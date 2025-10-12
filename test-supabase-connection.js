const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    connectionString: "postgresql://postgres:_)(*!%40%23%24%25%5EJo2030%25%26%24%5E@db.vsulgpvjyqnxyqrtzwlh.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔄 Testing Supabase connection...');
    await client.connect();
    console.log('✅ Connected to Supabase!');
    
    const result = await client.query('SELECT version()');
    console.log('📊 Database version:', result.rows[0].version);
    
    await client.end();
    console.log('✅ Connection test successful!');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('🔍 Error details:', error);
  }
}

testConnection();

