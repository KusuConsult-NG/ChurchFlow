import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get pending approvals based on user role
    let whereClause = { status: 'PENDING' };
    
    // Filter by user's approval level
    if (session.user.role === 'AGENCY_LEADER') {
      whereClause.agencyId = session.user.agencyId;
    } else if (session.user.role === 'DCC') {
      whereClause.districtId = session.user.districtId;
    } else if (session.user.role === 'LCC') {
      whereClause.subDistrictId = session.user.subDistrictId;
    }

    const approvals = await prisma.approvalRequest.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        requestedByUser: { select: { name: true, email: true } },
        workflow: { select: { name: true, department: true } },
      },
    });

    return NextResponse.json({ approvals });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    return NextResponse.json({ error: 'Failed to fetch pending approvals' }, { status: 500 });
  }
}
