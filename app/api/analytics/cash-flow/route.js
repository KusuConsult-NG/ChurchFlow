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

    // Operating Activities
    const operatingInflows = await prisma.transaction.aggregate({
      where: {
        type: 'DEPOSIT',
        createdAt: { gte: startDate, lte: endDate },
        category: {
          in: ['TITHES', 'OFFERINGS', 'DONATIONS', 'SPECIAL_EVENTS', 'FUNDRAISING']
        }
      },
      _sum: { amount: true }
    });

    const operatingOutflows = await prisma.transaction.aggregate({
      where: {
        type: 'WITHDRAWAL',
        createdAt: { gte: startDate, lte: endDate },
        category: {
          in: ['MINISTRY_OPERATIONS', 'ADMINISTRATIVE', 'UTILITIES', 'SALARIES', 'PROGRAMS']
        }
      },
      _sum: { amount: true }
    });

    // Investing Activities
    const investingInflows = await prisma.transaction.aggregate({
      where: {
        type: 'DEPOSIT',
        createdAt: { gte: startDate, lte: endDate },
        category: {
          in: ['INVESTMENT_RETURNS', 'ASSET_SALES', 'INTEREST_INCOME']
        }
      },
      _sum: { amount: true }
    });

    const investingOutflows = await prisma.transaction.aggregate({
      where: {
        type: 'WITHDRAWAL',
        createdAt: { gte: startDate, lte: endDate },
        category: {
          in: ['BUILDING_MAINTENANCE', 'EQUIPMENT_PURCHASE', 'FACILITY_IMPROVEMENTS', 'INVESTMENTS']
        }
      },
      _sum: { amount: true }
    });

    // Financing Activities
    const financingInflows = await prisma.transaction.aggregate({
      where: {
        type: 'DEPOSIT',
        createdAt: { gte: startDate, lte: endDate },
        category: {
          in: ['LOANS_RECEIVED', 'GRANTS', 'CAPITAL_CONTRIBUTIONS']
        }
      },
      _sum: { amount: true }
    });

    const financingOutflows = await prisma.transaction.aggregate({
      where: {
        type: 'WITHDRAWAL',
        createdAt: { gte: startDate, lte: endDate },
        category: {
          in: ['LOAN_PAYMENTS', 'DEBT_PAYMENT', 'DIVIDENDS']
        }
      },
      _sum: { amount: true }
    });

    // Calculate net cash flows
    const netOperatingCashFlow = (operatingInflows._sum.amount || 0) - (operatingOutflows._sum.amount || 0);
    const netInvestingCashFlow = (investingInflows._sum.amount || 0) - (investingOutflows._sum.amount || 0);
    const netFinancingCashFlow = (financingInflows._sum.amount || 0) - (financingOutflows._sum.amount || 0);
    const netCashFlow = netOperatingCashFlow + netInvestingCashFlow + netFinancingCashFlow;

    // Get beginning and ending cash balances
    const beginningCash = await prisma.accountBook.aggregate({
      where: {
        createdAt: { lt: startDate }
      },
      _sum: { balance: true }
    });

    const endingCash = await prisma.accountBook.aggregate({
      where: {
        createdAt: { lte: endDate }
      },
      _sum: { balance: true }
    });

    // Get detailed transaction breakdown
    const operatingTransactions = await prisma.transaction.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        OR: [
          {
            type: 'DEPOSIT',
            category: { in: ['TITHES', 'OFFERINGS', 'DONATIONS', 'SPECIAL_EVENTS', 'FUNDRAISING'] }
          },
          {
            type: 'WITHDRAWAL',
            category: { in: ['MINISTRY_OPERATIONS', 'ADMINISTRATIVE', 'UTILITIES', 'SALARIES', 'PROGRAMS'] }
          }
        ]
      },
      include: {
        book: { select: { name: true } },
        user: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate cash flow ratios
    const totalRevenue = operatingInflows._sum.amount || 0;
    const operatingCashFlowRatio = totalRevenue > 0 ? (netOperatingCashFlow / totalRevenue) * 100 : 0;
    const cashFlowCoverageRatio = (operatingOutflows._sum.amount || 0) > 0 ? 
      netOperatingCashFlow / (operatingOutflows._sum.amount || 0) : 0;

    // Generate cash flow insights
    const insights = [];
    
    if (netOperatingCashFlow < 0) {
      insights.push({
        type: 'WARNING',
        message: 'Negative operating cash flow - expenses exceed operating income',
        impact: 'High'
      });
    }

    if (netCashFlow < 0) {
      insights.push({
        type: 'ALERT',
        message: 'Overall negative cash flow - cash reserves are decreasing',
        impact: 'Critical'
      });
    }

    if (operatingCashFlowRatio < 10) {
      insights.push({
        type: 'INFO',
        message: 'Low operating cash flow ratio - consider improving operational efficiency',
        impact: 'Medium'
      });
    }

    if (cashFlowCoverageRatio < 1) {
      insights.push({
        type: 'WARNING',
        message: 'Operating cash flow insufficient to cover operating expenses',
        impact: 'High'
      });
    }

    const cashFlowStatement = {
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      beginningCash: beginningCash._sum.balance || 0,
      endingCash: endingCash._sum.balance || 0,
      operatingActivities: {
        inflows: {
          tithesOfferings: await getCategoryAmount('TITHES', 'OFFERINGS', startDate, endDate, 'DEPOSIT'),
          donations: await getCategoryAmount('DONATIONS', null, startDate, endDate, 'DEPOSIT'),
          specialEvents: await getCategoryAmount('SPECIAL_EVENTS', 'FUNDRAISING', startDate, endDate, 'DEPOSIT'),
          total: operatingInflows._sum.amount || 0
        },
        outflows: {
          ministryOperations: await getCategoryAmount('MINISTRY_OPERATIONS', 'PROGRAMS', startDate, endDate, 'WITHDRAWAL'),
          administrative: await getCategoryAmount('ADMINISTRATIVE', 'UTILITIES', startDate, endDate, 'WITHDRAWAL'),
          salaries: await getCategoryAmount('SALARIES', null, startDate, endDate, 'WITHDRAWAL'),
          total: operatingOutflows._sum.amount || 0
        },
        netCashFlow: netOperatingCashFlow
      },
      investingActivities: {
        inflows: {
          investmentReturns: await getCategoryAmount('INVESTMENT_RETURNS', 'INTEREST_INCOME', startDate, endDate, 'DEPOSIT'),
          assetSales: await getCategoryAmount('ASSET_SALES', null, startDate, endDate, 'DEPOSIT'),
          total: investingInflows._sum.amount || 0
        },
        outflows: {
          buildingMaintenance: await getCategoryAmount('BUILDING_MAINTENANCE', 'FACILITY_IMPROVEMENTS', startDate, endDate, 'WITHDRAWAL'),
          equipmentPurchase: await getCategoryAmount('EQUIPMENT_PURCHASE', 'INVESTMENTS', startDate, endDate, 'WITHDRAWAL'),
          total: investingOutflows._sum.amount || 0
        },
        netCashFlow: netInvestingCashFlow
      },
      financingActivities: {
        inflows: {
          loansReceived: await getCategoryAmount('LOANS_RECEIVED', 'GRANTS', startDate, endDate, 'DEPOSIT'),
          capitalContributions: await getCategoryAmount('CAPITAL_CONTRIBUTIONS', null, startDate, endDate, 'DEPOSIT'),
          total: financingInflows._sum.amount || 0
        },
        outflows: {
          loanPayments: await getCategoryAmount('LOAN_PAYMENTS', 'DEBT_PAYMENT', startDate, endDate, 'WITHDRAWAL'),
          dividends: await getCategoryAmount('DIVIDENDS', null, startDate, endDate, 'WITHDRAWAL'),
          total: financingOutflows._sum.amount || 0
        },
        netCashFlow: netFinancingCashFlow
      },
      netCashFlow,
      ratios: {
        operatingCashFlowRatio,
        cashFlowCoverageRatio
      },
      insights,
      transactions: operatingTransactions.slice(0, 50), // Limit for response size
      generatedAt: new Date().toISOString(),
      generatedBy: session.user.name || session.user.email
    };

    return NextResponse.json(cashFlowStatement);

  } catch (error) {
    console.error('Cash flow analysis error:', error);
    return NextResponse.json({ error: 'Failed to generate cash flow statement' }, { status: 500 });
  }
}

async function getCategoryAmount(category1, category2, startDate, endDate, type) {
  const categories = [category1];
  if (category2) categories.push(category2);
  
  const result = await prisma.transaction.aggregate({
    where: {
      type,
      createdAt: { gte: startDate, lte: endDate },
      category: { in: categories }
    },
    _sum: { amount: true }
  });
  
  return result._sum.amount || 0;
}
