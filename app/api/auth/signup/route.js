import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

import { 
  PasswordHasher, 
  JWTManager, 
  ValidationSchemas, 
  PasswordStrengthChecker,
  RateLimiter 
} from '../../../../lib/security';

const prisma = new PrismaClient();
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

    // Try database operations with fallback
    let user = null;
    let databaseError = null;

    try {
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

      // Hash password with argon2 (more secure than bcrypt)
      const hashedPassword = await PasswordHasher.hashPassword(password, 'argon2');
      console.log('✅ Password hashed with argon2');

      // Create user in database
      user = await prisma.user.create({
        data: {
          email,
          name: fullName,
          password: hashedPassword,
          role: role,
          emailVerified: null
        }
      });

      console.log('✅ User created in database:', user.id);

    } catch (dbError) {
      console.error('❌ Database error:', dbError.message);
      databaseError = dbError.message;
      
      // For now, create a temporary user object for fallback
      user = {
        id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        name: fullName,
        role: role,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('⚠️ Using fallback user creation:', user.id);
    }

    // Generate proper JWT tokens
    const tokens = JWTManager.generateTokens(user);
    console.log('✅ JWT tokens generated');

    // Reset rate limiter on successful signup
    rateLimiter.reset(clientIP);

    console.log('✅ Signup successful for:', email);

    // Return success response
    return NextResponse.json({
      success: true,
      message: databaseError ? 'User created successfully (database connection issue - using fallback)' : 'User created successfully',
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
      warning: databaseError ? 'Database connection failed - user created temporarily' : undefined
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Signup error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  } finally {
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.log('⚠️ Database disconnect error (ignored):', disconnectError.message);
    }
  }
}
