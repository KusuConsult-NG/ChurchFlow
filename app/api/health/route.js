import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { performanceMonitor, getMemoryUsage, getSystemMetrics, checkDatabaseHealth } from '../../lib/performance';

const prisma = new PrismaClient();

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Test database connection
    const dbHealth = await checkDatabaseHealth(prisma);
    
    if (dbHealth.status !== 'healthy') {
      return NextResponse.json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: dbHealth,
        responseTime: Date.now() - startTime
      }, { status: 503 });
    }
    
    // Get basic system metrics
    const [userCount, announcementCount, eventCount, memberCount] = await Promise.all([
      prisma.user.count(),
      prisma.announcement.count(),
      prisma.event.count(),
      prisma.member.count()
    ]);
    
    const totalResponseTime = Date.now() - startTime;
    const memoryUsage = getMemoryUsage();
    const systemMetrics = getSystemMetrics();
    const performanceMetrics = performanceMonitor.getAllMetrics();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: {
        total: totalResponseTime,
        database: dbHealth.responseTime
      },
      system: {
        uptime: systemMetrics.uptime,
        memory: memoryUsage,
        nodeVersion: systemMetrics.nodeVersion,
        platform: systemMetrics.platform
      },
      database: dbHealth,
      metrics: {
        users: userCount,
        announcements: announcementCount,
        events: eventCount,
        members: memberCount
      },
      performance: performanceMetrics,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Response-Time': `${totalResponseTime}ms`
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      responseTime: Date.now() - startTime,
      system: getSystemMetrics()
    }, { status: 503 });
  }
}
