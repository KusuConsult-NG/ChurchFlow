// lib/email-service.js
const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');

// Email service configuration
const emailConfig = {
  // SendGrid configuration
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.FROM_EMAIL || 'noreply@churchflow.com',
    fromName: process.env.FROM_NAME || 'ChurchFlow'
  },

  // SMTP configuration (fallback)
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  },

  // Email templates configuration
  templates: {
    baseUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    logoUrl: process.env.LOGO_URL || '/logo.png',
    supportEmail: process.env.SUPPORT_EMAIL || 'support@churchflow.com'
  }
};

// Initialize SendGrid
if (emailConfig.sendgrid.apiKey) {
  sgMail.setApiKey(emailConfig.sendgrid.apiKey);
}

// Email service class
class EmailService {
  constructor() {
    this.provider = this.determineProvider();
    this.transporter = null;
    this.initializeTransporter();
  }

  determineProvider() {
    if (emailConfig.sendgrid.apiKey) {
      return 'sendgrid';
    } else if (emailConfig.smtp.auth.user && emailConfig.smtp.auth.pass) {
      return 'smtp';
    } else {
      return 'console'; // Fallback to console logging
    }
  }

  async initializeTransporter() {
    if (this.provider === 'smtp') {
      this.transporter = nodemailer.createTransporter(emailConfig.smtp);

      // Verify connection
      try {
        await this.transporter.verify();
        console.log('✅ SMTP connection verified');
      } catch (error) {
        console.error('❌ SMTP connection failed:', error);
        this.provider = 'console';
      }
    }
  }

  // Send email using the configured provider
  async sendEmail(emailData) {
    try {
      switch (this.provider) {
      case 'sendgrid':
        return await this.sendWithSendGrid(emailData);
      case 'smtp':
        return await this.sendWithSMTP(emailData);
      default:
        return await this.sendToConsole(emailData);
      }
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      throw error;
    }
  }

  // SendGrid implementation
  async sendWithSendGrid(emailData) {
    const msg = {
      to: emailData.to,
      from: {
        email: emailConfig.sendgrid.fromEmail,
        name: emailConfig.sendgrid.fromName
      },
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
      templateId: emailData.templateId,
      dynamicTemplateData: emailData.dynamicTemplateData
    };

    const response = await sgMail.send(msg);
    return {
      success: true,
      messageId: response[0].headers['x-message-id'],
      provider: 'sendgrid'
    };
  }

  // SMTP implementation
  async sendWithSMTP(emailData) {
    const mailOptions = {
      from: `${emailConfig.sendgrid.fromName} <${emailConfig.sendgrid.fromEmail}>`,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text
    };

    const info = await this.transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: info.messageId,
      provider: 'smtp'
    };
  }

  // Console fallback (development)
  async sendToConsole(emailData) {
    console.log('📧 EMAIL (Console Mode):');
    console.log('To:', emailData.to);
    console.log('Subject:', emailData.subject);
    console.log('HTML:', emailData.html);
    console.log('---');

    return {
      success: true,
      messageId: `console-${Date.now()}`,
      provider: 'console'
    };
  }

  // Email template builders
  buildWelcomeEmail(user) {
    return {
      to: user.email,
      subject: 'Welcome to ChurchFlow!',
      html: this.getWelcomeTemplate(user),
      text: `Welcome to ChurchFlow, ${user.name}! Your account has been created successfully.`
    };
  }

  buildPasswordResetEmail(user, resetToken) {
    const resetUrl = `${emailConfig.templates.baseUrl}/auth/reset-password?token=${resetToken}`;

    return {
      to: user.email,
      subject: 'Reset Your ChurchFlow Password',
      html: this.getPasswordResetTemplate(user, resetUrl),
      text: `Hello ${user.name}, click this link to reset your password: ${resetUrl}`
    };
  }

  buildAnnouncementEmail(users, announcement) {
    return users.map(user => ({
      to: user.email,
      subject: `New Announcement: ${announcement.title}`,
      html: this.getAnnouncementTemplate(user, announcement),
      text: `New announcement: ${announcement.title}\n\n${announcement.content}`
    }));
  }

  buildEventReminderEmail(user, event) {
    return {
      to: user.email,
      subject: `Event Reminder: ${event.title}`,
      html: this.getEventReminderTemplate(user, event),
      text: `Reminder: ${event.title} is scheduled for ${event.date} at ${event.time}`
    };
  }

  // Email templates
  getWelcomeTemplate(user) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ChurchFlow</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ChurchFlow!</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name}!</h2>
            <p>Welcome to ChurchFlow, your comprehensive church management system. Your account has been successfully created.</p>
            <p>You can now access all the features of ChurchFlow:</p>
            <ul>
              <li>Manage church events and announcements</li>
              <li>Track attendance and member information</li>
              <li>Handle financial transactions and budgets</li>
              <li>Communicate with church members</li>
            </ul>
            <p style="text-align: center;">
              <a href="${emailConfig.templates.baseUrl}/dashboard" class="button">Access Dashboard</a>
            </p>
            <p>If you have any questions, please contact us at ${emailConfig.templates.supportEmail}</p>
          </div>
          <div class="footer">
            <p>© 2024 ChurchFlow. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordResetTemplate(user, resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #DC2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #DC2626; color: white; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .warning { background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name}!</h2>
            <p>You requested to reset your password for your ChurchFlow account.</p>
            <p>Click the button below to reset your password:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <div class="warning">
              <strong>Security Notice:</strong> This link will expire in 1 hour for security reasons. If you didn't request this password reset, please ignore this email.
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          </div>
          <div class="footer">
            <p>© 2024 ChurchFlow. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getAnnouncementTemplate(user, announcement) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Announcement</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .announcement { background: white; padding: 20px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Announcement</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name}!</h2>
            <p>A new announcement has been posted:</p>
            <div class="announcement">
              <h3>${announcement.title}</h3>
              <p><strong>Date:</strong> ${new Date(announcement.createdAt).toLocaleDateString()}</p>
              <div>${announcement.content}</div>
            </div>
            <p>Visit ChurchFlow to see all announcements and updates.</p>
          </div>
          <div class="footer">
            <p>© 2024 ChurchFlow. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getEventReminderTemplate(user, event) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Event Reminder</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #7C3AED; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .event { background: white; padding: 20px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Event Reminder</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name}!</h2>
            <p>This is a reminder about an upcoming event:</p>
            <div class="event">
              <h3>${event.title}</h3>
              <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${event.time}</p>
              <p><strong>Location:</strong> ${event.location}</p>
              <div>${event.description}</div>
            </div>
            <p>We look forward to seeing you there!</p>
          </div>
          <div class="footer">
            <p>© 2024 ChurchFlow. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

// Export singleton instance
const emailService = new EmailService();

// Utility functions
const emailUtils = {
  // Validate email address
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Send bulk emails
  async sendBulkEmails(emailList) {
    const results = [];

    for (const emailData of emailList) {
      try {
        const result = await emailService.sendEmail(emailData);
        results.push({ ...result, email: emailData.to });
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          email: emailData.to
        });
      }
    }

    return results;
  },

  // Get email statistics
  getEmailStats(results) {
    const total = results.length;
    const successful = results.filter(r => r.success).length;
    const failed = total - successful;

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? ((successful / total) * 100).toFixed(2) : 0
    };
  }
};

// Export all functions and objects
module.exports = {
  emailConfig,
  emailService,
  emailUtils
};
