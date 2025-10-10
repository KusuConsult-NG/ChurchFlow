// lib/user-persistence.js
const { PrismaClient } = require('@prisma/client');

const { JWTManager } = require('./security');

const prisma = new PrismaClient();

class UserPersistenceService {
  // Create or update user session
  static async createSession(userId, refreshToken, clientInfo = {}) {
    try {
      // Store session in database
      const session = await prisma.session.create({
        data: {
          sessionToken: refreshToken,
          userId: userId,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          userAgent: clientInfo.userAgent || null,
          ipAddress: clientInfo.ipAddress || null,
          deviceInfo: clientInfo.deviceInfo || null
        }
      });

      console.log('✅ Session created:', session.id);
      return session;
    } catch (error) {
      console.error('❌ Session creation failed:', error);
      throw error;
    }
  }

  // Get user session by token
  static async getSession(sessionToken) {
    try {
      const session = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true }
      });

      if (!session) {
        return null;
      }

      // Check if session is expired
      if (session.expires < new Date()) {
        await this.deleteSession(sessionToken);
        return null;
      }

      return session;
    } catch (error) {
      console.error('❌ Session retrieval failed:', error);
      return null;
    }
  }

  // Delete user session
  static async deleteSession(sessionToken) {
    try {
      await prisma.session.delete({
        where: { sessionToken }
      });
      console.log('✅ Session deleted');
    } catch (error) {
      console.error('❌ Session deletion failed:', error);
    }
  }

  // Delete all user sessions (logout from all devices)
  static async deleteAllUserSessions(userId) {
    try {
      const result = await prisma.session.deleteMany({
        where: { userId }
      });
      console.log(`✅ Deleted ${result.count} sessions for user ${userId}`);
      return result.count;
    } catch (error) {
      console.error('❌ Session cleanup failed:', error);
      throw error;
    }
  }

  // Get user with all related data
  static async getUserWithData(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          accounts: true,
          sessions: {
            where: {
              expires: {
                gt: new Date()
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
          members: {
            take: 10,
            orderBy: {
              createdAt: 'desc'
            }
          },
          events: {
            take: 10,
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      return user;
    } catch (error) {
      console.error('❌ User data retrieval failed:', error);
      throw error;
    }
  }

  // Update user profile
  static async updateUserProfile(userId, profileData) {
    try {
      const allowedFields = ['name', 'image', 'districtId', 'agencyId', 'subDistrictId'];
      const updateData = {};

      // Only allow specific fields to be updated
      for (const field of allowedFields) {
        if (profileData[field] !== undefined) {
          updateData[field] = profileData[field];
        }
      }

      updateData.updatedAt = new Date();

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData
      });

      console.log('✅ User profile updated:', userId);
      return updatedUser;
    } catch (error) {
      console.error('❌ Profile update failed:', error);
      throw error;
    }
  }

  // Get user activity log
  static async getUserActivity(userId, limit = 50) {
    try {
      const activities = await prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return activities;
    } catch (error) {
      console.error('❌ Activity log retrieval failed:', error);
      return [];
    }
  }

  // Log user activity
  static async logActivity(userId, action, entity, entityId, details = {}) {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          entity,
          entityId,
          details: JSON.stringify(details),
          createdAt: new Date()
        }
      });
    } catch (error) {
      console.error('❌ Activity logging failed:', error);
      // Don't throw error for logging failures
    }
  }

  // Clean up expired sessions
  static async cleanupExpiredSessions() {
    try {
      const result = await prisma.session.deleteMany({
        where: {
          expires: {
            lt: new Date()
          }
        }
      });
      console.log(`✅ Cleaned up ${result.count} expired sessions`);
      return result.count;
    } catch (error) {
      console.error('❌ Session cleanup failed:', error);
      return 0;
    }
  }

  // Get user statistics
  static async getUserStats(userId) {
    try {
      const [sessionCount, memberCount, eventCount, recentActivity] = await Promise.all([
        prisma.session.count({
          where: {
            userId,
            expires: { gt: new Date() }
          }
        }),
        prisma.member.count({
          where: { createdBy: userId }
        }),
        prisma.event.count({
          where: { createdBy: userId }
        }),
        prisma.auditLog.count({
          where: {
            userId,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            }
          }
        })
      ]);

      return {
        activeSessions: sessionCount,
        membersCreated: memberCount,
        eventsCreated: eventCount,
        recentActivity
      };
    } catch (error) {
      console.error('❌ User stats retrieval failed:', error);
      return {
        activeSessions: 0,
        membersCreated: 0,
        eventsCreated: 0,
        recentActivity: 0
      };
    }
  }

  // Refresh user session
  static async refreshUserSession(sessionToken, newRefreshToken) {
    try {
      const session = await prisma.session.findUnique({
        where: { sessionToken }
      });

      if (!session) {
        throw new Error('Session not found');
      }

      // Update session with new token
      const updatedSession = await prisma.session.update({
        where: { sessionToken },
        data: {
          sessionToken: newRefreshToken,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          updatedAt: new Date()
        }
      });

      console.log('✅ Session refreshed:', updatedSession.id);
      return updatedSession;
    } catch (error) {
      console.error('❌ Session refresh failed:', error);
      throw error;
    }
  }
}

module.exports = UserPersistenceService;


