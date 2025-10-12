# 🔑 Google OAuth Setup - Step by Step

## **Current Status:**
❌ Google OAuth not configured (using placeholder values)

## **Quick Setup (5 minutes):**

### **1. Go to Google Cloud Console**
- Open: https://console.cloud.google.com/
- Sign in with your Google account

### **2. Create New Project**
- Click "Select a project" → "New Project"
- Project name: `ChurchFlow`
- Click "Create"

### **3. Enable Google Identity API**
- Go to "APIs & Services" → "Library"
- Search "Google Identity"
- Click "Google Identity" → "Enable"

### **4. Create OAuth 2.0 Credentials**
- Go to "APIs & Services" → "Credentials"
- Click "Create Credentials" → "OAuth 2.0 Client ID"
- Application type: **Web application**
- Name: `ChurchFlow Web Client`

### **5. Configure OAuth Consent Screen**
- Click "Configure Consent Screen"
- User Type: **External** → Create
- App name: `ChurchFlow`
- User support email: Your email
- Developer contact: Your email
- Click "Save and Continue" (3 times)

### **6. Set Authorized Origins**
In the OAuth client configuration:
- **Authorized JavaScript origins:**
  ```
  http://localhost:3000
  ```
- **Authorized redirect URIs:**
  ```
  http://localhost:3000
  ```

### **7. Get Your Credentials**
- Click "Create"
- **Copy the Client ID** (looks like: `123456789-abcdefg.apps.googleusercontent.com`)
- **Copy the Client Secret** (looks like: `GOCSPX-abcdefghijklmnop`)

### **8. Update Your .env.local File**
Replace the placeholder values in your `.env.local`:

```bash
# Replace these lines:
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# With your actual values:
NEXT_PUBLIC_GOOGLE_CLIENT_ID="123456789-abcdefg.apps.googleusercontent.com"
GOOGLE_CLIENT_ID="123456789-abcdefg.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abcdefghijklmnop"
GOOGLE_REDIRECT_URI="postmessage"
```

## **Test Google OAuth:**
After updating `.env.local`:
```bash
npm run dev
# Go to http://localhost:3000
# Try Google sign-in
```

## **Need Help?**
- Google Cloud Console: https://console.cloud.google.com/
- OAuth 2.0 Setup Guide: https://developers.google.com/identity/protocols/oauth2


