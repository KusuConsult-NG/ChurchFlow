// Google OAuth Configuration
// To set up Google OAuth:
// 1. Go to Google Cloud Console: https://console.cloud.google.com/
// 2. Create a new project or select existing one
// 3. Enable Google+ API
// 4. Go to Credentials and create OAuth 2.0 Client ID
// 5. Set authorized redirect URIs to: http://localhost:3000
// 6. Copy Client ID and Client Secret
// 7. Create .env.local file with the following variables:

export const GOOGLE_CONFIG = {
  // Add these to your .env.local file:
  // NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here
  // GOOGLE_CLIENT_SECRET=your-client-secret-here
  // GOOGLE_REDIRECT_URI=postmessage
  // JWT_SECRET=your-jwt-secret-key
  
  // For development, you can use these test values:
  CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
  CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
  REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || 'postmessage',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  
  // Check if Google OAuth is properly configured
  isConfigured: () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    console.log('🔍 Google OAuth Configuration Check:');
    console.log('NEXT_PUBLIC_GOOGLE_CLIENT_ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
    console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
    console.log('GOOGLE_CLIENT_SECRET:', clientSecret ? 'SET' : 'NOT SET');
    console.log('Final clientId:', clientId);
    console.log('Is configured:', clientId && clientSecret && clientId !== 'your-google-client-id');
    
    // For production, be more lenient - if we have any client ID, assume it's configured
    if (process.env.NODE_ENV === 'production') {
      return clientId && clientId !== 'your-google-client-id';
    }
    
    return clientId && 
           clientSecret &&
           clientId !== 'your-google-client-id';
  }
};

export default GOOGLE_CONFIG;


