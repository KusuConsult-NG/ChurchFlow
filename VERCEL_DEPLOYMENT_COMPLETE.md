# 🚀 Vercel Deployment Guide - Complete Environment Variables

## 📋 **VERCEL ENVIRONMENT VARIABLES TO COPY**

### **Step 1: Go to Vercel Dashboard**
1. Visit: https://vercel.com/dashboard
2. Select your ChurchFlow project
3. Go to **Settings** → **Environment Variables**

### **Step 2: Add These Environment Variables**

Copy and paste these **EXACT** values into Vercel:

---

## 🔧 **REQUIRED ENVIRONMENT VARIABLES**

### **1. Database Configuration**
```
Variable Name: DATABASE_URL
Value: postgresql://neondb_owner:npg_OU1J5FlrqZcG@ep-wispy-leaf-adcb35hw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
Environment: Production, Preview, Development
```

### **2. NextAuth Configuration**
```
Variable Name: NEXTAUTH_URL
Value: https://your-app-name.vercel.app
Environment: Production, Preview, Development
```

```
Variable Name: NEXTAUTH_SECRET
Value: your-super-secret-nextauth-key-change-this-in-production-123456789
Environment: Production, Preview, Development
```

### **3. Google OAuth**
```
Variable Name: NEXT_PUBLIC_GOOGLE_CLIENT_ID
Value: your-google-client-id-here
Environment: Production, Preview, Development
```

```
Variable Name: GOOGLE_CLIENT_ID
Value: your-google-client-id-here
Environment: Production, Preview, Development
```

```
Variable Name: GOOGLE_CLIENT_SECRET
Value: your-google-client-secret-here
Environment: Production, Preview, Development
```

```
Variable Name: GOOGLE_REDIRECT_URI
Value: postmessage
Environment: Production, Preview, Development
```

### **4. JWT Secret**
```
Variable Name: JWT_SECRET
Value: your-super-secret-jwt-key-change-this-in-production-123456789
Environment: Production, Preview, Development
```

### **5. SendGrid Email**
```
Variable Name: SENDGRID_API_KEY
Value: your-sendgrid-api-key-here
Environment: Production, Preview, Development
```

```
Variable Name: SENDGRID_FROM_EMAIL
Value: noreply@churchflow.com
Environment: Production, Preview, Development
```

```
Variable Name: SENDGRID_FROM_NAME
Value: ChurchFlow
Environment: Production, Preview, Development
```

### **6. Twilio SMS**
```
Variable Name: TWILIO_ACCOUNT_SID
Value: your-twilio-account-sid-here
Environment: Production, Preview, Development
```

```
Variable Name: TWILIO_AUTH_TOKEN
Value: c092eed8aaea1de5f73ebb0a2d5a9b1d
Environment: Production, Preview, Development
```

```
Variable Name: TWILIO_PHONE_NUMBER
Value: +16169478878
Environment: Production, Preview, Development
```

### **7. Cloudinary Storage**
```
Variable Name: CLOUDINARY_CLOUD_NAME
Value: churchflow
Environment: Production, Preview, Development
```

```
Variable Name: CLOUDINARY_API_KEY
Value: 694375151875773
Environment: Production, Preview, Development
```

```
Variable Name: CLOUDINARY_API_SECRET
Value: H_49Pm6D97aSoHAoE7G4Gj0vIFI
Environment: Production, Preview, Development
```

---

## ⚠️ **IMPORTANT NOTES:**

### **1. Update NEXTAUTH_URL**
- Replace `https://your-app-name.vercel.app` with your actual Vercel domain
- Example: `https://churchflow-abc123.vercel.app`

### **2. Update Google OAuth Redirect URIs**
After deployment, update your Google Cloud Console:
1. Go to: https://console.cloud.google.com/
2. Navigate to APIs & Services → Credentials
3. Edit your OAuth 2.0 Client ID
4. Add these Authorized redirect URIs:
   - `https://your-app-name.vercel.app/api/auth/callback/google`
   - `https://your-app-name.vercel.app`

### **3. Environment Selection**
- Set **ALL** variables for: `Production`, `Preview`, and `Development`
- This ensures they work in all environments

---

## 🚀 **DEPLOYMENT STEPS:**

### **Step 1: Add Environment Variables**
1. Copy each variable above into Vercel
2. Make sure to select all environments (Production, Preview, Development)
3. Click "Save" after adding each variable

### **Step 2: Deploy**
1. Push your code to GitHub
2. Vercel will automatically deploy
3. Your app will be available at: `https://your-app-name.vercel.app`

### **Step 3: Test**
1. Visit your deployed app
2. Test Google OAuth login
3. Test email notifications
4. Test SMS notifications
5. Test file uploads

---

## ✅ **VERIFICATION CHECKLIST:**

- [ ] All 15 environment variables added to Vercel
- [ ] NEXTAUTH_URL updated with your Vercel domain
- [ ] Google OAuth redirect URIs updated
- [ ] All variables set for Production, Preview, Development
- [ ] App deployed successfully
- [ ] Authentication working
- [ ] Email service working
- [ ] SMS service working
- [ ] File storage working

---

## 🎯 **QUICK COPY-PASTE LIST:**

Here are all the variable names for quick reference:

```
DATABASE_URL
NEXTAUTH_URL
NEXTAUTH_SECRET
NEXT_PUBLIC_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI
JWT_SECRET
SENDGRID_API_KEY
SENDGRID_FROM_EMAIL
SENDGRID_FROM_NAME
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

**Total: 17 environment variables to add to Vercel**

---

## 🎉 **SUCCESS!**

Once you've added all these environment variables to Vercel, your ChurchFlow application will be fully functional in production with:

- ✅ Google OAuth authentication
- ✅ Email notifications (SendGrid)
- ✅ SMS notifications (Twilio)
- ✅ File storage (Cloudinary)
- ✅ Database operations (PostgreSQL)
- ✅ Complete user management

**Your app will work exactly the same in production as it does locally!** 🚀
