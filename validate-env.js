#!/usr/bin/env node

/**
 * Environment Validation Script
 * Validates environment configuration and provides setup guidance
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔍 ENVIRONMENT VALIDATION');
console.log('=========================');
console.log('');

const validationResults = {
  database: { status: 'pending', issues: [], recommendations: [] },
  email: { status: 'pending', issues: [], recommendations: [] },
  sms: { status: 'pending', issues: [], recommendations: [] },
  storage: { status: 'pending', issues: [], recommendations: [] },
  auth: { status: 'pending', issues: [], recommendations: [] }
};

// Validate Database Configuration
console.log('🗄️  VALIDATING DATABASE CONFIGURATION...');
if (!process.env.DATABASE_URL) {
  validationResults.database.issues.push('DATABASE_URL is not set');
  validationResults.database.recommendations.push('Set DATABASE_URL in .env.local');
} else if (process.env.DATABASE_URL.includes('postgresql')) {
  validationResults.database.status = 'configured';
  console.log('✅ Database: PostgreSQL configured');
} else if (process.env.DATABASE_URL.includes('file:')) {
  validationResults.database.status = 'development';
  console.log('⚠️  Database: Using SQLite (development only)');
  validationResults.database.recommendations.push('Switch to PostgreSQL for production');
} else {
  validationResults.database.issues.push('Invalid DATABASE_URL format');
  validationResults.database.recommendations.push('Use PostgreSQL or SQLite format');
}

// Validate Email Service Configuration
console.log('📧 VALIDATING EMAIL SERVICE CONFIGURATION...');
if (!process.env.SENDGRID_API_KEY) {
  validationResults.email.issues.push('SENDGRID_API_KEY is not set');
  validationResults.email.recommendations.push('Get API key from SendGrid dashboard');
} else if (!process.env.SENDGRID_API_KEY.startsWith('SG.')) {
  validationResults.email.issues.push('Invalid SendGrid API key format');
  validationResults.email.recommendations.push('API key should start with "SG."');
} else {
  validationResults.email.status = 'configured';
  console.log('✅ Email Service: SendGrid configured');
}

if (!process.env.EMAIL_FROM) {
  validationResults.email.issues.push('EMAIL_FROM is not set');
  validationResults.email.recommendations.push('Set EMAIL_FROM to your domain email');
}

// Validate SMS Service Configuration
console.log('📱 VALIDATING SMS SERVICE CONFIGURATION...');
if (!process.env.TWILIO_ACCOUNT_SID) {
  validationResults.sms.issues.push('TWILIO_ACCOUNT_SID is not set');
  validationResults.sms.recommendations.push('Get Account SID from Twilio dashboard');
} else if (!process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
  validationResults.sms.issues.push('Invalid Twilio Account SID format');
  validationResults.sms.recommendations.push('Account SID should start with "AC"');
} else {
  validationResults.sms.status = 'configured';
  console.log('✅ SMS Service: Twilio configured');
}

if (!process.env.TWILIO_AUTH_TOKEN) {
  validationResults.sms.issues.push('TWILIO_AUTH_TOKEN is not set');
  validationResults.sms.recommendations.push('Get Auth Token from Twilio dashboard');
}

if (!process.env.TWILIO_PHONE_NUMBER) {
  validationResults.sms.issues.push('TWILIO_PHONE_NUMBER is not set');
  validationResults.sms.recommendations.push('Get Phone Number from Twilio dashboard');
}

// Validate File Storage Configuration
console.log('📁 VALIDATING FILE STORAGE CONFIGURATION...');
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  validationResults.storage.issues.push('CLOUDINARY_CLOUD_NAME is not set');
  validationResults.storage.recommendations.push('Get Cloud Name from Cloudinary dashboard');
} else {
  validationResults.storage.status = 'configured';
  console.log('✅ File Storage: Cloudinary configured');
}

if (!process.env.CLOUDINARY_API_KEY) {
  validationResults.storage.issues.push('CLOUDINARY_API_KEY is not set');
  validationResults.storage.recommendations.push('Get API Key from Cloudinary dashboard');
}

if (!process.env.CLOUDINARY_API_SECRET) {
  validationResults.storage.issues.push('CLOUDINARY_API_SECRET is not set');
  validationResults.storage.recommendations.push('Get API Secret from Cloudinary dashboard');
}

// Validate Authentication Configuration
console.log('🔐 VALIDATING AUTHENTICATION CONFIGURATION...');
if (!process.env.NEXTAUTH_SECRET) {
  validationResults.auth.issues.push('NEXTAUTH_SECRET is not set');
  validationResults.auth.recommendations.push('Generate a secure secret: openssl rand -base64 32');
} else if (process.env.NEXTAUTH_SECRET.length < 32) {
  validationResults.auth.issues.push('NEXTAUTH_SECRET is too short');
  validationResults.auth.recommendations.push('Use a secret with at least 32 characters');
} else {
  validationResults.auth.status = 'configured';
  console.log('✅ Authentication: NextAuth configured');
}

if (!process.env.NEXTAUTH_URL) {
  validationResults.auth.issues.push('NEXTAUTH_URL is not set');
  validationResults.auth.recommendations.push('Set NEXTAUTH_URL to your domain');
}

console.log('');

// Generate Summary Report
console.log('📊 VALIDATION SUMMARY');
console.log('====================');

let totalIssues = 0;
let configuredServices = 0;

Object.entries(validationResults).forEach(([service, result]) => {
  const issues = result.issues.length;
  const recommendations = result.recommendations.length;
  totalIssues += issues;
  
  if (result.status === 'configured') {
    configuredServices++;
  }
  
  const icon = issues === 0 ? '✅' : issues <= 2 ? '⚠️' : '❌';
  console.log(`${icon} ${service.toUpperCase()}: ${issues} issues, ${recommendations} recommendations`);
  
  if (issues > 0) {
    result.issues.forEach(issue => {
      console.log(`   • ${issue}`);
    });
  }
});

console.log('');
console.log(`📈 Overall Status: ${configuredServices}/5 services configured`);
console.log(`🔧 Total Issues: ${totalIssues}`);

if (totalIssues === 0) {
  console.log('🎉 All services are properly configured!');
} else {
  console.log('⚠️  Some configuration issues need attention.');
  console.log('');
  console.log('🔧 RECOMMENDATIONS:');
  console.log('==================');
  
  Object.entries(validationResults).forEach(([service, result]) => {
    if (result.recommendations.length > 0) {
      console.log(`${service.toUpperCase()}:`);
      result.recommendations.forEach(rec => {
        console.log(`   • ${rec}`);
      });
      console.log('');
    }
  });
}

console.log('🔍 Environment validation complete!');


