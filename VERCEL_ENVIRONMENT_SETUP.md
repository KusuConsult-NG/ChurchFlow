# 🚨 CRITICAL: Vercel Environment Variables Setup

## ⚠️ **DEPLOYMENT FAILURE CAUSE**
The Vercel deployment is failing because **REQUIRED environment variables are missing**.

## 🔧 **IMMEDIATE FIX REQUIRED**

### **Step 1: Go to Vercel Dashboard**
1. Visit: [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your **ChurchFlow** project
3. Go to **Settings** → **Environment Variables**
4. Click **"Add New"** for each variable below

### **Step 2: Add These CRITICAL Variables**

#### **1. Database Connection (REQUIRED)**
```
Variable Name: DATABASE_URL
Value: postgresql://neondb_owner:npg_OU1J5FlrqZcG@ep-wispy-leaf-adcb35hw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
Environment: Production, Preview, Development
```

#### **2. NextAuth Configuration (REQUIRED)**
```
Variable Name: NEXTAUTH_URL
Value: https://church-flow-alpha.vercel.app
Environment: Production, Preview, Development
```

```
Variable Name: NEXTAUTH_SECRET
Value: your-super-secret-nextauth-key-change-this-in-production-123456789
Environment: Production, Preview, Development
```

#### **3. Google OAuth (REQUIRED for Login)**
```
Variable Name: GOOGLE_CLIENT_ID
Value: [Your Google Client ID from Google Cloud Console]
Environment: Production, Preview, Development
```

```
Variable Name: GOOGLE_CLIENT_SECRET
Value: [Your Google Client Secret from Google Cloud Console]
Environment: Production, Preview, Development
```

#### **4. JWT Secret (REQUIRED)**
```
Variable Name: JWT_SECRET
Value: your-super-secret-jwt-key-change-this-in-production-123456789
Environment: Production, Preview, Development
```

### **Step 3: Optional Variables (For Full Functionality)**

#### **SendGrid Email Service**
```
Variable Name: SENDGRID_API_KEY
Value: [Your SendGrid API Key]
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

#### **Twilio SMS Service**
```
Variable Name: TWILIO_ACCOUNT_SID
Value: [Your Twilio Account SID]
Environment: Production, Preview, Development
```

```
Variable Name: TWILIO_AUTH_TOKEN
Value: [Your Twilio Auth Token]
Environment: Production, Preview, Development
```

```
Variable Name: TWILIO_PHONE_NUMBER
Value: +1234567890
Environment: Production, Preview, Development
```

### **Step 4: Redeploy After Adding Variables**

1. **Save** all environment variables
2. Go to **Deployments** tab
3. Click **"Redeploy"** on the latest deployment
4. Or trigger a new deployment by pushing to GitHub

---

## 🚨 **Why This Fixes the Error**

The error `Application error: a server-side exception has occurred` happens because:

1. **Missing DATABASE_URL** → Prisma can't connect to database
2. **Missing NEXTAUTH_SECRET** → NextAuth.js fails to initialize
3. **Missing NEXTAUTH_URL** → Authentication redirects fail
4. **Missing JWT_SECRET** → Token generation fails

---

## ✅ **After Adding Variables**

Your ChurchFlow app should:
- ✅ Load without server errors
- ✅ Connect to database successfully
- ✅ Handle authentication properly
- ✅ Display all pages correctly

---

## 🆘 **Still Having Issues?**

If the deployment still fails after adding these variables:

1. **Check Vercel Function Logs**:
   - Go to Vercel Dashboard → Your Project → Functions
   - Look for error details in the logs

2. **Verify Database Connection**:
   - Test the DATABASE_URL in a database client
   - Ensure the database is accessible from Vercel

3. **Check Google OAuth Setup**:
   - Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
   - Ensure redirect URI matches your Vercel domain

---

## 📞 **Quick Test**

After adding variables and redeploying:
1. Visit: `https://church-flow-alpha.vercel.app`
2. Try to sign in with Google
3. Check if pages load without errors

**Expected Result**: App loads successfully with login functionality working.


