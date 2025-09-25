import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['DCC', 'ADMIN', 'GCC'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, category, severity, status, assignedTo, dueDate, priority } = await req.json();

    // Validate required fields
    if (!title || !description || !category || !severity) {
      return NextResponse.json({ error: 'Title, description, category, and severity are required' }, { status: 400 });
    }

    // Create compliance issue
    const issue = await prisma.complianceIssue.create({
      data: {
        title,
        description,
        category,
        severity,
        status: status || 'OPEN',
        assignedTo: assignedTo || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'NORMAL',
        districtId: session.user.districtId,
        createdBy: session.user.id,
        createdAt: new Date(),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'COMPLIANCE_ISSUE_CREATED',
        entityType: 'COMPLIANCE_ISSUE',
        entityId: issue.id,
        userId: session.user.id,
        details: {
          title,
          category,
          severity,
          priority,
        },
      },
    });

    return NextResponse.json({ 
      success: true,
      issue,
      message: 'Compliance issue created successfully' 
    });
  } catch (error) {
    console.error('Create compliance issue error:', error);
    return NextResponse.json({ error: 'Failed to create compliance issue' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Filter by user's district if DCC
    let whereClause = {};
    if (session.user.role === 'DCC') {
      whereClause.districtId = session.user.districtId;
    }

    const issues = await prisma.complianceIssue.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { name: true, email: true } },
        assignedTo: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({ issues });
  } catch (error) {
    console.error('Get compliance issues error:', error);
    return NextResponse.json({ error: 'Failed to fetch compliance issues' }, { status: 500 });
  }
}
