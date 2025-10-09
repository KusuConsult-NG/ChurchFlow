import bcrypt from 'bcryptjs';
import Joi from 'joi';
import jwt from 'jsonwebtoken';

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

// NextAuth configuration (for compatibility)
export const authOptions = {
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  }
};
