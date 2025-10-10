#!/usr/bin/env node

// Environment Setup Script for ChurchFlow
// This script will help you update your .env.local file with the correct values

const fs = require('fs');
const path = require('path');

console.log('🔧 ChurchFlow Environment Setup Script');
console.log('=====================================\n');

// Read current .env.local
const envPath = path.join(__dirname, '.env.local');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ Found existing .env.local file');
} else {
  console.log('❌ .env.local file not found');
  process.exit(1);
}

// Google OAuth credentials found in documentation
const googleClientId = '580742150709-mpn30oboekd15954ajfiqdi7fuf6ueta.apps.googleusercontent.com';

console.log('\n🔑 UPDATING GOOGLE OAUTH CREDENTIALS...');
console.log('Found Google Client ID in documentation:', googleClientId);

// Update Google OAuth configuration
let updatedContent = envContent
  .replace(/GOOGLE_CLIENT_ID="your-google-client-id"/g, `GOOGLE_CLIENT_ID="${googleClientId}"`)
  .replace(/NEXT_PUBLIC_GOOGLE_CLIENT_ID="[^"]*"/g, `NEXT_PUBLIC_GOOGLE_CLIENT_ID="${googleClientId}"`)
  .replace(/GOOGLE_CLIENT_SECRET="your-google-client-secret"/g, 'GOOGLE_CLIENT_SECRET="your-google-client-secret"');

// Add missing environment variables
if (!updatedContent.includes('NEXT_PUBLIC_GOOGLE_CLIENT_ID')) {
  updatedContent += `\nNEXT_PUBLIC_GOOGLE_CLIENT_ID="${googleClientId}"`;
}

if (!updatedContent.includes('GOOGLE_REDIRECT_URI')) {
  updatedContent += '\nGOOGLE_REDIRECT_URI="postmessage"';
}

if (!updatedContent.includes('SENDGRID_API_KEY')) {
  updatedContent += '\nSENDGRID_API_KEY="your-sendgrid-api-key-here"';
}

if (!updatedContent.includes('SENDGRID_FROM_EMAIL')) {
  updatedContent += '\nSENDGRID_FROM_EMAIL="noreply@churchflow.com"';
}

if (!updatedContent.includes('SENDGRID_FROM_NAME')) {
  updatedContent += '\nSENDGRID_FROM_NAME="ChurchFlow"';
}

if (!updatedContent.includes('TWILIO_ACCOUNT_SID')) {
  updatedContent += '\nTWILIO_ACCOUNT_SID="your-twilio-account-sid-here"';
}

if (!updatedContent.includes('TWILIO_AUTH_TOKEN')) {
  updatedContent += '\nTWILIO_AUTH_TOKEN="your-twilio-auth-token-here"';
}

if (!updatedContent.includes('TWILIO_PHONE_NUMBER')) {
  updatedContent += '\nTWILIO_PHONE_NUMBER="+1234567890"';
}

if (!updatedContent.includes('CLOUDINARY_CLOUD_NAME')) {
  updatedContent += '\nCLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name-here"';
}

if (!updatedContent.includes('CLOUDINARY_API_KEY')) {
  updatedContent += '\nCLOUDINARY_API_KEY="your-cloudinary-api-key-here"';
}

if (!updatedContent.includes('CLOUDINARY_API_SECRET')) {
  updatedContent += '\nCLOUDINARY_API_SECRET="your-cloudinary-api-secret-here"';
}

// Write updated content
fs.writeFileSync(envPath, updatedContent);
console.log('✅ Updated .env.local with Google OAuth credentials');

console.log('\n📋 NEXT STEPS:');
console.log('==============');
console.log('1. You still need to provide:');
console.log('   - GOOGLE_CLIENT_SECRET (get from Google Cloud Console)');
console.log('   - SENDGRID_API_KEY (get from SendGrid Dashboard)');
console.log('   - TWILIO_ACCOUNT_SID & TWILIO_AUTH_TOKEN (get from Twilio Console)');
console.log('   - CLOUDINARY_CLOUD_NAME, API_KEY & API_SECRET (get from Cloudinary Dashboard)');

console.log('\n2. Test the current configuration:');
console.log('   node test-services-quick.js');

console.log('\n3. Start development server:');
console.log('   npm run dev');

console.log('\n🎯 Google OAuth should now work with the Client ID from documentation!');
console.log('   You just need to add the Client Secret from Google Cloud Console.');

