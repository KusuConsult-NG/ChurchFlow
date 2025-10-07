// lib/rate-limiting.js
import { NextResponse } from 'next/server';

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map();

export const rateLimit = {
  // Rate limit configurations
  configs: {
    // Authentication endpoints
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 attempts per window
      message: 'Too many authentication attempts, please try again later'
    },

    // API endpoints
    api: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 requests per window
      message: 'Too many API requests, please try again later'
    },

    // File uploads
    upload: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // 10 uploads per hour
      message: 'Too many file uploads, please try again later'
    },

    // Password reset
    passwordReset: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3, // 3 attempts per hour
      message: 'Too many password reset attempts, please try again later'
    }
  },

  // Check rate limit for a given key and config
  checkLimit(key, config) {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get existing records for this key
    let records = rateLimitStore.get(key) || [];

    // Remove old records outside the window
    records = records.filter(timestamp => timestamp > windowStart);

    // Check if limit exceeded
    if (records.length >= config.max) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: records[0] + config.windowMs
      };
    }

    // Add current request
    records.push(now);
    rateLimitStore.set(key, records);

    return {
      allowed: true,
      remaining: config.max - records.length,
      resetTime: now + config.windowMs
    };
  },

  // Get client identifier
  getClientId(request) {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
    return ip;
  },

  // Rate limit middleware
  createRateLimit(configName) {
    return request => {
      const config = this.configs[configName];
      if (!config) {
        return NextResponse.next();
      }

      const clientId = this.getClientId(request);
      const key = `${configName}:${clientId}`;

      const result = this.checkLimit(key, config);

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

      // Add rate limit headers to successful responses
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', config.max.toString());
      response.headers.set(
        'X-RateLimit-Remaining',
        result.remaining.toString()
      );
      response.headers.set('X-RateLimit-Reset', result.resetTime.toString());

      return response;
    };
  },

  // Clean up old entries periodically
  cleanup() {
    const now = Date.now();
    for (const [key, records] of rateLimitStore.entries()) {
      const configName = key.split(':')[0];
      const config = this.configs[configName];
      if (config) {
        const windowStart = now - config.windowMs;
        const filteredRecords = records.filter(
          timestamp => timestamp > windowStart
        );

        if (filteredRecords.length === 0) {
          rateLimitStore.delete(key);
        } else {
          rateLimitStore.set(key, filteredRecords);
        }
      }
    }
  }
};

// Start cleanup interval (every 5 minutes)
setInterval(
  () => {
    rateLimit.cleanup();
  },
  5 * 60 * 1000
);

// API protection utilities
export const apiProtection = {
  // Validate API key
  validateApiKey(apiKey) {
    // In production, validate against database
    // For now, return true for development
    return apiKey && apiKey.length > 10;
  },

  // Check request origin
  validateOrigin(request) {
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      'http://localhost:3000',
      'https://yourdomain.com' // Add your production domain
    ];

    return !origin || allowedOrigins.includes(origin);
  },

  // Validate request size
  validateRequestSize(request) {
    const contentLength = request.headers.get('content-length');
    const maxSize = 10 * 1024 * 1024; // 10MB

    return !contentLength || parseInt(contentLength) <= maxSize;
  },

  // Security headers
  addSecurityHeaders(response) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()'
    );

    return response;
  }
};
