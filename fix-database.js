#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing database configuration...');

// Read current .env.local
const envPath = path.join(__dirname, '.env.local');
let envContent = fs.readFileSync(envPath, 'utf8');

// Replace Neon PostgreSQL with local SQLite
const oldDbUrl = 'DATABASE_URL="postgresql://neondb_owner:npg_OU1J5FlrqZcG@ep-wispy-leaf-adcb35hw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"';
const newDbUrl = 'DATABASE_URL="file:./dev.db"';

if (envContent.includes(oldDbUrl)) {
  envContent = envContent.replace(oldDbUrl, newDbUrl);
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Database URL updated to local SQLite');
} else {
  console.log('⚠️  Database URL not found or already updated');
}

console.log('🚀 Database configuration fixed!');
console.log('📝 Next steps:');
console.log('   1. Run: npx prisma generate');
console.log('   2. Run: npx prisma db push');
console.log('   3. Test the application');


