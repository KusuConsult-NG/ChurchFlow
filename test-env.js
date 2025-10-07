#!/usr/bin/env node

/**
 * Environment Variable Test Script
 * Tests if environment variables are properly loaded in Node.js context
 */

require('dotenv').config({ path: '.env.local' });

console.log('🌐 ENVIRONMENT VARIABLE LOADING TEST');
console.log('===================================');
console.log('');

// Test database configuration
console.log('🗄️  DATABASE CONFIGURATION:');
console.log('==========================');
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}`);
if (process.env.DATABASE_URL) {
  console.log(`Database Type: ${process.env.DATABASE_URL.includes('postgresql') ? 'PostgreSQL' : 'SQLite'}`);
}
console.log('');

// Test email service configuration
console.log('📧 EMAIL SERVICE CONFIGURATION:');
console.log('===============================');
console.log(`SENDGRID_API_KEY: ${process.env.SENDGRID_API_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM || '❌ Missing'}`);
console.log(`EMAIL_FROM_NAME: ${process.env.EMAIL_FROM_NAME || '❌ Missing'}`);
console.log('');

// Test SMS service configuration
console.log('📱 SMS SERVICE CONFIGURATION:');
console.log('=============================');
console.log(`TWILIO_ACCOUNT_SID: ${process.env.TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Missing'}`);
console.log(`TWILIO_AUTH_TOKEN: ${process.env.TWILIO_AUTH_TOKEN ? '✅ Set' : '❌ Missing'}`);
console.log(`TWILIO_PHONE_NUMBER: ${process.env.TWILIO_PHONE_NUMBER || '❌ Missing'}`);
console.log('');

// Test file storage configuration
console.log('📁 FILE STORAGE CONFIGURATION:');
console.log('==============================');
console.log(`CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME || '❌ Missing'}`);
console.log(`CLOUDINARY_API_KEY: ${process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`CLOUDINARY_API_SECRET: ${process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing'}`);
console.log(`MAX_FILE_SIZE: ${process.env.MAX_FILE_SIZE || '❌ Missing'}`);
console.log('');

// Test NextAuth configuration
console.log('🔐 NEXTAUTH CONFIGURATION:');
console.log('==========================');
console.log(`NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || '❌ Missing'}`);
console.log(`NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing'}`);
console.log('');

// Test application configuration
console.log('⚙️  APPLICATION CONFIGURATION:');
console.log('===============================');
console.log(`NODE_ENV: ${process.env.NODE_ENV || '❌ Missing'}`);
console.log('');

// Summary
const requiredVars = [
  'DATABASE_URL',
  'SENDGRID_API_KEY',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'NEXTAUTH_SECRET'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

console.log('📊 SUMMARY:');
console.log('===========');
if (missingVars.length === 0) {
  console.log('✅ All required environment variables are loaded!');
  console.log('✅ Environment configuration is complete!');
} else {
  console.log(`❌ Missing ${missingVars.length} required environment variables:`);
  missingVars.forEach(varName => console.log(`   • ${varName}`));
}

console.log('');
console.log('🔧 Environment variable loading test complete!');

