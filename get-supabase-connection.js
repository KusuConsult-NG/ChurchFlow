#!/usr/bin/env node

console.log('🗄️ SUPABASE DATABASE CONNECTION SETUP');
console.log('======================================\n');

console.log('✅ You have Supabase API keys:');
console.log('   - Anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
console.log('   - Service role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\n');

console.log('📋 NOW GET THE DATABASE CONNECTION STRING:');
console.log('1. Go to your Supabase project dashboard');
console.log('2. Click on "Settings" in the left sidebar');
console.log('3. Click on "Database"');
console.log('4. Scroll down to "Connection string" section');
console.log('5. Copy the "URI" connection string');
console.log('6. It will look like: postgresql://postgres:[password]@db.vsulgpvjyqnyxqyrztwlh.supabase.co:5432/postgres\n');

console.log('🔧 ALTERNATIVE: Build connection string manually');
console.log('Based on your project reference "vsulgpvjyqnyxqyrztwlh":');
console.log('Host: db.vsulgpvjyqnyxqyrztwlh.supabase.co');
console.log('Port: 5432');
console.log('Database: postgres');
console.log('Username: postgres');
console.log('Password: [your database password]\n');

console.log('📝 CONNECTION STRING FORMAT:');
console.log('postgresql://postgres:[YOUR_PASSWORD]@db.vsulgpvjyqnyxqyrztwlh.supabase.co:5432/postgres\n');

console.log('🚀 NEXT STEPS:');
console.log('1. Get the database password (set when you created the project)');
console.log('2. Build the connection string');
console.log('3. Update Vercel environment variables');
console.log('4. Update Prisma schema to postgresql');
console.log('5. Deploy to Vercel\n');

console.log('💡 TIP: If you forgot the password, you can reset it in Supabase dashboard');
console.log('   Settings > Database > Reset database password');


