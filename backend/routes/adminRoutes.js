const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const Course = require('../models/Course');

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

    const url = `${endpoint}openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

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
    console.error('Azure OpenAI Error:', error.response?.data || error.message);
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

📋 OVERVIEW (2-3 sentences)
- Briefly describe what this document covers

🎯 KEY CONCEPTS (3-5 bullet points)
- List the main concepts and topics covered

💡 IMPORTANT POINTS (3-5 bullet points)
- Highlight the most important information students should remember

📚 PRACTICAL APPLICATIONS
- Explain how this knowledge can be applied

🎓 LEARNING OUTCOMES
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
    console.error('Error summarizing document:', error);
    res.status(500).json({
      success: false,
      message: 'Error summarizing document',
      error: error.message
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

module.exports = router;
