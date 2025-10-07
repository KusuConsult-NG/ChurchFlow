# Google OAuth OAuthCallback Error - Complete Troubleshooting Guide

## 🚨 **Current Issue: OAuthCallback Error**

The Google OAuth is still returning `error=OAuthCallback` which means the OAuth callback processing is failing. This is a common issue with NextAuth.js and Google OAuth configuration.

## 🔍 **Step-by-Step Diagnosis**

### **Step 1: Check Environment Variables**

Visit: `https://church-flow-alpha.vercel.app/api/debug-oauth`

This will show you:
- Which environment variables are set/missing
- Google OAuth configuration status
- Session state
- Troubleshooting recommendations

### **Step 2: Verify Google Cloud Console Configuration**

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Navigate to APIs & Services → Credentials**
3. **Find your OAuth 2.0 Client ID: `580742150709-mpn30oboekd15954ajfiqdi7fuf6ueta.apps.googleusercontent.com`**
4. **Verify these redirect URIs are added:**

```
https://church-flow-alpha.vercel.app/api/auth/callback/google
https://church-flow-alpha.vercel.app/api/auth/[...nextauth]
```

### **Step 3: Check Vercel Environment Variables**

In your Vercel dashboard, ensure these are set:

```bash
NEXTAUTH_URL=https://church-flow-alpha.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-here
GOOGLE_CLIENT_ID=580742150709-mpn30oboekd15954ajfiqdi7fuf6ueta.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

## 🔧 **Common Causes & Solutions**

### **Cause 1: Missing Environment Variables**
**Solution:** Set all required environment variables in Vercel

### **Cause 2: Incorrect Redirect URI**
**Solution:** Ensure Google Cloud Console has the exact redirect URI

### **Cause 3: NEXTAUTH_SECRET Not Set**
**Solution:** Generate a secret and set it in Vercel:
```bash
openssl rand -base64 32
```

### **Cause 4: Google OAuth Not Enabled**
**Solution:** Enable Google+ API in Google Cloud Console

### **Cause 5: Domain Not Authorized**
**Solution:** Add your domain to authorized domains in Google Cloud Console

## 🧪 **Testing Steps**

### **Test 1: Environment Check**
```bash
curl https://church-flow-alpha.vercel.app/api/debug-oauth
```

### **Test 2: Google OAuth Test**
Visit: `https://church-flow-alpha.vercel.app/test-google-oauth`

### **Test 3: Direct OAuth URL**
Visit: `https://church-flow-alpha.vercel.app/api/auth/signin`

## 🚀 **Quick Fix Checklist**

- [ ] All environment variables set in Vercel
- [ ] Redirect URI added to Google Cloud Console
- [ ] Google+ API enabled
- [ ] Domain added to authorized domains
- [ ] NEXTAUTH_SECRET is set and secure
- [ ] Redeploy after making changes

## 📊 **Expected Behavior After Fix**

1. **Click "Continue with Google"**
2. **Redirected to Google OAuth consent screen**
3. **After consent, redirected back to:**
   ```
   https://church-flow-alpha.vercel.app/dashboard
   ```
4. **No error parameters in URL**

## 🔍 **Debug Information**

If the issue persists, check:

1. **Browser Network Tab:** Look for failed requests to `/api/auth/callback/google`
2. **Vercel Function Logs:** Check for errors in the NextAuth function
3. **Google Cloud Console:** Check OAuth consent screen configuration
4. **Environment Variables:** Ensure all are properly set

## 📞 **Next Steps**

1. **Run the debug API** to check configuration
2. **Verify Google Cloud Console** settings
3. **Check Vercel environment variables**
4. **Test the OAuth flow** again
5. **Check browser console** for any JavaScript errors

The OAuthCallback error should be resolved once the environment variables and Google Cloud Console are properly configured!
