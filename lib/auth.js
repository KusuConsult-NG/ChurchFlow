import NextResponse from 'next/server';
import bcrypt from 'bcryptjs';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import GoogleProvider from 'next-auth/providers/google';

// JWT Secret - use the same secret across all auth routes
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-123456789';

// Password hashing
export async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// JWT Token generation
export function generateToken(userId, role) {
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Response helpers
export function createSuccessResponse(data, message) {
  return {
    success: true,
    data,
    message
  };
}

export function createErrorResponse(message, statusCode = 400) {
  return {
    success: false,
    error: message,
    statusCode
  };
}

// Validation schemas
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

export const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  fullName: Joi.string().min(2).required(),
  phone: Joi.string().optional(),
  role: Joi.string().valid('rider', 'driver', 'admin').default('rider')
});

// Auth middleware
export function withAuth(handler) {
  return async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json(createErrorResponse('No token provided', 401));
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      
      return handler(req, res);
    } catch (error) {
      return res.status(401).json(createErrorResponse('Invalid token', 401));
    }
  };
}

// Role-based access control
export function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json(createErrorResponse('Insufficient permissions', 403));
    }

    next();
  };
}

// NextAuth configuration
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow Google OAuth sign-ins
      if (account?.provider === 'google') {
        return true;
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || 'MEMBER';
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.email = token.email;
        session.user.name = token.name;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET
};
