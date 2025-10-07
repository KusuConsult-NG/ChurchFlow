import { NextResponse } from 'next/server';

/**
 * Standardized API response utility
 */
export class ApiResponse {
  static success(data, message = 'Success', status = 200) {
    return NextResponse.json(
      {
        success: true,
        data,
        message,
        timestamp: new Date().toISOString()
      },
      { status }
    );
  }

  static error(
    message = 'Internal Server Error',
    status = 500,
    details = null
  ) {
    return NextResponse.json(
      {
        success: false,
        error: message,
        details,
        timestamp: new Date().toISOString()
      },
      { status }
    );
  }

  static validationError(errors, message = 'Validation failed') {
    return NextResponse.json(
      {
        success: false,
        error: message,
        validationErrors: errors,
        timestamp: new Date().toISOString()
      },
      { status: 400 }
    );
  }

  static unauthorized(message = 'Unauthorized') {
    return NextResponse.json(
      {
        success: false,
        error: message,
        timestamp: new Date().toISOString()
      },
      { status: 401 }
    );
  }

  static forbidden(message = 'Forbidden') {
    return NextResponse.json(
      {
        success: false,
        error: message,
        timestamp: new Date().toISOString()
      },
      { status: 403 }
    );
  }

  static notFound(message = 'Resource not found') {
    return NextResponse.json(
      {
        success: false,
        error: message,
        timestamp: new Date().toISOString()
      },
      { status: 404 }
    );
  }

  static conflict(message = 'Resource conflict') {
    return NextResponse.json(
      {
        success: false,
        error: message,
        timestamp: new Date().toISOString()
      },
      { status: 409 }
    );
  }

  static tooManyRequests(message = 'Too many requests') {
    return NextResponse.json(
      {
        success: false,
        error: message,
        timestamp: new Date().toISOString()
      },
      { status: 429 }
    );
  }
}

/**
 * Error handling wrapper for API routes
 */
export function withErrorHandling(handler) {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (error) {
      console.error('API Error:', error);

      // Handle Prisma errors
      if (error.code === 'P2002') {
        return ApiResponse.conflict(
          'A record with this information already exists'
        );
      }

      if (error.code === 'P2025') {
        return ApiResponse.notFound('Record not found');
      }

      if (error.code === 'P2003') {
        return ApiResponse.validationError(
          [],
          'Invalid reference to related record'
        );
      }

      // Handle validation errors
      if (error.name === 'ValidationError') {
        return ApiResponse.validationError(error.errors, 'Validation failed');
      }

      // Handle network/timeout errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        return ApiResponse.error('Service temporarily unavailable', 503);
      }

      // Default error response
      return ApiResponse.error(
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : error.message,
        500,
        process.env.NODE_ENV === 'development' ? error.stack : null
      );
    }
  };
}

/**
 * Rate limiting utility
 */
const rateLimitMap = new Map();

export function rateLimit(
  identifier,
  maxRequests = 100,
  windowMs = 15 * 60 * 1000
) {
  const now = Date.now();
  const windowStart = now - windowMs;

  if (!rateLimitMap.has(identifier)) {
    rateLimitMap.set(identifier, []);
  }

  const requests = rateLimitMap.get(identifier);

  // Remove old requests outside the window
  const validRequests = requests.filter(timestamp => timestamp > windowStart);
  rateLimitMap.set(identifier, validRequests);

  if (validRequests.length >= maxRequests) {
    return false;
  }

  validRequests.push(now);
  return true;
}

/**
 * Request validation utility
 */
export function validateRequest(data, schema) {
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    if (rules.required && (!value || value.toString().trim() === '')) {
      errors.push(`${field} is required`);
      continue;
    }

    if (
      value &&
      rules.type === 'email' &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
      errors.push(`${field} must be a valid email address`);
    }

    if (value && rules.type === 'number' && isNaN(Number(value))) {
      errors.push(`${field} must be a valid number`);
    }

    if (value && rules.minLength && value.length < rules.minLength) {
      errors.push(
        `${field} must be at least ${rules.minLength} characters long`
      );
    }

    if (value && rules.maxLength && value.length > rules.maxLength) {
      errors.push(
        `${field} must be no more than ${rules.maxLength} characters long`
      );
    }

    if (value && rules.min && Number(value) < rules.min) {
      errors.push(`${field} must be at least ${rules.min}`);
    }

    if (value && rules.max && Number(value) > rules.max) {
      errors.push(`${field} must be no more than ${rules.max}`);
    }
  }

  return errors;
}

/**
 * Pagination utility
 */
export function getPaginationParams(searchParams) {
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const pageSize = Math.max(
    1,
    Math.min(100, Number(searchParams.get('pageSize') || 10))
  );
  const offset = (page - 1) * pageSize;

  return { page, pageSize, offset };
}

/**
 * Database query optimization
 */
export function optimizeQuery(query, options = {}) {
  const {
    include = {},
    select = {},
    orderBy = { createdAt: 'desc' },
    where = {},
    take = 10,
    skip = 0
  } = options;

  return {
    where,
    include: Object.keys(include).length > 0 ? include : undefined,
    select: Object.keys(select).length > 0 ? select : undefined,
    orderBy,
    take,
    skip
  };
}

/**
 * Response caching utility
 */
export function getCacheHeaders(maxAge = 300) {
  return {
    'Cache-Control': `public, max-age=${maxAge}, stale-while-revalidate=60`,
    ETag: `"${Date.now()}"`
  };
}

/**
 * Logging utility
 */
export function logApiCall(endpoint, method, userId, duration, status) {
  console.log(
    `[API] ${method} ${endpoint} - User: ${userId} - Duration: ${duration}ms - Status: ${status}`
  );
}
