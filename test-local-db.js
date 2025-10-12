#!/usr/bin/env node

/**
 * Local Database Fallback Test
 * Tests database functionality with SQLite fallback
 */

require('dotenv').config({ path: '.env.local' });

console.log('🗄️  LOCAL DATABASE FALLBACK TEST');
console.log('===============================');
console.log('');

async function testLocalDatabase() {
  try {
    console.log('🔍 Testing local database fallback...');
    
    // Temporarily switch to SQLite for testing
    const originalDbUrl = process.env.DATABASE_URL;
    process.env.DATABASE_URL = 'file:./test-local.db';
    
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Local Database: SQLite connected successfully');
    
    // Test basic query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Local Database: Query test successful');
    
    // Test schema (if exists)
    try {
      const tables = await prisma.$queryRaw`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `;
      console.log(`✅ Local Database: Found ${tables.length} tables`);
    } catch (schemaError) {
      console.log('⚠️  Local Database: Schema not initialized (run migrations)');
    }
    
    await prisma.$disconnect();
    
    // Restore original database URL
    process.env.DATABASE_URL = originalDbUrl;
    
    console.log('✅ Local Database: Fallback test successful');
    console.log('   Note: Production should use PostgreSQL');
    
  } catch (error) {
    console.log('❌ Local Database:', error.message);
  }
  
  console.log('');
}

// Run the test
testLocalDatabase();




