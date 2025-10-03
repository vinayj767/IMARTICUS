// Script to fix existing user passwords to use bcrypt
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function fixPasswords() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB Connected');

    // Test users to fix
    const testUsers = [
      { email: 'admin@test.com', password: 'admin123' },
      { email: 'student@test.com', password: 'student123' }
    ];

    for (const testUser of testUsers) {
      const user = await User.findOne({ email: testUser.email });
      
      if (user) {
        // Hash password with bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(testUser.password, salt);
        
        // Update user password
        user.password = hashedPassword;
        await user.save();
        
        console.log(`✅ Fixed password for ${user.email}`);
      } else {
        console.log(`⚠️  User not found: ${testUser.email}`);
      }
    }

    console.log('\n🎉 All passwords fixed! You can now login with:');
    console.log('   Admin: admin@test.com / admin123');
    console.log('   Student: student@test.com / student123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixPasswords();
