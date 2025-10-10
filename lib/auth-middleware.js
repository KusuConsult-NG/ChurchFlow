// lib/auth-middleware.js
import { NextResponse } from 'next/server';

import { JWTManager } from './security';

// JWT Authentication Middleware
export function withAuth(handler, options = {}) {
  return async (req, ...args) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.get('authorization');
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return NextResponse.json({
          success: false,
          error: 'Access token required',
          code: 'MISSING_TOKEN'
        }, { status: 401 });
      }

      // Verify token
      const verification = JWTManager.verifyToken(token);
      if (!verification.valid) {
        return NextResponse.json({
          success: false,
          error: 'Invalid or expired token',
          code: 'INVALID_TOKEN'
        }, { status: 403 });
      }

      // Add user info to request
      req.user = verification.payload;

      // Check role if required
      if (options.roles && !options.roles.includes(verification.payload.role)) {
        return NextResponse.json({
          success: false,
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS'
        }, { status: 403 });
      }

      // Call the original handler
      return await handler(req, ...args);

    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json({
        success: false,
        error: 'Authentication failed',
        code: 'AUTH_ERROR'
      }, { status: 500 });
    }
  };
}

// Role-based access control
export function requireRole(roles) {
  return (handler) => {
    return withAuth(handler, { roles });
  };
}

// Admin only access
export const requireAdmin = requireRole(['ADMIN']);

// Admin or Pastor access
export const requireAdminOrPastor = requireRole(['ADMIN', 'PASTOR']);

// Any authenticated user
export const requireAuth = withAuth;


