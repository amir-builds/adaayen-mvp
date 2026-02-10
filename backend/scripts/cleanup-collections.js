import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const cleanupCollections = async () => {
  try {
    console.log('🧹 Cleaning up collections for fresh start...');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📦 Connected to database');

    // Drop problematic collections
    const collections = ['users', 'customers', 'creators', 'admins'];
    
    for (const collection of collections) {
      try {
        await mongoose.connection.db.dropCollection(collection);
        console.log(`✅ Dropped ${collection} collection`);
      } catch (error) {
        if (error.codeName === 'NamespaceNotFound') {
          console.log(`ℹ️  Collection ${collection} doesn't exist, skipping...`);
        } else {
          console.log(`❌ Error dropping ${collection}:`, error.message);
        }
      }
    }

    console.log('✅ Cleanup completed! You can now test with fresh collections.');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    mongoose.disconnect();
  }
};

// If running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupCollections();
}

export default cleanupCollections;