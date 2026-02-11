import 'dotenv/config';
import mongoose from 'mongoose';
import CreatorProfile from '../models/CreatorProfile.js';
import Customer from '../models/Customer.js';

const cleanup = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find and remove Creator records with null user references
    console.log('\n🔍 Checking for orphaned Creator records...');
    const orphanedCreators = await CreatorProfile.find({ 
      $or: [
        { user: null }, 
        { user: undefined },
        { user: { $exists: false } }
      ]
    });
    
    console.log(`Found ${orphanedCreators.length} orphaned Creator records`);
    
    if (orphanedCreators.length > 0) {
      console.log('🗑️ Removing orphaned Creator records...');
      const deleteResult = await CreatorProfile.deleteMany({ 
        $or: [
          { user: null }, 
          { user: undefined },
          { user: { $exists: false } }
        ]
      });
      console.log(`✅ Deleted ${deleteResult.deletedCount} orphaned Creator records`);
    }

    // Also check Customer records for completeness
    console.log('\n🔍 Checking for orphaned Customer records...');
    const orphanedCustomers = await Customer.find({ 
      $or: [
        { user: null }, 
        { user: undefined },
        { user: { $exists: false } }
      ]
    });
    
    console.log(`Found ${orphanedCustomers.length} orphaned Customer records`);
    
    if (orphanedCustomers.length > 0) {
      console.log('🗑️ Removing orphaned Customer records...');
      const deleteResult = await Customer.deleteMany({ 
        $or: [
          { user: null }, 
          { user: undefined },
          { user: { $exists: false } }
        ]
      });
      console.log(`✅ Deleted ${deleteResult.deletedCount} orphaned Customer records`);
    }

    // Show current valid records count
    const validCreators = await CreatorProfile.countDocuments({ user: { $ne: null } });
    const validCustomers = await Customer.countDocuments({ user: { $ne: null } });
    
    console.log('\n📊 Current valid records:');
    console.log(`   Creators: ${validCreators}`);
    console.log(`   Customers: ${validCustomers}`);
    
    console.log('\n✨ Cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

cleanup();