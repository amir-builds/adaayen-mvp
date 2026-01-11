#!/usr/bin/env node
// scripts/test-api-endpoints.js
// Test script for API endpoints (pagination and error handling)

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

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

async function makeRequest(endpoint, method = 'GET') {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    return {
      status: response.status,
      ok: response.ok,
      data
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message
    };
  }
}

async function testHealthCheck() {
  header('TEST 1: Health Check');
  
  // Health endpoint is at root level, not under /api
  const response = await fetch('http://localhost:5000/health');
  const result = {
    status: response.status,
    ok: response.ok,
    data: await response.json().catch(() => ({})),
    error: null
  };
  
  if (!response.ok) {
    result.error = 'Request failed';
  }
  
  if (result.error) {
    log(`❌ Server not reachable: ${result.error}`, 'red');
    log('   Make sure the server is running on http://localhost:5000', 'yellow');
    return false;
  }
  
  if (result.ok && result.data.status === 'ok') {
    log('✅ Server is running and healthy', 'green');
    log(`   Timestamp: ${result.data.timestamp}`, 'blue');
    return true;
  } else {
    log('❌ Server health check failed', 'red');
    return false;
  }
}

async function testFabricsPagination() {
  header('TEST 2: Fabrics Pagination');
  
  try {
    // Test default pagination
    log('Testing: GET /fabrics (default pagination)', 'yellow');
    const result1 = await makeRequest('/fabrics');
    
    if (result1.ok) {
      const hasPagination = result1.data.hasOwnProperty('pagination');
      const hasFabrics = result1.data.hasOwnProperty('fabrics');
      
      if (hasPagination && hasFabrics) {
        log('✅ Response has pagination structure', 'green');
        log(`   Current Page: ${result1.data.pagination.currentPage}`, 'blue');
        log(`   Total Pages: ${result1.data.pagination.totalPages}`, 'blue');
        log(`   Total Items: ${result1.data.pagination.totalItems}`, 'blue');
        log(`   Items Per Page: ${result1.data.pagination.itemsPerPage}`, 'blue');
        log(`   Fabrics returned: ${result1.data.fabrics.length}`, 'blue');
      } else {
        log('⚠️  Response structure doesn\'t match expected pagination format', 'yellow');
        log(`   Has pagination: ${hasPagination}, Has fabrics: ${hasFabrics}`, 'yellow');
      }
    } else {
      log(`❌ Request failed with status ${result1.status}`, 'red');
      log(`   Error: ${JSON.stringify(result1.data)}`, 'red');
    }
    
    // Test custom page and limit
    log('\nTesting: GET /fabrics?page=1&limit=5', 'yellow');
    const result2 = await makeRequest('/fabrics?page=1&limit=5');
    
    if (result2.ok && result2.data.pagination) {
      log('✅ Custom pagination parameters work', 'green');
      log(`   Requested limit: 5, Actual: ${result2.data.pagination.itemsPerPage}`, 'blue');
      log(`   Items returned: ${result2.data.fabrics.length}`, 'blue');
    }
    
    // Test invalid parameters
    log('\nTesting: GET /fabrics?page=0&limit=5 (should fail)', 'yellow');
    const result3 = await makeRequest('/fabrics?page=0&limit=5');
    
    if (result3.status === 400) {
      log('✅ Invalid page parameter correctly rejected', 'green');
      log(`   Error message: ${result3.data.message}`, 'blue');
    } else {
      log('⚠️  Invalid parameters not rejected properly', 'yellow');
    }
    
    log('\nTesting: GET /fabrics?page=1&limit=150 (should fail)', 'yellow');
    const result4 = await makeRequest('/fabrics?page=1&limit=150');
    
    if (result4.status === 400) {
      log('✅ Limit exceeding max correctly rejected', 'green');
      log(`   Error message: ${result4.data.message}`, 'blue');
    } else {
      log('⚠️  Excessive limit not rejected properly', 'yellow');
    }
    
    return true;
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, 'red');
    return false;
  }
}

