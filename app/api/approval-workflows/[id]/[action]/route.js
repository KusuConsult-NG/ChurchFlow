import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, action } = params;

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get the approval request
    const approvalRequest = await prisma.approvalRequest.findUnique({
      where: { id },
      include: {
        workflow: true,
        requestedByUser: { select: { name: true, email: true } },
      },
    });

    if (!approvalRequest) {
      return NextResponse.json({ error: 'Approval request not found' }, { status: 404 });
    }

    // Check if user has permission to approve/reject
    const hasPermission = await checkApprovalPermission(session.user, approvalRequest);
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Update approval request
    const updatedRequest = await prisma.approvalRequest.update({
      where: { id },
      data: {
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        approvedBy: session.user.id,
        approvedAt: new Date(),
        comments: action === 'reject' ? 'Request rejected' : 'Request approved',
      },
    });

    // If approved, trigger any follow-up actions
    if (action === 'approve') {
      await handleApprovedRequest(approvalRequest);
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: action === 'approve' ? 'APPROVAL_APPROVED' : 'APPROVAL_REJECTED',
        entityType: 'APPROVAL_REQUEST',
        entityId: id,
        userId: session.user.id,
        details: {
          action,
          originalStatus: approvalRequest.status,
          newStatus: updatedRequest.status,
        },
      },
    });

    return NextResponse.json({ 
      success: true,
      message: `Request ${action}d successfully`,
      approval: updatedRequest
    });
  } catch (error) {
    console.error('Approval action error:', error);
    return NextResponse.json({ error: 'Failed to process approval' }, { status: 500 });
  }
}

async function checkApprovalPermission(user, approvalRequest) {
  // Check if user has permission based on their role and the approval level
  const userRole = user.role;
  const approvalLevel = approvalRequest.approvalLevel;

  // Basic role-based permission check
  const allowedRoles = ['ADMIN', 'GCC', 'DCC', 'AGENCY_LEADER', 'LCC'];
  if (!allowedRoles.includes(userRole)) {
    return false;
  }

  // Additional checks based on organizational hierarchy
  if (userRole === 'AGENCY_LEADER' && approvalRequest.agencyId !== user.agencyId) {
    return false;
  }
  
  if (userRole === 'DCC' && approvalRequest.districtId !== user.districtId) {
    return false;
  }
  
  if (userRole === 'LCC' && approvalRequest.subDistrictId !== user.subDistrictId) {
    return false;
  }

  return true;
}

async function handleApprovedRequest(approvalRequest) {
  // Handle post-approval actions based on the type of request
  try {
    if (approvalRequest.type === 'REQUISITION') {
      // Update requisition status
      await prisma.requisition.update({
        where: { id: approvalRequest.entityId },
        data: { status: 'APPROVED' },
      });
    } else if (approvalRequest.type === 'FUND_TRANSFER') {
      // Process fund transfer
      await prisma.fundTransfer.update({
        where: { id: approvalRequest.entityId },
        data: { status: 'APPROVED' },
      });
    }
    // Add more approval types as needed
  } catch (error) {
    console.error('Error handling approved request:', error);
  }
}
