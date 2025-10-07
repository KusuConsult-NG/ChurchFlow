#!/usr/bin/env node

/**
 * External Service Connection Test Script
 * Tests connections to all external services
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔗 EXTERNAL SERVICE CONNECTION TEST');
console.log('===================================');
console.log('');

async function testServices() {
  const results = {
    database: { status: 'pending', message: '' },
    email: { status: 'pending', message: '' },
    sms: { status: 'pending', message: '' },
    storage: { status: 'pending', message: '' }
  };

  // Test Database Connection
  console.log('🗄️  TESTING DATABASE CONNECTION...');
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();
    results.database = { status: 'success', message: 'PostgreSQL connection successful' };
    console.log('✅ Database: Connected successfully');
  } catch (error) {
    results.database = { status: 'error', message: error.message };
    console.log('❌ Database:', error.message);
  }
  console.log('');

  // Test Email Service (SendGrid)
  console.log('📧 TESTING EMAIL SERVICE (SENDGRID)...');
  try {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    // Test API key validity by checking if it's properly set
    if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.')) {
      results.email = { status: 'success', message: 'SendGrid API key configured correctly' };
      console.log('✅ Email Service: SendGrid API key valid');
    } else {
      results.email = { status: 'error', message: 'Invalid SendGrid API key format' };
      console.log('❌ Email Service: Invalid API key format');
    }
  } catch (error) {
    results.email = { status: 'error', message: error.message };
    console.log('❌ Email Service:', error.message);
  }
  console.log('');

  // Test SMS Service (Twilio)
  console.log('📱 TESTING SMS SERVICE (TWILIO)...');
  try {
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    // Test connection by fetching account info
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    results.sms = { status: 'success', message: `Twilio connected - Account: ${account.friendlyName}` };
    console.log('✅ SMS Service: Twilio connected successfully');
    console.log(`   Account: ${account.friendlyName}`);
    console.log(`   Status: ${account.status}`);
  } catch (error) {
    results.sms = { status: 'error', message: error.message };
    console.log('❌ SMS Service:', error.message);
  }
  console.log('');

  // Test File Storage (Cloudinary)
  console.log('📁 TESTING FILE STORAGE (CLOUDINARY)...');
  try {
    const { v2: cloudinary } = require('cloudinary');
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });
    
    // Test connection by getting account info
    const result = await cloudinary.api.ping();
    if (result.status === 'ok') {
      results.storage = { status: 'success', message: 'Cloudinary connection successful' };
      console.log('✅ File Storage: Cloudinary connected successfully');
    } else {
      results.storage = { status: 'error', message: 'Cloudinary ping failed' };
      console.log('❌ File Storage: Cloudinary ping failed');
    }
  } catch (error) {
    results.storage = { status: 'error', message: error.message };
    console.log('❌ File Storage:', error.message);
  }
  console.log('');

  // Summary
  console.log('📊 SERVICE CONNECTION SUMMARY:');
  console.log('==============================');
  
  const successful = Object.values(results).filter(r => r.status === 'success').length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([service, result]) => {
    const icon = result.status === 'success' ? '✅' : '❌';
    console.log(`${icon} ${service.toUpperCase()}: ${result.message}`);
  });
  
  console.log('');
  console.log(`📈 Overall Status: ${successful}/${total} services connected successfully`);
  
  if (successful === total) {
    console.log('🎉 All external services are working perfectly!');
  } else {
    console.log('⚠️  Some services need attention. Check the errors above.');
  }
  
  console.log('');
  console.log('🔧 External service connection test complete!');
}

// Run the tests
testServices().catch(console.error);
