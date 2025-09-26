import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Get the issue first
    const issue = await prisma.complianceIssue.findUnique({
      where: { id },
      include: { creator: { select: { name: true } } }
    });

    if (!issue) {
      return NextResponse.json({ error: 'Compliance issue not found' }, { status: 404 });
    }

    // Check permissions
    if (session.user.role === 'DCC' && issue.districtId !== session.user.districtId) {
      return NextResponse.json({ error: 'Unauthorized to update this issue' }, { status: 403 });
    }

    // Update the issue
    const updatedIssue = await prisma.complianceIssue.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
        ...(status === 'RESOLVED' && { resolvedAt: new Date() }),
        ...(status === 'CLOSED' && { closedAt: new Date() }),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'COMPLIANCE_ISSUE_STATUS_UPDATED',
        entityType: 'COMPLIANCE_ISSUE',
        entityId: id,
        userId: session.user.id,
        details: {
          oldStatus: issue.status,
          newStatus: status,
          issueTitle: issue.title,
        },
      },
    });

    return NextResponse.json({ 
      success: true,
      issue: updatedIssue,
      message: 'Issue status updated successfully' 
    });
  } catch (error) {
    console.error('Update compliance issue status error:', error);
    return NextResponse.json({ error: 'Failed to update issue status' }, { status: 500 });
  }
}
