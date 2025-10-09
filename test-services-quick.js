#!/usr/bin/env node

// Quick Service Test Script
// Run with: node test-services-quick.js

require('dotenv').config({ path: '.env.local' });

console.log('🧪 QUICK SERVICE TEST');
console.log('==================\n');

// Test Google OAuth
console.log('🔑 Google OAuth:');
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
const googleSecret = process.env.GOOGLE_CLIENT_SECRET;
if (googleClientId && googleClientId !== 'your-google-client-id' && googleClientId.includes('.apps.googleusercontent.com')) {
  console.log('✅ Google OAuth configured');
  console.log(`   Client ID: ${googleClientId.substring(0, 20)}...`);
  if (googleSecret && googleSecret !== 'your-google-client-secret') {
    console.log('   Client Secret: ✅ Set');
  } else {
    console.log('   Client Secret: ⚠️  Still needs actual secret');
  }
} else {
  console.log('❌ Google OAuth not configured');
  console.log('   Get credentials from: https://console.cloud.google.com/');
}

// Test SendGrid
console.log('\n📧 SendGrid Email:');
const sendgridKey = process.env.SENDGRID_API_KEY;
if (sendgridKey && sendgridKey.startsWith('SG.')) {
  console.log('✅ SendGrid configured');
  console.log(`   API Key: ${sendgridKey.substring(0, 10)}...`);
} else {
  console.log('❌ SendGrid not configured');
  console.log('   Get API key from: https://app.sendgrid.com/');
}

// Test Twilio
console.log('\n📱 Twilio SMS:');
const twilioSid = process.env.TWILIO_ACCOUNT_SID;
const twilioToken = process.env.TWILIO_AUTH_TOKEN;
if (twilioSid && twilioSid.startsWith('AC') && twilioToken) {
  console.log('✅ Twilio configured');
  console.log(`   Account SID: ${twilioSid.substring(0, 10)}...`);
} else {
  console.log('❌ Twilio not configured');
  console.log('   Get credentials from: https://console.twilio.com/');
}

// Test Cloudinary
console.log('\n📁 Cloudinary Storage:');
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudKey = process.env.CLOUDINARY_API_KEY;
if (cloudName && cloudKey) {
  console.log('✅ Cloudinary configured');
  console.log(`   Cloud Name: ${cloudName}`);
} else {
  console.log('❌ Cloudinary not configured');
  console.log('   Get credentials from: https://cloudinary.com/console');
}

// Test Database
console.log('\n🗄️ Database:');
const dbUrl = process.env.DATABASE_URL;
if (dbUrl && dbUrl.includes('postgresql://')) {
  console.log('✅ Database URL configured');
  console.log('   Type: PostgreSQL');
} else {
  console.log('❌ Database not configured');
  console.log('   Check DATABASE_URL in .env.local');
}

console.log('\n🎯 SUMMARY:');
console.log('===========');
const services = [
  { name: 'Google OAuth', configured: googleClientId && googleClientId !== 'your-google-client-id' },
  { name: 'SendGrid', configured: sendgridKey && sendgridKey.startsWith('SG.') },
  { name: 'Twilio', configured: twilioSid && twilioSid.startsWith('AC') },
  { name: 'Cloudinary', configured: cloudName && cloudKey },
  { name: 'Database', configured: dbUrl && dbUrl.includes('postgresql://') }
];

const configured = services.filter(s => s.configured).length;
const total = services.length;

console.log(`Configured: ${configured}/${total} services`);

if (configured === total) {
  console.log('🎉 All services configured! Run `npm run dev` to start.');
} else {
  console.log('⚠️  Some services need configuration. Check the guides above.');
}

console.log('\n📚 Setup Guides:');
console.log('- Google OAuth: GOOGLE_OAUTH_QUICK_SETUP.md');
console.log('- SendGrid: SENDGRID_QUICK_SETUP.md');
console.log('- Twilio: TWILIO_QUICK_SETUP.md');
console.log('- Cloudinary: CLOUDINARY_QUICK_SETUP.md');
console.log('- Complete Template: COMPLETE_ENV_TEMPLATE.md');
