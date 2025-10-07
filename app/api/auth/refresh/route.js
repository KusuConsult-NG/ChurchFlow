import { NextResponse } from 'next/server';

import { JWTManager, ValidationSchemas, RateLimiter } from '../../../../lib/security';

const rateLimiter = new RateLimiter();

// Token refresh endpoint
export async function POST(req) {
  try {
    console.log('🔍 Token refresh request received');
    
    const body = await req.json();
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    // Rate limiting check
    if (rateLimiter.isRateLimited(clientIP, 10)) { // More lenient for refresh
      const remainingTime = rateLimiter.getRemainingTime(clientIP);
      console.log('🚫 Rate limit exceeded for IP:', clientIP);
      return NextResponse.json({ 
        success: false, 
        error: 'Too many refresh attempts. Please try again later.',
        retryAfter: Math.ceil(remainingTime / 1000)
      }, { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil(remainingTime / 1000).toString()
        }
      });
    }
    
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json({ 
        success: false, 
        error: 'Refresh token is required' 
      }, { status: 400 });
    }

    // Verify and refresh token
    try {
      const newTokens = JWTManager.refreshAccessToken(refreshToken);
      console.log('✅ Tokens refreshed successfully');
      
      // Reset rate limiter on successful refresh
      rateLimiter.reset(clientIP);
      
      return NextResponse.json({
        success: true,
        message: 'Tokens refreshed successfully',
        data: {
          tokens: {
            accessToken: newTokens.accessToken,
            refreshToken: newTokens.refreshToken,
            expiresIn: newTokens.expiresIn
          }
        }
      }, { status: 200 });
      
    } catch (error) {
      console.log('❌ Invalid refresh token:', error.message);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid or expired refresh token' 
      }, { status: 401 });
    }

  } catch (error) {
    console.error('❌ Token refresh error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
