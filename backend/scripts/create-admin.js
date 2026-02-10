import mongoose from 'mongoose';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

const createDefaultAdmin = async () => {
  try {
    console.log('👤 Creating default admin user...');
    
    await mongoose.connect(process.env.MONGO_URI);
    
    // Check if admin exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
      return;
    }

    // Create admin user
    const adminUser = await User.create({
      email: 'admin@adaayen.com',
      password: 'Admin@123', // Will be hashed by pre-save hook
      name: 'Administrator',
      role: 'admin',
      emailVerified: true
    });

    // Create admin profile
    await Admin.create({
      user: adminUser._id,
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

    console.log('✅ Default admin created successfully!');
    console.log('   📧 Email: admin@adaayen.com');
    console.log('   🔒 Password: Admin@123');
    console.log('');
    console.log('⚠️  Please change the password after first login!');
    
  } catch (error) {
    console.error('❌ Failed to create admin:', error);
  } finally {
    mongoose.disconnect();
  }
};

// If running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createDefaultAdmin();
}

export default createDefaultAdmin;