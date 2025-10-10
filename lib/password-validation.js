// lib/password-validation.js
import zxcvbn from 'zxcvbn';

export const passwordValidation = {
  // Password strength requirements
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  minStrengthScore: 3, // 0-4 scale, 3 = strong

  // Validate password strength
  validatePassword(password) {
    const errors = [];
    const warnings = [];

    // Length validation
    if (password.length < this.minLength) {
      errors.push(
        `Password must be at least ${this.minLength} characters long`
      );
    }
    if (password.length > this.maxLength) {
      errors.push(
        `Password must be no more than ${this.maxLength} characters long`
      );
    }

    // Character requirements
    if (this.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (this.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (this.requireNumbers && !/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (
      this.requireSpecialChars &&
      !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    ) {
      errors.push('Password must contain at least one special character');
    }

    // Common password patterns to avoid
    const commonPatterns = [
      /password/i,
      /123456/,
      /qwerty/i,
      /admin/i,
      /letmein/i,
      /welcome/i,
      /church/i,
      /churchflow/i
    ];

    if (commonPatterns.some(pattern => pattern.test(password))) {
      errors.push('Password contains common patterns and is not secure');
    }

    // Check for sequential characters
    if (/(.)\1{2,}/.test(password)) {
      warnings.push('Password contains repeated characters');
    }

    // Check for sequential numbers/letters
    if (/123|abc|qwe/i.test(password)) {
      warnings.push('Password contains sequential characters');
    }

    // Use zxcvbn for strength analysis
    const strength = zxcvbn(password);

    if (strength.score < this.minStrengthScore) {
      errors.push(`Password is too weak. Score: ${strength.score}/4`);
    }

    // Add zxcvbn feedback
    if (strength.feedback.suggestions.length > 0) {
      warnings.push(...strength.feedback.suggestions);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      strength: strength.score,
      crackTime:
        strength.crack_times_seconds.offline_slow_hashing_1e4_per_second
    };
  },

  // Generate password strength indicator
  getStrengthIndicator(strength) {
    const indicators = [
      { level: 'Very Weak', color: 'red', width: '20%' },
      { level: 'Weak', color: 'orange', width: '40%' },
      { level: 'Fair', color: 'yellow', width: '60%' },
      { level: 'Good', color: 'lightgreen', width: '80%' },
      { level: 'Strong', color: 'green', width: '100%' }
    ];
    return indicators[strength] || indicators[0];
  },

  // Generate secure password suggestions
  generateSuggestions() {
    return [
      'Use a mix of uppercase and lowercase letters',
      'Include numbers and special characters',
      'Avoid common words and patterns',
      'Make it at least 12 characters long',
      'Consider using a passphrase',
      'Don\'t reuse passwords from other accounts'
    ];
  }
};

// Password hashing utilities
export const passwordHashing = {
  // Additional security for password hashing
  saltRounds: 12, // Increased from default 10

  // Validate password against common breaches
  async checkBreach(password) {
    // In production, integrate with HaveIBeenPwned API
    // For now, return false (no breach detected)
    return false;
  }
};

// Session security utilities
export const sessionSecurity = {
  // Session timeout settings
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  maxSessionsPerUser: 5,

  // Generate secure session token
  generateSessionToken() {
    return require('crypto').randomBytes(32).toString('hex');
  },

  // Validate session
  validateSession(sessionData) {
    const now = Date.now();
    return sessionData.expiresAt > now;
  }
};



