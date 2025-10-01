require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('./models/User');

// Test users
const testUsers = [
  {
    name: 'Test Student',
    email: 'student@test.com',
    password: crypto.createHash('sha256').update('student123').digest('hex'),
    role: 'student'
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: crypto.createHash('sha256').update('password123').digest('hex'),
    role: 'student'
  },
  {
    name: 'Admin User',
    email: 'admin@test.com',
    password: crypto.createHash('sha256').update('admin123').digest('hex'),
    role: 'admin'
  }
];

async function seedUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Insert test users
    const users = await User.insertMany(testUsers);
    console.log('✅ Test users created successfully');
    console.log('\n📋 Test User Credentials:\n');
    
    console.log('1. Student Account:');
    console.log('   Email: student@test.com');
    console.log('   Password: student123');
    console.log('   Role: student\n');
    
    console.log('2. Regular Student:');
    console.log('   Email: john@example.com');
    console.log('   Password: password123');
    console.log('   Role: student\n');
    
    console.log('3. Admin Account:');
    console.log('   Email: admin@test.com');
    console.log('   Password: admin123');
    console.log('   Role: admin\n');

    console.log('✨ Users seeded successfully!');
    
    // Close connection
    await mongoose.connection.close();
    console.log('👋 Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
}

// Run the seed function
seedUsers();
