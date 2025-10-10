# 🎯 Complete .env.local Template for ChurchFlow

# Copy this entire content to your .env.local file and replace the placeholder values

# Database Configuration (Neon PostgreSQL)
DATABASE_URL="postgresql://neondb_owner:npg_OU1J5FlrqZcG@ep-wispy-leaf-adcb35hw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-nextauth-key-change-this-in-production-123456789"

# Google OAuth Configuration (REQUIRED for Google Sign-in)
# Get these from: https://console.cloud.google.com/
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-actual-google-client-id-here"
GOOGLE_CLIENT_ID="your-actual-google-client-id-here"
GOOGLE_CLIENT_SECRET="your-actual-google-client-secret-here"
GOOGLE_REDIRECT_URI="postmessage"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-123456789"

# SendGrid Email Service (REQUIRED for email notifications)
# Get API key from: https://app.sendgrid.com/
SENDGRID_API_KEY="SG.your-actual-sendgrid-api-key-here"
SENDGRID_FROM_EMAIL="noreply@churchflow.com"
SENDGRID_FROM_NAME="ChurchFlow"

# Twilio SMS Service (REQUIRED for SMS notifications)
# Get credentials from: https://console.twilio.com/
TWILIO_ACCOUNT_SID="ACyour-actual-twilio-account-sid-here"
TWILIO_AUTH_TOKEN="your-actual-twilio-auth-token-here"
TWILIO_PHONE_NUMBER="+1234567890"

# Cloudinary File Storage (REQUIRED for file uploads)
# Get credentials from: https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME="your-actual-cloudinary-cloud-name-here"
CLOUDINARY_API_KEY="your-actual-cloudinary-api-key-here"
CLOUDINARY_API_SECRET="your-actual-cloudinary-api-secret-here"

# Optional: Redis for caching
REDIS_URL="redis://localhost:6379"

# Optional: Analytics
GOOGLE_ANALYTICS_ID="your-google-analytics-id"

# ========================================
# SETUP CHECKLIST:
# ========================================
# [ ] Google OAuth: Get Client ID & Secret from Google Cloud Console
# [ ] SendGrid: Get API Key from SendGrid Dashboard  
# [ ] Twilio: Get Account SID, Auth Token & Phone Number
# [ ] Cloudinary: Get Cloud Name, API Key & API Secret
# [ ] Database: Check Neon database status or use local PostgreSQL
# [ ] Test: Run `npm run test:services` to verify all services

