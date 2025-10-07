// app/api/analytics/track/route.js
const { NextResponse } = require('next/server');

const { getPrismaClient } = require('../../../../lib/database-config');

export async function POST(request) {
  try {
    const { events } = await request.json();

    if (!events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Events array is required' },
        { status: 400 }
      );
    }

    const prisma = await getPrismaClient();

    // Store events in database
    const storedEvents = await Promise.all(
      events.map(async event => {
        return await prisma.analyticsEvent.create({
          data: {
            id: event.id,
            eventType: event.event_type,
            userId: event.user_id,
            sessionId: event.session_id,
            timestamp: new Date(event.timestamp),
            properties: event.properties,
            url: event.url,
            userAgent: event.user_agent,
            ipAddress: event.ip_address
          }
        });
      })
    );

    return NextResponse.json({
      success: true,
      message: `${storedEvents.length} events tracked successfully`,
      eventIds: storedEvents.map(e => e.id)
    });
  } catch (error) {
    // console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track events', message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    const eventType = searchParams.get('eventType');
    const userId = searchParams.get('userId');

    const prisma = await getPrismaClient();

    // Calculate date range
    const now = new Date();
    const days = parseInt(timeRange.replace('d', ''));
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Build query
    const where = {
      timestamp: {
        gte: startDate
      }
    };

    if (eventType) {
      where.eventType = eventType;
    }

    if (userId) {
      where.userId = userId;
    }

    // Get events
    const events = await prisma.analyticsEvent.findMany({
      where,
      orderBy: {
        timestamp: 'desc'
      },
      take: 1000 // Limit for performance
    });

    // Calculate basic metrics
    const metrics = {
      totalEvents: events.length,
      uniqueUsers: new Set(events.map(e => e.userId)).size,
      uniqueSessions: new Set(events.map(e => e.sessionId)).size,
      eventTypes: {},
      timeRange: timeRange
    };

    // Count event types
    events.forEach(event => {
      metrics.eventTypes[event.eventType] =
        (metrics.eventTypes[event.eventType] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      events,
      metrics
    });
  } catch (error) {
    // console.error('Analytics data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data', message: error.message },
      { status: 500 }
    );
  }
}
