// Global user storage (persists across requests in development)
if (!global.users) {
  global.users = new Map();
}

// Use global storage
const users = global.users;

// Simple token generation
function generateToken(userId) {
  return Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64');
}

// Simple token validation
function validateToken(token) {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    return decoded.userId;
  } catch {
    return null;
  }
}

// Simple user validation
function validateUser(email, password, fullName) {
  if (!email || !email.includes('@')) {
    return { valid: false, error: 'Valid email is required' };
  }
  if (!password || password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters' };
  }
  if (!fullName || fullName.length < 2) {
    return { valid: false, error: 'Full name is required' };
  }
  return { valid: true };
}

// Export shared functions
export { users, generateToken, validateToken, validateUser };
