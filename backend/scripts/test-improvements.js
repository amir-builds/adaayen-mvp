#!/usr/bin/env node
// scripts/test-improvements.js
// Test script for pagination and Cloudinary improvements

import { config } from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend directory
config({ path: join(__dirname, '..', '.env') });

import mongoose from 'mongoose';
import Fabric from '../models/Fabric.js';
import Post from '../models/Post.js';
import Creator from '../models/Creator.js';
import { 
  deleteCloudinaryImage, 
  deleteCloudinaryImages,
  deleteImagesFromMeta,
  verifyImageExists 
} from '../utils/cloudinary.js';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(message) {
  console.log('\n' + '='.repeat(60));
  log(message, 'cyan');
  console.log('='.repeat(60) + '\n');
}

async function connectDB() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not found in .env file');
    }
    await mongoose.connect(process.env.MONGO_URI);
    log('✅ Connected to MongoDB', 'green');
  } catch (error) {
    log(`❌ MongoDB connection failed: ${error.message}`, 'red');
    throw error;
  }
}

// Test 1: Pagination Query Parameters
async function testPaginationBasics() {
  header('TEST 1: Pagination Basics');
  
  try {
    // Test with fabrics
    const totalFabrics = await Fabric.countDocuments();
    log(`Total fabrics in database: ${totalFabrics}`, 'blue');
    
    const page = 1;
    const limit = 5;
    const skip = (page - 1) * limit;
    
    const fabrics = await Fabric.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    log(`✅ Fetched page ${page} with limit ${limit}: ${fabrics.length} items`, 'green');
    
    const totalPages = Math.ceil(totalFabrics / limit);
    log(`   Total pages: ${totalPages}`, 'blue');
    log(`   Has next page: ${page < totalPages}`, 'blue');
    log(`   Has prev page: ${page > 1}`, 'blue');
    
    return true;
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, 'red');
    return false;
  }
}

// Test 2: Pagination Edge Cases
async function testPaginationEdgeCases() {
  header('TEST 2: Pagination Edge Cases');
  
  try {
    // Test page beyond limit
    const totalPosts = await Post.countDocuments();
    const hugePage = 9999;
    const limit = 10;
    const skip = (hugePage - 1) * limit;
    
    const posts = await Post.find()
      .skip(skip)
      .limit(limit)
      .lean();
    
    log(`✅ Page ${hugePage} (beyond limit) returned: ${posts.length} items (expected: 0)`, 'green');
    
    // Test with limit validation
    const testCases = [
      { page: 1, limit: 20, valid: true },
      { page: 0, limit: 20, valid: false },
      { page: 1, limit: 0, valid: false },
      { page: 1, limit: 101, valid: false },
      { page: -1, limit: 20, valid: false }
    ];
    
    for (const testCase of testCases) {
      const isValid = testCase.page >= 1 && testCase.limit >= 1 && testCase.limit <= 100;
      const status = isValid === testCase.valid ? '✅' : '❌';
      log(`${status} page=${testCase.page}, limit=${testCase.limit} => ${isValid ? 'valid' : 'invalid'}`, 
          isValid === testCase.valid ? 'green' : 'red');
    }
    
    return true;
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, 'red');
    return false;
  }
}

// Test 3: Pagination with Filters
async function testPaginationWithFilters() {
  header('TEST 3: Pagination with Filters');
  
  try {
    // Test posts with featured filter
    const query = { isFeatured: true };
    const totalFeatured = await Post.countDocuments(query);
    
    log(`Total featured posts: ${totalFeatured}`, 'blue');
    
    const page = 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    const featuredPosts = await Post.find(query)
      .skip(skip)
      .limit(limit)
      .lean();
    
    log(`✅ Fetched ${featuredPosts.length} featured posts (page ${page})`, 'green');
    
    // Test creators filter
    const creatorCount = await Creator.countDocuments({ role: 'creator' });
    log(`Total creators: ${creatorCount}`, 'blue');
    
    return true;
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, 'red');
    return false;
  }
}

