# 🚀 Vercel Deployment Guide for ChurchFlow

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: ChurchFlow is already pushed to GitHub
3. **Environment Variables**: Prepare your production environment variables

## 🔧 Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

## 🌐 Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"

2. **Import from GitHub**
   - Select "Import Git Repository"
   - Choose `KusuConsult-NG/ChurchFlow`
   - Click "Import"

3. **Configure Project**
   - **Project Name**: `churchflow` (or your preferred name)
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### Option B: Deploy via CLI

```bash
# Navigate to project directory
cd /Users/mac/Downloads/ChurchFlow

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name: churchflow
# - Directory: ./
# - Override settings? N
```

## 🔐 Step 3: Configure Environment Variables

### Required Environment Variables

Go to your Vercel project dashboard → Settings → Environment Variables and add:

```bash
# Database
DATABASE_URL=your_production_database_url

# NextAuth
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# SendGrid (Optional)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_from_email

# Twilio (Optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Environment Variable Setup

1. **Go to Project Settings**
   - Navigate to your project in Vercel dashboard
   - Click "Settings" tab
   - Click "Environment Variables"

2. **Add Each Variable**
   - Click "Add New"
   - Enter variable name and value
   - Select environment (Production, Preview, Development)
   - Click "Save"

## 🗄️ Step 4: Database Setup

### Option A: Use Vercel Postgres (Recommended)

1. **Add Vercel Postgres**
   - Go to your Vercel project dashboard
   - Click "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Choose a name (e.g., `churchflow-db`)

2. **Get Connection String**
   - Copy the `DATABASE_URL` from the database settings
   - Add it to your environment variables

### Option B: Use External Database

- **Neon**: [neon.tech](https://neon.tech)
- **Supabase**: [supabase.com](https://supabase.com)
- **PlanetScale**: [planetscale.com](https://planetscale.com)

## 🚀 Step 5: Deploy and Test

1. **Trigger Deployment**
   - Push changes to GitHub (if using CLI)
   - Or click "Deploy" in Vercel dashboard

2. **Monitor Build**
   - Watch the build logs in Vercel dashboard
   - Check for any errors or warnings

3. **Test Application**
   - Visit your deployed URL
   - Test all major features
   - Check database connectivity

## 🔧 Step 6: Domain Configuration (Optional)

1. **Add Custom Domain**
   - Go to Project Settings → Domains
   - Click "Add Domain"
   - Enter your domain name
   - Follow DNS configuration instructions

2. **SSL Certificate**
   - Automatically provided by Vercel
   - No additional configuration needed

## 📊 Step 7: Monitoring and Analytics

1. **Vercel Analytics**
   - Automatically enabled
   - View in Vercel dashboard

2. **Performance Monitoring**
   - Check Core Web Vitals
   - Monitor build times
   - Track deployment frequency

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check build logs in Vercel dashboard
   # Common fixes:
   - Update Node.js version in vercel.json
   - Check for TypeScript errors
   - Verify all dependencies are installed
   ```

2. **Environment Variable Issues**
   ```bash
   # Ensure all required variables are set
   # Check variable names match exactly
   # Verify no typos in values
   ```

3. **Database Connection Issues**
   ```bash
   # Verify DATABASE_URL is correct
   # Check database server is accessible
   # Ensure Prisma schema is up to date
   ```

### Debug Commands

```bash
# Check Vercel CLI version
vercel --version

# View deployment logs
vercel logs

# Check project status
vercel ls

# Redeploy
vercel --prod
```

## 📈 Performance Optimization

1. **Image Optimization**
   - Use Next.js Image component
   - Optimize image sizes
   - Consider WebP format

2. **Code Splitting**
   - Already implemented with Next.js
   - Monitor bundle sizes

3. **Caching**
   - Vercel handles static asset caching
   - Configure API route caching as needed

## 🔒 Security Best Practices

1. **Environment Variables**
   - Never commit sensitive data
   - Use Vercel's environment variable system
   - Rotate keys regularly

2. **API Security**
   - Implement rate limiting
   - Validate all inputs
   - Use HTTPS (automatic with Vercel)

3. **Database Security**
   - Use connection pooling
   - Implement proper access controls
   - Regular security updates

## 📞 Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **Community Support**: [github.com/vercel/next.js/discussions](https://github.com/vercel/next.js/discussions)

## 🎉 Success Checklist

- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] Database connected
- [ ] Application deployed successfully
- [ ] All features tested
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up
- [ ] Performance optimized

---

**🚀 Your ChurchFlow application is now ready for production!**

