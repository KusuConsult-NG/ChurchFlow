# 🚀 ChurchFlow Service Setup Guide

## 📋 **Quick Setup Checklist**

- [ ] Google OAuth (for Google sign-in)
- [ ] SendGrid (for email notifications)
- [ ] Twilio (for SMS notifications)
- [ ] Cloudinary (for file storage)
- [ ] Database (PostgreSQL)

---

## 🔑 **Step 1: Google OAuth Setup**

### **1.1 Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name: `ChurchFlow` → Create

### **1.2 Enable Google+ API**
1. Go to "APIs & Services" → "Library"
2. Search "Google+ API" → Enable
3. Or search "Google Identity" → Enable

### **1.3 Create OAuth 2.0 Credentials**
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Application type: **Web application**
4. Name: `ChurchFlow Web Client`
5. **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   ```
6. **Authorized redirect URIs:**
   ```
   http://localhost:3000
   ```
7. Click "Create"
8. **Copy Client ID and Client Secret**

### **1.4 Update Environment Variables**
Add to `.env.local`:
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-client-id-here"
GOOGLE_CLIENT_ID="your-client-id-here"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
GOOGLE_REDIRECT_URI="postmessage"
```

---

## 📧 **Step 2: SendGrid Email Setup**

### **2.1 Create SendGrid Account**
1. Go to [SendGrid](https://sendgrid.com/)
2. Sign up for free account
3. Verify your email

### **2.2 Create API Key**
1. Go to [SendGrid Dashboard](https://app.sendgrid.com/)
2. Navigate to "Settings" → "API Keys"
3. Click "Create API Key"
4. Name: `ChurchFlow API Key`
5. Permissions: **Full Access**
6. Click "Create & View"
7. **Copy the API Key** (starts with `SG.`)

### **2.3 Update Environment Variables**
Add to `.env.local`:
```bash
SENDGRID_API_KEY="SG.your-actual-api-key-here"
SENDGRID_FROM_EMAIL="noreply@churchflow.com"
SENDGRID_FROM_NAME="ChurchFlow"
```

---

## 📱 **Step 3: Twilio SMS Setup**

### **3.1 Create Twilio Account**
1. Go to [Twilio](https://www.twilio.com/)
2. Sign up for free account
3. Verify your phone number

### **3.2 Get Credentials**
1. Go to [Twilio Console](https://console.twilio.com/)
2. On the dashboard, find:
   - **Account SID** (starts with `AC`)
   - **Auth Token** (click to reveal)

### **3.3 Get Phone Number**
1. Go to "Phone Numbers" → "Manage" → "Buy a number"
2. Choose a number (free trial includes one)
3. **Copy the phone number**

### **3.4 Update Environment Variables**
Add to `.env.local`:
```bash
TWILIO_ACCOUNT_SID="ACyour-actual-account-sid-here"
TWILIO_AUTH_TOKEN="your-actual-auth-token-here"
TWILIO_PHONE_NUMBER="+1234567890"
```

---

## 📁 **Step 4: Cloudinary File Storage**

### **4.1 Create Cloudinary Account**
1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for free account
3. Verify your email

### **4.2 Get Credentials**
1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. On the dashboard, find:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### **4.3 Update Environment Variables**
Add to `.env.local`:
```bash
CLOUDINARY_CLOUD_NAME="your-cloud-name-here"
CLOUDINARY_API_KEY="your-api-key-here"
CLOUDINARY_API_SECRET="your-api-secret-here"
```

---

## 🗄️ **Step 5: Database Setup**

### **Option A: Use Neon Database (Recommended)**

#### **5.1 Check Neon Database**
1. Go to [Neon Console](https://console.neon.tech/)
2. Check if your database is active
3. If paused, click "Resume"

#### **5.2 Test Connection**
```bash
npm run test:services
```

### **Option B: Use Local PostgreSQL**

#### **5.1 Install PostgreSQL**
```bash
# macOS
brew install postgresql
brew services start postgresql

# Create database
createdb churchflow
```

#### **5.2 Update Environment Variables**
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/churchflow"
```

---

## 🧪 **Step 6: Test All Services**

### **6.1 Update .env.local File**
Copy the template and fill in your values:
```bash
cp env.template .env.local
nano .env.local
```

### **6.2 Test Services**
```bash
# Test all external services
npm run test:services

# Test environment variables
npm run env:validate

# Start development server
npm run dev
```

### **6.3 Expected Results**
```
✅ DATABASE: SUCCESS
✅ EMAIL: SUCCESS  
✅ SMS: SUCCESS
✅ STORAGE: SUCCESS
✅ AUTH: SUCCESS
```

---

## 🎯 **Complete .env.local Template**

```bash
# Database Configuration
DATABASE_URL="postgresql://neondb_owner:npg_OU1J5FlrqZcG@ep-wispy-leaf-adcb35hw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-nextauth-key-change-this-in-production-123456789"

# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-actual-google-client-id"
GOOGLE_CLIENT_ID="your-actual-google-client-id"
GOOGLE_CLIENT_SECRET="your-actual-google-client-secret"
GOOGLE_REDIRECT_URI="postmessage"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-123456789"

# SendGrid Email Service
SENDGRID_API_KEY="SG.your-actual-sendgrid-api-key"
SENDGRID_FROM_EMAIL="noreply@churchflow.com"
SENDGRID_FROM_NAME="ChurchFlow"

# Twilio SMS Service
TWILIO_ACCOUNT_SID="ACyour-actual-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-actual-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Cloudinary File Storage
CLOUDINARY_CLOUD_NAME="your-actual-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-actual-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-actual-cloudinary-api-secret"
```

---

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **"Google OAuth not configured"**
   - Check `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set
   - Verify redirect URI matches Google Console

2. **"SendGrid API key invalid"**
   - Ensure key starts with `SG.`
   - Check API key permissions

3. **"Twilio SID invalid"**
   - Ensure Account SID starts with `AC`
   - Verify Auth Token is correct

4. **"Cloudinary cloud_name required"**
   - Check `CLOUDINARY_CLOUD_NAME` is set
   - Verify all Cloudinary credentials

5. **"Database connection failed"**
   - Check Neon database status
   - Verify connection string format

### **Test Individual Services:**
```bash
# Test Google OAuth
curl -X POST http://localhost:3000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"token":"test"}'

# Test SendGrid
node -e "console.log(process.env.SENDGRID_API_KEY)"

# Test Twilio
node -e "console.log(process.env.TWILIO_ACCOUNT_SID)"

# Test Cloudinary
node -e "console.log(process.env.CLOUDINARY_CLOUD_NAME)"
```

---

## 🎉 **Success!**

Once all services are configured:
- ✅ Google OAuth will work for sign-in
- ✅ Email notifications will be sent
- ✅ SMS notifications will work
- ✅ File uploads will be stored
- ✅ Database operations will work
- ✅ Authentication will be fully functional

**Your ChurchFlow application will be ready for development and testing!** 🚀