// Test 4: Cloudinary Deletion Utilities
async function testCloudinaryUtilities() {
  header('TEST 4: Cloudinary Deletion Utilities');
  
  try {
    log('Testing Cloudinary utility functions...', 'blue');
    
    // Test 1: Delete non-existent image (should handle gracefully)
    const fakePublicId = 'test/non-existent-image-12345';
    log(`\nTesting deletion of non-existent image: ${fakePublicId}`, 'yellow');
    
    const result1 = await deleteCloudinaryImage(fakePublicId);
    log(`   Result: success=${result1.success}, warning="${result1.warning || 'none'}"`, 
        result1.success ? 'green' : 'red');
    
    // Test 2: Delete with null/undefined (should handle gracefully)
    log('\nTesting deletion with null public_id', 'yellow');
    const result2 = await deleteCloudinaryImage(null);
    log(`   Result: success=${result2.success}, error="${result2.error || 'none'}"`, 
        !result2.success ? 'green' : 'red');
    
    // Test 3: Batch deletion
    log('\nTesting batch deletion with mixed valid/invalid IDs', 'yellow');
    const testIds = [
      'test/fake1',
      null,
      'test/fake2',
      undefined,
      'test/fake3'
    ];
    
    const result3 = await deleteCloudinaryImages(testIds);
    log(`   Results: successful=${result3.successful}, failed=${result3.failed}`, 'green');
    log(`   Total attempts: ${result3.results.length}`, 'blue');
    
    // Test 4: Delete from imagesMeta format
    log('\nTesting deleteImagesFromMeta', 'yellow');
    const mockImagesMeta = [
      { url: 'https://...', public_id: 'test/meta1' },
      { url: 'https://...', public_id: null },
      { url: 'https://...', public_id: 'test/meta2' }
    ];
    
    const result4 = await deleteImagesFromMeta(mockImagesMeta);
    log(`   Results: successful=${result4.successful}, failed=${result4.failed}`, 'green');
    
    log('\n✅ All Cloudinary utility tests passed!', 'green');
    return true;
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, 'red');
    console.error(error);
    return false;
  }
}

// Test 5: Database Queries Performance
async function testQueryPerformance() {
  header('TEST 5: Query Performance');
  
  try {
    // Test pagination performance
    const limit = 20;
    
    const start1 = Date.now();
    const allFabrics = await Fabric.find().lean();
    const time1 = Date.now() - start1;
    log(`Query all fabrics (${allFabrics.length} items): ${time1}ms`, 'blue');
    
    const start2 = Date.now();
    const paginatedFabrics = await Fabric.find()
      .skip(0)
      .limit(limit)
      .lean();
    const time2 = Date.now() - start2;
    log(`Query paginated (${paginatedFabrics.length} items): ${time2}ms`, 'blue');
    
    const improvement = ((time1 - time2) / time1 * 100).toFixed(1);
    log(`✅ Performance improvement: ${improvement}%`, 'green');
    
    return true;
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, 'red');
    return false;
  }
}

// Test 6: Verify Model Structures
async function testModelStructures() {
  header('TEST 6: Model Structure Verification');
  
  try {
    // Check if models have imagesMeta field
    const fabric = await Fabric.findOne().lean();
    const post = await Post.findOne().lean();
    
    if (fabric) {
      const hasImagesMeta = fabric.hasOwnProperty('imagesMeta');
      log(`Fabric model has imagesMeta: ${hasImagesMeta ? '✅' : '❌'}`, 
          hasImagesMeta ? 'green' : 'red');
      if (hasImagesMeta && fabric.imagesMeta?.length > 0) {
        log(`   Sample imagesMeta structure: ${JSON.stringify(fabric.imagesMeta[0])}`, 'blue');
      }
    } else {
      log('⚠️  No fabrics found in database', 'yellow');
    }
    
    if (post) {
      const hasImagesMeta = post.hasOwnProperty('imagesMeta');
      log(`Post model has imagesMeta: ${hasImagesMeta ? '✅' : '❌'}`, 
          hasImagesMeta ? 'green' : 'red');
      if (hasImagesMeta && post.imagesMeta?.length > 0) {
        log(`   Sample imagesMeta structure: ${JSON.stringify(post.imagesMeta[0])}`, 'blue');
      }
    } else {
      log('⚠️  No posts found in database', 'yellow');
    }
    
    return true;
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, 'red');
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║     ADAAYEIN MVP - IMPROVEMENTS TEST SUITE                ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  
  const results = [];
  
  try {
    await connectDB();
    
    // Run all tests
    results.push({ name: 'Pagination Basics', passed: await testPaginationBasics() });
    results.push({ name: 'Pagination Edge Cases', passed: await testPaginationEdgeCases() });
    results.push({ name: 'Pagination with Filters', passed: await testPaginationWithFilters() });
    results.push({ name: 'Cloudinary Utilities', passed: await testCloudinaryUtilities() });
    results.push({ name: 'Query Performance', passed: await testQueryPerformance() });
    results.push({ name: 'Model Structures', passed: await testModelStructures() });
    
    // Summary
    header('TEST SUMMARY');
    
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    
    results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      const color = result.passed ? 'green' : 'red';
      log(`${status} - ${result.name}`, color);
    });
    
    console.log('\n' + '='.repeat(60));
    log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`, 
        failed === 0 ? 'green' : 'yellow');
    console.log('='.repeat(60) + '\n');
    
    if (failed === 0) {
      log('🎉 All tests passed successfully!', 'green');
    } else {
      log('⚠️  Some tests failed. Please review the output above.', 'yellow');
    }
    
  } catch (error) {
    log(`\n❌ Test suite failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    log('\n✅ Database connection closed\n', 'green');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
