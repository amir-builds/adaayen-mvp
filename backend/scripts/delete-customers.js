import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const deleteCustomers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Count before
    const totalBefore = await User.countDocuments();
    const customerCount = await User.countDocuments({ role: 'customer' });
    const creatorCount = await User.countDocuments({ role: 'creator' });
    const adminCount = await User.countDocuments({ role: 'admin' });

    console.log('\n📊 Before deletion:');
    console.log(`   Total users  : ${totalBefore}`);
    console.log(`   Customers    : ${customerCount}`);
    console.log(`   Creators     : ${creatorCount}`);
    console.log(`   Admins       : ${adminCount}`);

    // Delete only customers
    const result = await User.deleteMany({ role: 'customer' });

    console.log(`\n🗑️  Deleted ${result.deletedCount} customer account(s).`);

    // Count after
    const totalAfter = await User.countDocuments();
    console.log(`✅ Remaining users: ${totalAfter} (creators + admins only)`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

deleteCustomers();
