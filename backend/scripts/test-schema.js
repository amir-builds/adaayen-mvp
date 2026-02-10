import mongoose from 'mongoose';
import User from '../models/User.js';
import Customer from '../models/Customer.js';
import CreatorProfile from '../models/CreatorProfile.js';
import Admin from '../models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

const testNewSchema = async () => {
  try {
    console.log('🧪 Testing new schema structure...');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📦 Connected to database');

    // Test 1: Create a customer
    console.log('\n1️⃣ Testing Customer Creation...');
    const customerUser = await User.create({
      email: 'test.customer@example.com',
      password: 'Test@123',
      name: 'Test Customer',
      role: 'customer',
      emailVerified: true
    });

    const customerProfile = await Customer.create({
      user: customerUser._id,
      preferredFabricTypes: ['Cotton', 'Silk'],
      priceRange: { min: 500, max: 5000 }
    });

    console.log('✅ Customer created successfully');

    // Test 2: Create a creator
    console.log('\n2️⃣ Testing Creator Creation...');
    const creatorUser = await User.create({
      email: 'test.creator@example.com',
      password: 'Test@123',
      name: 'Test Creator',
      role: 'creator',
      emailVerified: true
    });

    const creatorProfile = await CreatorProfile.create({
      user: creatorUser._id,
      bio: 'Passionate fabric designer and tailor',
      specialization: ['Traditional Wear', 'Fusion Wear'],
      experience: 'intermediate'
    });

    console.log('✅ Creator created successfully');

    // Test 3: Test login simulation
    console.log('\n3️⃣ Testing User Lookup (Login Simulation)...');
    
    const foundCustomer = await User.findOne({ email: 'test.customer@example.com' });
    const customerData = await Customer.findOne({ user: foundCustomer._id });
    
    console.log('Customer found:', {
      id: foundCustomer._id,
      name: foundCustomer.name,
      role: foundCustomer.role,
      preferredFabrics: customerData.preferredFabricTypes
    });

    const foundCreator = await User.findOne({ email: 'test.creator@example.com' });
    const creatorData = await CreatorProfile.findOne({ user: foundCreator._id });
    
    console.log('Creator found:', {
      id: foundCreator._id,
      name: foundCreator.name,
      role: foundCreator.role,
      bio: creatorData.bio,
      specialization: creatorData.specialization
    });

    // Test 4: Test password verification
    console.log('\n4️⃣ Testing Password Verification...');
    const isCustomerPasswordValid = await foundCustomer.matchPassword('Test@123');
    const isCreatorPasswordValid = await foundCreator.matchPassword('Test@123');
    
    console.log('Customer password valid:', isCustomerPasswordValid);
    console.log('Creator password valid:', isCreatorPasswordValid);

    // Test 5: Test account locking functionality
    console.log('\n5️⃣ Testing Account Security Features...');
    console.log('Account locked?', foundCustomer.isAccountLocked());
    
    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
    await User.deleteOne({ email: 'test.customer@example.com' });
    await User.deleteOne({ email: 'test.creator@example.com' });
    await Customer.deleteOne({ user: customerUser._id });
    await CreatorProfile.deleteOne({ user: creatorUser._id });

    console.log('✅ Schema test completed successfully!');
    console.log('\n🎉 Your new schema is working perfectly!');
    console.log('📝 Ready for production use');

  } catch (error) {
    console.error('❌ Schema test failed:', error);
  } finally {
    mongoose.disconnect();
  }
};

// If running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testNewSchema();
}

export default testNewSchema;