#!/usr/bin/env node

// Integration Test Script for KiTS Provisioning System
// Run with: node test-integration.js

const http = require('http');
const { URL } = require('url');

const BASE_URL = 'http://localhost:3000';

// Test configuration
const tests = [
  {
    name: 'Main Homepage Loads',
    path: '/',
    expectedStatus: 200,
    checks: ['KiTS Hub', 'Get Started Free']
  },
  {
    name: 'Onboarding Page Loads',
    path: '/onboarding',
    expectedStatus: 200,
    checks: ['Welcome to KiTS', 'Step 1 of 5']
  },
  {
    name: 'Email Pre-fill Works',
    path: '/onboarding?email=test@example.com',
    expectedStatus: 200,
    checks: ['test@example.com']
  },
  {
    name: 'Admin Portal Loads',
    path: '/admin/provisioning',
    expectedStatus: 200,
    checks: ['Provisioning Dashboard']
  },
  {
    name: 'Waiting Screen Loads',
    path: '/onboarding/waiting',
    expectedStatus: 200,
    checks: ['Your KiTS Account']
  },
  {
    name: 'Customer API Works',
    path: '/api/customers',
    method: 'POST',
    expectedStatus: 200,
    body: JSON.stringify({
      email: 'test-integration@example.com',
      company_name: 'Integration Test Company',
      contact_name: 'Test User',
      phone: '1234567890',
      plan_type: 'basic'
    }),
    checks: ['success', 'customer_id']
  },
  {
    name: 'Supabase Connection Test API',
    path: '/api/test-supabase-connection',
    method: 'POST',
    expectedStatus: 400, // Should fail with invalid credentials
    body: JSON.stringify({
      project_url: 'https://invalid.supabase.co',
      service_role_key: 'invalid_key'
    }),
    checks: ['error']
  }
];

// Utility function to make HTTP requests
function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const url = new URL(options.path, BASE_URL);
    const requestOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('🚀 Starting KiTS Integration Tests...\n');
  
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`📋 Testing: ${test.name}`);
      
      const response = await makeRequest(test);
      
      // Check status code
      if (response.status !== test.expectedStatus) {
        console.log(`❌ Failed: Expected status ${test.expectedStatus}, got ${response.status}`);
        failed++;
        continue;
      }

      // Check content
      let contentChecks = 0;
      for (const check of test.checks) {
        if (response.body.includes(check)) {
          contentChecks++;
        } else {
          console.log(`⚠️  Warning: Expected to find "${check}" in response`);
        }
      }

      if (contentChecks === test.checks.length) {
        console.log(`✅ Passed: ${test.name}`);
        passed++;
      } else {
        console.log(`❌ Failed: ${test.name} - Missing content checks`);
        failed++;
      }

    } catch (error) {
      console.log(`❌ Failed: ${test.name} - ${error.message}`);
      failed++;
    }
    
    console.log(''); // Empty line for readability
  }

  // Summary
  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! The KiTS provisioning system is ready for production.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.');
  }
}

// Check if server is running
async function checkServer() {
  try {
    await makeRequest({ path: '/' });
    return true;
  } catch (error) {
    console.log('❌ Server is not running. Please start it with: npm run dev');
    console.log('Then run this test again.');
    return false;
  }
}

// Main execution
async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runTests();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runTests, checkServer };
