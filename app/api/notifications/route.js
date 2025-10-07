// app/api/notifications/route.js
const { NextResponse } = require('next/server');

const {
  notificationService,
  notificationTemplates,
  notificationUtils
} = require('../../../lib/notification-service');

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, recipients, channels, data } = body;

    // Validate notification
    const validation = notificationUtils.validateNotification({
      content: data?.content,
      to: recipients,
      channels
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid notification data', details: validation.errors },
        { status: 400 }
      );
    }

    // Get template based on type
    let notifications = [];

    if (type && notificationTemplates[type]) {
      // Use template
      for (const recipient of recipients) {
        const template = notificationTemplates[type](recipient, data);
        notifications.push(template);
      }
    } else {
      // Custom notification
      notifications = recipients.map(recipient => ({
        email: {
          to: recipient.email,
          subject: data.subject || 'Notification from ChurchFlow',
          content: data.content
        },
        sms: recipient.phone
          ? {
            to: recipient.phone,
            content: data.content
          }
          : null,
        push: {
          title: data.title || 'ChurchFlow Notification',
          body: data.content,
          icon: '/icon-192x192.png'
        }
      }));
    }

    // Send notifications
    const results = await notificationService.sendBulkNotifications(
      notifications,
      channels
    );
    const stats = notificationUtils.getNotificationStats(results);

    return NextResponse.json({
      success: true,
      message: 'Notifications sent successfully',
      stats,
      results
    });
  } catch (error) {
    // console.error('❌ Notification API error:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications', message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Get notification statistics (mock implementation)
    const stats = {
      totalSent: 1250,
      successRate: 98.5,
      byChannel: {
        email: { sent: 1200, success: 1185 },
        sms: { sent: 45, success: 44 },
        push: { sent: 5, success: 5 }
      },
      recentActivity: [
        {
          id: 1,
          type: 'welcome',
          recipient: 'user@example.com',
          channel: 'email',
          status: 'sent',
          timestamp: new Date().toISOString()
        }
      ]
    };

    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    // console.error('❌ Notification stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get notification statistics' },
      { status: 500 }
    );
  }
}
