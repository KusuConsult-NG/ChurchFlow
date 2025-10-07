// app/api/attendance/route.js
const { NextResponse } = require('next/server');

const { getPrismaClient } = require('../../../lib/database-config');

export async function POST(request) {
  try {
    const body = await request.json();
    const { eventId, userId, status, notes } = body;

    if (!eventId || !userId || !status) {
      return NextResponse.json(
        { error: 'Event ID, User ID, and status are required' },
        { status: 400 }
      );
    }

    const prisma = await getPrismaClient();

    // Check if attendance record already exists
    const existingRecord = await prisma.attendance.findFirst({
      where: {
        eventId,
        userId
      }
    });

    let attendance;

    if (existingRecord) {
      // Update existing record
      attendance = await prisma.attendance.update({
        where: { id: existingRecord.id },
        data: {
          status,
          notes,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new record
      attendance = await prisma.attendance.create({
        data: {
          eventId,
          userId,
          status,
          notes,
          recordedAt: new Date()
        }
      });
    }

    return NextResponse.json({
      success: true,
      attendance,
      message: 'Attendance recorded successfully'
    });
  } catch (error) {
    // console.error('Attendance recording error:', error);
    return NextResponse.json(
      { error: 'Failed to record attendance', message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const prisma = await getPrismaClient();

    // Build query
    const where = {};

    if (eventId) {
      where.eventId = eventId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    if (startDate && endDate) {
      where.recordedAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // Get attendance records
    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            time: true,
            location: true
          }
        }
      },
      orderBy: {
        recordedAt: 'desc'
      }
    });

    // Calculate statistics
    const stats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      excused: attendance.filter(a => a.status === 'excused').length
    };

    return NextResponse.json({
      success: true,
      attendance,
      stats
    });
  } catch (error) {
    // console.error('Attendance fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance', message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Attendance record ID is required' },
        { status: 400 }
      );
    }

    const prisma = await getPrismaClient();

    // Update attendance record
    const attendance = await prisma.attendance.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      attendance,
      message: 'Attendance updated successfully'
    });
  } catch (error) {
    // console.error('Attendance update error:', error);
    return NextResponse.json(
      { error: 'Failed to update attendance', message: error.message },
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
        { error: 'Attendance record ID is required' },
        { status: 400 }
      );
    }

    const prisma = await getPrismaClient();

    // Delete attendance record
    await prisma.attendance.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    // console.error('Attendance deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete attendance record', message: error.message },
      { status: 500 }
    );
  }
}
