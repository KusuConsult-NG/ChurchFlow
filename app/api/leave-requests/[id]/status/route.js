import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { status, comments } = await req.json();

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Get the leave request first
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
      include: { 
        user: { select: { name: true, email: true, districtId: true } } 
      }
    });

    if (!leaveRequest) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
    }

    // Check permissions
    if (session.user.role === 'MEMBER' && leaveRequest.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to update this request' }, { status: 403 });
    }

    if (session.user.role === 'DCC' && leaveRequest.user.districtId !== session.user.districtId) {
      return NextResponse.json({ error: 'Unauthorized to update this request' }, { status: 403 });
    }

    // Validate status transition
    const validTransitions = {
      'PENDING': ['APPROVED', 'REJECTED', 'CANCELLED'],
      'APPROVED': ['CANCELLED'],
      'REJECTED': ['CANCELLED'],
      'CANCELLED': []
    };

    if (!validTransitions[leaveRequest.status]?.includes(status)) {
      return NextResponse.json({ 
        error: `Cannot change status from ${leaveRequest.status} to ${status}` 
      }, { status: 400 });
    }

    // Update the leave request
    const updatedRequest = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        comments: comments || null,
        approvedBy: (status === 'APPROVED' || status === 'REJECTED') ? session.user.id : null,
        approvedAt: (status === 'APPROVED' || status === 'REJECTED') ? new Date() : null,
        updatedAt: new Date(),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'LEAVE_REQUEST_STATUS_UPDATED',
        entityType: 'LEAVE_REQUEST',
        entityId: id,
        userId: session.user.id,
        details: {
          oldStatus: leaveRequest.status,
          newStatus: status,
          comments: comments || null,
          staffName: leaveRequest.user.name,
        },
      },
    });

    // Send notification to the staff member if status changed
    if (status === 'APPROVED' || status === 'REJECTED') {
      // In production, you would send an email/SMS notification here
      console.log(`Leave request ${status.toLowerCase()} for ${leaveRequest.user.name}`);
    }

    return NextResponse.json({ 
      success: true,
      leaveRequest: updatedRequest,
      message: `Leave request ${status.toLowerCase()} successfully` 
    });
  } catch (error) {
    console.error('Update leave request status error:', error);
    return NextResponse.json({ error: 'Failed to update leave request status' }, { status: 500 });
  }
}
