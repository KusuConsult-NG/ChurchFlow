// lib/notification-service.js
const twilio = require('twilio');

const { emailService } = require('./email-service');

// Notification service configuration
const notificationConfig = {
  // Twilio SMS configuration
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER
  },

  // Push notification configuration
  push: {
    vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
    vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
    vapidEmail: process.env.VAPID_EMAIL
  },

  // Notification preferences
  preferences: {
    defaultChannels: ['email'], // email, sms, push
    batchSize: 100,
    retryAttempts: 3,
    retryDelay: 5000 // 5 seconds
  }
};

// Initialize Twilio
let twilioClient = null;
if (
  notificationConfig.twilio.accountSid &&
  notificationConfig.twilio.authToken
) {
  twilioClient = twilio(
    notificationConfig.twilio.accountSid,
    notificationConfig.twilio.authToken
  );
}

// Notification service class
class NotificationService {
  constructor() {
    this.channels = {
      email: emailService,
      sms: this.createSMSChannel(),
      push: this.createPushChannel()
    };
  }

  // Create SMS channel
  createSMSChannel() {
    return {
      send: async message => {
        if (!twilioClient) {
          console.log('📱 SMS (Mock):', message);
          return { success: true, provider: 'mock' };
        }

        try {
          const result = await twilioClient.messages.create({
            body: message.content,
            from: notificationConfig.twilio.phoneNumber,
            to: message.to
          });

          return {
            success: true,
            messageId: result.sid,
            provider: 'twilio'
          };
        } catch (error) {
          console.error('❌ SMS sending failed:', error);
          throw error;
        }
      }
    };
  }

  // Create push notification channel
  createPushChannel() {
    return {
      send: async message => {
        // Mock implementation - in production, integrate with service worker
        console.log('🔔 Push Notification (Mock):', message);
        return { success: true, provider: 'mock' };
      }
    };
  }

