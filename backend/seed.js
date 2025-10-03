require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');

// Sample course data
const sampleCourse = {
  title: 'Introduction to Machine Learning',
  description: 'A comprehensive course on Machine Learning covering fundamental concepts, algorithms, and real-world applications. Perfect for beginners looking to start their journey in AI and ML.',
  instructor: 'Ritesh Singh',
  duration: '2 Years',
  thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800',
  price: 500,
  category: 'technology',
  modules: [
    {
      title: 'Introduction to Machine Learning',
      description: 'Understanding the basics of Machine Learning and its applications',
      order: 1,
      lessons: [
        {
          title: 'What is Machine Learning?',
          videoUrl: 'https://drive.google.com/file/d/1NGvLKYjur_qLjzXLRGtEqeDS56oB2woI/view?usp=sharing',
          description: 'Introduction to Machine Learning concepts and overview',
          duration: '15:30',
          order: 1
        },
        {
          title: 'Types of Machine Learning',
          videoUrl: 'https://drive.google.com/file/d/1NGvLKYjur_qLjzXLRGtEqeDS56oB2woI/view?usp=sharing',
          description: 'Understanding Supervised, Unsupervised, and Reinforcement Learning',
          duration: '20:45',
          order: 2
        },
        {
          title: 'ML Applications in Real World',
          videoUrl: 'https://drive.google.com/file/d/1NGvLKYjur_qLjzXLRGtEqeDS56oB2woI/view?usp=sharing',
          description: 'Exploring practical applications of Machine Learning',
          duration: '18:20',
          order: 3
        }
      ]
    },
    {
      title: 'Basic Concepts of Machine Learning',
      description: 'Core concepts and mathematical foundations',
      order: 2,
      lessons: [
        {
          title: 'Data Preprocessing',
          videoUrl: 'https://drive.google.com/file/d/1NGvLKYjur_qLjzXLRGtEqeDS56oB2woI/view?usp=sharing',
          description: 'Learn how to clean and prepare data for ML models',
          duration: '25:15',
          order: 1
        },
        {
          title: 'Feature Engineering',
          videoUrl: 'https://drive.google.com/file/d/1NGvLKYjur_qLjzXLRGtEqeDS56oB2woI/view?usp=sharing',
          description: 'Creating meaningful features from raw data',
          duration: '22:30',
          order: 2
        },
        {
          title: 'Model Evaluation Metrics',
          videoUrl: 'https://drive.google.com/file/d/1NGvLKYjur_qLjzXLRGtEqeDS56oB2woI/view?usp=sharing',
          description: 'Understanding accuracy, precision, recall, and F1-score',
          duration: '19:40',
          order: 3
        }
      ]
    },
    {
      title: 'Linear Regression, Polymer Regression, Logistic Regression',
      description: 'Understanding regression algorithms in depth',
      order: 3,
      lessons: [
        {
          title: 'Linear Regression Fundamentals',
          videoUrl: 'https://drive.google.com/file/d/1NGvLKYjur_qLjzXLRGtEqeDS56oB2woI/view?usp=sharing',
          description: 'Introduction to linear regression and its applications',
          duration: '28:50',
          order: 1
        },
        {
          title: 'Polynomial Regression',
          videoUrl: 'https://drive.google.com/file/d/1NGvLKYjur_qLjzXLRGtEqeDS56oB2woI/view?usp=sharing',
          description: 'Extending linear regression with polynomial features',
          duration: '26:15',
          order: 2
        },
        {
          title: 'Logistic Regression for Classification',
          videoUrl: 'https://drive.google.com/file/d/1NGvLKYjur_qLjzXLRGtEqeDS56oB2woI/view?usp=sharing',
          description: 'Using logistic regression for binary classification problems',
          duration: '30:20',
          order: 3
        }
      ]
    },
    {
      title: 'Neural Network and Deep Learning',
      description: 'Introduction to neural networks and deep learning concepts',
      order: 4,
      lessons: [
        {
          title: 'Introduction to Neural Networks',
          videoUrl: 'https://drive.google.com/file/d/1NGvLKYjur_qLjzXLRGtEqeDS56oB2woI/view?usp=sharing',
          description: 'Understanding artificial neurons and network architecture',
          duration: '32:45',
          order: 1
        },
        {
          title: 'Backpropagation Algorithm',
          videoUrl: 'https://drive.google.com/file/d/1NGvLKYjur_qLjzXLRGtEqeDS56oB2woI/view?usp=sharing',
          description: 'How neural networks learn through backpropagation',
          duration: '35:10',
          order: 2
        },
        {
          title: 'Deep Learning Frameworks',
          videoUrl: 'https://drive.google.com/file/d/1NGvLKYjur_qLjzXLRGtEqeDS56oB2woI/view?usp=sharing',
          description: 'Overview of TensorFlow, PyTorch, and Keras',
          duration: '27:30',
          order: 3
        }
      ]
    },
    {
      title: 'Application of Deep Learning',
      description: 'Real-world applications and advanced topics',
      order: 5,
      lessons: [
        {
          title: 'Computer Vision with CNNs',
          videoUrl: 'https://drive.google.com/file/d/1NGvLKYjur_qLjzXLRGtEqeDS56oB2woI/view?usp=sharing',
          description: 'Convolutional Neural Networks for image recognition',
          duration: '40:15',
          order: 1
        },
        {
          title: 'Natural Language Processing',
          videoUrl: 'https://drive.google.com/file/d/1NGvLKYjur_qLjzXLRGtEqeDS56oB2woI/view?usp=sharing',
          description: 'Using deep learning for text analysis and generation',
          duration: '38:50',
          order: 2
        },
        {
          title: 'Transfer Learning and Fine-tuning',
          videoUrl: 'https://drive.google.com/file/d/1NGvLKYjur_qLjzXLRGtEqeDS56oB2woI/view?usp=sharing',
          description: 'Leveraging pre-trained models for your applications',
          duration: '33:25',
          order: 3
        }
      ]
    }
  ],
  isActive: true
};

// Connect to MongoDB and seed data
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing courses
    await Course.deleteMany({});
    console.log('🗑️  Cleared existing courses');

    // Insert sample course
    const course = await Course.create(sampleCourse);
    console.log(' Sample course created successfully');
    console.log(' Course ID:', course._id);
    console.log(' Course Title:', course.title);
    console.log(' Modules:', course.modules.length);
    
    let totalLessons = 0;
    course.modules.forEach(module => {
      totalLessons += module.lessons.length;
    });
    console.log('🎬 Total Lessons:', totalLessons);

    console.log('\n✨ Database seeded successfully!');
    
    // Close connection
    await mongoose.connection.close();
    console.log('👋 Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
