import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'GCC', 'DCC'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, type, trigger, template, recipients, conditions, isActive } = await req.json();

    // Validate required fields
    if (!name || !description || !type || !trigger || !template || !recipients || recipients.length === 0) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 });
    }

    // Create notification template
    const notification = await prisma.notificationTemplate.create({
      data: {
        name,
        description,
        type,
        trigger,
        template,
        recipients,
        conditions: conditions || {},
        isActive: isActive !== false,
        createdBy: session.user.id,
        createdAt: new Date(),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'NOTIFICATION_CREATED',
        entityType: 'NOTIFICATION_TEMPLATE',
        entityId: notification.id,
        userId: session.user.id,
        details: {
          name,
          type,
          trigger,
          recipients: recipients.length,
        },
      },
    });

    return NextResponse.json({ 
      success: true,
      notification,
      message: 'Notification template created successfully' 
    });
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json({ error: 'Failed to create notification template' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notifications = await prisma.notificationTemplate.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
