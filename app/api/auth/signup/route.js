import { NextResponse } from 'next/server';

const { users, generateToken, validateUser } = require('../../../../lib/simple-auth');

export async function POST(req) {
  try {
    console.log('🔍 Signup request received');
    
    const body = await req.json();
    const { email, password, fullName, role = 'MEMBER' } = body;

    console.log('🔍 Signup data:', { email, fullName, role });

    // Validate input
    const validation = validateUser(email, password, fullName);
    if (!validation.valid) {
      return NextResponse.json({ 
        success: false, 
        error: validation.error 
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
    const userId = Date.now().toString();
    const newUser = {
      id: userId,
      email,
      password, // In production, hash this
      name: fullName,
      role,
      createdAt: new Date().toISOString()
    };

    users.set(email, newUser);
    console.log('✅ User created:', userId);

    // Generate token
    const token = generateToken(userId);

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