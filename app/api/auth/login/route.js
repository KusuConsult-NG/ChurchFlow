import { NextResponse } from 'next/server';
import { getPrismaClient } from '../../../../lib/database-config';

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

    // Find user in database
    const prisma = await getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
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