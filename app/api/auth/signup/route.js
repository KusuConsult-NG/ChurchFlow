import { NextResponse } from 'next/server';

import { createUser, userExists } from '../../../../lib/user-storage';

export async function POST(req) {
  try {
    console.log('🔍 Signup request received');
    
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
    if (userExists(email)) {
      console.log('❌ User already exists:', email);
      return NextResponse.json({ 
        success: false, 
        error: 'User with this email already exists' 
      }, { status: 400 });
    }

    // Create new user
    const newUser = createUser({ email, password, fullName, role });
    console.log('✅ User created:', newUser.id);

    // Generate simple token (in production, use proper JWT)
    const token = Buffer.from(JSON.stringify({ userId: newUser.id, email: newUser.email })).toString('base64');

    console.log('✅ Signup successful for:', email);

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.name,
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