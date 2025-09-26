import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fromAccount, toAccount, amount, description, transferType } = await req.json();

    // Validate required fields
    if (!fromAccount || !toAccount || !amount || !description) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Validate amount
    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Create fund transfer request
    const fundTransfer = await prisma.fundTransfer.create({
      data: {
        fromAccount,
        toAccount,
        amount: transferAmount,
        reason: description,
        transferType: transferType || 'INTERNAL',
        status: 'PENDING',
        districtId: session.user.districtId,
        agencyId: session.user.agencyId,
        createdBy: session.user.id,
        createdAt: new Date(),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'FUND_TRANSFER_REQUEST',
        entityType: 'FUND_TRANSFER',
        entityId: fundTransfer.id,
        userId: session.user.id,
        details: {
          fromAccount,
          toAccount,
          amount: transferAmount,
          transferType,
        },
      },
    });

    return NextResponse.json({ 
      success: true,
      transferId: fundTransfer.id,
      message: 'Fund transfer request submitted successfully' 
    });
  } catch (error) {
    console.error('Fund transfer error:', error);
    return NextResponse.json({ error: 'Failed to process transfer request' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get('page') || 1));
    const pageSize = Math.max(1, Math.min(50, Number(url.searchParams.get('pageSize') || 10)));

    const [transfers, total] = await Promise.all([
      prisma.fundTransfer.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          creator: { select: { name: true, email: true } },
          approver: { select: { name: true, email: true } },
        },
      }),
      prisma.fundTransfer.count(),
    ]);

    return NextResponse.json({
      transfers,
      total,
      page,
      pageSize,
      pages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Get fund transfers error:', error);
    return NextResponse.json({ error: 'Failed to fetch transfers' }, { status: 500 });
  }
}
