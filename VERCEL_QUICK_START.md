# ⚡ Vercel Quick Start for ChurchFlow

## 🚀 Deploy in 5 Minutes

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy from GitHub
```bash
# Go to your project directory
cd /Users/mac/Downloads/ChurchFlow

# Deploy to Vercel
vercel

# Follow the prompts:
# ✅ Set up and deploy? → Y
# ✅ Which scope? → Select your account
# ✅ Link to existing project? → N
# ✅ Project name → churchflow
# ✅ Directory → ./
# ✅ Override settings? → N
```

### Step 4: Configure Environment Variables

Go to [vercel.com/dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables

Add these **REQUIRED** variables:

```bash
DATABASE_URL=your_production_database_url
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_secret_key_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Step 5: Redeploy
```bash
vercel --prod
```

## 🎉 Done! Your ChurchFlow is live!

Visit your deployment URL to see your application running.

## 📋 Next Steps

1. **Set up Database**: Use Vercel Postgres or external database
2. **Configure OAuth**: Set up Google OAuth credentials
3. **Add Domain**: Configure custom domain (optional)
4. **Monitor**: Check Vercel dashboard for analytics

## 🔧 Troubleshooting

**Build Failed?**
- Check environment variables are set
- Verify all required variables are present
- Check build logs in Vercel dashboard

**Database Issues?**
- Ensure DATABASE_URL is correct
- Check database server is accessible
- Run `prisma generate` locally first

**Authentication Issues?**
- Verify NEXTAUTH_URL matches your domain
- Check Google OAuth credentials
- Ensure NEXTAUTH_SECRET is set

## 📞 Need Help?

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Full Guide**: See `VERCEL_DEPLOYMENT_GUIDE.md`
- **Environment Variables**: See `VERCEL_ENV_VARIABLES_TEMPLATE.md`
