import { OAuth2Client } from 'google-auth-library';
import { NextResponse } from 'next/server';

import { createSuccessResponse, createErrorResponse, generateToken } from '../../../../lib/auth';
import { GOOGLE_CONFIG } from '../../../../lib/google-config';
import { getUserByEmail, createUser } from '../../../../lib/user-storage';

const client = new OAuth2Client(GOOGLE_CONFIG.CLIENT_ID);

// Simple rate limiting storage (in production, use Redis or database)
const rateLimitStore = new Map();

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 60 * 60 * 1000 // 1 hour
};

function checkRateLimit(identifier) {
  const now = Date.now();
  const key = `google_auth_${identifier}`;
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, {
      attempts: 0,
      firstAttempt: now,
      blockedUntil: 0
    });
  }
  
  const data = rateLimitStore.get(key);
  
  // Check if currently blocked
  if (data.blockedUntil > now) {
    const retryAfter = Math.ceil((data.blockedUntil - now) / 1000);
    return {
      allowed: false,
      retryAfter,
      message: `Too many authentication attempts. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`
    };
  }
  
  // Reset if window has passed
  if (now - data.firstAttempt > RATE_LIMIT_CONFIG.windowMs) {
    data.attempts = 0;
    data.firstAttempt = now;
    data.blockedUntil = 0;
  }
  
  // Check if exceeded max attempts
  if (data.attempts >= RATE_LIMIT_CONFIG.maxAttempts) {
    data.blockedUntil = now + RATE_LIMIT_CONFIG.blockDurationMs;
    const retryAfter = Math.ceil(RATE_LIMIT_CONFIG.blockDurationMs / 1000);
    return {
      allowed: false,
      retryAfter,
      message: `Too many authentication attempts. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`
    };
  }
  
  // Increment attempts
  data.attempts++;
  
  return {
    allowed: true,
    attemptsRemaining: RATE_LIMIT_CONFIG.maxAttempts - data.attempts
  };
}

function getClientIdentifier(req) {
  // Use IP address for rate limiting
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';
  return ip;
}

export async function POST(req) {
  try {
    console.log('🔍 Google OAuth request received');
    
    // Check if Google OAuth is properly configured
    if (!GOOGLE_CONFIG.isConfigured()) {
      console.log('❌ Google OAuth not configured');
      return NextResponse.json(createErrorResponse(
        'Google OAuth is not configured. Please set up Google OAuth credentials in your .env.local file.'
      ), { status: 400 });
    }

    const body = await req.json();
    console.log('🔍 Request body received:', { token: body.token ? 'present' : 'missing', role: body.role });
    
    const { token, role = 'rider' } = body;

    if (!token) {
      console.log('❌ No Google token provided');
      return NextResponse.json(createErrorResponse('Google token is required'), { status: 400 });
    }

    console.log('✅ Google token received, verifying...');
    
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CONFIG.CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) {
      console.log('❌ Invalid Google token');
      return NextResponse.json(createErrorResponse('Invalid Google token'), { status: 400 });
    }

    const { email, name, picture } = payload;

    if (!email) {
      console.log('❌ Email not provided by Google');
      return NextResponse.json(createErrorResponse('Email not provided by Google'), { status: 400 });
    }

    console.log('✅ Google token verified for email:', email);

    // Check if user already exists
    let user = getUserByEmail(email);
    
    if (!user) {
      console.log('📝 Creating new user for:', email);
      // Create new user
      user = createUser({
        email,
        fullName: name || 'Google User',
        phone: '', // Google doesn't provide phone
        role: role,
        password: '', // No password for Google users
        googleId: payload.sub,
        profilePicture: picture
      });
    } else {
      console.log('✅ Existing user found:', email);
    }

    // Generate our own JWT token using the same function as other auth routes
    const ourToken = generateToken(user.id, user.role);

    // Return success response (don't include password)
    const { password: _, ...userWithoutPassword } = user;
    
    console.log('✅ Google authentication successful for:', email);
    return NextResponse.json(createSuccessResponse({
      user: userWithoutPassword,
      token: ourToken
    }, 'Google authentication successful'));

  } catch (error) {
    console.error('❌ Google auth error:', error);
    return NextResponse.json(createErrorResponse('Google authentication failed', 500), { status: 500 });
  }
}
