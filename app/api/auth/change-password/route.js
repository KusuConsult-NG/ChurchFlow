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

// Password change endpoint
export async function POST(req) {
  try {
    console.log('🔍 Password change request received');
    
    const body = await req.json();
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    // Rate limiting check
    if (rateLimiter.isRateLimited(clientIP)) {
      const remainingTime = rateLimiter.getRemainingTime(clientIP);
      console.log('🚫 Rate limit exceeded for IP:', clientIP);
      return NextResponse.json({ 
        success: false, 
        error: 'Too many password change attempts. Please try again later.',
        retryAfter: Math.ceil(remainingTime / 1000)
      }, { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil(remainingTime / 1000).toString()
        }
      });
    }
    
    // Validate input using Joi schema
    const { error, value } = ValidationSchemas.changePassword.validate(body, { abortEarly: false });
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

    const { currentPassword, newPassword, userId } = value;

    // Check password strength
    const passwordCheck = PasswordStrengthChecker.checkStrength(newPassword);
    if (!passwordCheck.isValid) {
      console.log('❌ Weak password detected');
      return NextResponse.json({ 
        success: false, 
        error: 'New password does not meet security requirements',
        details: {
          strength: passwordCheck.strength,
          score: passwordCheck.score,
          checks: passwordCheck.checks
        }
      }, { status: 400 });
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      console.log('❌ User not found:', userId);
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Verify current password
    const algorithm = PasswordHasher.detectHashAlgorithm(user.password);
    const isValidCurrentPassword = await PasswordHasher.verifyPassword(currentPassword, user.password, algorithm);
    
    if (!isValidCurrentPassword) {
      console.log('❌ Invalid current password for user:', userId);
      return NextResponse.json({ 
        success: false, 
        error: 'Current password is incorrect' 
      }, { status: 401 });
    }

    // Hash new password with argon2
    const hashedNewPassword = await PasswordHasher.hashPassword(newPassword, 'argon2');
    console.log('✅ New password hashed with argon2');

    // Update user password in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date()
      }
    });

    console.log('✅ Password updated for user:', userId);

    // Generate new JWT tokens (invalidate old ones)
    const tokens = JWTManager.generateTokens(updatedUser);
    console.log('✅ New JWT tokens generated');

    // Reset rate limiter on successful password change
    rateLimiter.reset(clientIP);

    console.log('✅ Password change successful for user:', userId);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Password change error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
