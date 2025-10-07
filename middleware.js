import { NextResponse } from 'next/server';

import { rateLimit, apiProtection } from './lib/rate-limiting';

export function middleware(request) {
  const { pathname } = request.nextUrl;

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
    let configName = 'api';
    if (pathname.includes('/auth/')) {
      configName = 'auth';
    } else if (pathname.includes('/upload')) {
      configName = 'upload';
    } else if (pathname.includes('/password-reset')) {
      configName = 'passwordReset';
    }

    const clientId = rateLimit.getClientId(request);
    const key = `${configName}:${clientId}`;
    const config = rateLimit.configs[configName];

    const result = rateLimit.checkLimit(key, config);

    if (!result.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: config.message,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil(
              (result.resetTime - Date.now()) / 1000
            ).toString(),
            'X-RateLimit-Limit': config.max.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString()
          }
        }
      );
    }

    // Validate request origin
    if (!apiProtection.validateOrigin(request)) {
      return new NextResponse(JSON.stringify({ error: 'Invalid origin' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate request size
    if (!apiProtection.validateRequestSize(request)) {
      return new NextResponse(JSON.stringify({ error: 'Request too large' }), {
        status: 413,
        headers: { 'Content-Type': 'application/json' }
      });
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
