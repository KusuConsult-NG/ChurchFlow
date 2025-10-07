// Rate Limiting Utility for ChurchFlow
// This provides rate limiting functionality for API endpoints

class RateLimiter {
  constructor(options = {}) {
    this.maxAttempts = options.maxAttempts || 5;
    this.windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
    this.blockDurationMs = options.blockDurationMs || 60 * 60 * 1000; // 1 hour
    this.store = new Map(); // In production, use Redis or database
  }

  checkLimit(identifier) {
    const now = Date.now();
    const key = `rate_limit_${identifier}`;
    
    if (!this.store.has(key)) {
      this.store.set(key, {
        attempts: 0,
        firstAttempt: now,
        blockedUntil: 0
      });
    }
    
    const data = this.store.get(key);
    
    // Check if currently blocked
    if (data.blockedUntil > now) {
      const retryAfter = Math.ceil((data.blockedUntil - now) / 1000);
      return {
        allowed: false,
        retryAfter,
        message: `Too many attempts. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`
      };
    }
    
    // Reset if window has passed
    if (now - data.firstAttempt > this.windowMs) {
      data.attempts = 0;
      data.firstAttempt = now;
      data.blockedUntil = 0;
    }
    
    // Check if exceeded max attempts
    if (data.attempts >= this.maxAttempts) {
      data.blockedUntil = now + this.blockDurationMs;
      const retryAfter = Math.ceil(this.blockDurationMs / 1000);
      return {
        allowed: false,
        retryAfter,
        message: `Too many attempts. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`
      };
    }
    
    // Increment attempts
    data.attempts++;
    
    return {
      allowed: true,
      attemptsRemaining: this.maxAttempts - data.attempts
    };
  }

  reset(identifier) {
    const key = `rate_limit_${identifier}`;
    this.store.delete(key);
  }

  getStatus(identifier) {
    const key = `rate_limit_${identifier}`;
    const data = this.store.get(key);
    
    if (!data) {
      return {
        attempts: 0,
        attemptsRemaining: this.maxAttempts,
        blockedUntil: 0,
        isBlocked: false
      };
    }
    
    const now = Date.now();
    const isBlocked = data.blockedUntil > now;
    
    return {
      attempts: data.attempts,
      attemptsRemaining: Math.max(0, this.maxAttempts - data.attempts),
      blockedUntil: data.blockedUntil,
      isBlocked,
      retryAfter: isBlocked ? Math.ceil((data.blockedUntil - now) / 1000) : 0
    };
  }
}

// Pre-configured rate limiters for different use cases
export const googleAuthRateLimiter = new RateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 60 * 60 * 1000 // 1 hour
});

export const loginRateLimiter = new RateLimiter({
  maxAttempts: 10,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 30 * 60 * 1000 // 30 minutes
});

export const apiRateLimiter = new RateLimiter({
  maxAttempts: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 15 * 60 * 1000 // 15 minutes
});

// Utility function to get client identifier from request
export function getClientIdentifier(req) {
  // Use IP address for rate limiting
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';
  return ip;
}

// Utility function to create rate limit response
export function createRateLimitResponse(message, retryAfter, maxAttempts) {
  return {
    success: false,
    error: message,
    retryAfter,
    headers: {
      'Retry-After': retryAfter.toString(),
      'X-RateLimit-Limit': maxAttempts.toString(),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': new Date(Date.now() + retryAfter * 1000).toISOString()
    }
  };
}

export default RateLimiter;