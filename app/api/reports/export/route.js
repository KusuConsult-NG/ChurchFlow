import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'GCC', 'DCC', 'BANK_OPERATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, format, dateRange } = await req.json();

    if (!type || !format || !dateRange) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Fetch financial data
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);

    const [revenue, expenses, transactions, budgets] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          type: 'DEPOSIT',
          createdAt: { gte: startDate, lte: endDate }
        },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: {
          type: 'WITHDRAWAL',
          createdAt: { gte: startDate, lte: endDate }
        },
        _sum: { amount: true }
      }),
      prisma.transaction.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate }
        },
        include: { 
          book: { select: { name: true } },
          user: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.budget.findMany({
        where: { year: startDate.getFullYear() }
      })
    ]);

    const totalRevenue = revenue._sum.amount || 0;
    const totalExpenses = expenses._sum.amount || 0;
    const netIncome = totalRevenue - totalExpenses;

    // Generate report data based on type
    let reportData = {};
    
    switch (type) {
      case 'overview':
        reportData = {
          title: 'Financial Overview Report',
          period: `${dateRange.start} to ${dateRange.end}`,
          summary: {
            totalRevenue,
            totalExpenses,
            netIncome,
            transactionCount: transactions.length
          },
          transactions: transactions.slice(0, 100), // Limit for export
          generatedAt: new Date().toISOString(),
          generatedBy: session.user.name || session.user.email
        };
        break;
        
      case 'income':
        const incomeByCategory = await prisma.transaction.groupBy({
          by: ['category'],
          where: {
            type: 'DEPOSIT',
            createdAt: { gte: startDate, lte: endDate }
          },
          _sum: { amount: true }
        });
        
        reportData = {
          title: 'Income Statement',
          period: `${dateRange.start} to ${dateRange.end}`,
          revenue: {
            total: totalRevenue,
            byCategory: incomeByCategory
          },
          expenses: {
            total: totalExpenses,
            byCategory: await prisma.transaction.groupBy({
              by: ['category'],
              where: {
                type: 'WITHDRAWAL',
                createdAt: { gte: startDate, lte: endDate }
              },
              _sum: { amount: true }
            })
          },
          netIncome,
          generatedAt: new Date().toISOString(),
          generatedBy: session.user.name || session.user.email
        };
        break;
        
      case 'budget':
        reportData = {
          title: 'Budget vs Actual Report',
          period: `${dateRange.start} to ${dateRange.end}`,
          budgets: budgets.map(budget => ({
            ...budget,
            actualSpent: transactions
              .filter(t => t.type === 'WITHDRAWAL' && t.category === budget.category)
              .reduce((sum, t) => sum + t.amount, 0),
            variance: budget.amount - transactions
              .filter(t => t.type === 'WITHDRAWAL' && t.category === budget.category)
              .reduce((sum, t) => sum + t.amount, 0)
          })),
          generatedAt: new Date().toISOString(),
          generatedBy: session.user.name || session.user.email
        };
        break;
        
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    // Generate file based on format
    if (format === 'pdf') {
      // For now, return JSON data - PDF generation would require additional libraries
      return NextResponse.json({
        success: true,
        message: 'PDF export not yet implemented',
        data: reportData
      });
    } else if (format === 'excel') {
      // Generate CSV format (Excel-compatible)
      const csvData = generateCSV(reportData, type);
      
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="financial-report-${type}-${dateRange.start}-${dateRange.end}.csv"`
        }
      });
    } else {
      return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
    }

  } catch (error) {
    console.error('Export report error:', error);
    return NextResponse.json({ error: 'Failed to export report' }, { status: 500 });
  }
}

function generateCSV(data, type) {
  let csv = '';
  
  switch (type) {
    case 'overview':
      csv = 'Financial Overview Report\n';
      csv += `Period: ${data.period}\n`;
      csv += `Generated: ${data.generatedAt}\n`;
      csv += `Generated By: ${data.generatedBy}\n\n`;
      
      csv += 'Summary\n';
      csv += 'Metric,Amount\n';
      csv += `Total Revenue,${data.summary.totalRevenue}\n`;
      csv += `Total Expenses,${data.summary.totalExpenses}\n`;
      csv += `Net Income,${data.summary.netIncome}\n`;
      csv += `Transaction Count,${data.summary.transactionCount}\n\n`;
      
      csv += 'Recent Transactions\n';
      csv += 'Date,Type,Amount,Description,Account,User\n';
      data.transactions.forEach(t => {
        csv += `${t.createdAt},${t.type},${t.amount},"${t.description || ''}","${t.book?.name || ''}","${t.user?.name || ''}"\n`;
      });
      break;
      
    case 'income':
      csv = 'Income Statement\n';
      csv += `Period: ${data.period}\n`;
      csv += `Generated: ${data.generatedAt}\n`;
      csv += `Generated By: ${data.generatedBy}\n\n`;
      
      csv += 'Revenue by Category\n';
      csv += 'Category,Amount\n';
      data.revenue.byCategory.forEach(item => {
        csv += `"${item.category || 'Uncategorized'}",${item._sum.amount}\n`;
      });
      csv += `Total Revenue,${data.revenue.total}\n\n`;
      
      csv += 'Expenses by Category\n';
      csv += 'Category,Amount\n';
      data.expenses.byCategory.forEach(item => {
        csv += `"${item.category || 'Uncategorized'}",${item._sum.amount}\n`;
      });
      csv += `Total Expenses,${data.expenses.total}\n\n`;
      csv += `Net Income,${data.netIncome}\n`;
      break;
      
    case 'budget':
      csv = 'Budget vs Actual Report\n';
      csv += `Period: ${data.period}\n`;
      csv += `Generated: ${data.generatedAt}\n`;
      csv += `Generated By: ${data.generatedBy}\n\n`;
      
      csv += 'Budget Performance\n';
      csv += 'Category,Budgeted,Actual,Variance,Status\n';
      data.budgets.forEach(budget => {
        const status = budget.variance >= 0 ? 'Under Budget' : 'Over Budget';
        csv += `"${budget.category}",${budget.amount},${budget.actualSpent},${budget.variance},"${status}"\n`;
      });
      break;
  }
  
  return csv;
}
