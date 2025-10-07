#!/usr/bin/env node

/**
 * API Endpoint Testing Suite
 * Tests all API endpoints to ensure they're working correctly
 */

require('dotenv').config({ path: '.env.local' });

console.log('🌐 API ENDPOINT TESTING SUITE');
console.log('=============================');
console.log('');

const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const testResults = {
  health: { status: 'pending', response: null, duration: 0 },
  sms: { status: 'pending', response: null, duration: 0 },
  email: { status: 'pending', response: null, duration: 0 },
  upload: { status: 'pending', response: null, duration: 0 }
};

// Test Health Endpoint
async function testHealthEndpoint() {
  const startTime = Date.now();
  console.log('🏥 TESTING HEALTH ENDPOINT...');
  
  try {
    const response = await fetch(`${baseUrl}/api/health`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Health: Endpoint responding');
      console.log(`   Status: ${data.status}`);
      console.log(`   Environment: ${data.environment}`);
      
      if (data.checks) {
        Object.entries(data.checks).forEach(([service, check]) => {
          const icon = check.status === 'ok' ? '✅' : '⚠️';
          console.log(`   ${icon} ${service}: ${check.status}`);
        });
      }
      
      testResults.health = {
        status: 'success',
        response: data,
        duration: Date.now() - startTime
      };
    } else {
      throw new Error(`HTTP ${response.status}: ${data.error || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.log('❌ Health:', error.message);
    testResults.health = {
      status: 'error',
      response: { error: error.message },
      duration: Date.now() - startTime
    };
  }
  
  console.log('');
}

// Test SMS Endpoint
async function testSMSEndpoint() {
  const startTime = Date.now();
  console.log('📱 TESTING SMS ENDPOINT...');
  
  try {
    const response = await fetch(`${baseUrl}/api/test-sms`, {
      method: 'GET'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SMS: Endpoint responding');
      console.log(`   Service: ${data.service}`);
      console.log(`   Status: ${data.status}`);
      console.log(`   Phone: ${data.phoneNumber}`);
      
      testResults.sms = {
        status: 'success',
        response: data,
        duration: Date.now() - startTime
      };
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`HTTP ${response.status}: ${errorData.error}`);
    }
    
  } catch (error) {
    console.log('❌ SMS:', error.message);
    testResults.sms = {
      status: 'error',
      response: { error: error.message },
      duration: Date.now() - startTime
    };
  }
  
  console.log('');
}

// Test Email Endpoint
async function testEmailEndpoint() {
  const startTime = Date.now();
  console.log('📧 TESTING EMAIL ENDPOINT...');
  
  try {
    const response = await fetch(`${baseUrl}/api/email`, {
      method: 'GET'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Email: Endpoint responding');
      console.log(`   Service: ${data.service || 'Email Service'}`);
      
      testResults.email = {
        status: 'success',
        response: data,
        duration: Date.now() - startTime
      };
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`HTTP ${response.status}: ${errorData.error}`);
    }
    
  } catch (error) {
    console.log('❌ Email:', error.message);
    testResults.email = {
      status: 'error',
      response: { error: error.message },
      duration: Date.now() - startTime
    };
  }
  
  console.log('');
}

// Test Upload Endpoint
async function testUploadEndpoint() {
  const startTime = Date.now();
  console.log('📁 TESTING UPLOAD ENDPOINT...');
  
  try {
    const response = await fetch(`${baseUrl}/api/upload`, {
      method: 'GET'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Upload: Endpoint responding');
      console.log(`   Service: ${data.service || 'File Upload Service'}`);
      
      testResults.upload = {
        status: 'success',
        response: data,
        duration: Date.now() - startTime
      };
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`HTTP ${response.status}: ${errorData.error}`);
    }
    
  } catch (error) {
    console.log('❌ Upload:', error.message);
    testResults.upload = {
      status: 'error',
      response: { error: error.message },
      duration: Date.now() - startTime
    };
  }
  
  console.log('');
}

// Generate API Test Report
function generateAPIReport() {
  console.log('📊 API ENDPOINT TEST REPORT');
  console.log('===========================');
  console.log('');
  
  const successful = Object.values(testResults).filter(r => r.status === 'success').length;
  const errors = Object.values(testResults).filter(r => r.status === 'error').length;
  const total = Object.keys(testResults).length;
  
  console.log('📈 OVERALL STATUS:');
  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`❌ Errors: ${errors}`);
  console.log('');
  
  console.log('🔍 DETAILED RESULTS:');
  console.log('===================');
  
  Object.entries(testResults).forEach(([endpoint, result]) => {
    const icon = result.status === 'success' ? '✅' : '❌';
    const duration = `${result.duration}ms`;
    
    console.log(`${icon} ${endpoint.toUpperCase()}: ${result.status.toUpperCase()} (${duration})`);
    
    if (result.response && result.response.error) {
      console.log(`   • Error: ${result.response.error}`);
    }
  });
  
  console.log('');
  console.log('🎯 RECOMMENDATIONS:');
  console.log('==================');
  
  if (errors === 0) {
    console.log('🎉 All API endpoints are working!');
    console.log('✅ Your API is ready for production!');
  } else {
    console.log('❌ Some API endpoints need attention:');
    Object.entries(testResults).forEach(([endpoint, result]) => {
      if (result.status === 'error') {
        console.log(`   • ${endpoint.toUpperCase()}: ${result.response.error}`);
      }
    });
  }
  
  console.log('');
  console.log('🌐 API endpoint testing complete!');
}

// Run all API tests
async function runAPITests() {
  console.log(`🔗 Testing API endpoints at: ${baseUrl}`);
  console.log('');
  
  await testHealthEndpoint();
  await testSMSEndpoint();
  await testEmailEndpoint();
  await testUploadEndpoint();
  
  generateAPIReport();
}

// Execute API tests
runAPITests().catch(console.error);
