import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'GCC', 'DCC', 'BANK_OPERATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const startDate = new Date(url.searchParams.get('start') || new Date(new Date().getFullYear(), 0, 1));
    const endDate = new Date(url.searchParams.get('end') || new Date());

    // Fetch financial data
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
        include: { book: { select: { name: true } } }
      }),
      prisma.budget.findMany({
        where: { year: startDate.getFullYear() }
      })
    ]);

    const totalRevenue = revenue._sum.amount || 0;
    const totalExpenses = expenses._sum.amount || 0;
    const netIncome = totalRevenue - totalExpenses;

    // Calculate growth rate (compare with previous period)
    const previousStartDate = new Date(startDate);
    const previousEndDate = new Date(endDate);
    const periodLength = endDate.getTime() - startDate.getTime();
    previousStartDate.setTime(previousStartDate.getTime() - periodLength);
    previousEndDate.setTime(previousEndDate.getTime() - periodLength);

    const previousRevenue = await prisma.transaction.aggregate({
      where: {
        type: 'DEPOSIT',
        createdAt: { gte: previousStartDate, lte: previousEndDate }
      },
      _sum: { amount: true }
    });

    const previousPeriodRevenue = previousRevenue._sum.amount || 0;
    const growthRate = previousPeriodRevenue > 0 ? ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 : 0;

    // Real income source analysis based on transaction categories
    const incomeByCategory = await prisma.transaction.groupBy({
      by: ['category'],
      where: {
        type: 'DEPOSIT',
        createdAt: { gte: startDate, lte: endDate }
      },
      _sum: { amount: true }
    });

    const incomeSources = incomeByCategory.map(item => ({
      name: item.category || 'Uncategorized',
      amount: item._sum.amount || 0,
      percentage: totalRevenue > 0 ? ((item._sum.amount || 0) / totalRevenue) * 100 : 0
    }));

    // Real expense category analysis
    const expensesByCategory = await prisma.transaction.groupBy({
      by: ['category'],
      where: {
        type: 'WITHDRAWAL',
        createdAt: { gte: startDate, lte: endDate }
      },
      _sum: { amount: true }
    });

    const expenseCategories = expensesByCategory.map(item => ({
      name: item.category || 'Uncategorized',
      amount: item._sum.amount || 0,
      percentage: totalExpenses > 0 ? ((item._sum.amount || 0) / totalExpenses) * 100 : 0
    }));

    // Real financial health indicators from account balances
    const accountBalances = await prisma.accountBook.aggregate({
      _sum: { balance: true }
    });

    const currentAssets = accountBalances._sum.balance || 0;
    const currentLiabilities = totalExpenses * 0.1; // Estimate based on monthly expenses
    const totalDebt = await prisma.transaction.aggregate({
      where: { category: 'DEBT_PAYMENT' },
      _sum: { amount: true }
    });
    const totalEquity = currentAssets - (totalDebt._sum.amount || 0);

    const liquidityRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
    const debtToEquityRatio = totalEquity > 0 ? totalDebt / totalEquity : 0;
    const operatingMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;

    // Generate recommendations
    const recommendations = [];
    if (liquidityRatio < 2) {
      recommendations.push('Consider increasing liquid assets to improve financial stability');
    }
    if (debtToEquityRatio > 0.5) {
      recommendations.push('Monitor debt levels and consider debt reduction strategies');
    }
    if (operatingMargin < 10) {
      recommendations.push('Review operational efficiency and cost management');
    }
    if (netIncome < 0) {
      recommendations.push('Immediate attention needed: Operating at a loss');
    }
    if (recommendations.length === 0) {
      recommendations.push('Financial health indicators are within acceptable ranges');
    }

    const analytics = {
      totalRevenue,
      totalExpenses,
      netIncome,
      growthRate,
      incomeSources,
      expenseCategories,
      liquidityRatio,
      debtToEquityRatio,
      operatingMargin,
      recommendations,
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      }
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Financial analytics error:', error);
    return NextResponse.json({ error: 'Failed to generate financial analytics' }, { status: 500 });
  }
}
