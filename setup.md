# ChurchFlow MVP Setup Guide

## Quick Start for MVP Deployment

### 1. Environment Setup

Create a `.env.local` file in the root directory:

```bash
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Application
NODE_ENV="development"
```

### 2. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed database with test users
npx prisma db seed
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

## Test Users (After Seeding)

- **Admin**: admin@churchflow.com / password123
- **Member**: member@churchflow.com / password123

## MVP Readiness Assessment

### ✅ Ready for Internal Testing

- Core authentication works
- Dashboard functional
- Admin panel operational
- Database schema complete
- API routes functional

### ⚠️ Needs for Production MVP

- PostgreSQL database (not SQLite)
- Environment variables configured
- Email service integration
- File upload service (Cloudinary)
- Basic error handling improvements

### 🚀 Deployment Options

1. **Vercel** (Recommended for MVP)
   - Automatic deployments
   - Built-in environment variables
   - PostgreSQL integration

2. **Railway/Render**
   - Easy database setup
   - Environment configuration
   - Automatic scaling

3. **Self-hosted**
   - Requires server setup
   - Database configuration
   - SSL certificates

## Current Status: MVP Ready with Setup

The application is functionally complete and ready for MVP deployment once environment variables are configured.
