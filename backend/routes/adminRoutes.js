const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const Course = require('../models/Course');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { cacheMiddleware } = require('../config/redis');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Function to call Azure OpenAI
async function callAzureOpenAI(prompt) {
  try {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const deployment = process.env.AZURE_OPENAI_CHATGPT_DEPLOYMENT;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

    // Validate environment variables
    if (!endpoint || !apiKey || !deployment || !apiVersion) {
      throw new Error('Azure OpenAI environment variables not properly configured');
    }

    const url = `${endpoint}openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

    console.log('Calling Azure OpenAI:', {
      endpoint,
      deployment,
      apiVersion,
      hasApiKey: !!apiKey
    });

    const response = await axios.post(url, {
      messages: [
        { role: 'system', content: 'You are an expert educational AI assistant. Provide clear, structured, and comprehensive summaries that help students learn effectively. Use emojis to make content engaging.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 800,
      temperature: 0.7
    }, {
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Azure OpenAI Error Details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    throw error;
  }
}

// Upload document to a lesson
router.post('/upload-document', upload.single('document'), async (req, res) => {
  try {
    const { courseId, moduleId, lessonId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    if (!courseId || !moduleId || !lessonId) {
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Find the module
    const module = course.modules.id(moduleId);
    if (!module) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Find the lesson
    const lesson = module.lessons.id(lessonId);
    if (!lesson) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Delete old document if exists
    if (lesson.document && lesson.document.filepath) {
      const oldFilePath = path.join(__dirname, '..', lesson.document.filepath);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Update lesson with document info
    lesson.document = {
      filename: req.file.originalname,
      filepath: `uploads/${req.file.filename}`,
      uploadedAt: new Date()
    };

    await course.save();

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        lessonId: lesson._id,
        document: lesson.document
      }
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('Error uploading document:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading document',
      error: error.message
    });
  }
});

// Summarize document using AI
router.post('/summarize-document', async (req, res) => {
  try {
    const { courseId, moduleId, lessonId } = req.body;

    if (!courseId || !moduleId || !lessonId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Find the lesson
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const module = course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    const lesson = module.lessons.id(lessonId);
    if (!lesson || !lesson.document || !lesson.document.filepath) {
      return res.status(404).json({
        success: false,
        message: 'Document not found for this lesson'
      });
    }

    // Read and parse PDF
    const filePath = path.join(__dirname, '..', lesson.document.filepath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Document file not found on server'
      });
    }

    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const pdfText = pdfData.text;

    if (!pdfText || pdfText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No text content found in PDF'
      });
    }

    // Check if OpenAI is configured
    if (!process.env.AZURE_OPENAI_ENDPOINT || !process.env.AZURE_OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'AI service not configured',
        testMode: true,
        summary: `📚 EDUCATIONAL SUMMARY\n\n📋 OVERVIEW\nThis document "${lesson.document.filename}" contains important course material for ${lesson.title}. The content spans ${Math.floor(pdfText.length / 1000)} pages of educational material.\n\n🎯 KEY CONCEPTS\n• Core principles and fundamental theories\n• Practical methodologies and frameworks\n• Real-world applications and examples\n• Step-by-step processes and techniques\n• Industry best practices\n\n💡 IMPORTANT POINTS\n• Understanding the foundational concepts is crucial for mastery\n• The document includes practical examples to reinforce learning\n• Key formulas and principles are highlighted throughout\n• Case studies demonstrate real-world applications\n• Practice exercises help solidify understanding\n\n📚 PRACTICAL APPLICATIONS\nThe knowledge from this document can be applied in:\n• Project work and assignments\n• Professional scenarios and workplace challenges\n• Building practical skills for career advancement\n• Understanding industry-standard practices\n\n🎓 LEARNING OUTCOMES\nAfter studying this material, you will be able to:\n• Comprehend and explain the core concepts covered\n• Apply the principles to solve practical problems\n• Analyze real-world scenarios using the frameworks taught\n• Demonstrate proficiency in the key skills introduced\n\n⚠️ Note: This is a demo summary. Configure Azure OpenAI credentials in the backend .env file for AI-powered summaries.`
      });
    }

    // Prepare prompt for summarization with structured output
    const prompt = `You are an educational AI assistant helping students understand course materials.

Analyze the following document and provide a comprehensive, well-structured summary with these sections:

 OVERVIEW (2-3 sentences)
- Briefly describe what this document covers

 KEY CONCEPTS (3-5 bullet points)
- List the main concepts and topics covered

 IMPORTANT POINTS (3-5 bullet points)
- Highlight the most important information students should remember

 PRACTICAL APPLICATIONS
- Explain how this knowledge can be applied

 LEARNING OUTCOMES
- What students will be able to do after understanding this material

Document Text:
${pdfText.substring(0, 4000)}`;

    // Call Azure OpenAI
    const summary = await callAzureOpenAI(prompt);

    res.json({
      success: true,
      data: {
        lessonTitle: lesson.title,
        documentName: lesson.document.filename,
        summary: summary
      }
    });
  } catch (error) {
    console.error('Error summarizing document:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    
    // Provide more specific error message
    let errorMessage = 'Error summarizing document';
    if (error.response?.status === 401) {
      errorMessage = 'Azure OpenAI authentication failed. Please check API key.';
    } else if (error.response?.status === 404) {
      errorMessage = 'Azure OpenAI deployment not found. Please check deployment name.';
    } else if (error.message.includes('environment variables')) {
      errorMessage = 'Azure OpenAI is not properly configured on the server.';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// Get all courses for admin
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find().select('title modules._id modules.title modules.lessons._id modules.lessons.title modules.lessons.document');
    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message
    });
  }
});

// Create new course
router.post('/courses', async (req, res) => {
  try {
    const courseData = req.body;
    const course = await Course.create(courseData);
    res.json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating course',
      error: error.message
    });
  }
});

// Update course
router.put('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const course = await Course.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating course',
      error: error.message
    });
  }
});

// Delete course
router.delete('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await Course.findByIdAndDelete(id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Delete associated documents
    if (course.modules) {
      for (const module of course.modules) {
        for (const lesson of module.lessons) {
          if (lesson.document && lesson.document.filepath) {
            const filePath = path.join(__dirname, '..', lesson.document.filepath);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          }
        }
      }
    }
    
    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: error.message
    });
  }
});

// ============================================
// ANALYTICS DASHBOARD ENDPOINT (Protected)
// ============================================

// Analytics route with 30-minute cache
router.get('/analytics', verifyToken, isAdmin, cacheMiddleware(1800), async (req, res) => {
  try {
    console.log('📊 Fetching analytics data...');

    // 1. CORE STATS - Total counts
    const [totalStudents, totalCourses, totalEnrollments] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Course.countDocuments(),
      User.aggregate([
        { $unwind: '$enrolledCourses' },
        { $count: 'total' }
      ])
    ]);

    const enrollmentCount = totalEnrollments.length > 0 ? totalEnrollments[0].total : 0;

    // 2. COURSE POPULARITY - Top 5 most enrolled courses
    const coursePopularity = await User.aggregate([
      { $unwind: '$enrolledCourses' },
      { 
        $group: {
          _id: '$enrolledCourses.courseId',
          enrollments: { $sum: 1 }
        }
      },
      { $sort: { enrollments: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'courseInfo'
        }
      },
      { $unwind: '$courseInfo' },
      {
        $project: {
          _id: 1,
          courseName: '$courseInfo.title',
          enrollments: 1
        }
      }
    ]);

    // 3. STUDENT PROGRESS - Calculate average completion per course
    const studentProgress = await User.aggregate([
      { $unwind: '$enrolledCourses' },
      {
        $lookup: {
          from: 'courses',
          localField: 'enrolledCourses.courseId',
          foreignField: '_id',
          as: 'courseDetails'
        }
      },
      { $unwind: '$courseDetails' },
      {
        $project: {
          courseId: '$enrolledCourses.courseId',
          courseName: '$courseDetails.title',
          totalLessons: {
            $sum: {
              $map: {
                input: '$courseDetails.modules',
                as: 'module',
                in: { $size: '$$module.lessons' }
              }
            }
          },
          completedLessons: {
            $cond: {
              if: { $isArray: '$enrolledCourses.progress' },
              then: { $size: '$enrolledCourses.progress' },
              else: 0
            }
          }
        }
      },
      {
        $group: {
          _id: '$courseId',
          courseName: { $first: '$courseName' },
          totalLessons: { $first: '$totalLessons' },
          avgCompletedLessons: { $avg: '$completedLessons' }
        }
      },
      {
        $project: {
          _id: 1,
          courseName: 1,
          totalLessons: 1,
          avgCompletedLessons: { $round: ['$avgCompletedLessons', 1] },
          completionPercentage: {
            $round: [
              {
                $multiply: [
                  {
                    $cond: {
                      if: { $eq: ['$totalLessons', 0] },
                      then: 0,
                      else: { $divide: ['$avgCompletedLessons', '$totalLessons'] }
                    }
                  },
                  100
                ]
              },
              1
            ]
          }
        }
      },
      { $sort: { completionPercentage: -1 } }
    ]);

    // 4. RECENT ACTIVITY - Last 5 registered students
    const recentStudents = await User.find({ role: 'student' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt enrolledCourses')
      .lean();

    const recentActivity = recentStudents.map(student => ({
      _id: student._id,
      name: student.name,
      email: student.email,
      registeredAt: student.createdAt,
      enrolledCoursesCount: student.enrolledCourses?.length || 0
    }));

    // 5. ENROLLMENT TRENDS - Last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const enrollmentTrends = await User.aggregate([
      { $unwind: '$enrolledCourses' },
      {
        $match: {
          'enrolledCourses.enrolledAt': { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$enrolledCourses.enrolledAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          enrollments: '$count',
          _id: 0
        }
      }
    ]);

    // 6. REVENUE DATA (if Payment model exists)
    let totalRevenue = 0;
    let recentPayments = [];

    try {
      const payments = await Payment.aggregate([
        { $match: { status: { $in: ['success', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      
      totalRevenue = payments.length > 0 ? payments[0].total : 0;

      recentPayments = await Payment.find({ status: { $in: ['success', 'completed'] } })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'name email')
        .populate('courseId', 'title')
        .select('amount createdAt')
        .lean();
    } catch (error) {
      console.log('Payment model not found or error:', error.message);
    }

    // Prepare response
    const analyticsData = {
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        coreStats: {
          totalStudents,
          totalCourses,
          totalEnrollments: enrollmentCount,
          totalRevenue
        },
        coursePopularity: coursePopularity.map(course => ({
          courseId: course._id,
          courseName: course.courseName,
          enrollments: course.enrollments
        })),
        studentProgress: studentProgress.map(progress => ({
          courseId: progress._id,
          courseName: progress.courseName,
          totalLessons: progress.totalLessons,
          avgCompletedLessons: progress.avgCompletedLessons,
          completionPercentage: progress.completionPercentage
        })),
        recentActivity,
        enrollmentTrends,
        recentPayments: recentPayments.map(payment => ({
          amount: payment.amount,
          student: payment.userId?.name || 'Unknown',
          course: payment.courseId?.title || 'Unknown',
          date: payment.createdAt
        }))
      }
    };

    console.log('✅ Analytics data fetched successfully');
    res.json(analyticsData);

  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics data',
      error: error.message
    });
  }
});

// Get detailed student progress with 15-minute cache
router.get('/student-progress', verifyToken, isAdmin, cacheMiddleware(900), async (req, res) => {
  try {
    console.log('Fetching detailed student progress...');

    const students = await User.find({ role: 'student' })
      .select('name email enrolledCourses')
      .populate('enrolledCourses.courseId', 'title')
      .lean();

    const studentProgressList = students.map(student => {
      const enrollments = student.enrolledCourses || [];
      const courses = enrollments.map(enrollment => ({
        courseId: enrollment.courseId?._id,
        courseName: enrollment.courseId?.title || 'Unknown Course',
        completionPercentage: enrollment.completionPercentage || 0,
        enrolledAt: enrollment.enrolledAt,
        progressCount: enrollment.progress?.length || 0
      }));

      return {
        studentId: student._id,
        studentName: student.name,
        studentEmail: student.email,
        totalEnrollments: enrollments.length,
        averageCompletion: enrollments.length > 0
          ? Math.round(
              enrollments.reduce((sum, e) => sum + (e.completionPercentage || 0), 0) / enrollments.length
            )
          : 0,
        courses: courses
      };
    });

    // Sort by average completion (descending)
    studentProgressList.sort((a, b) => b.averageCompletion - a.averageCompletion);

    res.json({
      success: true,
      data: studentProgressList
    });

  } catch (error) {
    console.error('Error fetching student progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student progress',
      error: error.message
    });
  }
});

module.exports = router;

