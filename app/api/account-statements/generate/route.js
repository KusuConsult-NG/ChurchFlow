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

    const { accountId, startDate, endDate } = await req.json();

    if (!accountId || !startDate || !endDate) {
      return NextResponse.json({ error: 'Account ID, start date, and end date are required' }, { status: 400 });
    }

    // Get account information
    const account = await prisma.accountBook.findUnique({
      where: { id: accountId }
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Generate statement data
    const statementData = await generateStatementData(accountId, startDate, endDate);
    
    // Create statement record
    const statement = await prisma.accountStatement.create({
      data: {
        accountId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'COMPLETED',
        generatedBy: session.user.id,
        createdAt: new Date(),
        completedAt: new Date(),
      },
    });

    // Generate PDF (simplified - in production you'd use a PDF library)
    const fileContent = await generateStatementPDF(statementData);
    
    // Update statement with file path
    await prisma.accountStatement.update({
      where: { id: statement.id },
      data: {
        filePath: `/statements/${statement.id}.pdf`,
      },
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
          endDate,
        },
      },
    });

    // Return file as response
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="account-statement-${accountId}-${startDate}-${endDate}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Generate account statement error:', error);
    return NextResponse.json({ error: 'Failed to generate account statement' }, { status: 500 });
  }
}

async function generateStatementData(accountId, startDate, endDate) {
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

async function generateStatementPDF(statementData) {
  // This is a simplified version - in production you'd use a PDF library like Puppeteer or jsPDF
  // For now, we'll return a simple text representation
  
  const { account, period, summary, transactions } = statementData;
  
  const content = `
ACCOUNT STATEMENT
=================

Account: ${account.name} (${account.type})
Period: ${new Date(period.startDate).toLocaleDateString()} - ${new Date(period.endDate).toLocaleDateString()}

SUMMARY
-------
Total Deposits: $${summary.totalDeposits.toFixed(2)}
Total Withdrawals: $${summary.totalWithdrawals.toFixed(2)}
Net Change: $${summary.netChange.toFixed(2)}
Transaction Count: ${summary.transactionCount}

TRANSACTIONS
------------
${transactions.map(t => 
  `${t.createdAt.toLocaleDateString()} | ${t.type} | $${t.amount} | ${t.description || 'No description'}`
).join('\n')}

Generated on: ${new Date().toLocaleString()}
  `;
  
  return Buffer.from(content);
}
