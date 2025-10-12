#!/usr/bin/env node

console.log('🔍 VERCEL 404 ERROR - ADVANCED TROUBLESHOOTING');
console.log('==============================================\n');

console.log('✅ You mentioned everything is correctly set in Vercel');
console.log('❌ But still getting HTTP 404: Not Found');
console.log('This suggests a build or deployment issue.\n');

console.log('🔍 STEP 1: CHECK BUILD STATUS');
console.log('==============================');
console.log('1. Go to Vercel Dashboard → Your Project → Deployments');
console.log('2. Look at the latest deployment status');
console.log('3. Check if it shows "Ready" or "Failed"');
console.log('4. If "Failed", click on it to see build logs\n');

console.log('🔍 STEP 2: CHECK BUILD LOGS');
console.log('============================');
console.log('Look for these common errors in build logs:');
console.log('❌ "Environment variable not found"');
console.log('❌ "Module not found"');
console.log('❌ "Build failed"');
console.log('❌ "TypeScript errors"');
console.log('❌ "ESLint errors"\n');

console.log('🔍 STEP 3: CHECK FUNCTION LOGS');
console.log('===============================');
console.log('1. Go to Vercel Dashboard → Your Project → Functions');
console.log('2. Look for any runtime errors');
console.log('3. Check if NextAuth is initializing properly\n');

console.log('🔍 STEP 4: VERIFY CRITICAL VARIABLES');
console.log('====================================');
console.log('Double-check these are EXACTLY correct:');
console.log('• NEXTAUTH_URL = Your exact Vercel domain');
console.log('• DATABASE_URL = Your Supabase connection string');
console.log('• GOOGLE_CLIENT_ID = Your Google OAuth Client ID');
console.log('• GOOGLE_CLIENT_SECRET = Your Google OAuth Secret\n');

console.log('🔍 STEP 5: TEST YOUR DOMAIN');
console.log('============================');
console.log('1. Try accessing: https://your-domain.vercel.app');
console.log('2. Try accessing: https://your-domain.vercel.app/api/auth/signin');
console.log('3. Check if you get different errors\n');

console.log('🔍 STEP 6: COMMON 404 CAUSES');
console.log('=============================');
console.log('❌ NextAuth configuration error');
console.log('   Fix: Check NEXTAUTH_URL and NEXTAUTH_SECRET');
console.log('');
console.log('❌ Build failed silently');
console.log('   Fix: Check build logs for hidden errors');
console.log('');
console.log('❌ Missing middleware configuration');
console.log('   Fix: Verify middleware.ts is properly configured');
console.log('');
console.log('❌ Database connection issues');
console.log('   Fix: Check DATABASE_URL and Supabase status');
console.log('');
console.log('❌ Google OAuth misconfiguration');
console.log('   Fix: Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET\n');

console.log('🔍 STEP 7: FORCE REDEPLOYMENT');
console.log('==============================');
console.log('1. Go to Deployments tab');
console.log('2. Click "Redeploy" on latest deployment');
console.log('3. Or make a small change and push to GitHub');
console.log('4. Watch the build process carefully\n');

console.log('🔍 STEP 8: CHECK NEXT.JS CONFIGURATION');
console.log('=======================================');
console.log('Verify these files exist and are correct:');
console.log('• next.config.js');
console.log('• middleware.ts');
console.log('• app/layout.tsx');
console.log('• app/page.tsx\n');

console.log('🔍 STEP 9: DEBUG MODE');
console.log('=====================');
console.log('1. Add this to your .env.local:');
console.log('   DEBUG=next-auth:*');
console.log('2. Redeploy and check function logs');
console.log('3. Look for NextAuth initialization messages\n');

console.log('🔍 STEP 10: MINIMAL TEST');
console.log('========================');
console.log('1. Create a simple test page: app/test/page.tsx');
console.log('2. Add: export default function Test() { return <h1>Test</h1>; }');
console.log('3. Deploy and try: https://your-domain.vercel.app/test');
console.log('4. If this works, the issue is with NextAuth configuration\n');

console.log('🎯 QUICK DIAGNOSTIC QUESTIONS:');
console.log('==============================');
console.log('1. What does your Vercel domain look like?');
console.log('2. What does the build status show?');
console.log('3. Are there any errors in build logs?');
console.log('4. Does https://your-domain.vercel.app/api/auth/signin work?');
console.log('5. What happens when you try the root domain?\n');

console.log('💡 PRO TIP:');
console.log('===========');
console.log('The 404 error on the root domain usually means:');
console.log('• NextAuth middleware is blocking the request');
console.log('• Build failed but Vercel shows "Ready"');
console.log('• Environment variables are missing at runtime');
console.log('• Google OAuth redirect URI is misconfigured\n');

console.log('🚀 NEXT STEPS:');
console.log('==============');
console.log('1. Check your build logs first');
console.log('2. Verify your exact Vercel domain');
console.log('3. Test the /api/auth/signin endpoint');
console.log('4. Share the build logs if you need help');
console.log('5. Try the minimal test page approach');

