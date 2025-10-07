// app/api/announcements/route.js
const { NextResponse } = require('next/server');

const { getPrismaClient } = require('../../../lib/database-config');
const {
  notificationService,
  notificationTemplates
} = require('../../../lib/notification-service');

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      title,
      content,
      priority,
      targetAudience,
      sendNotifications,
      scheduledAt
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const prisma = await getPrismaClient();

    // Create announcement
    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        priority: priority || 'normal',
        targetAudience: targetAudience || 'all',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
        status: 'published'
      }
    });

    // Send notifications if requested
    if (sendNotifications) {
      try {
        // Get target users based on audience
        let users = [];
        if (targetAudience === 'all') {
          users = await prisma.user.findMany({
            where: { emailVerified: true }
          });
        } else if (targetAudience === 'members') {
          users = await prisma.user.findMany({
            where: {
              emailVerified: true,
              role: 'member'
            }
          });
        } else if (targetAudience === 'admins') {
          users = await prisma.user.findMany({
            where: {
              emailVerified: true,
              role: 'admin'
            }
          });
        }

        // Send notifications
        const notifications = notificationTemplates.announcement(
          users,
          announcement
        );
        await notificationService.sendBulkNotifications(notifications, [
          'email',
          'sms',
          'push'
        ]);
      } catch (notificationError) {
        // console.error('Notification sending failed:', notificationError);
        // Don't fail the announcement creation if notifications fail
      }
    }

    return NextResponse.json({
      success: true,
      announcement,
      message: 'Announcement created successfully'
    });
  } catch (error) {
    // console.error('Announcement creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create announcement', message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const priority = searchParams.get('priority');
    const status = searchParams.get('status') || 'published';

    const prisma = await getPrismaClient();

    // Build query
    const where = { status };
    if (priority) {
      where.priority = priority;
    }

    // Get announcements with pagination
    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Get total count
    const total = await prisma.announcement.count({ where });

    return NextResponse.json({
      success: true,
      announcements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    // console.error('Announcements fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements', message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, title, content, priority, targetAudience, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Announcement ID is required' },
        { status: 400 }
      );
    }

    const prisma = await getPrismaClient();

    // Update announcement
    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(priority && { priority }),
        ...(targetAudience && { targetAudience }),
        ...(status && { status })
      }
    });

    return NextResponse.json({
      success: true,
      announcement,
      message: 'Announcement updated successfully'
    });
  } catch (error) {
    // console.error('Announcement update error:', error);
    return NextResponse.json(
      { error: 'Failed to update announcement', message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Announcement ID is required' },
        { status: 400 }
      );
    }

    const prisma = await getPrismaClient();

    // Soft delete announcement
    await prisma.announcement.update({
      where: { id },
      data: { status: 'deleted' }
    });

    return NextResponse.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    // console.error('Announcement deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete announcement', message: error.message },
      { status: 500 }
    );
  }
}
