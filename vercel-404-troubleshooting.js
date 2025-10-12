#!/usr/bin/env node

console.log('🔧 VERCEL 404 ERROR TROUBLESHOOTING GUIDE');
console.log('==========================================\n');

console.log('❌ ERROR: HTTP 404: Not Found');
console.log('==============================');
console.log('This usually means environment variables are missing or incorrect.\n');

console.log('🔍 STEP 1: CHECK YOUR VERCEL DOMAIN');
console.log('====================================');
console.log('1. Go to your Vercel dashboard');
console.log('2. Find your ChurchFlow project');
console.log('3. Copy the exact domain (e.g., https://churchflow-abc123.vercel.app)');
console.log('4. This will be your NEXTAUTH_URL\n');

console.log('🔍 STEP 2: ADD ALL ENVIRONMENT VARIABLES');
console.log('=========================================');
console.log('Go to: Project Settings → Environment Variables');
console.log('Add these 20 variables (copy values from your .env.local):\n');

console.log('REQUIRED VARIABLES:');
console.log('===================');
console.log('1. DATABASE_URL = [Your Supabase PostgreSQL URL]');
console.log('2. NEXTAUTH_URL = [Your actual Vercel domain]');
console.log('3. NEXTAUTH_SECRET = [Your NextAuth secret]');
console.log('4. JWT_SECRET = [Your JWT secret]');
console.log('5. GOOGLE_CLIENT_ID = [Your Google OAuth Client ID]');
console.log('6. GOOGLE_CLIENT_SECRET = [Your Google OAuth Secret]');
console.log('7. NEXT_PUBLIC_GOOGLE_CLIENT_ID = [Same as GOOGLE_CLIENT_ID]');
console.log('8. GOOGLE_REDIRECT_URI = postmessage');
console.log('9. SENDGRID_API_KEY = [Your SendGrid API key]');
console.log('10. SENDGRID_FROM_EMAIL = noreply@churchflow.com');
console.log('11. SENDGRID_FROM_NAME = ChurchFlow');
console.log('12. TWILIO_ACCOUNT_SID = [Your Twilio Account SID]');
console.log('13. TWILIO_AUTH_TOKEN = [Your Twilio Auth Token]');
console.log('14. TWILIO_PHONE_NUMBER = +16169478878');
console.log('15. CLOUDINARY_CLOUD_NAME = [Your Cloudinary Cloud Name]');
console.log('16. CLOUDINARY_API_KEY = [Your Cloudinary API Key]');
console.log('17. CLOUDINARY_API_SECRET = [Your Cloudinary API Secret]');
console.log('18. SUPABASE_URL = [Your Supabase URL]');
console.log('19. SUPABASE_ANON_KEY = [Your Supabase Anon Key]');
console.log('20. SUPABASE_SERVICE_ROLE_KEY = [Your Supabase Service Role Key]\n');

console.log('⚠️  CRITICAL SETTINGS:');
console.log('======================');
console.log('• Set Environment to: Production, Preview, Development');
console.log('• NEXTAUTH_URL must match your exact Vercel domain');
console.log('• All variables must be added (even if some are optional)\n');

console.log('🔍 STEP 3: REDEPLOY YOUR APP');
console.log('============================');
console.log('1. After adding all variables, go to Deployments tab');
console.log('2. Click "Redeploy" on the latest deployment');
console.log('3. Or push a new commit to trigger redeployment\n');

console.log('🔍 STEP 4: CHECK BUILD LOGS');
console.log('===========================');
console.log('1. Go to Deployments tab');
console.log('2. Click on the latest deployment');
console.log('3. Check the Build Logs for errors');
console.log('4. Look for "Environment variable not found" errors\n');

console.log('🔍 STEP 5: COMMON ISSUES');
console.log('========================');
console.log('❌ NEXTAUTH_URL is wrong');
console.log('   Fix: Use your exact Vercel domain');
console.log('');
console.log('❌ Missing DATABASE_URL');
console.log('   Fix: Add your Supabase PostgreSQL connection string');
console.log('');
console.log('❌ Missing Google OAuth credentials');
console.log('   Fix: Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
console.log('');
console.log('❌ Build failed due to missing variables');
console.log('   Fix: Add all 20 variables and redeploy\n');

console.log('🎯 QUICK FIX CHECKLIST:');
console.log('=======================');
console.log('□ Added all 20 environment variables to Vercel');
console.log('□ Set NEXTAUTH_URL to your exact Vercel domain');
console.log('□ Set all variables to Production, Preview, Development');
console.log('□ Redeployed your app after adding variables');
console.log('□ Checked build logs for errors');
console.log('□ Verified your .env.local has all the same values\n');

console.log('🚀 IF STILL NOT WORKING:');
console.log('========================');
console.log('1. Check Vercel Function Logs for runtime errors');
console.log('2. Verify your Supabase database is accessible');
console.log('3. Test your Google OAuth credentials');
console.log('4. Contact Vercel support if build keeps failing\n');

console.log('💡 PRO TIP:');
console.log('===========');
console.log('The 404 error usually means NextAuth can\'t initialize');
console.log('because NEXTAUTH_URL or other critical variables are missing.');
console.log('Double-check your domain and add ALL variables!');

