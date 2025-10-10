import { OAuth2Client } from 'google-auth-library';
import { NextResponse } from 'next/server';

const { users, generateToken } = require('../../../../lib/simple-auth');

// Google OAuth client
const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(req) {
  try {
    console.log('🔍 Google OAuth request received');
    
    const body = await req.json();
    const { token, role = 'MEMBER' } = body;

    console.log('🔍 Request body received:', { token: token ? 'present' : 'missing', role });

    if (!token) {
      console.log('❌ No Google token provided');
      return NextResponse.json({ 
        success: false, 
        error: 'Google token is required' 
      }, { status: 400 });
    }

    console.log('✅ Google token received, verifying...');
    
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) {
      console.log('❌ Invalid Google token');
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid Google token' 
      }, { status: 400 });
    }

    const { email, name, picture } = payload;

    if (!email) {
      console.log('❌ Email not provided by Google');
      return NextResponse.json({ 
        success: false, 
        error: 'Email not provided by Google' 
      }, { status: 400 });
    }

    console.log('✅ Google token verified for email:', email);

    // Check if user already exists
    let user = users.get(email);
    
    if (!user) {
      console.log('📝 Creating new user for:', email);
      // Create new user
      const userId = Date.now().toString();
      user = {
        id: userId,
        email,
        name: name || 'Google User',
        role: role || 'MEMBER',
        password: '', // No password for Google users
        googleId: payload.sub,
        profilePicture: picture,
        createdAt: new Date().toISOString()
      };
      users.set(email, user);
    } else {
      console.log('✅ Existing user found:', email);
    }

    // Generate our own JWT token
    const ourToken = generateToken(user.id);

    console.log('✅ Google authentication successful for:', email);
    return NextResponse.json({
      success: true,
      message: 'Google authentication successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.name,
        role: user.role,
        profilePicture: user.profilePicture
      },
      token: ourToken
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Google auth error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Google authentication failed' 
    }, { status: 500 });
  }
}