import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

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
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('❌ User already exists:', email);
      return NextResponse.json({ 
        success: false, 
        error: 'User with this email already exists' 
      }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('✅ Password hashed successfully');

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email,
        name: fullName,
        password: hashedPassword,
        role: role,
        emailVerified: null
      }
    });

    console.log('✅ User created in database:', user.id);

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
  } finally {
    await prisma.$disconnect();
  }
}
