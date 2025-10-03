// Complete Demo Data Seeder - Creates users, enrolls in courses, adds progress
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Course = require('./models/Course');
const Payment = require('./models/Payment');

const demoUsers = [
  { name: 'Akshat', email: 'akshat.goel@imarticus.com', password: 'student123', role: 'student' },
  { name: 'Vinay Jain', email: 'vinayj767@gmail.com', password: 'student123', role: 'student' },
  { name: 'Priya Sharma', email: 'priya.sharma@example.com', password: 'student123', role: 'student' },
  { name: 'Rahul Kumar', email: 'rahul.kumar@example.com', password: 'student123', role: 'student' },
  { name: 'Sneha Patel', email: 'sneha.patel@example.com', password: 'student123', role: 'student' },
  { name: 'Arjun Singh', email: 'arjun.singh@example.com', password: 'student123', role: 'student' },
  { name: 'Ananya Reddy', email: 'ananya.reddy@example.com', password: 'student123', role: 'student' },
  { name: 'Karthik Iyer', email: 'karthik.iyer@example.com', password: 'student123', role: 'student' },
];

// Enrollment patterns - which courses to enroll users in
const enrollmentPatterns = {
  'akshat.goel@imarticus.com': [0, 1, 2], // 3 courses
  'vinayj767@gmail.com': [0, 3, 4], // 3 courses
  'priya.sharma@example.com': [0, 1], // 2 courses - popular course 0
  'rahul.kumar@example.com': [0, 5], // 2 courses - popular course 0
  'sneha.patel@example.com': [1, 2, 3], // 3 courses - popular course 1
  'arjun.singh@example.com': [1, 4], // 2 courses - popular course 1
  'ananya.reddy@example.com': [2, 3], // 2 courses - popular course 2
  'karthik.iyer@example.com': [0, 2], // 2 courses - popular courses
};

// Progress patterns - how many lessons completed
const progressPatterns = {
  'akshat.goel@imarticus.com': 'high', // 70-90% complete
  'vinayj767@gmail.com': 'medium', // 40-60% complete
  'priya.sharma@example.com': 'high',
  'rahul.kumar@example.com': 'low', // 10-30% complete
  'sneha.patel@example.com': 'medium',
  'arjun.singh@example.com': 'high',
  'ananya.reddy@example.com': 'medium',
  'karthik.iyer@example.com': 'low',
};

async function seedDemoData() {
  try {
    console.log('🌱 Starting demo data seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB Connected');

    // Get all courses
    const courses = await Course.find().limit(15);
    if (courses.length === 0) {
      console.log('❌ No courses found! Please run seed-multiple-courses.js first');
      process.exit(1);
    }
    console.log(`✅ Found ${courses.length} courses`);

    // Create or update demo users
    console.log('\n👥 Creating demo users...');
    const createdUsers = [];

    for (const userData of demoUsers) {
      // Check if user exists
      let user = await User.findOne({ email: userData.email });
      
      if (!user) {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        
        // Create user
        user = await User.create({
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          enrolledCourses: []
        });
        console.log(`✅ Created user: ${user.name} (${user.email})`);
      } else {
        console.log(`ℹ️  User exists: ${user.name} (${user.email})`);
      }
      
      createdUsers.push(user);
    }

    // Enroll users in courses with progress
    console.log('\n📚 Enrolling users in courses...');
    
    for (const user of createdUsers) {
      const courseIndices = enrollmentPatterns[user.email] || [];
      const progressLevel = progressPatterns[user.email] || 'medium';
      
      // Clear existing enrollments for clean data
      user.enrolledCourses = [];
      
      for (const courseIndex of courseIndices) {
        const course = courses[courseIndex];
        if (!course) continue;

        // Create payment record (status 'completed' for successful payments)
        const payment = await Payment.create({
          userId: user._id,
          courseId: course._id,
          amount: course.price || 1500,
          userName: user.name,
          userEmail: user.email,
          status: 'completed',
          razorpayOrderId: `order_${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase(),
          razorpayPaymentId: `pay_${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase(),
          razorpaySignature: `sig_${Math.random().toString(36).substr(2, 20)}`.toUpperCase()
        });

        // Calculate progress
        const allLessons = [];
        course.modules.forEach(module => {
          module.lessons.forEach(lesson => {
            allLessons.push({ moduleId: module._id, lessonId: lesson._id });
          });
        });

        // Determine how many lessons to mark complete
        let completePercentage;
        switch(progressLevel) {
          case 'high':
            completePercentage = 0.7 + Math.random() * 0.2; // 70-90%
            break;
          case 'medium':
            completePercentage = 0.4 + Math.random() * 0.2; // 40-60%
            break;
          case 'low':
            completePercentage = 0.1 + Math.random() * 0.2; // 10-30%
            break;
          default:
            completePercentage = 0.5;
        }

        const lessonsToComplete = Math.floor(allLessons.length * completePercentage);
        const progress = [];
        
        for (let i = 0; i < lessonsToComplete; i++) {
          const lesson = allLessons[i];
          progress.push({
            moduleId: lesson.moduleId,
            lessonId: lesson.lessonId,
            completed: true,
            completedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random date in last 7 days
          });
        }

        // Add enrollment with progress
        user.enrolledCourses.push({
          courseId: course._id,
          enrolledAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000), // Random date in last 14 days
          paymentId: payment._id,
          progress: progress,
          completionPercentage: Math.round((lessonsToComplete / allLessons.length) * 100)
        });

        console.log(`   ✅ ${user.name} enrolled in "${course.title}" (${Math.round(completePercentage * 100)}% complete)`);
      }
      
      await user.save();
    }

    // Summary
    console.log('\n📊 Seeding Summary:');
    console.log(`   👥 Users created/updated: ${createdUsers.length}`);
    
    const totalEnrollments = createdUsers.reduce((sum, user) => sum + user.enrolledCourses.length, 0);
    console.log(`   📚 Total enrollments: ${totalEnrollments}`);
    
    const totalPayments = await Payment.countDocuments();
    console.log(`   💰 Total payments: ${totalPayments}`);
    
    const totalRevenue = await Payment.aggregate([
      { $match: { status: { $in: ['success', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    console.log(`   💵 Total revenue: ₹${totalRevenue[0]?.total || 0}`);

    console.log('\n🎉 Demo data seeded successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('   Admin: admin@test.com / admin123');
    console.log('   Students:');
    demoUsers.forEach(u => {
      console.log(`   - ${u.email} / student123`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    process.exit(1);
  }
}

seedDemoData();
