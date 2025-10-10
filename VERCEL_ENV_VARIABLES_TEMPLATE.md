# 🔐 Vercel Environment Variables Template

## 📋 Required Environment Variables

Copy these variables to your Vercel project settings:

### 🗄️ Database Configuration
```bash
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```

### 🔐 Authentication (NextAuth.js)
```bash
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-super-secret-nextauth-secret-key-here
```

### 🔑 Google OAuth
```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 📧 Email Service (SendGrid - Optional)
```bash
SENDGRID_API_KEY=SG.your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=ChurchFlow
```

### 📱 SMS Service (Twilio - Optional)
```bash
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### ☁️ File Storage (Cloudinary - Optional)
```bash
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 🔔 WhatsApp Service (Optional)
```bash
WHATSAPP_ACCESS_TOKEN=your-whatsapp-access-token
WHATSAPP_PHONE_NUMBER_ID=your-whatsapp-phone-number-id
WHATSAPP_VERIFY_TOKEN=your-whatsapp-verify-token
```

## 🛠️ How to Add Environment Variables in Vercel

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Click "Settings" tab
   - Click "Environment Variables"

2. **Add Each Variable**
   - Click "Add New"
   - Enter the variable name (exactly as shown above)
   - Enter the variable value
   - Select environments: Production, Preview, Development
   - Click "Save"

3. **Redeploy**
   - After adding all variables, redeploy your project
   - Go to "Deployments" tab
   - Click "Redeploy" on the latest deployment

## 🔍 Environment Variable Validation

### Required for Basic Functionality
- `DATABASE_URL` - Database connection
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - Authentication secret
- `GOOGLE_CLIENT_ID` - Google OAuth
- `GOOGLE_CLIENT_SECRET` - Google OAuth

### Optional for Enhanced Features
- `SENDGRID_API_KEY` - Email notifications
- `TWILIO_ACCOUNT_SID` - SMS notifications
- `CLOUDINARY_CLOUD_NAME` - File uploads
- `WHATSAPP_ACCESS_TOKEN` - WhatsApp notifications

## 🚨 Security Notes

1. **Never commit these values to Git**
2. **Use strong, unique secrets**
3. **Rotate keys regularly**
4. **Use different values for different environments**

## 📝 Example Values (DO NOT USE IN PRODUCTION)

```bash
# Example DATABASE_URL
DATABASE_URL=postgresql://user:pass@db.example.com:5432/churchflow?sslmode=require

# Example NEXTAUTH_SECRET (generate a strong one)
NEXTAUTH_SECRET=your-32-character-secret-key-here

# Example NEXTAUTH_URL
NEXTAUTH_URL=https://churchflow.vercel.app
```

## 🔧 Testing Environment Variables

After adding variables, test them by:

1. **Check Build Logs**
   - Look for any environment variable errors
   - Verify all required variables are loaded

2. **Test Application Features**
   - Try logging in with Google
   - Test database operations
   - Check email/SMS functionality

3. **Use Vercel CLI**
   ```bash
   vercel env ls
   vercel env pull .env.local
   ```

## 📞 Need Help?

- **Vercel Docs**: [vercel.com/docs/environment-variables](https://vercel.com/docs/environment-variables)
- **NextAuth.js Docs**: [next-auth.js.org/configuration/options](https://next-auth.js.org/configuration/options)
- **Prisma Docs**: [prisma.io/docs/concepts/database-connectors](https://prisma.io/docs/concepts/database-connectors)



