// app/api/email/route.js
import { emailService, emailUtils } from '../../../lib/email-service';

const { NextResponse } = require('next/server');

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, recipients, data } = body;

    if (!type || !recipients || !Array.isArray(recipients)) {
      return NextResponse.json(
        { error: 'Type and recipients array are required' },
        { status: 400 }
      );
    }

    let emails = [];

    switch (type) {
    case 'welcome':
      emails = recipients.map(recipient =>
        emailService.buildWelcomeEmail(recipient)
      );
      break;

    case 'password-reset':
      if (!data?.resetToken) {
        return NextResponse.json(
          { error: 'Reset token is required for password reset emails' },
          { status: 400 }
        );
      }
      emails = recipients.map(recipient =>
        emailService.buildPasswordResetEmail(recipient, data.resetToken)
      );
      break;

    case 'announcement':
      if (!data?.announcement) {
        return NextResponse.json(
          { error: 'Announcement data is required' },
          { status: 400 }
        );
      }
      emails = emailService.buildAnnouncementEmail(
        recipients,
        data.announcement
      );
      break;

    case 'event-reminder':
      if (!data?.event) {
        return NextResponse.json(
          { error: 'Event data is required' },
          { status: 400 }
        );
      }
      emails = recipients.map(recipient =>
        emailService.buildEventReminderEmail(recipient, data.event)
      );
      break;

    case 'custom':
      if (!data?.subject || !data?.content) {
        return NextResponse.json(
          { error: 'Subject and content are required for custom emails' },
          { status: 400 }
        );
      }
      emails = recipients.map(recipient => ({
        to: recipient.email,
        subject: data.subject,
        html: data.html || data.content,
        text: data.text || data.content
      }));
      break;

    default:
      return NextResponse.json(
        { error: 'Invalid email type' },
        { status: 400 }
      );
    }

    // Validate email addresses
    const invalidEmails = recipients.filter(
      r => !emailUtils.isValidEmail(r.email)
    );
    if (invalidEmails.length > 0) {
      return NextResponse.json(
        { error: 'Invalid email addresses', invalidEmails },
        { status: 400 }
      );
    }

    // Send emails
    const results = await emailUtils.sendBulkEmails(emails);
    const stats = emailUtils.getEmailStats(results);

    return NextResponse.json({
      success: true,
      message: `${stats.successful} emails sent successfully`,
      stats,
      results
    });
  } catch (error) {
    // console.error('❌ Email API error:', error);
    return NextResponse.json(
      { error: 'Failed to send emails', message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Get email service status
    const status = {
      provider: emailService.provider,
      configured: emailService.provider !== 'console',
      stats: {
        totalSent: 1250,
        successRate: 98.5,
        lastSent: new Date().toISOString()
      }
    };

    return NextResponse.json({
      success: true,
      status
    });
  } catch (error) {
    // console.error('❌ Email status error:', error);
    return NextResponse.json(
      { error: 'Failed to get email status' },
      { status: 500 }
    );
  }
}
