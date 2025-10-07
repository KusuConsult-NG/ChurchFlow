import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '../../../lib/auth';

export async function GET() {
  try {
    // Check if required environment variables are present
    const envCheck = {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'SET' : 'NOT SET',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT SET'
    };

    // Try to get session
    let session = null;
    let sessionError = null;
    
    try {
      session = await getServerSession(authOptions);
    } catch (error) {
      sessionError = error.message;
    }

    // Check Google OAuth configuration
    const googleConfig = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET',
      redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
      isConfigured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
    };

    // Check if all required environment variables are set
    const isFullyConfigured = envCheck.NEXTAUTH_URL === 'SET' && 
                             envCheck.NEXTAUTH_SECRET === 'SET' && 
                             envCheck.GOOGLE_CLIENT_ID === 'SET' && 
                             envCheck.GOOGLE_CLIENT_SECRET === 'SET';

    return NextResponse.json({
      status: isFullyConfigured ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      googleOAuth: googleConfig,
      session: {
        exists: !!session,
        user: session?.user || null,
        error: sessionError
      },
      urls: {
        signIn: '/api/auth/signin',
        callback: '/api/auth/callback/google',
        error: '/auth/error'
      },
      troubleshooting: {
        message: isFullyConfigured ? 'Configuration looks good' : 'Missing required environment variables',
        nextSteps: isFullyConfigured ? 
          'Try signing in with Google again' : 
          'Please set all required environment variables in Vercel'
      }
    });

  } catch (error) {
    console.error('Debug OAuth API error:', error);
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}