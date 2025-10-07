# Database Migration Guide

## Overview

This guide covers migrating ChurchFlow from SQLite to PostgreSQL for production deployment.

## Prerequisites

- PostgreSQL 13+ installed
- Database user with CREATE DATABASE privileges
- Backup of current SQLite database

## Step 1: Set Up PostgreSQL Database

### Local Development

```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb churchflow_dev
createdb churchflow_test
```

### Production (Cloud)

- **Supabase**: Create new project
- **Railway**: Deploy PostgreSQL service
- **AWS RDS**: Create PostgreSQL instance
- **Google Cloud SQL**: Create PostgreSQL instance

## Step 2: Update Environment Variables

### Development (.env.local)

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/churchflow_dev"
DATABASE_URL_TEST="postgresql://username:password@localhost:5432/churchflow_test"

# Connection Pool
DB_POOL_MIN=2
DB_POOL_MAX=20
DB_CONNECTION_TIMEOUT=60000
```

### Production (.env.production)

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# SSL Configuration
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=true

# Connection Pool
DB_POOL_MIN=5
DB_POOL_MAX=50
DB_CONNECTION_TIMEOUT=30000
```

## Step 3: Update Prisma Schema

### prisma/schema.prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ... rest of your models
```

## Step 4: Run Migration

```bash
# Generate Prisma client
npx prisma generate

# Push schema to PostgreSQL
npx prisma db push

# Seed database
npx prisma db seed
```

## Step 5: Data Migration (if needed)

### Export from SQLite

```bash
# Install sqlite3 if not already installed
npm install sqlite3

# Export data
node scripts/export-sqlite-data.js
```

### Import to PostgreSQL

```bash
# Import data
node scripts/import-postgresql-data.js
```

## Step 6: Verify Migration

```bash
# Check database connection
npx prisma db pull

# Verify data integrity
npm run db:validate

# Run tests
npm test
```

## Production Considerations

### Connection Pooling

- Use connection pooling for better performance
- Configure appropriate pool sizes
- Monitor connection usage

### Backup Strategy

- Set up automated backups
- Test restore procedures
- Monitor backup success

### Monitoring

- Set up database monitoring
- Monitor query performance
- Track connection usage

### Security

- Use SSL connections
- Implement proper access controls
- Regular security updates

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check PostgreSQL service status
   - Verify connection string
   - Check firewall settings

2. **Authentication Failed**
   - Verify username/password
   - Check user permissions
   - Verify database exists

3. **Schema Mismatch**
   - Run `npx prisma db push`
   - Check for migration conflicts
   - Verify Prisma client generation

### Performance Optimization

1. **Indexes**
   - Add indexes for frequently queried fields
   - Monitor query performance
   - Use EXPLAIN ANALYZE

2. **Connection Pooling**
   - Configure appropriate pool sizes
   - Monitor connection usage
   - Use connection pooling libraries

3. **Query Optimization**
   - Use Prisma's query optimization features
   - Implement proper pagination
   - Use database-specific optimizations

## Rollback Plan

If migration fails:

1. **Stop Application**

   ```bash
   # Stop the application
   pm2 stop churchflow
   ```

2. **Restore SQLite**

   ```bash
   # Restore from backup
   cp backup-*.db dev.db
   ```

3. **Update Environment**

   ```env
   DATABASE_URL="file:./dev.db"
   ```

4. **Restart Application**
   ```bash
   pm2 start churchflow
   ```

## Monitoring and Maintenance

### Daily Tasks

- Check database health
- Monitor connection usage
- Review error logs

### Weekly Tasks

- Analyze query performance
- Check backup status
- Review security logs

### Monthly Tasks

- Update database software
- Review and optimize queries
- Test disaster recovery procedures

