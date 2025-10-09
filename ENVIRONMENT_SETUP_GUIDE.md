# Environment Configuration Guide

This guide explains how to properly configure environment variables for the ChurchFlow application.

## 📁 Environment Files

### `.env.local` (Development)
Used for local development. Contains all service configurations.

### `.env.production` (Production)
Used for production deployment. Should contain production-ready configurations.

## 🔧 Required Environment Variables

### Database Configuration
```bash
# PostgreSQL Database URL
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# For development, you can use SQLite
# DATABASE_URL="file:./dev.db"
```

### NextAuth.js Configuration
```bash
# NextAuth.js URL (should match your domain)
NEXTAUTH_URL="http://localhost:3000"  # Development
# NEXTAUTH_URL="https://yourdomain.com"  # Production

# NextAuth.js Secret (generate a secure random string)
NEXTAUTH_SECRET="your-secret-key-here"
```

### Email Service (SendGrid)
```bash
# SendGrid API Key
SENDGRID_API_KEY="SG.your-sendgrid-api-key"

# Email Configuration
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_FROM_NAME="ChurchFlow"
SUPPORT_EMAIL="support@yourdomain.com"
```

### SMS Service (Twilio)
```bash
# Twilio Credentials
TWILIO_ACCOUNT_SID="ACyour-account-sid"
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"
```

### File Storage (Cloudinary)
```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# File Upload Limits
MAX_FILE_SIZE="10485760"  # 10MB in bytes
```

### Application Configuration
```bash
# Environment
NODE_ENV="development"  # or "production"

# Optional: Redis for caching
# REDIS_URL="redis://localhost:6379"

# Optional: SMTP fallback for email
# SMTP_HOST="smtp.gmail.com"
# SMTP_PORT="587"
# SMTP_USER="your-email@gmail.com"
# SMTP_PASSWORD="your-app-password"
# SMTP_SECURE="false"
```

## 🚀 Environment Setup Steps

### 1. Copy Environment Template
```bash
cp .env.local.example .env.local
```

### 2. Configure Database
- **Development**: Use SQLite (already configured)
- **Production**: Set up PostgreSQL and update `DATABASE_URL`

### 3. Configure Email Service
- Sign up for SendGrid account
- Get API key from SendGrid dashboard
- Update `SENDGRID_API_KEY` in environment file

### 4. Configure SMS Service
- Sign up for Twilio account
- Get Account SID, Auth Token, and Phone Number
- Update Twilio credentials in environment file

### 5. Configure File Storage
- Sign up for Cloudinary account
- Get Cloud Name, API Key, and API Secret
- Update Cloudinary credentials in environment file

### 6. Generate NextAuth Secret
```bash
# Generate a secure secret
openssl rand -base64 32
```

## 🧪 Testing Environment Configuration

### Test Environment Variables
```bash
node test-env.js
```

### Test External Services
```bash
node test-services.js
```

### Test API Endpoints
```bash
# Start development server
npm run dev

# Test health endpoint
curl http://localhost:3000/api/health
```

## 🔒 Security Best Practices

### 1. Never Commit Environment Files
- Add `.env*` to `.gitignore`
- Use `.env.example` for templates

### 2. Use Strong Secrets
- Generate cryptographically secure secrets
- Use different secrets for different environments

### 3. Rotate Credentials Regularly
- Update API keys periodically
- Monitor service usage

### 4. Production Environment
- Use environment-specific configurations
- Enable SSL/TLS for all services
- Use production-grade database and services

## 🚨 Troubleshooting

### Environment Variables Not Loading
1. Check file path: `.env.local` should be in project root
2. Restart development server after changes
3. Verify file permissions

### Database Connection Issues
1. Check `DATABASE_URL` format
2. Verify database server is running
3. Check network connectivity

### Service Connection Issues
1. Verify API keys are correct
2. Check service account status
3. Review service-specific error messages

### API Endpoint Issues
1. Ensure development server is running
2. Check middleware configuration
3. Verify route handlers are properly exported

## 📊 Environment Status Check

Run the following commands to verify your environment:

```bash
# Check environment variables
node test-env.js

# Test service connections
node test-services.js

# Test API endpoints
npm run dev
curl http://localhost:3000/api/health
```

## 🎯 Production Deployment

For production deployment:

1. **Set up production environment variables**
2. **Use production-grade services**
3. **Enable SSL/TLS**
4. **Configure proper CORS settings**
5. **Set up monitoring and logging**
6. **Implement proper error handling**

## 📞 Support

If you encounter issues with environment configuration:

1. Check this guide first
2. Review service-specific documentation
3. Check application logs
4. Verify network connectivity
5. Contact support if needed

---

**Note**: Keep your environment files secure and never commit them to version control!


