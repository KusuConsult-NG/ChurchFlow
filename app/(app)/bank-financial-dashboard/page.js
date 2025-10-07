import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

import { authOptions } from '../../../lib/auth';

const prisma = new PrismaClient();

export default async function BankFinancialDashboard() {
  const _session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'BANK_OPERATOR') {
    return (
      <main className='p-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <h2 className='text-red-800 font-semibold'>Access Denied</h2>
          <p className='text-red-700 text-sm'>
            You don't have permission to access this dashboard.
          </p>
        </div>
      </main>
    );
  }

  // Fetch bank-specific financial data
  const [
    totalDeposits,
    totalWithdrawals,
    pendingTransactions,
    accountBalances,
    recentTransactions
  ] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        type: 'DEPOSIT',
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      },
      _sum: { amount: true }
    }),
    prisma.transaction.aggregate({
      where: {
        type: 'WITHDRAWAL',
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      },
      _sum: { amount: true }
    }),
    prisma.transaction.count({ where: { status: 'PENDING' } }),
    prisma.accountBook.findMany({
      select: { name: true, balance: true, accountType: true },
      orderBy: { balance: 'desc' }
    }),
    prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        book: { select: { name: true } },
        user: { select: { name: true } }
      }
    })
  ]);

  const netFlow =
    (totalDeposits._sum.amount || 0) - (totalWithdrawals._sum.amount || 0);

  return (
    <main className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Bank Financial Dashboard</h1>
        <div className='text-sm text-gray-600'>
          Bank Operator: {session.user.name}
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <div className='bg-white border border-gray-200 rounded-lg p-6'>
          <div className='flex items-center'>
            <div className='p-2 bg-green-100 rounded-lg'>
              <svg
                className='w-6 h-6 text-green-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>
                Monthly Deposits
              </p>
              <p className='text-2xl font-semibold text-gray-900'>
                ${totalDeposits._sum.amount?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white border border-gray-200 rounded-lg p-6'>
          <div className='flex items-center'>
            <div className='p-2 bg-red-100 rounded-lg'>
              <svg
                className='w-6 h-6 text-red-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>
                Monthly Withdrawals
              </p>
              <p className='text-2xl font-semibold text-gray-900'>
                ${totalWithdrawals._sum.amount?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white border border-gray-200 rounded-lg p-6'>
          <div className='flex items-center'>
            <div
              className={`p-2 rounded-lg ${netFlow >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}
            >
              <svg
                className={`w-6 h-6 ${netFlow >= 0 ? 'text-blue-600' : 'text-orange-600'}`}
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Net Cash Flow</p>
              <p
                className={`text-2xl font-semibold ${netFlow >= 0 ? 'text-gray-900' : 'text-orange-600'}`}
              >
                ${netFlow.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white border border-gray-200 rounded-lg p-6'>
          <div className='flex items-center'>
            <div className='p-2 bg-yellow-100 rounded-lg'>
              <svg
                className='w-6 h-6 text-yellow-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>
                Pending Transactions
              </p>
              <p className='text-2xl font-semibold text-gray-900'>
                {pendingTransactions}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Balances and Recent Transactions */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white border border-gray-200 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Account Balances
          </h3>
          <div className='space-y-3'>
            {accountBalances.map(account => (
              <div
                key={account.name}
                className='flex items-center justify-between py-2 border-b border-gray-100'
              >
                <div>
                  <p className='text-sm font-medium text-gray-900'>
                    {account.name}
                  </p>
                  <p className='text-xs text-gray-500'>{account.accountType}</p>
                </div>
                <div className='text-right'>
                  <p className='text-sm font-medium text-gray-900'>
                    ${account.balance.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='bg-white border border-gray-200 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Recent Transactions
          </h3>
          <div className='space-y-3 max-h-80 overflow-y-auto'>
            {recentTransactions.map(transaction => (
              <div
                key={transaction.id}
                className='flex items-center justify-between py-2 border-b border-gray-100'
              >
                <div>
                  <p className='text-sm font-medium text-gray-900'>
                    {transaction.description}
                  </p>
                  <p className='text-xs text-gray-500'>
                    {transaction.book.name} • {transaction.user.name}
                  </p>
                </div>
                <div className='text-right'>
                  <p
                    className={`text-sm font-medium ${
                      transaction.type === 'DEPOSIT'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'DEPOSIT' ? '+' : '-'}$
                    {transaction.amount.toLocaleString()}
                  </p>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      transaction.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : transaction.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className='bg-white border border-gray-200 rounded-lg p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Bank Operations
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <a
            href='/admin/transactions'
            className='p-4 text-center bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors'
          >
            <div className='font-medium text-blue-900'>
              Process Transactions
            </div>
            <div className='text-sm text-blue-700'>
              Review and approve pending transactions
            </div>
          </a>
          <a
            href='/admin/bank-reconciliation'
            className='p-4 text-center bg-green-50 hover:bg-green-100 rounded-lg transition-colors'
          >
            <div className='font-medium text-green-900'>
              Bank Reconciliation
            </div>
            <div className='text-sm text-green-700'>
              Reconcile accounts with bank statements
            </div>
          </a>
          <a
            href='/admin/financial-reports'
            className='p-4 text-center bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors'
          >
            <div className='font-medium text-purple-900'>Financial Reports</div>
            <div className='text-sm text-purple-700'>
              Generate comprehensive financial reports
            </div>
          </a>
        </div>
      </div>
    </main>
  );
}
