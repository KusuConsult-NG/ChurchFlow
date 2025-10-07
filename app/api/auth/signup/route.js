import { NextResponse } from 'next/server';

// Simple in-memory user storage (in production, use a database)
const users = new Map();

// Simple signup schema validation
function validateSignupData(data) {
  const { email, password, fullName, role = 'MEMBER' } = data;
  
  if (!email || !password || !fullName) {
    return { valid: false, error: 'Email, password, and full name are required' };
  }
  
  if (!email.includes('@')) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters' };
  }
  
  if (!['MEMBER', 'ADMIN', 'PASTOR'].includes(role)) {
    return { valid: false, error: 'Invalid role' };
  }
  
  return { valid: true };
}

export async function POST(req) {
  try {
    console.log('🔍 Signup request received');
    
    const body = await req.json();
    console.log('🔍 Signup data:', { email: body.email, fullName: body.fullName, role: body.role });
    
    // Validate input
    const validation = validateSignupData(body);
    if (!validation.valid) {
      console.log('❌ Validation failed:', validation.error);
      return NextResponse.json({ 
        success: false, 
        error: validation.error 
      }, { status: 400 });
    }

    const { email, password, fullName, role = 'MEMBER' } = body;

    // Check if user already exists
    if (users.has(email)) {
      console.log('❌ User already exists:', email);
      return NextResponse.json({ 
        success: false, 
        error: 'User with this email already exists' 
      }, { status: 400 });
    }

    // Create user
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user = {
      id: userId,
      email: email,
      name: fullName,
      role: role,
      password: password, // In production, hash this password
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store user in memory
    users.set(email, user);
    console.log('✅ User created:', user.id);

    // Generate a simple token
    const token = Buffer.from(JSON.stringify({
      userId: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    })).toString('base64');

    console.log('✅ Signup successful for:', email);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token: token
      }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Signup error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
