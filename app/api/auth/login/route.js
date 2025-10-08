import { NextResponse } from 'next/server';

import AuthenticationService from '../../../../lib/auth-service';
import { 
  ValidationSchemas,
  RateLimiter 
} from '../../../../lib/security';

const rateLimiter = new RateLimiter();

export async function POST(req) {
  try {
    console.log('🔍 Login request received');
    
    const body = await req.json();
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    // Rate limiting check
    if (rateLimiter.isRateLimited(clientIP)) {
      const remainingTime = rateLimiter.getRemainingTime(clientIP);
      console.log('🚫 Rate limit exceeded for IP:', clientIP);
      return NextResponse.json({ 
        success: false, 
        error: 'Too many login attempts. Please try again later.',
        retryAfter: Math.ceil(remainingTime / 1000)
      }, { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil(remainingTime / 1000).toString()
        }
      });
    }
    
    console.log('🔍 Login data:', { email: body.email });
    
    // Validate input using Joi schema
    const { error, value } = ValidationSchemas.login.validate(body, { abortEarly: false });
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      console.log('❌ Validation failed:', errors);
      return NextResponse.json({ 
        success: false, 
        error: 'Validation failed',
        details: errors
      }, { status: 400 });
    }

    const { email, password } = value;

    // Find user (database + fallback)
    const { user, source } = await AuthenticationService.findUserByEmail(email);
    
    if (!user) {
      console.log('❌ User not found:', email);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid email or password' 
      }, { status: 401 });
    }

    // Verify password
    const isValidPassword = await AuthenticationService.verifyPassword(user, password, source);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password for:', email);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid email or password' 
      }, { status: 401 });
    }

    console.log('✅ User authenticated successfully from', source);

    // Generate JWT tokens
    const tokens = AuthenticationService.generateTokens(user);
    console.log('✅ JWT tokens generated');

    // Reset rate limiter on successful login
    rateLimiter.reset(clientIP);

    console.log('✅ Login successful for:', email);

    // Return success response
    return NextResponse.json({
      success: true,
      message: source === 'fallback' ? 'Login successful (using fallback storage)' : 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn
        }
      },
      warning: source === 'fallback' ? 'Database unavailable - using fallback storage' : undefined
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Login error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  } finally {
    await AuthenticationService.disconnect();
  }
}
