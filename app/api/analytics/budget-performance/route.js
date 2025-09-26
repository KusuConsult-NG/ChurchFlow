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
    const year = parseInt(url.searchParams.get('year')) || new Date().getFullYear();
    const month = parseInt(url.searchParams.get('month')) || null;

    // Get budgets for the year
    const budgets = await prisma.budget.findMany({
      where: { year },
      orderBy: { category: 'asc' }
    });

    // Get actual expenses for the period
    const startDate = new Date(year, month ? month - 1 : 0, 1);
    const endDate = month 
      ? new Date(year, month, 0, 23, 59, 59) // End of month
      : new Date(year, 11, 31, 23, 59, 59); // End of year

    const actualExpenses = await prisma.transaction.groupBy({
      by: ['category'],
      where: {
        type: 'WITHDRAWAL',
        createdAt: { gte: startDate, lte: endDate }
      },
      _sum: { amount: true }
    });

    // Calculate budget performance
    const budgetPerformance = budgets.map(budget => {
      const actual = actualExpenses.find(expense => expense.category === budget.category);
      const actualAmount = actual ? actual._sum.amount : 0;
      const variance = budget.amount - actualAmount;
      const variancePercentage = budget.amount > 0 ? (variance / budget.amount) * 100 : 0;
      
      return {
        id: budget.id,
        category: budget.category,
        department: budget.department,
        budgeted: budget.amount,
        actual: actualAmount,
        variance: variance,
        variancePercentage: variancePercentage,
        status: variance >= 0 ? 'UNDER_BUDGET' : 'OVER_BUDGET',
        utilizationRate: budget.amount > 0 ? (actualAmount / budget.amount) * 100 : 0
      };
    });

    // Calculate totals
    const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    const totalActual = actualExpenses.reduce((sum, expense) => sum + expense._sum.amount, 0);
    const totalVariance = totalBudgeted - totalActual;
    const overallUtilizationRate = totalBudgeted > 0 ? (totalActual / totalBudgeted) * 100 : 0;

    // Get monthly trends for the year
    const monthlyTrends = [];
    for (let m = 0; m < 12; m++) {
      const monthStart = new Date(year, m, 1);
      const monthEnd = new Date(year, m + 1, 0, 23, 59, 59);
      
      const monthExpenses = await prisma.transaction.aggregate({
        where: {
          type: 'WITHDRAWAL',
          createdAt: { gte: monthStart, lte: monthEnd }
        },
        _sum: { amount: true }
      });

      monthlyTrends.push({
        month: m + 1,
        monthName: monthStart.toLocaleString('default', { month: 'long' }),
        actual: monthExpenses._sum.amount || 0,
        budgeted: totalBudgeted / 12 // Distribute annual budget evenly
      });
    }

    // Generate insights and recommendations
    const insights = [];
    const overBudgetCategories = budgetPerformance.filter(bp => bp.status === 'OVER_BUDGET');
    const underBudgetCategories = budgetPerformance.filter(bp => bp.status === 'UNDER_BUDGET');

    if (overBudgetCategories.length > 0) {
      insights.push({
        type: 'WARNING',
        message: `${overBudgetCategories.length} categories are over budget`,
        categories: overBudgetCategories.map(cat => cat.category)
      });
    }

    if (overallUtilizationRate > 90) {
      insights.push({
        type: 'INFO',
        message: 'Overall budget utilization is high',
        utilizationRate: overallUtilizationRate
      });
    }

    if (totalVariance < 0) {
      insights.push({
        type: 'ALERT',
        message: 'Total expenses exceed total budget',
        variance: totalVariance
      });
    }

    const analysis = {
      period: {
        year,
        month: month ? month : 'Full Year',
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      },
      summary: {
        totalBudgeted,
        totalActual,
        totalVariance,
        overallUtilizationRate,
        categoriesCount: budgets.length,
        overBudgetCount: overBudgetCategories.length,
        underBudgetCount: underBudgetCategories.length
      },
      budgetPerformance,
      monthlyTrends,
      insights,
      generatedAt: new Date().toISOString(),
      generatedBy: session.user.name || session.user.email
    };

    return NextResponse.json(analysis);

  } catch (error) {
    console.error('Budget performance analysis error:', error);
    return NextResponse.json({ error: 'Failed to generate budget performance analysis' }, { status: 500 });
  }
}
