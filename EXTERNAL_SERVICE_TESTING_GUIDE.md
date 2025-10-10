# External Service Testing Guide

This guide explains how to test all external services in the ChurchFlow application and provides comprehensive testing tools.

## 🧪 Testing Overview

### Services to Test
- **PostgreSQL Database** - Data storage and retrieval
- **SendGrid Email Service** - Email notifications
- **Twilio SMS Service** - SMS notifications
- **Cloudinary File Storage** - File uploads and management
- **NextAuth Authentication** - User authentication
- **API Endpoints** - REST API functionality

## 🔧 Testing Commands

### Comprehensive Service Testing
```bash
# Test all external services
npm run test:services

# Test individual services
node test-external-services.js
```

### API Endpoint Testing
```bash
# Test all API endpoints
npm run test:api

# Test individual endpoints
node test-api-endpoints.js
```

### Environment Testing
```bash
# Test environment configuration
npm run env:test

# Validate environment setup
npm run env:validate
```

## 📊 Service Test Results

### Expected Results
- ✅ **SendGrid Email**: API key valid, configuration correct
- ✅ **Twilio SMS**: Account connected, phone number verified
- ✅ **Cloudinary Storage**: Connection successful, credentials valid
- ✅ **NextAuth Auth**: Secret configured, URL set
- ⚠️ **PostgreSQL Database**: May show connection error in local testing (expected)

### Database Testing Notes
The PostgreSQL database may show connection errors during local testing because:
1. **Network Access**: The database server may not be accessible from your local network
2. **Firewall**: Database server may have firewall restrictions
3. **Environment**: Local testing environment may not have production database access

This is **normal and expected** for local development testing.

## 🔍 Individual Service Tests

### 1. Database Service Test
```bash
# Test database connection
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect()
  .then(() => console.log('✅ Database connected'))
  .catch(err => console.log('❌ Database error:', err.message))
  .finally(() => prisma.\$disconnect());
"
```

### 2. Email Service Test
```bash
# Test SendGrid configuration
node -e "
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
console.log('✅ SendGrid configured:', !!process.env.SENDGRID_API_KEY);
"
```

### 3. SMS Service Test
```bash
# Test Twilio connection
node -e "
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch()
  .then(account => console.log('✅ Twilio connected:', account.friendlyName))
  .catch(err => console.log('❌ Twilio error:', err.message));
"
```

### 4. File Storage Test
```bash
# Test Cloudinary connection
node -e "
const { v2: cloudinary } = require('cloudinary');
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
cloudinary.api.ping()
  .then(result => console.log('✅ Cloudinary connected:', result.status))
  .catch(err => console.log('❌ Cloudinary error:', err.message));
"
```

## 🌐 API Endpoint Testing

### Health Check
```bash
curl http://localhost:3000/api/health
```

### SMS Service
```bash
curl http://localhost:3000/api/test-sms
```

### Email Service
```bash
curl http://localhost:3000/api/email
```

### File Upload
```bash
curl http://localhost:3000/api/upload
```

## 🚀 Production Testing

### Pre-Deployment Checklist
- [ ] All services pass individual tests
- [ ] API endpoints respond correctly
- [ ] Database connection works in production environment
- [ ] Email service can send test emails
- [ ] SMS service can send test messages
- [ ] File storage can upload test files
- [ ] Authentication works with production URLs

### Production Test Commands
```bash
# Test with production environment
NODE_ENV=production npm run test:services

# Test with production database
DATABASE_URL="your-production-db-url" npm run test:services
```

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Error: Can't reach database server
# Solutions:
# 1. Check DATABASE_URL format
# 2. Verify database server is running
# 3. Check network connectivity
# 4. Verify credentials
```

#### Email Service Errors
```bash
# Error: Invalid API key
# Solutions:
# 1. Verify SENDGRID_API_KEY format (starts with SG.)
# 2. Check API key permissions
# 3. Verify SendGrid account status
```

#### SMS Service Errors
```bash
# Error: Authentication failed
# Solutions:
# 1. Verify TWILIO_ACCOUNT_SID format (starts with AC)
# 2. Check TWILIO_AUTH_TOKEN
# 3. Verify Twilio account status
```

#### File Storage Errors
```bash
# Error: Invalid credentials
# Solutions:
# 1. Verify CLOUDINARY_CLOUD_NAME
# 2. Check CLOUDINARY_API_KEY
# 3. Verify CLOUDINARY_API_SECRET
```

## 📊 Test Reporting

### Automated Reports
The testing suite generates comprehensive reports including:
- Service connection status
- Response times
- Error details
- Recommendations
- Next steps

### Manual Verification
```bash
# Check service status manually
npm run test:services | grep -E "(✅|❌|⚠️)"

# Check specific service
npm run test:services | grep -A 5 "DATABASE"
```

## 🔄 Continuous Testing

### Development Testing
```bash
# Run tests during development
npm run test:services

# Run tests before commits
npm run test:services && git commit
```

### CI/CD Integration
```yaml
# GitHub Actions example
- name: Test External Services
  run: |
    npm run test:services
    if [ $? -ne 0 ]; then
      echo "Service tests failed"
      exit 1
    fi
```

## 📞 Support

If you encounter issues with service testing:

1. **Check environment variables**: `npm run env:validate`
2. **Verify service credentials**: Check service dashboards
3. **Test individual services**: Use individual test commands
4. **Check network connectivity**: Verify internet connection
5. **Review service documentation**: Check service-specific guides

---

**Note**: Some services may show connection errors in local development environments. This is normal and expected. Focus on ensuring the services work correctly in your production environment.



