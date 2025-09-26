import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Get notification template
    const notification = await prisma.notificationTemplate.findUnique({
      where: { id },
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification template not found' }, { status: 404 });
    }

    // Send test notification
    await sendTestNotification(notification, session.user);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'NOTIFICATION_TESTED',
        entityType: 'NOTIFICATION_TEMPLATE',
        entityId: id,
        userId: session.user.id,
        details: {
          notificationName: notification.name,
          type: notification.type,
        },
      },
    });

    return NextResponse.json({ 
      success: true,
      message: 'Test notification sent successfully' 
    });
  } catch (error) {
    console.error('Test notification error:', error);
    return NextResponse.json({ error: 'Failed to send test notification' }, { status: 500 });
  }
}

async function sendTestNotification(notification, user) {
  // This is a simplified version - in production you'd integrate with actual email/SMS services
  
  const message = notification.template
    .replace(/\{\{name\}\}/g, user.name || 'Test User')
    .replace(/\{\{email\}\}/g, user.email || 'test@example.com')
    .replace(/\{\{date\}\}/g, new Date().toLocaleDateString())
    .replace(/\{\{event\}\}/g, 'Test Event')
    .replace(/\{\{amount\}\}/g, '$0.00');

  console.log(`Test notification sent to ${user.email}:`, {
    type: notification.type,
    message: message,
    recipients: notification.recipients
  });

  // In production, you would:
  // - Send actual email via SendGrid, AWS SES, etc.
  // - Send SMS via Twilio, AWS SNS, etc.
  // - Send push notifications via Firebase, etc.
  // - Send webhook to external service
}
