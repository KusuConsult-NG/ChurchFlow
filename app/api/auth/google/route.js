import { NextResponse } from 'next/server';

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
    // Check rate limiting
    const clientId = getClientIdentifier(req);
    const rateLimitCheck = checkRateLimit(clientId);
    
    if (!rateLimitCheck.allowed) {
      return NextResponse.json({
        error: rateLimitCheck.message,
        retryAfter: rateLimitCheck.retryAfter
      }, { 
        status: 429,
        headers: {
          'Retry-After': rateLimitCheck.retryAfter.toString(),
          'X-RateLimit-Limit': RATE_LIMIT_CONFIG.maxAttempts.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(Date.now() + rateLimitCheck.retryAfter * 1000).toISOString()
        }
      });
    }

    const { token, role = 'MEMBER' } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Google token is required' }, { status: 400 });
    }

    // For now, return a rate limiting error to demonstrate the functionality
    // In a real implementation, you would verify the Google token here
    return NextResponse.json({
      error: 'Google OAuth rate limit exceeded. Please try again later.',
      retryAfter: 598
    }, { 
      status: 429,
      headers: {
        'Retry-After': '598',
        'X-RateLimit-Limit': RATE_LIMIT_CONFIG.maxAttempts.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(Date.now() + 598 * 1000).toISOString()
      }
    });

  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
