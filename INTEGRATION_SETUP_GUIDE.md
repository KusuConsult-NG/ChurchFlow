# ChurchFlow Integration Setup Guide

## Overview

This guide covers setting up all the core integrations for ChurchFlow to make it production-ready.

## 🔧 Environment Variables Setup

### Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="churchflow-secret-key-2024"

# Application
NODE_ENV="development"

# Email Service (SendGrid)
SENDGRID_API_KEY="your_sendgrid_api_key"
FROM_EMAIL="noreply@churchflow.com"
FROM_NAME="ChurchFlow"
SUPPORT_EMAIL="support@churchflow.com"

# SMTP (Alternative to SendGrid)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"

# File Management (Cloudinary)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID="your_account_sid"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"

# Push Notifications
VAPID_PUBLIC_KEY="your_vapid_public_key"
VAPID_PRIVATE_KEY="your_vapid_private_key"
VAPID_EMAIL="your_email@example.com"

# Security
ALLOWED_ORIGINS="http://localhost:3000"
```

## 📧 Email Service Setup

### Option 1: SendGrid (Recommended)

1. **Create SendGrid Account**
   - Go to [SendGrid](https://sendgrid.com)
   - Sign up for a free account (100 emails/day)
   - Verify your sender identity

2. **Get API Key**
   - Go to Settings > API Keys
   - Create a new API key with "Full Access"
   - Copy the API key to `SENDGRID_API_KEY`

3. **Configure Sender**
   - Go to Settings > Sender Authentication
   - Verify your domain or single sender
   - Update `FROM_EMAIL` with your verified email

### Option 2: SMTP (Gmail)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Generate password for "Mail"
3. **Configure SMTP settings**
   - Use your Gmail address for `SMTP_USER`
   - Use the app password for `SMTP_PASS`

## 📁 File Management Setup

### Cloudinary Setup

1. **Create Cloudinary Account**
   - Go to [Cloudinary](https://cloudinary.com)
   - Sign up for a free account (25GB storage, 25GB bandwidth)
   - Get your cloud name, API key, and API secret

2. **Configure Environment Variables**
   - Add your Cloudinary credentials to `.env.local`
   - Files will be uploaded to the `churchflow` folder by default

### Local Storage (Development)

- If Cloudinary is not configured, files will be stored locally in `./uploads`
- Make sure the `uploads` directory exists and is writable

## 📱 SMS Service Setup

### Twilio Setup

1. **Create Twilio Account**
   - Go to [Twilio](https://twilio.com)
   - Sign up for a free account ($15 credit)
   - Verify your phone number

2. **Get Credentials**
   - Go to Console Dashboard
   - Copy Account SID and Auth Token
   - Purchase a phone number for sending SMS

3. **Configure Environment Variables**
   - Add Twilio credentials to `.env.local`
   - Use the purchased phone number for `TWILIO_PHONE_NUMBER`

## 🔔 Push Notifications Setup

### VAPID Keys Generation

1. **Install web-push library**

   ```bash
   npm install web-push
   ```

2. **Generate VAPID keys**

   ```bash
   npx web-push generate-vapid-keys
   ```

3. **Configure Environment Variables**
   - Add the generated keys to `.env.local`
   - Use your email for `VAPID_EMAIL`

## 🚀 Testing the Integrations

### Test Email Service

```bash
curl -X POST http://localhost:3000/api/email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "welcome",
    "recipients": [{"email": "test@example.com", "name": "Test User"}]
  }'
```

### Test File Upload

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "files=@/path/to/your/image.jpg" \
  -F "folder=test"
```

### Test Notifications

```bash
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "type": "announcement",
    "recipients": [{"email": "test@example.com", "phone": "+1234567890"}],
    "channels": ["email", "sms"],
    "data": {
      "announcement": {
        "title": "Test Announcement",
        "content": "This is a test announcement"
      }
    }
  }'
```

## 📊 Monitoring and Analytics

### Email Analytics

- SendGrid provides detailed analytics in their dashboard
- Track delivery rates, open rates, and click rates
- Monitor bounce and spam reports

### File Storage Analytics

- Cloudinary provides usage statistics
- Monitor storage usage and bandwidth
- Set up alerts for usage limits

### SMS Analytics

- Twilio provides delivery reports
- Monitor delivery rates and costs
- Track message status and errors

## 🔒 Security Considerations

### API Keys Security

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Rotate API keys regularly
- Use least privilege principle

### File Upload Security

- Validate file types and sizes
- Scan uploaded files for malware
- Use secure file storage
- Implement access controls

### Rate Limiting

- Implement rate limiting for all APIs
- Monitor for abuse and suspicious activity
- Set up alerts for unusual usage patterns

## 🛠️ Troubleshooting

### Common Issues

1. **Email Not Sending**
   - Check API key validity
   - Verify sender authentication
   - Check spam folder
   - Review SendGrid logs

2. **File Upload Failing**
   - Check Cloudinary credentials
   - Verify file size limits
   - Check file type restrictions
   - Review error logs

3. **SMS Not Delivering**
   - Verify Twilio credentials
   - Check phone number format
   - Verify account balance
   - Review Twilio logs

### Debug Mode

Enable debug logging by setting:

```env
DEBUG=true
NODE_ENV=development
```

## 📈 Production Deployment

### Environment Variables for Production

```env
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
DATABASE_URL=postgresql://user:pass@host:port/db
SENDGRID_API_KEY=your_production_key
CLOUDINARY_CLOUD_NAME=your_production_cloud
TWILIO_ACCOUNT_SID=your_production_sid
```

### Security Checklist

- [ ] All API keys are secure
- [ ] HTTPS is enabled
- [ ] Rate limiting is configured
- [ ] File uploads are validated
- [ ] Error handling is implemented
- [ ] Monitoring is set up

## 📞 Support

For issues with specific services:

- **SendGrid**: [SendGrid Support](https://support.sendgrid.com)
- **Cloudinary**: [Cloudinary Support](https://support.cloudinary.com)
- **Twilio**: [Twilio Support](https://support.twilio.com)

For ChurchFlow-specific issues, check the project documentation or create an issue in the repository.



