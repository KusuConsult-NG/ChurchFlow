import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'GCC'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, approvalLevels, amountThreshold, department, isActive } = await req.json();

    // Validate required fields
    if (!name || !department) {
      return NextResponse.json({ error: 'Name and department are required' }, { status: 400 });
    }

    // Create approval workflow
    const workflow = await prisma.approvalWorkflow.create({
      data: {
        name,
        description: description || null,
        approvalLevels: approvalLevels || [],
        amountThreshold: amountThreshold ? parseFloat(amountThreshold) : null,
        department,
        isActive: isActive !== false,
        createdBy: session.user.id,
        createdAt: new Date(),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'WORKFLOW_CREATED',
        entityType: 'APPROVAL_WORKFLOW',
        entityId: workflow.id,
        userId: session.user.id,
        details: {
          name,
          department,
          amountThreshold: amountThreshold ? parseFloat(amountThreshold) : null,
        },
      },
    });

    return NextResponse.json({ 
      success: true,
      workflow,
      message: 'Approval workflow created successfully' 
    });
  } catch (error) {
    console.error('Workflow creation error:', error);
    return NextResponse.json({ error: 'Failed to create workflow' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workflows = await prisma.approvalWorkflow.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdByUser: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({ workflows });
  } catch (error) {
    console.error('Get workflows error:', error);
    return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 });
  }
}
