import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      JWT_SECRET: !!process.env.JWT_SECRET,
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET
    };

    // Check database connection
    let dbStatus = 'Not tested';
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      await prisma.$connect();
      dbStatus = 'Connected';
      await prisma.$disconnect();
    } catch (dbError) {
      dbStatus = `Error: ${dbError.message}`;
    }

    // Check NextAuth configuration
    let nextAuthStatus = 'Not tested';
    try {
      const { getServerSession } = await import('next-auth');
      const { authOptions } = await import('../../../lib/auth');
      nextAuthStatus = 'Configuration loaded';
    } catch (authError) {
      nextAuthStatus = `Error: ${authError.message}`;
    }

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        VERCEL_ENV: process.env.VERCEL_ENV
      },
      environmentVariables: envCheck,
      database: {
        status: dbStatus,
        url: process.env.DATABASE_URL ? 'Set' : 'Missing'
      },
      nextAuth: {
        status: nextAuthStatus,
        url: process.env.NEXTAUTH_URL,
        secret: process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing'
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing'
      },
      recommendations: getRecommendations(envCheck, dbStatus, nextAuthStatus)
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        VERCEL_ENV: process.env.VERCEL_ENV
      }
    }, { status: 500 });
  }
}

function getRecommendations(envCheck, dbStatus, nextAuthStatus) {
  const recommendations = [];

  if (!envCheck.DATABASE_URL) {
    recommendations.push('Add DATABASE_URL environment variable');
  }
  if (!envCheck.NEXTAUTH_URL) {
    recommendations.push('Add NEXTAUTH_URL environment variable');
  }
  if (!envCheck.NEXTAUTH_SECRET) {
    recommendations.push('Add NEXTAUTH_SECRET environment variable');
  }
  if (!envCheck.JWT_SECRET) {
    recommendations.push('Add JWT_SECRET environment variable');
  }
  if (!envCheck.GOOGLE_CLIENT_ID) {
    recommendations.push('Add GOOGLE_CLIENT_ID environment variable');
  }
  if (!envCheck.GOOGLE_CLIENT_SECRET) {
    recommendations.push('Add GOOGLE_CLIENT_SECRET environment variable');
  }
  if (dbStatus.includes('Error')) {
    recommendations.push('Fix database connection - check DATABASE_URL');
  }
  if (nextAuthStatus.includes('Error')) {
    recommendations.push('Fix NextAuth configuration');
  }

  if (recommendations.length === 0) {
    recommendations.push('All systems appear to be working correctly');
  }

  return recommendations;
}

