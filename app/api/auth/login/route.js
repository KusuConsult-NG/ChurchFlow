import { NextResponse } from 'next/server';

// Simple in-memory user storage for testing
const users = new Map();

// Initialize with test users only if not already present
function initializeTestUsers() {
  if (users.size === 0) {
    users.set('test@churchflow.com', {
      id: '1',
      email: 'test@churchflow.com',
      name: 'Test User',
      role: 'ADMIN',
      password: 'TestPassword123!'
    });

    users.set('admin@churchflow.com', {
      id: '2',
      email: 'admin@churchflow.com',
      name: 'Admin User',
      role: 'ADMIN',
      password: 'AdminPassword123!'
    });

    users.set('member@churchflow.com', {
      id: '3',
      email: 'member@churchflow.com',
      name: 'Member User',
      role: 'MEMBER',
      password: 'MemberPassword123!'
    });
  }
}

export async function POST(req) {
  try {
    console.log('🔍 Login request received');
    
    // Initialize test users
    initializeTestUsers();
    
    const body = await req.json();
    const { email, password } = body;

    console.log('🔍 Login data:', { email });

    // Basic validation
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

    // Check password
    if (user.password !== password) {
      console.log('❌ Invalid password for:', email);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid email or password' 
      }, { status: 401 });
    }

    console.log('✅ User authenticated:', user.email);

    // Generate simple token (in production, use proper JWT)
    const token = Buffer.from(JSON.stringify({ userId: user.id, email: user.email })).toString('base64');

    console.log('✅ Login successful for:', email);

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Login error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}