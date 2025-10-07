import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

import { authOptions } from '../../../lib/auth';

export const revalidate = 60;
const prisma = new PrismaClient();

export default async function FinancialReports({ searchParams }) {
  const _session = await getServerSession(authOptions);
  
  // Await searchParams for Next.js 15 compatibility
  const params = await searchParams;
  const reportType = params.reportType || 'overview';
  const startDate = params.startDate || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
  const endDate = params.endDate || new Date().toISOString().split('T')[0];

  // Handle database connection errors gracefully
  let reportData = null;

  try {
    // Generate report data based on type
    switch (reportType) {
    case 'overview':
      const [totalIncome, totalExpenses, totalMembers, totalEvents] = await Promise.all([
        prisma.transaction.aggregate({
          where: { 
            type: 'DEPOSIT',
            createdAt: { gte: new Date(startDate), lte: new Date(endDate) }
          },
          _sum: { amount: true }
        }),
        prisma.transaction.aggregate({
          where: { 
            type: 'WITHDRAWAL',
            createdAt: { gte: new Date(startDate), lte: new Date(endDate) }
          },
          _sum: { amount: true }
        }),
        prisma.member.count(),
        prisma.event.count({
          where: {
            date: { gte: new Date(startDate), lte: new Date(endDate) }
          }
        })
      ]);
        
      reportData = {
        totalIncome: totalIncome._sum.amount || 0,
        totalExpenses: totalExpenses._sum.amount || 0,
        totalMembers,
        totalEvents,
        netIncome: (totalIncome._sum.amount || 0) - (totalExpenses._sum.amount || 0)
      };
      break;
        
    case 'income':
      const incomeTransactions = await prisma.transaction.findMany({
        where: { 
          type: 'DEPOSIT',
          createdAt: { gte: new Date(startDate), lte: new Date(endDate) }
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      });
        
      reportData = {
        transactions: incomeTransactions,
        totalAmount: incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
      };
      break;
        
    default:
      reportData = {
        message: 'Report type not implemented yet',
        reportType
      };
    }
  } catch (error) {
    console.error('Database connection failed, using default values:', error);
    reportData = {
      totalIncome: 0,
      totalExpenses: 0,
      totalMembers: 0,
      totalEvents: 0,
      netIncome: 0,
      message: 'Database connection failed, showing default values'
    };
  }

  const reportTypes = [
    {
      id: 'overview',
      name: 'Financial Overview',
      description: 'Key financial metrics and trends'
    },
    {
      id: 'income',
      name: 'Income Statement',
      description: 'Revenue and expense breakdown'
    },
    {
      id: 'cashflow',
      name: 'Cash Flow Statement',
      description: 'Cash inflows and outflows'
    },
    {
      id: 'budget',
      name: 'Budget vs Actual',
      description: 'Budget performance analysis'
    },
    {
      id: 'balance',
      name: 'Balance Sheet',
      description: 'Assets, liabilities, and equity'
    },
    {
      id: 'trends',
      name: 'Financial Trends',
      description: 'Historical performance analysis'
    }
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
        <p className="mt-2 text-gray-600">Generate and view comprehensive financial reports</p>
      </div>

      {/* Report Controls */}
      <div className="card mb-8">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">Report Configuration</h2>
        </div>
        <div className="p-6">
          <form method="get" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select 
                name="reportType" 
                defaultValue={reportType}
                className="form-input"
              >
                {reportTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                defaultValue={startDate}
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                defaultValue={endDate}
                className="form-input"
              />
            </div>
            <div className="md:col-span-3">
              <button type="submit" className="btn-primary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Generate Report
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Report Results */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">
            {reportTypes.find(r => r.id === reportType)?.name || 'Financial Report'}
          </h2>
          <p className="text-gray-600">
            {reportTypes.find(r => r.id === reportType)?.description || 'Financial analysis and insights'}
          </p>
        </div>
        <div className="p-6">
          {reportData ? (
            <div className="space-y-6">
              {reportType === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="metric-card">
                    <div className="flex items-center">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Income</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ₦{reportData.totalIncome?.toLocaleString() || '0'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="flex items-center">
                      <div className="p-3 bg-red-100 rounded-xl">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ₦{reportData.totalExpenses?.toLocaleString() || '0'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Members</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {reportData.totalMembers || '0'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="flex items-center">
                      <div className="p-3 bg-purple-100 rounded-xl">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Net Income</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ₦{reportData.netIncome?.toLocaleString() || '0'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {reportType === 'income' && reportData.transactions && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Income Transactions</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.transactions.map((transaction) => (
                          <tr key={transaction.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {transaction.description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₦{transaction.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {reportData.message && (
                <div className="text-center py-8">
                  <p className="text-gray-500">{reportData.message}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No report data available</h3>
              <p className="mt-1 text-sm text-gray-500">Generate a report to view financial data.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}