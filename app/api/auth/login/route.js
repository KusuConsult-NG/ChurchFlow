import { NextResponse } from 'next/server';

import { users, generateToken } from '../../../../lib/shared-auth';

export async function POST(req) {
  try {
    console.log('🔍 Login request received');
    
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

    // Generate token
    const token = generateToken(user.id);

    console.log('✅ Login successful for:', email);

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.name,
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