import { NextResponse } from 'next/server';

// Simple in-memory user storage (in production, use a database)
const users = new Map();

// Initialize with some test users
users.set('test@churchflow.com', {
  id: 'test_user_1',
  email: 'test@churchflow.com',
  name: 'Test User',
  role: 'ADMIN',
  password: 'password123',
  createdAt: new Date(),
  updatedAt: new Date()
});

users.set('admin@churchflow.com', {
  id: 'admin_user_1',
  email: 'admin@churchflow.com',
  name: 'Admin User',
  role: 'ADMIN',
  password: 'admin123',
  createdAt: new Date(),
  updatedAt: new Date()
});

export async function POST(req) {
  try {
    console.log('🔍 Login request received');
    
    const body = await req.json();
    console.log('🔍 Login data:', { email: body.email });
    
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email and password are required' 
      }, { status: 400 });
    }

    // Find user
    const user = users.get(email);
    if (!user) {
      console.log('❌ User not found:', email);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid email or password' 
      }, { status: 401 });
    }

    // Check password (in production, use proper password hashing)
    if (user.password !== password) {
      console.log('❌ Invalid password for:', email);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid email or password' 
      }, { status: 401 });
    }

    // Generate a simple token
    const token = Buffer.from(JSON.stringify({
      userId: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    })).toString('base64');

    console.log('✅ Login successful for:', email);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token: token
      }
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Login error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
