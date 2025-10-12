import { NextResponse } from 'next/server';

// Simple rate limiting for middleware
const rateLimitStore = new Map();

function checkRateLimit(identifier, maxAttempts = 100, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const key = `middleware_${identifier}`;
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, {
      attempts: 0,
      firstAttempt: now
    });
  }
  
  const data = rateLimitStore.get(key);
  
  // Reset if window has passed
  if (now - data.firstAttempt > windowMs) {
    data.attempts = 0;
    data.firstAttempt = now;
  }
  
  // Check if exceeded max attempts
  if (data.attempts >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: data.firstAttempt + windowMs
    };
  }
  
  // Increment attempts
  data.attempts++;
  
  return {
    allowed: true,
    remaining: maxAttempts - data.attempts,
    resetTime: data.firstAttempt + windowMs
  };
}

function getClientId(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // TEMPORARILY DISABLED - Skip all middleware to test
  return NextResponse.next();

  // Skip middleware for static files and health checks
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname === '/api/health'
  ) {
    return NextResponse.next();
  }

  // Apply rate limiting to API routes (disabled for development)
  if (pathname.startsWith('/api/') && process.env.NODE_ENV === 'production') {
    // Determine rate limit config based on endpoint
    let maxAttempts = 100;
    let windowMs = 15 * 60 * 1000; // 15 minutes
    
    if (pathname.includes('/auth/')) {
      maxAttempts = 20; // More restrictive for auth endpoints
    } else if (pathname.includes('/upload')) {
      maxAttempts = 10; // Very restrictive for uploads
    }

    const clientId = getClientId(request);
    const result = checkRateLimit(clientId, maxAttempts, windowMs);

    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests. Please try again later.',
          retryAfter
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': maxAttempts.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString()
          }
        }
      );
    }
  }

  // Add security headers
  const response = NextResponse.next();

  // Enhanced security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );

  // CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    response.headers.set(
      'Access-Control-Allow-Origin',
      process.env.ALLOWED_ORIGINS || '*'
    );
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
};
