// app/api/health/route.js
const { NextResponse } = require('next/server');

const { getPrismaClient } = require('../../../lib/database-config');

// Health check endpoint
export async function GET() {
  const startTime = Date.now();

  try {
    // Basic health information
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      checks: {}
    };

    // Check database connection
    try {
      const prisma = await getPrismaClient();
      await prisma.$queryRaw`SELECT 1`;
      health.checks.database = {
        status: 'ok',
        responseTime: Date.now() - startTime,
        message: 'Database connection successful'
      };
    } catch (error) {
      health.checks.database = {
        status: 'error',
        error: error.message,
        responseTime: Date.now() - startTime
      };
    }

    // Check Redis connection (if configured)
    if (process.env.REDIS_URL) {
      try {
        const redis = require('redis');
        const client = redis.createClient({ url: process.env.REDIS_URL });
        await client.connect();
        await client.ping();
        await client.quit();

        health.checks.redis = {
          status: 'ok',
          message: 'Redis connection successful'
        };
      } catch (error) {
        health.checks.redis = {
          status: 'error',
          error: error.message
        };
      }
    }

    // Check email service (if configured)
    if (process.env.SENDGRID_API_KEY) {
      health.checks.email = {
        status: 'ok',
        provider: 'sendgrid',
        message: 'Email service configured'
      };
    } else if (process.env.SMTP_HOST) {
      health.checks.email = {
        status: 'ok',
        provider: 'smtp',
        message: 'SMTP service configured'
      };
    } else {
      health.checks.email = {
        status: 'warning',
        message: 'No email service configured'
      };
    }

    // Check file storage (if configured)
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      health.checks.storage = {
        status: 'ok',
        provider: 'cloudinary',
        message: 'Cloud storage configured'
      };
    } else {
      health.checks.storage = {
        status: 'warning',
        message: 'Using local storage'
      };
    }

    // Check SMS service (if configured)
    if (process.env.TWILIO_ACCOUNT_SID) {
      health.checks.sms = {
        status: 'ok',
        provider: 'twilio',
        message: 'SMS service configured'
      };
    } else {
      health.checks.sms = {
        status: 'warning',
        message: 'No SMS service configured'
      };
    }

    // Calculate overall health status
    const checkStatuses = Object.values(health.checks).map(
      check => check.status
    );
    const hasErrors = checkStatuses.includes('error');
    const hasWarnings = checkStatuses.includes('warning');

    if (hasErrors) {
      health.status = 'error';
    } else if (hasWarnings) {
      health.status = 'warning';
    }

    // Add performance metrics
    health.metrics = {
      responseTime: Date.now() - startTime,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };

    // Add system information
    health.system = {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      pid: process.pid
    };

    // Return appropriate HTTP status
    const httpStatus =
      health.status === 'ok' ? 200 : health.status === 'warning' ? 200 : 503;

    return NextResponse.json(health, {
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0'
      }
    });
  } catch (error) {
    // console.error('Health check error:', error);

    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
        checks: {
          application: {
            status: 'error',
            error: error.message
          }
        }
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0'
        }
      }
    );
  }
}

// Liveness probe endpoint
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0'
    }
  });
}
