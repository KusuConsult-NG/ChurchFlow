import { NextResponse } from 'next/server';

import AuthenticationService from '../../../../lib/auth-service';
import { 
  ValidationSchemas, 
  PasswordStrengthChecker,
  RateLimiter 
} from '../../../../lib/security';

const rateLimiter = new RateLimiter();

export async function POST(req) {
  try {
    console.log('🔍 Signup request received');
    
    const body = await req.json();
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    // Rate limiting check
    if (rateLimiter.isRateLimited(clientIP)) {
      const remainingTime = rateLimiter.getRemainingTime(clientIP);
      console.log('🚫 Rate limit exceeded for IP:', clientIP);
      return NextResponse.json({ 
        success: false, 
        error: 'Too many signup attempts. Please try again later.',
        retryAfter: Math.ceil(remainingTime / 1000)
      }, { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil(remainingTime / 1000).toString()
        }
      });
    }
    
    console.log('🔍 Signup data:', { email: body.email, fullName: body.fullName, role: body.role });
    
    // Validate input using Joi schema
    const { error, value } = ValidationSchemas.signup.validate(body, { abortEarly: false });
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

    const { email, password, fullName, role } = value;

    // Check password strength
    const passwordCheck = PasswordStrengthChecker.checkStrength(password);
    if (!passwordCheck.isValid) {
      console.log('❌ Weak password detected');
      return NextResponse.json({ 
        success: false, 
        error: 'Password does not meet security requirements',
        details: {
          strength: passwordCheck.strength,
          score: passwordCheck.score,
          checks: passwordCheck.checks
        }
      }, { status: 400 });
    }

    // Check if user already exists (database + fallback)
    const userExists = await AuthenticationService.checkUserExists(email);
    if (userExists.exists) {
      console.log('❌ User already exists:', email, 'in', userExists.source);
      return NextResponse.json({ 
        success: false, 
        error: 'User with this email already exists' 
      }, { status: 400 });
    }

    // Create user (database + fallback)
    const { user, source } = await AuthenticationService.createUser({
      email,
      password,
      fullName,
      role
    });

    console.log('✅ User created in', source, ':', user.id);

    // Generate JWT tokens
    const tokens = AuthenticationService.generateTokens(user);
    console.log('✅ JWT tokens generated');

    // Reset rate limiter on successful signup
    rateLimiter.reset(clientIP);

    console.log('✅ Signup successful for:', email);

    // Return success response
    return NextResponse.json({
      success: true,
      message: source === 'fallback' ? 'User created successfully (using fallback storage)' : 'User created successfully',
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
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Signup error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  } finally {
    await AuthenticationService.disconnect();
  }
}