  // Send notification through specified channels
  async sendNotification(
    notification,
    channels = notificationConfig.preferences.defaultChannels
  ) {
    const results = [];

    for (const channel of channels) {
      try {
        const channelService = this.channels[channel];
        if (!channelService) {
          throw new Error(`Channel ${channel} not available`);
        }

        const result = await channelService.send(notification);
        results.push({
          channel,
          success: true,
          ...result
        });
      } catch (error) {
        results.push({
          channel,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  // Send bulk notifications
  async sendBulkNotifications(
    notifications,
    channels = notificationConfig.preferences.defaultChannels
  ) {
    const results = [];
    const batchSize = notificationConfig.preferences.batchSize;

    // Process in batches
    for (let i = 0; i < notifications.length; i += batchSize) {
      const batch = notifications.slice(i, i + batchSize);

      for (const notification of batch) {
        try {
          const result = await this.sendNotification(notification, channels);
          results.push({
            notification,
            results: result
          });
        } catch (error) {
          results.push({
            notification,
            error: error.message
          });
        }
      }

      // Add delay between batches to avoid rate limiting
      if (i + batchSize < notifications.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  // Retry failed notifications
  async retryFailedNotifications(
    failedResults,
    maxRetries = notificationConfig.preferences.retryAttempts
  ) {
    const retryResults = [];

    for (const result of failedResults) {
      if (result.success) continue;

      let attempts = 0;
      let success = false;

      while (attempts < maxRetries && !success) {
        try {
          await new Promise(resolve =>
            setTimeout(resolve, notificationConfig.preferences.retryDelay)
          );

          const retryResult = await this.sendNotification(
            result.notification,
            result.channels
          );
          success = retryResult.some(r => r.success);
          attempts++;
        } catch (error) {
          attempts++;
        }
      }

      retryResults.push({
        ...result,
        retryAttempts: attempts,
        success
      });
    }

    return retryResults;
  }
}

// Export singleton instance
const notificationService = new NotificationService();

// Notification templates
const notificationTemplates = {
  // Welcome notification
  welcome: user => ({
    email: {
      to: user.email,
      subject: 'Welcome to ChurchFlow!',
      content: `Welcome ${user.name}! Your account has been created successfully.`
    },
    sms: {
      to: user.phone,
      content: `Welcome to ChurchFlow, ${user.name}! Your account is ready.`
    },
    push: {
      title: 'Welcome to ChurchFlow!',
      body: `Hello ${user.name}, welcome to our church management system!`,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png'
    }
  }),

  // Event reminder
  eventReminder: (user, event) => ({
    email: {
      to: user.email,
      subject: `Event Reminder: ${event.title}`,
      content: `Don't forget about ${event.title} on ${event.date} at ${event.time}.`
    },
    sms: {
      to: user.phone,
      content: `Reminder: ${event.title} is tomorrow at ${event.time}. See you there!`
    },
    push: {
      title: 'Event Reminder',
      body: `${event.title} is tomorrow at ${event.time}`,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png'
    }
  }),

  // Announcement
  announcement: (user, announcement) => ({
    email: {
      to: user.email,
      subject: `New Announcement: ${announcement.title}`,
      content: announcement.content
    },
    sms: {
      to: user.phone,
      content: `New announcement: ${announcement.title}. Check ChurchFlow for details.`
    },
    push: {
      title: 'New Announcement',
      body: announcement.title,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png'
    }
  }),

  // Password reset
  passwordReset: (user, resetToken) => ({
    email: {
      to: user.email,
      subject: 'Password Reset Request',
      content: `Click here to reset your password: ${resetToken}`
    },
    sms: {
      to: user.phone,
      content:
        'Password reset requested for ChurchFlow. Check your email for the reset link.'
    }
  }),

  // Attendance reminder
  attendanceReminder: (user, event) => ({
    email: {
      to: user.email,
      subject: 'Attendance Reminder',
      content: `Please confirm your attendance for ${event.title} on ${event.date}.`
    },
    sms: {
      to: user.phone,
      content: `Please confirm attendance for ${event.title} on ${event.date}.`
    },
    push: {
      title: 'Attendance Confirmation',
      body: `Please confirm your attendance for ${event.title}`,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png'
    }
  })
};

// Notification utility functions
const notificationUtils = {
  // Get user notification preferences
  getUserPreferences(user) {
    return (
      user.notificationPreferences || {
        email: true,
        sms: user.phone ? true : false,
        push: true,
        frequency: 'immediate' // immediate, daily, weekly
      }
    );
  },

  // Filter users by notification preferences
  filterUsersByPreferences(users, channel) {
    return users.filter(user => {
      const preferences = this.getUserPreferences(user);
      return preferences[channel];
    });
  },

  // Schedule notification
  scheduleNotification(notification, scheduledTime, channels = ['email']) {
    // In production, integrate with a job queue like Bull or Agenda
    const delay = scheduledTime.getTime() - Date.now();

    if (delay > 0) {
      setTimeout(async () => {
        await notificationService.sendNotification(notification, channels);
      }, delay);
    }
  },

  // Get notification statistics
  getNotificationStats(results) {
    const stats = {
      total: 0,
      successful: 0,
      failed: 0,
      byChannel: {}
    };

    for (const result of results) {
      stats.total++;

      if (result.success) {
        stats.successful++;
      } else {
        stats.failed++;
      }

      // Count by channel
      for (const channelResult of result.results || []) {
        if (!stats.byChannel[channelResult.channel]) {
          stats.byChannel[channelResult.channel] = {
            total: 0,
            successful: 0,
            failed: 0
          };
        }

        stats.byChannel[channelResult.channel].total++;
        if (channelResult.success) {
          stats.byChannel[channelResult.channel].successful++;
        } else {
          stats.byChannel[channelResult.channel].failed++;
        }
      }
    }

    return stats;
  },

  // Validate notification data
  validateNotification(notification) {
    const errors = [];

    if (!notification.content) {
      errors.push('Content is required');
    }

    if (!notification.to && !notification.users) {
      errors.push('Recipients are required');
    }

    if (notification.channels) {
      const validChannels = ['email', 'sms', 'push'];
      const invalidChannels = notification.channels.filter(
        c => !validChannels.includes(c)
      );
      if (invalidChannels.length > 0) {
        errors.push(`Invalid channels: ${invalidChannels.join(', ')}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};

// Real-time notification handler (for Socket.IO)
const realTimeNotifications = {
  // Send real-time notification to connected users
  sendToUsers(io, userIds, notification) {
    userIds.forEach(userId => {
      io.to(`user-${userId}`).emit('notification', notification);
    });
  },

  // Send to all connected users
  sendToAll(io, notification) {
    io.emit('notification', notification);
  },

  // Send to specific room/channel
  sendToRoom(io, room, notification) {
    io.to(room).emit('notification', notification);
  }
};

// Export all functions and objects
module.exports = {
  notificationConfig,
  notificationService,
  notificationTemplates,
  notificationUtils,
  realTimeNotifications
};
