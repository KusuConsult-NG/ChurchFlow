# 📧 SendGrid Email Setup - Quick Guide

## **Current Status:**
❌ SendGrid API key not configured

## **Quick Setup (3 minutes):**

### **1. Create SendGrid Account**
- Go to: https://sendgrid.com/
- Click "Start for Free"
- Sign up with your email
- Verify your email address

### **2. Get API Key**
- Go to: https://app.sendgrid.com/
- Navigate to "Settings" → "API Keys"
- Click "Create API Key"
- Name: `ChurchFlow API Key`
- Permissions: **Full Access**
- Click "Create & View"
- **Copy the API Key** (starts with `SG.`)

### **3. Update Your .env.local File**
Add these lines to your `.env.local`:

```bash
# SendGrid Email Service
SENDGRID_API_KEY="SG.your-actual-api-key-here"
SENDGRID_FROM_EMAIL="noreply@churchflow.com"
SENDGRID_FROM_NAME="ChurchFlow"
```

## **Test SendGrid:**
```bash
npm run test:services
# Should show: ✅ EMAIL: SUCCESS
```
