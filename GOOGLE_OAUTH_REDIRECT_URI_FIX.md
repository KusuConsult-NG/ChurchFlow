# Google OAuth Redirect URI Fix for ChurchFlow

## 🚨 **URGENT: Google OAuth Configuration Issue**

### **Problem Identified**
The Google OAuth is failing with `Error 400: redirect_uri_mismatch` because the redirect URI in your Google Cloud Console doesn't match what NextAuth.js expects.

**Current redirect URI being used:** `https://church-flow-alpha.vercel.app/api/auth/callback/google`  
**Google Client ID:** `580742150709-mpn30oboekd15954ajfiqdi7fuf6ueta.apps.googleusercontent.com`

### **Solution: Update Google Cloud Console**

#### **Step 1: Access Google Cloud Console**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one if needed)
3. Navigate to **APIs & Services** → **Credentials**

#### **Step 2: Update OAuth 2.0 Client ID**
1. Find your OAuth 2.0 Client ID: `580742150709-mpn30oboekd15954ajfiqdi7fuf6ueta.apps.googleusercontent.com`
2. Click on it to edit
3. In the **Authorized redirect URIs** section, add these URIs:

```
https://church-flow-alpha.vercel.app/api/auth/callback/google
https://church-flow-alpha.vercel.app/api/auth/[...nextauth]
http://localhost:3000/api/auth/callback/google
http://localhost:3000/api/auth/[...nextauth]
```

#### **Step 3: Save Changes**
1. Click **Save** to update the configuration
2. Wait 5-10 minutes for changes to propagate

### **Alternative Solution: Environment Variables**

If you want to use a different redirect URI, update your Vercel environment variables:

```bash
# In Vercel Dashboard → Project Settings → Environment Variables
NEXTAUTH_URL=https://church-flow-alpha.vercel.app
GOOGLE_CLIENT_ID=580742150709-mpn30oboekd15954ajfiqdi7fuf6ueta.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

### **Verification Steps**

1. **Test the redirect URI** by visiting:
   ```
   https://church-flow-alpha.vercel.app/api/auth/signin
   ```

2. **Check the callback URL** in the browser network tab when clicking "Sign in with Google"

3. **Verify the redirect URI** matches exactly what's in Google Cloud Console

### **Common Issues & Solutions**

#### **Issue 1: Trailing Slash**
- ❌ Wrong: `https://church-flow-alpha.vercel.app/api/auth/callback/google/`
- ✅ Correct: `https://church-flow-alpha.vercel.app/api/auth/callback/google`

#### **Issue 2: HTTP vs HTTPS**
- ❌ Wrong: `http://church-flow-alpha.vercel.app/api/auth/callback/google`
- ✅ Correct: `https://church-flow-alpha.vercel.app/api/auth/callback/google`

#### **Issue 3: Missing NextAuth Route**
- ❌ Wrong: `https://church-flow-alpha.vercel.app/api/auth/google`
- ✅ Correct: `https://church-flow-alpha.vercel.app/api/auth/callback/google`

### **NextAuth.js OAuth Flow**

NextAuth.js automatically handles the OAuth flow:
1. User clicks "Sign in with Google"
2. Redirects to: `/api/auth/signin`
3. NextAuth redirects to Google with callback: `/api/auth/callback/google`
4. Google redirects back to: `https://church-flow-alpha.vercel.app/api/auth/callback/google`
5. NextAuth processes the response and redirects to dashboard

### **Testing Locally**

For local development, also add:
```
http://localhost:3000/api/auth/callback/google
http://localhost:3000/api/auth/[...nextauth]
```

### **Security Notes**

- Only add the exact URIs you need
- Use HTTPS in production
- Keep your client secret secure
- Regularly rotate your credentials

---

## **Quick Fix Summary**

1. **Go to Google Cloud Console**
2. **Edit OAuth 2.0 Client ID**
3. **Add redirect URI:** `https://church-flow-alpha.vercel.app/api/auth/callback/google`
4. **Save and wait 5-10 minutes**
5. **Test Google sign-in**

This should resolve the `redirect_uri_mismatch` error immediately!


