import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
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

    // Calculate growth rate (simplified)
    const previousPeriodRevenue = totalRevenue * 0.8; // Mock previous period
    const growthRate = previousPeriodRevenue > 0 ? ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 : 0;

    // Income source analysis
    const incomeSources = [
      { name: 'Tithes & Offerings', amount: totalRevenue * 0.6, percentage: 60 },
      { name: 'Special Events', amount: totalRevenue * 0.2, percentage: 20 },
      { name: 'Donations', amount: totalRevenue * 0.15, percentage: 15 },
      { name: 'Other Income', amount: totalRevenue * 0.05, percentage: 5 }
    ];

    // Expense category analysis
    const expenseCategories = [
      { name: 'Ministry Operations', amount: totalExpenses * 0.4, percentage: 40 },
      { name: 'Administrative', amount: totalExpenses * 0.25, percentage: 25 },
      { name: 'Building & Maintenance', amount: totalExpenses * 0.2, percentage: 20 },
      { name: 'Mission & Outreach', amount: totalExpenses * 0.15, percentage: 15 }
    ];

    // Financial health indicators
    const currentAssets = totalRevenue * 0.3; // Mock current assets
    const currentLiabilities = totalExpenses * 0.1; // Mock current liabilities
    const totalDebt = totalExpenses * 0.2; // Mock total debt
    const totalEquity = totalRevenue * 0.8; // Mock total equity

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
