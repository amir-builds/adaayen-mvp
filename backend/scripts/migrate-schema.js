import mongoose from 'mongoose';
import User from '../models/User.js';
import Customer from '../models/Customer.js';
import CreatorProfile from '../models/CreatorProfile.js';
import Admin from '../models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

// Simple migration for existing users (if any)
const migrateExistingUsers = async () => {
  try {
    console.log('🔄 Starting data migration...');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📦 Connected to database');

    // Check for existing Creator collection data
    const CreatorCollection = mongoose.connection.db.collection('creators');
    const existingUsers = await CreatorCollection.find({}).toArray();
    
    if (existingUsers.length === 0) {
      console.log('✅ No existing users found. Starting fresh with new schema!');
      console.log('🚀 You can now register users with the new schema structure.');
      return;
    }

    console.log(`📊 Found ${existingUsers.length} existing users to migrate`);

    for (const oldUser of existingUsers) {
      try {
        // Check if user already migrated
        const existingNewUser = await User.findOne({ email: oldUser.email });
        if (existingNewUser) {
          console.log(`⏭️  User ${oldUser.email} already migrated, skipping...`);
          continue;
        }

        // Create base User record
        const newUser = await User.create({
          email: oldUser.email,
          password: oldUser.password, // Already hashed
          name: oldUser.name,
          role: oldUser.role || 'customer',
          emailVerified: oldUser.emailVerified || false,
          profilePic: oldUser.profilePic || '',
          phone: oldUser.phone || '',
          failedLoginAttempts: oldUser.failedLoginAttempts || 0,
          lockedUntil: oldUser.lockedUntil,
          lastLogin: oldUser.lastLogin,
          emailVerificationToken: oldUser.emailVerificationToken,
          emailVerificationExpires: oldUser.emailVerificationExpires,
          createdAt: oldUser.createdAt,
          updatedAt: oldUser.updatedAt
        });

        // Create role-specific record
        if (oldUser.role === 'customer') {
          await Customer.create({
            user: newUser._id
          });
          console.log(`✅ Migrated customer: ${oldUser.email}`);
        } else if (oldUser.role === 'creator') {
          await CreatorProfile.create({
            user: newUser._id,
            bio: oldUser.bio || ''
          });
          console.log(`✅ Migrated creator: ${oldUser.email}`);
        } else if (oldUser.role === 'admin') {
          await Admin.create({
            user: newUser._id,
            adminRole: 'super_admin',
            department: 'operations',
            permissions: [
              'manage_users', 'manage_posts', 'manage_fabrics', 
              'view_analytics', 'manage_settings'
            ]
          });
          console.log(`✅ Migrated admin: ${oldUser.email}`);
        }

      } catch (userError) {
        console.error(`❌ Failed to migrate user ${oldUser.email}:`, userError.message);
      }
    }

    console.log('🎉 Migration completed successfully!');
    console.log('💡 You can now delete the old "creators" collection if everything works correctly');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Create default admin user if none exists
const createDefaultAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Check if admin exists
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
      console.log('✅ Admin user already exists');
      return;
    }

    console.log('👤 Creating default admin user...');
    
    const adminUserData = await User.create({
      email: 'admin@adaayen.com',
      password: 'Admin@123', // Will be hashed by pre-save hook
      name: 'Administrator',
      role: 'admin',
      emailVerified: true
    });

    await Admin.create({
      user: adminUserData._id,
      adminRole: 'super_admin',
      department: 'operations',
      employeeId: 'ADM001',
      permissions: [
        'manage_users', 'view_users', 'ban_users', 'verify_creators',
        'manage_posts', 'feature_posts', 'moderate_content', 'manage_reports',
        'manage_fabrics', 'manage_inventory', 'manage_orders', 'view_sales',
        'manage_settings', 'view_analytics', 'manage_admins', 'system_config',
        'view_revenue', 'manage_payments', 'export_data',
        'manage_promotions', 'send_notifications', 'manage_newsletters'
      ]
    });

    console.log('✅ Default admin created:');
    console.log('   Email: admin@adaayen.com');
    console.log('   Password: Admin@123');
    console.log('   Please change the password after first login!');
    
  } catch (error) {
    console.error('❌ Failed to create admin:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Run migration
const runMigration = async () => {
  console.log('🚀 Starting Adaayen Database Schema Migration');
  console.log('=========================================');
  
  await migrateExistingUsers();
  await createDefaultAdmin();
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Test registration with new schema');
  console.log('2. Test login functionality'); 
  console.log('3. Update frontend API calls if needed');
  console.log('4. Deploy and monitor');
};

export default runMigration;

// If running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}