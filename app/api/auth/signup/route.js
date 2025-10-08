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
    console.log('🔍 Signup request received');
    
    // Initialize test users
    initializeTestUsers();
    
    const body = await req.json();
    const { email, password, fullName, role } = body;

    console.log('🔍 Signup data:', { email, fullName, role });

    // Basic validation
    if (!email || !password || !fullName) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email, password, and full name are required' 
      }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ 
        success: false, 
        error: 'Password must be at least 6 characters' 
      }, { status: 400 });
    }

    // Check if user already exists
    if (users.has(email)) {
      console.log('❌ User already exists:', email);
      return NextResponse.json({ 
        success: false, 
        error: 'User with this email already exists' 
      }, { status: 400 });
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      name: fullName,
      role: role || 'MEMBER',
      password // In production, hash this password
    };

    users.set(email, newUser);
    console.log('✅ User created:', newUser.id);
    console.log('📊 Total users now:', users.size);

    // Generate simple token (in production, use proper JWT)
    const token = Buffer.from(JSON.stringify({ userId: newUser.id, email: newUser.email })).toString('base64');

    console.log('✅ Signup successful for:', email);

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      },
      token
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Signup error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}