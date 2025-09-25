import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leaveType, startDate, endDate, reason, emergencyContact, contactPhone, workHandover } = await req.json();

    // Validate required fields
    if (!leaveType || !startDate || !endDate || !reason || !emergencyContact || !contactPhone) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 });
    }

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
    }

    // Check if dates are in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      return NextResponse.json({ error: 'Leave start date must be in the future' }, { status: 400 });
    }

    // Create leave request
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        emergencyContact,
        contactPhone,
        workHandover: workHandover || '',
        status: 'PENDING',
        userId: session.user.id,
        createdAt: new Date(),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'LEAVE_REQUEST_CREATED',
        entityType: 'LEAVE_REQUEST',
        entityId: leaveRequest.id,
        userId: session.user.id,
        details: {
          leaveType,
          startDate,
          endDate,
          reason: reason.substring(0, 100), // Truncate for audit log
        },
      },
    });

    return NextResponse.json({ 
      success: true,
      leaveRequest,
      message: 'Leave request submitted successfully' 
    });
  } catch (error) {
    console.error('Create leave request error:', error);
    return NextResponse.json({ error: 'Failed to create leave request' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Filter by user's role and permissions
    let whereClause = {};
    if (session.user.role === 'MEMBER') {
      // Members can only see their own requests
      whereClause.userId = session.user.id;
    } else if (session.user.role === 'DCC') {
      // DCC can see requests from their district
      whereClause.user = {
        districtId: session.user.districtId
      };
    }
    // ADMIN and GCC can see all requests

    const requests = await prisma.leaveRequest.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { 
          select: { 
            name: true, 
            email: true, 
            role: true,
            districtId: true 
          } 
        },
        approvedBy: { 
          select: { 
            name: true, 
            email: true 
          } 
        },
      },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Get leave requests error:', error);
    return NextResponse.json({ error: 'Failed to fetch leave requests' }, { status: 500 });
  }
}
