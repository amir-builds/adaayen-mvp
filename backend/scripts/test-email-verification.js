import mongoose from 'mongoose';
import User from '../models/User.js';
import Customer from '../models/Customer.js';
import { generateVerificationToken, sendVerificationEmail } from '../utils/emailService.js';
import dotenv from 'dotenv';

dotenv.config();

const testEmailVerification = async () => {
  try {
    console.log('🧪 Testing email verification flow...');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📦 Connected to database');

    // Create a test user
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const testUser = await User.create({
      email: 'test.verification@example.com',
      password: 'Test@123',
      name: 'Test Verification User',
      role: 'customer',
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires
    });

    await Customer.create({ user: testUser._id });

    console.log('✅ Test user created');
    console.log(`📧 Email: ${testUser.email}`);
    console.log(`🔗 Verification URL: ${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/verify-email/${verificationToken}`);
    
    // Send verification email
    console.log('\n📧 Sending verification email...');
    const emailResult = await sendVerificationEmail(testUser, verificationToken);
    
    if (emailResult.success) {
      console.log('✅ Verification email sent successfully!');
      console.log(`📬 Preview URL: ${emailResult.previewUrl || 'Check your email'}`);
    } else {
      console.log('❌ Failed to send verification email:', emailResult.error);
    }

    console.log('\n🎯 Next steps:');
    console.log('1. Make sure your backend server is running: npm run dev');
    console.log('2. Make sure your frontend server is running');
    console.log('3. Click the verification link from the email');
    console.log('4. You should be redirected to your frontend with success parameters');

    // don't cleanup - let the user test the verification
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.disconnect();
  }
};

// If running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testEmailVerification();
}

export default testEmailVerification;