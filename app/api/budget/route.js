import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '../../../lib/auth';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const _session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { year, category, allocatedAmount, description, department } =
      await req.json();

    // Validate required fields
    if (!year || !category || !allocatedAmount || !description) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate amount
    const amount = parseFloat(allocatedAmount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Create budget item
    const budget = await prisma.budget.create({
      data: {
        year: parseInt(year),
        category,
        amount: amount,
        description,
        department: department || null,
        districtId: session.user.districtId,
        agencyId: session.user.agencyId,
        createdBy: session.user.id,
        createdAt: new Date()
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'BUDGET_CREATED',
        entityType: 'BUDGET',
        entityId: budget.id,
        userId: session.user.id,
        details: {
          year: parseInt(year),
          category,
          allocatedAmount: amount,
          department
        }
      }
    });

    return NextResponse.json({
      success: true,
      budget,
      message: 'Budget item created successfully'
    });
  } catch (error) {
    // console.error('Budget creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create budget item' },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const _session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const year = url.searchParams.get('year') || new Date().getFullYear();
    const page = Math.max(1, Number(url.searchParams.get('page') || 1));
    const pageSize = Math.max(
      1,
      Math.min(50, Number(url.searchParams.get('pageSize') || 10))
    );

    const [budgets, total] = await Promise.all([
      prisma.budget.findMany({
        where: { year: parseInt(year) },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: { select: { name: true, email: true } }
        }
      }),
      prisma.budget.count({ where: { year: parseInt(year) } })
    ]);

    return NextResponse.json({
      budgets,
      total,
      page,
      pageSize,
      pages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    // console.error('Get budgets error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}
