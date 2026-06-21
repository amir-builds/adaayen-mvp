import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const oldEmail = 'admin@adaayen.com';
    const newEmail = 'devamir121@gmail.com';
    const newPassword = '$AmirBM121';

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Delete any existing regular user with the new email (to avoid conflict)
    const conflict = await User.findOne({ email: newEmail, role: { $ne: 'admin' } });
    if (conflict) {
      await User.deleteOne({ _id: conflict._id });
      console.log('⚠️  Removed conflicting non-admin account with that email.');
    }

    // Update the admin user by old email OR by role
    const result = await User.findOneAndUpdate(
      { $or: [{ email: oldEmail }, { role: 'admin' }] },
      { email: newEmail, password: hashedPassword, role: 'admin' },
      { new: true }
    );

    if (!result) {
      console.log('❌ No admin user found.');
    } else {
      console.log('✅ Admin credentials updated successfully!');
      console.log('   📧 Email:', result.email);
      console.log('   🔒 Password:', newPassword);
      console.log('   👤 Role:', result.role);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

resetAdmin();
