#!/usr/bin/env node

console.log('🚀 VERCEL ENVIRONMENT VARIABLES SETUP GUIDE');
console.log('===========================================\n');

console.log('📋 REQUIRED ENVIRONMENT VARIABLES FOR VERCEL:');
console.log('==============================================');
console.log('Copy these values from your .env.local file to Vercel:\n');

console.log('1. DATABASE_URL');
console.log('   Value: [YOUR_SUPABASE_DATABASE_URL]\n');

console.log('2. NEXTAUTH_URL');
console.log('   Value: https://your-app-name.vercel.app\n');

console.log('3. NEXTAUTH_SECRET');
console.log('   Value: your-super-secret-nextauth-key-change-this-in-production-123456789\n');

console.log('4. JWT_SECRET');
console.log('   Value: your-super-secret-jwt-key-change-this-in-production-123456789\n');

console.log('5. GOOGLE_CLIENT_ID');
console.log('   Value: [YOUR_GOOGLE_CLIENT_ID]\n');

console.log('6. GOOGLE_CLIENT_SECRET');
console.log('   Value: [YOUR_GOOGLE_CLIENT_SECRET]\n');

console.log('📋 ADDITIONAL ENVIRONMENT VARIABLES:');
console.log('=====================================');
console.log('7. NEXT_PUBLIC_GOOGLE_CLIENT_ID');
console.log('   Value: [YOUR_GOOGLE_CLIENT_ID]\n');

console.log('8. GOOGLE_REDIRECT_URI');
console.log('   Value: postmessage\n');

console.log('9. SENDGRID_API_KEY');
console.log('   Value: [YOUR_SENDGRID_API_KEY]\n');

console.log('10. SENDGRID_FROM_EMAIL');
console.log('    Value: noreply@churchflow.com\n');

console.log('11. SENDGRID_FROM_NAME');
console.log('    Value: ChurchFlow\n');

console.log('12. TWILIO_ACCOUNT_SID');
console.log('    Value: [YOUR_TWILIO_ACCOUNT_SID]\n');

console.log('13. TWILIO_AUTH_TOKEN');
console.log('    Value: [YOUR_TWILIO_AUTH_TOKEN]\n');

console.log('14. TWILIO_PHONE_NUMBER');
console.log('    Value: +16169478878\n');

console.log('15. CLOUDINARY_CLOUD_NAME');
console.log('    Value: [YOUR_CLOUDINARY_CLOUD_NAME]\n');

console.log('16. CLOUDINARY_API_KEY');
console.log('    Value: [YOUR_CLOUDINARY_API_KEY]\n');

console.log('17. CLOUDINARY_API_SECRET');
console.log('    Value: [YOUR_CLOUDINARY_API_SECRET]\n');

console.log('18. SUPABASE_URL');
console.log('    Value: [YOUR_SUPABASE_URL]\n');

console.log('19. SUPABASE_ANON_KEY');
console.log('    Value: [YOUR_SUPABASE_ANON_KEY]\n');

console.log('20. SUPABASE_SERVICE_ROLE_KEY');
console.log('    Value: [YOUR_SUPABASE_SERVICE_ROLE_KEY]\n');

console.log('🔧 HOW TO ADD ENVIRONMENT VARIABLES TO VERCEL:');
console.log('==============================================');
console.log('1. Go to your Vercel dashboard');
console.log('2. Select your ChurchFlow project');
console.log('3. Click on "Settings" tab');
console.log('4. Click on "Environment Variables" in the left sidebar');
console.log('5. Add each variable one by one:');
console.log('   - Name: DATABASE_URL');
console.log('   - Value: [copy from your .env.local file]');
console.log('   - Environment: Production, Preview, Development');
console.log('6. Click "Save" after adding each variable');
console.log('7. Repeat for all 20 variables\n');

console.log('⚠️  IMPORTANT NOTES:');
console.log('====================');
console.log('• Update NEXTAUTH_URL to your actual Vercel domain');
console.log('• All variables should be added to Production, Preview, and Development');
console.log('• After adding all variables, redeploy your app');
console.log('• The database schema will be pushed automatically on first deployment\n');

console.log('🎯 AFTER ADDING ALL VARIABLES:');
console.log('==============================');
console.log('1. Redeploy your app in Vercel');
console.log('2. Test the live deployment');
console.log('3. Your ChurchFlow app will be fully functional!');
console.log('4. Users can signup, login, and use all features\n');

console.log('🎉 YOU ARE ALMOST LIVE!');
console.log('=======================');
console.log('Just add these environment variables to Vercel and you will have');
console.log('a fully functional ChurchFlow application running live!');