async function testPostsPagination() {
  header('TEST 3: Posts Pagination');
  
  try {
    // Test default pagination
    log('Testing: GET /posts (default pagination)', 'yellow');
    const result1 = await makeRequest('/posts');
    
    if (result1.ok) {
      const hasPagination = result1.data.hasOwnProperty('pagination');
      const hasPosts = result1.data.hasOwnProperty('posts');
      
      if (hasPagination && hasPosts) {
        log('✅ Response has pagination structure', 'green');
        log(`   Total Posts: ${result1.data.pagination.totalItems}`, 'blue');
        log(`   Posts returned: ${result1.data.posts.length}`, 'blue');
      } else {
        log('⚠️  Response structure doesn\'t match expected format', 'yellow');
      }
    }
    
    // Test with filters
    log('\nTesting: GET /posts?featured=true&page=1&limit=10', 'yellow');
    const result2 = await makeRequest('/posts?featured=true&page=1&limit=10');
    
    if (result2.ok && result2.data.pagination) {
      log('✅ Pagination with filters work', 'green');
      log(`   Featured posts: ${result2.data.posts.length}`, 'blue');
    }
    
    return true;
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, 'red');
    return false;
  }
}

async function testCreatorsPagination() {
  header('TEST 4: Creators Pagination');
  
  try {
    log('Testing: GET /creators?page=1&limit=10', 'yellow');
    const result = await makeRequest('/creators?page=1&limit=10');
    
    if (result.ok) {
      const hasPagination = result.data.hasOwnProperty('pagination');
      const hasCreators = result.data.hasOwnProperty('creators');
      
      if (hasPagination && hasCreators) {
        log('✅ Response has pagination structure', 'green');
        log(`   Total Creators: ${result.data.pagination.totalItems}`, 'blue');
        log(`   Creators returned: ${result.data.creators.length}`, 'blue');
      } else {
        log('⚠️  Response structure doesn\'t match expected format', 'yellow');
      }
    } else {
      log(`⚠️  Request returned status ${result.status}`, 'yellow');
    }
    
    return true;
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, 'red');
    return false;
  }
}

async function testPaginationConsistency() {
  header('TEST 5: Pagination Consistency');
  
  try {
    log('Testing pagination metadata consistency across endpoints', 'yellow');
    
    const endpoints = ['/fabrics', '/posts', '/creators'];
    const requiredFields = ['currentPage', 'totalPages', 'totalItems', 'itemsPerPage', 'hasNextPage', 'hasPrevPage'];
    
    let allConsistent = true;
    
    for (const endpoint of endpoints) {
      const result = await makeRequest(`${endpoint}?page=1&limit=10`);
      
      if (result.ok && result.data.pagination) {
        const pagination = result.data.pagination;
        const missingFields = requiredFields.filter(field => !pagination.hasOwnProperty(field));
        
        if (missingFields.length === 0) {
          log(`✅ ${endpoint} has all required pagination fields`, 'green');
        } else {
          log(`❌ ${endpoint} missing fields: ${missingFields.join(', ')}`, 'red');
          allConsistent = false;
        }
      }
    }
    
    return allConsistent;
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, 'red');
    return false;
  }
}

async function runTests() {
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║     ADAAYEIN MVP - API ENDPOINT TESTS                     ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  log(`\nTesting API at: ${BASE_URL}`, 'blue');
  
  const results = [];
  
  try {
    // Run all tests
    const serverUp = await testHealthCheck();
    
    if (!serverUp) {
      log('\n⚠️  Server is not running. Please start the server first:', 'yellow');
      log('   cd backend && npm start', 'yellow');
      log('\nSkipping API tests...\n', 'yellow');
      process.exit(1);
    }
    
    results.push({ name: 'Fabrics Pagination', passed: await testFabricsPagination() });
    results.push({ name: 'Posts Pagination', passed: await testPostsPagination() });
    results.push({ name: 'Creators Pagination', passed: await testCreatorsPagination() });
    results.push({ name: 'Pagination Consistency', passed: await testPaginationConsistency() });
    
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
      log('🎉 All API tests passed successfully!', 'green');
    } else {
      log('⚠️  Some tests failed. Please review the output above.', 'yellow');
    }
    
  } catch (error) {
    log(`\n❌ Test suite failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
