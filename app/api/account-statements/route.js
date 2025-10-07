import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '../../../lib/auth';

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const _session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const statements = await prisma.accountStatement.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        account: { select: { name: true, type: true } },
        user: { select: { name: true, email: true } }
      }
    });

    return NextResponse.json({ statements });
  } catch (error) {
    // console.error('Get account statements error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statements' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const _session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { accountId, startDate, endDate } = await req.json();

    if (!accountId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Account ID, start date, and end date are required' },
        { status: 400 }
      );
    }

    // Create statement record
    const statement = await prisma.accountStatement.create({
      data: {
        accountId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'PROCESSING',
        generatedBy: session.user.id,
        createdAt: new Date()
      }
    });

    // Generate PDF (simplified - in production you'd use a PDF library)
    const _statementData = await generateStatementPDF(
      accountId,
      startDate,
      endDate
    );

    // Update statement with file path
    await prisma.accountStatement.update({
      where: { id: statement.id },
      data: {
        status: 'COMPLETED',
        filePath: `/statements/${statement.id}.pdf`,
        completedAt: new Date()
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'STATEMENT_GENERATED',
        entityType: 'ACCOUNT_STATEMENT',
        entityId: statement.id,
        userId: session.user.id,
        details: {
          accountId,
          startDate,
          endDate
        }
      }
    });

    return NextResponse.json({
      success: true,
      statement,
      message: 'Statement generated successfully'
    });
  } catch (error) {
    // console.error('Generate statement error:', error);
    return NextResponse.json(
      { error: 'Failed to generate statement' },
      { status: 500 }
    );
  }
}

async function generateStatementPDF(accountId, startDate, endDate) {
  // This is a simplified version - in production you'd use a PDF library like Puppeteer or jsPDF
  // For now, we'll just return mock data

  const account = await prisma.accountBook.findUnique({
    where: { id: accountId },
    include: {
      transactions: {
        where: {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        },
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!account) {
    throw new Error('Account not found');
  }

  // Calculate summary
  const totalDeposits = account.transactions
    .filter(t => t.type === 'DEPOSIT')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = account.transactions
    .filter(t => t.type === 'WITHDRAWAL')
    .reduce((sum, t) => sum + t.amount, 0);

  const netChange = totalDeposits - totalWithdrawals;

  return {
    account,
    period: { startDate, endDate },
    summary: {
      totalDeposits,
      totalWithdrawals,
      netChange,
      transactionCount: account.transactions.length
    },
    transactions: account.transactions
  };
}
