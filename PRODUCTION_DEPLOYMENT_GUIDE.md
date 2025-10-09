# Production Environment Configuration

## Environment Variables

### Required Environment Variables for Production

```env
# Application Environment
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-super-secure-secret-key-here

# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database_name
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=true

# Email Service (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=ChurchFlow
SUPPORT_EMAIL=support@yourdomain.com

# SMTP Alternative
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your_smtp_password

# File Management (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Push Notifications
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=your_email@yourdomain.com

# Security
ALLOWED_ORIGINS=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring & Logging
LOG_LEVEL=info
SENTRY_DSN=your_sentry_dsn
NEW_RELIC_LICENSE_KEY=your_newrelic_key

# Performance
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600
MAX_FILE_SIZE=10485760

# Analytics
ANALYTICS_ENABLED=true
ANALYTICS_RETENTION_DAYS=365
PRIVACY_MODE=false

# Backup & Recovery
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30
BACKUP_S3_BUCKET=your-backup-bucket
BACKUP_S3_REGION=us-east-1
BACKUP_S3_ACCESS_KEY=your_access_key
BACKUP_S3_SECRET_KEY=your_secret_key
```

## Production Deployment Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] Database migrations completed
- [ ] SSL certificates installed
- [ ] Domain DNS configured
- [ ] CDN setup (if applicable)
- [ ] Backup strategy implemented
- [ ] Monitoring tools configured
- [ ] Security audit completed
- [ ] Performance testing completed
- [ ] Load testing completed

### Database Setup

- [ ] PostgreSQL instance provisioned
- [ ] Database user created with appropriate permissions
- [ ] Connection pooling configured
- [ ] Backup strategy implemented
- [ ] Monitoring configured
- [ ] SSL connections enabled
- [ ] Firewall rules configured

### Security Configuration

- [ ] HTTPS enabled with valid SSL certificate
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Input validation implemented
- [ ] SQL injection protection
- [ ] XSS protection enabled
- [ ] CSRF protection enabled
- [ ] Authentication tokens secured
- [ ] API keys rotated

### Performance Optimization

- [ ] Image optimization enabled
- [ ] Static assets cached
- [ ] Database queries optimized
- [ ] CDN configured
- [ ] Compression enabled
- [ ] Minification enabled
- [ ] Bundle size optimized
- [ ] Lazy loading implemented
- [ ] Caching strategy implemented

### Monitoring & Logging

- [ ] Application monitoring configured
- [ ] Error tracking enabled
- [ ] Performance monitoring enabled
- [ ] Uptime monitoring configured
- [ ] Log aggregation setup
- [ ] Alerting configured
- [ ] Dashboard created
- [ ] Health checks implemented

### Backup & Recovery

- [ ] Database backups automated
- [ ] File backups configured
- [ ] Backup testing completed
- [ ] Recovery procedures documented
- [ ] Disaster recovery plan created
- [ ] Backup retention policy set
- [ ] Cross-region backups (if applicable)

## Deployment Platforms

### Vercel (Recommended for Next.js)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Set environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
# ... add all required variables
```

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy
railway up

# Set environment variables
railway variables set DATABASE_URL=your_database_url
railway variables set NEXTAUTH_SECRET=your_secret
# ... set all required variables
```

### AWS (ECS/EKS)

```bash
# Build Docker image
docker build -t churchflow .

# Tag for ECR
docker tag churchflow:latest your-account.dkr.ecr.region.amazonaws.com/churchflow:latest

# Push to ECR
docker push your-account.dkr.ecr.region.amazonaws.com/churchflow:latest

# Deploy to ECS/EKS
# (Use AWS CLI or console)
```

### DigitalOcean App Platform

```bash
# Create app spec file
# Deploy via DigitalOcean CLI or console
# Set environment variables in dashboard
```

## Production Scripts

### package.json Scripts

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "dev": "next dev",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "db:migrate": "prisma migrate deploy",
    "db:seed": "prisma db seed",
    "db:backup": "node scripts/backup.js",
    "db:restore": "node scripts/restore.js",
    "pm2:start": "pm2 start ecosystem.config.js",
    "pm2:stop": "pm2 stop ecosystem.config.js",
    "pm2:restart": "pm2 restart ecosystem.config.js",
    "pm2:logs": "pm2 logs",
    "health:check": "node scripts/health-check.js"
  }
}
```

## Health Check Endpoint

### /api/health

```javascript
export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version,
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      email: await checkEmailService(),
      storage: await checkStorage()
    }
  };

  const isHealthy = Object.values(health.checks).every(
    check => check.status === 'ok'
  );

  return Response.json(health, {
    status: isHealthy ? 200 : 503
  });
}
```

## Performance Monitoring

### Key Metrics to Monitor

- Response time (p95, p99)
- Error rate
- Throughput (requests per second)
- Database connection pool usage
- Memory usage
- CPU usage
- Disk usage
- Cache hit rate
- API response times
- User session duration
- Page load times

### Alerting Thresholds

- Response time > 2 seconds
- Error rate > 1%
- Memory usage > 80%
- CPU usage > 80%
- Disk usage > 90%
- Database connections > 80% of pool
- Cache hit rate < 70%

## Security Best Practices

### Environment Variables

- Never commit .env files
- Use different secrets for each environment
- Rotate secrets regularly
- Use environment-specific configurations
- Encrypt sensitive data at rest

### Database Security

- Use connection pooling
- Enable SSL connections
- Implement proper access controls
- Regular security updates
- Monitor database access
- Implement query logging

### Application Security

- Enable HTTPS only
- Implement proper CORS
- Use secure cookies
- Implement rate limiting
- Validate all inputs
- Sanitize outputs
- Regular security audits

## Backup Strategy

### Database Backups

- Daily automated backups
- Point-in-time recovery
- Cross-region replication
- Backup testing
- Retention policy (30 days)

### File Backups

- Daily file system backups
- Version control for code
- Configuration backups
- SSL certificate backups

### Recovery Procedures

- Documented recovery steps
- Tested recovery procedures
- Recovery time objectives (RTO)
- Recovery point objectives (RPO)
- Disaster recovery plan


