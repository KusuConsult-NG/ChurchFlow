// lib/security.js
import argon2 from 'argon2';
import bcrypt from 'bcryptjs';
import Joi from 'joi';
import jwt from 'jsonwebtoken';

// Security configuration
const SECURITY_CONFIG = {
  // Password hashing
  BCRYPT_ROUNDS: 12,
  ARGON2_CONFIG: {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3,
    parallelism: 1,
    hashLength: 32
  },
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  JWT_EXPIRES_IN: '7d',
  JWT_REFRESH_EXPIRES_IN: '30d',

  // Password requirements
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBERS: true,
  PASSWORD_REQUIRE_SYMBOLS: true,

  // Rate limiting
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_TIME: 15 * 60 * 1000, // 15 minutes

  // Session security
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  REFRESH_TOKEN_LENGTH: 32
};

// Password hashing utilities
class PasswordHasher {
  static async hashPassword(password, algorithm = 'bcrypt') {
    try {
      switch (algorithm) {
      case 'bcrypt':
        return await bcrypt.hash(password, SECURITY_CONFIG.BCRYPT_ROUNDS);
      case 'argon2':
        return await argon2.hash(password, SECURITY_CONFIG.ARGON2_CONFIG);
      default:
        throw new Error(`Unsupported hashing algorithm: ${algorithm}`);
      }
    } catch (error) {
      console.error('Password hashing error:', error);
      throw new Error('Failed to hash password');
    }
  }

  static async verifyPassword(password, hash, algorithm = 'bcrypt') {
    try {
      switch (algorithm) {
      case 'bcrypt':
        return await bcrypt.compare(password, hash);
      case 'argon2':
        return await argon2.verify(hash, password);
      default:
        throw new Error(`Unsupported hashing algorithm: ${algorithm}`);
      }
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  }

  static detectHashAlgorithm(hash) {
    if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
      return 'bcrypt';
    } else if (hash.startsWith('$argon2')) {
      return 'argon2';
    }
    return 'unknown';
  }
}

// JWT utilities
class JWTManager {
  static generateTokens(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000)
    };

    const accessToken = jwt.sign(payload, SECURITY_CONFIG.JWT_SECRET, {
      expiresIn: SECURITY_CONFIG.JWT_EXPIRES_IN,
      issuer: 'churchflow',
      audience: 'churchflow-users'
    });

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      SECURITY_CONFIG.JWT_SECRET,
      {
        expiresIn: SECURITY_CONFIG.JWT_REFRESH_EXPIRES_IN,
        issuer: 'churchflow',
        audience: 'churchflow-refresh'
      }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: SECURITY_CONFIG.JWT_EXPIRES_IN
    };
  }

  static verifyToken(token, type = 'access') {
    try {
      const decoded = jwt.verify(token, SECURITY_CONFIG.JWT_SECRET, {
        issuer: 'churchflow',
        audience: type === 'access' ? 'churchflow-users' : 'churchflow-refresh'
      });
      return { valid: true, payload: decoded };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  static refreshAccessToken(refreshToken) {
    const verification = this.verifyToken(refreshToken, 'refresh');
    if (!verification.valid) {
      throw new Error('Invalid refresh token');
    }

    const payload = verification.payload;
    return this.generateTokens({ id: payload.userId });
  }
}

// Input validation schemas
const ValidationSchemas = {
  signup: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(SECURITY_CONFIG.PASSWORD_MIN_LENGTH)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
      .required()
      .messages({
        'string.min': `Password must be at least ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters long`,
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required'
      }),
    fullName: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Full name must be at least 2 characters long',
        'string.max': 'Full name must not exceed 100 characters',
        'any.required': 'Full name is required'
      }),
    role: Joi.string()
      .valid('MEMBER', 'ADMIN', 'PASTOR')
      .default('MEMBER')
      .messages({
        'any.only': 'Role must be one of: MEMBER, ADMIN, PASTOR'
      })
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'any.required': 'Current password is required'
      }),
    newPassword: Joi.string()
      .min(SECURITY_CONFIG.PASSWORD_MIN_LENGTH)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
      .required()
      .messages({
        'string.min': `Password must be at least ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters long`,
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'New password is required'
      })
  })
};

// Security middleware
class SecurityMiddleware {
  static validateInput(schema) {
    return (req, res, next) => {
      const { error, value } = schema.validate(req.body, { abortEarly: false });
      
      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }));
        
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors
        });
      }
      
      req.validatedData = value;
      next();
    };
  }

  static async authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const verification = JWTManager.verifyToken(token);
    if (!verification.valid) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    req.user = verification.payload;
    next();
  }

  static requireRole(roles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }

      next();
    };
  }
}

// Rate limiting utilities
class RateLimiter {
  constructor() {
    this.attempts = new Map();
  }

  isRateLimited(identifier, maxAttempts = SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
    const now = Date.now();
    const key = `rate_limit_${identifier}`;
    
    if (!this.attempts.has(key)) {
      this.attempts.set(key, {
        count: 0,
        firstAttempt: now,
        lastAttempt: now
      });
      return false;
    }

    const data = this.attempts.get(key);
    
    // Reset if enough time has passed
    if (now - data.firstAttempt > SECURITY_CONFIG.LOCKOUT_TIME) {
      this.attempts.set(key, {
        count: 1,
        firstAttempt: now,
        lastAttempt: now
      });
      return false;
    }

    // Check if exceeded max attempts
    if (data.count >= maxAttempts) {
      return true;
    }

    // Increment attempts
    data.count++;
    data.lastAttempt = now;
    
    return false;
  }

  getRemainingTime(identifier) {
    const key = `rate_limit_${identifier}`;
    const data = this.attempts.get(key);
    
    if (!data) return 0;
    
    const elapsed = Date.now() - data.firstAttempt;
    return Math.max(0, SECURITY_CONFIG.LOCKOUT_TIME - elapsed);
  }

  reset(identifier) {
    const key = `rate_limit_${identifier}`;
    this.attempts.delete(key);
  }
}

// Password strength checker
class PasswordStrengthChecker {
  static checkStrength(password) {
    const checks = {
      length: password.length >= SECURITY_CONFIG.PASSWORD_MIN_LENGTH,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[@$!%*?&]/.test(password),
      common: !this.isCommonPassword(password)
    };

    const score = Object.values(checks).filter(Boolean).length;
    const strength = this.getStrengthLevel(score);

    return {
      score,
      strength,
      checks,
      isValid: score >= 5
    };
  }

  static isCommonPassword(password) {
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];
    return commonPasswords.includes(password.toLowerCase());
  }

  static getStrengthLevel(score) {
    if (score < 3) return 'weak';
    if (score < 5) return 'medium';
    if (score < 6) return 'strong';
    return 'very-strong';
  }
}

// Export all utilities
export {
  SECURITY_CONFIG,
  PasswordHasher,
  JWTManager,
  ValidationSchemas,
  SecurityMiddleware,
  RateLimiter,
  PasswordStrengthChecker
};
