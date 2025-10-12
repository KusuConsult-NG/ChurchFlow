#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 SUPABASE COMPLETE SETUP SCRIPT');
console.log('==================================\n');

console.log('📋 STEP 1: Get Database Connection String');
console.log('Go to Supabase dashboard > Settings > Database');
console.log('Copy the URI connection string\n');

console.log('📋 STEP 2: Update Prisma Schema');
console.log('I will update prisma/schema.prisma to use PostgreSQL...\n');

// Update Prisma schema to use PostgreSQL
const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let schemaContent = fs.readFileSync(schemaPath, 'utf8');

// Replace SQLite with PostgreSQL
schemaContent = schemaContent.replace(
  'provider = "sqlite"',
  'provider = "postgresql"'
);

fs.writeFileSync(schemaPath, schemaContent);
console.log('✅ Updated prisma/schema.prisma to use PostgreSQL\n');

console.log('📋 STEP 3: Generate Prisma Client');
console.log('Running: npx prisma generate...\n');

// Generate Prisma client
const { execSync } = require('child_process');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated successfully\n');
} catch (error) {
  console.log('❌ Error generating Prisma client:', error.message);
  console.log('You may need to run: npx prisma generate\n');
}

console.log('📋 STEP 4: Environment Variables for Vercel');
console.log('Add these to your Vercel environment variables:\n');
console.log('DATABASE_URL=postgresql://postgres:[PASSWORD]@db.vsulgpvjyqnyxqyrztwlh.supabase.co:5432/postgres');
console.log('SUPABASE_URL=https://vsulgpvjyqnyxqyrztwlh.supabase.co');
console.log('SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzdWxncHZqeXFueHlxcnR6d2xoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMTgyNDksImV4cCI6MjA3NTU5NDI0OX0.L6hi8-co_vzCVK7GkA1MUcQLnqFbRa6Pc3CM_ShEvBs');
console.log('SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzdWxncHZqeXFueHlxcnR6d2xoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDAxODI0OSwiZXhwIjoyMDc1NTk0MjQ5fQ.No4jHJDHNiRSUXWuN_zjc7OLtylbgp2ZpstNPgf0QpU\n');

console.log('📋 STEP 5: Push Database Schema');
console.log('Run: npx prisma db push');
console.log('This will create all tables in your Supabase database\n');

console.log('📋 STEP 6: Deploy to Vercel');
console.log('1. Push changes to GitHub');
console.log('2. Vercel will auto-deploy');
console.log('3. Test the live application\n');

console.log('🎯 CURRENT STATUS:');
console.log('✅ Supabase project created');
console.log('✅ API keys obtained');
console.log('✅ Prisma schema updated');
console.log('⚠️  Need database password for connection string');
console.log('⚠️  Need to update Vercel environment variables\n');

console.log('🚀 YOU ARE ALMOST READY TO DEPLOY!');
console.log('Just need the database password and Vercel setup.');


