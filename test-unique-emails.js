#!/usr/bin/env node

// Test script to generate unique emails for testing
const http = require('http');

function generateUniqueEmail() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `test-user-${timestamp}-${random}@example.com`;
}

function makeRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/customers',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: JSON.parse(responseData)
        });
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function testUniqueEmails() {
  console.log('🧪 Testing unique email creation...\n');
  
  for (let i = 1; i <= 3; i++) {
    const uniqueEmail = generateUniqueEmail();
    const testData = {
      email: uniqueEmail,
      company_name: `Test Company ${i}`,
      contact_name: `Test User ${i}`,
      phone: '1234567890',
      plan_type: 'basic'
    };

    try {
      console.log(`📧 Test ${i}: Creating account for ${uniqueEmail}`);
      const response = await makeRequest(testData);
      
      if (response.status === 200) {
        console.log(`✅ Success: Customer ID - ${response.data.customer_id}`);
      } else if (response.status === 409) {
        console.log(`❌ Conflict: Email already exists`);
      } else {
        console.log(`❌ Error: ${response.status} - ${response.data.error}`);
      }
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
    }
    
    console.log(''); // Empty line
  }
  
  console.log('🎯 Testing duplicate prevention...');
  
  // Test duplicate email
  const duplicateEmail = generateUniqueEmail();
  const testData = {
    email: duplicateEmail,
    company_name: 'Duplicate Test',
    contact_name: 'Duplicate User',
    phone: '1234567890',
    plan_type: 'basic'
  };

  try {
    // First attempt - should succeed
    console.log(`📧 First attempt: ${duplicateEmail}`);
    const response1 = await makeRequest(testData);
    console.log(`✅ First attempt: ${response1.status === 200 ? 'SUCCESS' : 'FAILED'}`);
    
    // Second attempt - should fail with 409
    console.log(`📧 Second attempt: ${duplicateEmail}`);
    const response2 = await makeRequest(testData);
    console.log(`✅ Duplicate prevention: ${response2.status === 409 ? 'WORKING' : 'FAILED'}`);
    
  } catch (error) {
    console.log(`❌ Duplicate test failed: ${error.message}`);
  }
}

if (require.main === module) {
  testUniqueEmails().catch(console.error);
}
