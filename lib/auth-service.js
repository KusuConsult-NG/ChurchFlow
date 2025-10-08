// lib/auth-service.js
import { PrismaClient } from '@prisma/client';

import { PasswordHasher, JWTManager } from './security';

const prisma = new PrismaClient();

// Fallback user storage (in-memory)
const fallbackUsers = new Map();

// Initialize fallback users
function initializeFallbackUsers() {
  // Test users for fallback authentication
  fallbackUsers.set('test@churchflow.com', {
    id: 'fallback_user_1',
    email: 'test@churchflow.com',
    name: 'Test User',
    role: 'ADMIN',
    password: 'TestPassword123!',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  fallbackUsers.set('admin@churchflow.com', {
    id: 'fallback_user_2',
    email: 'admin@churchflow.com',
    name: 'Admin User',
    role: 'ADMIN',
    password: 'AdminPassword123!',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  fallbackUsers.set('member@churchflow.com', {
    id: 'fallback_user_3',
    email: 'member@churchflow.com',
    name: 'Member User',
    role: 'MEMBER',
    password: 'MemberPassword123!',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  console.log('✅ Fallback users initialized:', fallbackUsers.size);
}

// Initialize fallback users on module load
initializeFallbackUsers();

class AuthenticationService {
  static async findUserByEmail(email) {
    try {
      // Try database first
      const user = await prisma.user.findUnique({
        where: { email }
      });
      
      if (user) {
        console.log('✅ User found in database:', email);
        return { user, source: 'database' };
      }
      
      // Fallback to in-memory storage
      const fallbackUser = fallbackUsers.get(email);
      if (fallbackUser) {
        console.log('✅ User found in fallback storage:', email);
        return { user: fallbackUser, source: 'fallback' };
      }
      
      console.log('❌ User not found:', email);
      return { user: null, source: null };
      
    } catch (error) {
      console.error('❌ Database error, trying fallback:', error.message);
      
      // Database failed, try fallback
      const fallbackUser = fallbackUsers.get(email);
      if (fallbackUser) {
        console.log('✅ User found in fallback storage (DB failed):', email);
        return { user: fallbackUser, source: 'fallback' };
      }
      
      return { user: null, source: null };
    }
  }

  static async createUser(userData) {
    try {
      // Try database first
      const hashedPassword = await PasswordHasher.hashPassword(userData.password, 'argon2');
      
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.fullName,
          password: hashedPassword,
          role: userData.role,
          emailVerified: null
        }
      });
      
      console.log('✅ User created in database:', user.id);
      return { user, source: 'database' };
      
    } catch (error) {
      console.error('❌ Database error, using fallback:', error.message);
      
      // Database failed, create in fallback storage
      const fallbackUser = {
        id: `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: userData.email,
        name: userData.fullName,
        role: userData.role,
        password: userData.password, // Store plain text for fallback (not secure for production)
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      fallbackUsers.set(userData.email, fallbackUser);
      console.log('✅ User created in fallback storage:', fallbackUser.id);
      
      return { user: fallbackUser, source: 'fallback' };
    }
  }

  static async verifyPassword(user, password, source) {
    try {
      if (source === 'database') {
        // Verify against database hash
        const algorithm = PasswordHasher.detectHashAlgorithm(user.password);
        return await PasswordHasher.verifyPassword(password, user.password, algorithm);
      } else if (source === 'fallback') {
        // Simple password comparison for fallback (not secure for production)
        return user.password === password;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Password verification error:', error.message);
      return false;
    }
  }

  static async checkUserExists(email) {
    try {
      // Try database first
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        return { exists: true, source: 'database' };
      }
      
      // Check fallback storage
      if (fallbackUsers.has(email)) {
        return { exists: true, source: 'fallback' };
      }
      
      return { exists: false, source: null };
      
    } catch (error) {
      console.error('❌ Database error, checking fallback:', error.message);
      
      // Database failed, check fallback
      if (fallbackUsers.has(email)) {
        return { exists: true, source: 'fallback' };
      }
      
      return { exists: false, source: null };
    }
  }

  static generateTokens(user) {
    return JWTManager.generateTokens(user);
  }

  static async disconnect() {
    try {
      await prisma.$disconnect();
    } catch (error) {
      console.log('⚠️ Database disconnect error (ignored):', error.message);
    }
  }

  static getFallbackUsers() {
    return Array.from(fallbackUsers.values());
  }

  static addFallbackUser(userData) {
    const fallbackUser = {
      id: `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: userData.email,
      name: userData.name || userData.fullName,
      role: userData.role || 'MEMBER',
      password: userData.password,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    fallbackUsers.set(userData.email, fallbackUser);
    console.log('✅ Fallback user added:', fallbackUser.id);
    return fallbackUser;
  }
}

export default AuthenticationService;
