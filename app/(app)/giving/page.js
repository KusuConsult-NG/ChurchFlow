import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

import { authOptions } from '../../../lib/auth';

export const revalidate = 60;
const prisma = new PrismaClient();
const ALLOWED_SORT = { createdAt: 'createdAt', amount: 'amount', type: 'type' };

export default async function Giving({ searchParams }) {
  const _session = await getServerSession(authOptions);
  
  // Await searchParams for Next.js 15 compatibility
  const params = await searchParams;
  const page = Math.max(1, Number(params.page || 1));
  const pageSize = Math.max(
    1,
    Math.min(50, Number(params.pageSize || 10))
  );
  const type = params.type || '';
  const where = type ? { type } : {};
  const sort = ALLOWED_SORT[params.sort] || 'createdAt';
  const dir = params.dir === 'asc' ? 'asc' : 'desc';

  // Handle database connection errors gracefully
  let items = [], total = 0;

  try {
    [items, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { [sort]: dir },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          book: { select: { name: true, type: true } },
          user: { select: { name: true } }
        }
      }),
      prisma.transaction.count({ where })
    ]);
  } catch (error) {
    console.warn('Database connection failed, using default values:', error.message);
    // Use default values when database is not available
  }

  const pages = Math.max(1, Math.ceil(total / pageSize));
  const link = (s, d) =>
    `?type=${encodeURIComponent(type)}&sort=${s}&dir=${d}&page=1&pageSize=${pageSize}`;

  // Calculate summary statistics
  const [totalDeposits, totalWithdrawals, monthlyDeposits, monthlyWithdrawals] =
    await Promise.all([
      prisma.transaction.aggregate({
        where: { type: 'DEPOSIT' },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: { type: 'WITHDRAWAL' },
        _sum: { amount: true }
      }),
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
      })
    ]);

  return (
    <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>
          Giving & Financial Records
        </h1>
        <p className='mt-2 text-gray-600'>
          Track donations, expenses, and financial transactions
        </p>
      </div>

      {/* Financial Summary */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
        <div className='metric-card'>
          <div className='flex items-center'>
            <div className='p-3 bg-green-100 rounded-xl'>
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
                Total Deposits
              </p>
              <p className='text-2xl font-bold text-gray-900'>
                ₦{totalDeposits._sum.amount?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className='metric-card'>
          <div className='flex items-center'>
            <div className='p-3 bg-red-100 rounded-xl'>
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
                  d='M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>
                Total Withdrawals
              </p>
              <p className='text-2xl font-bold text-gray-900'>
                ₦{totalWithdrawals._sum.amount?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className='metric-card'>
          <div className='flex items-center'>
            <div className='p-3 bg-blue-100 rounded-xl'>
              <svg
                className='w-6 h-6 text-blue-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>
                This Month Deposits
              </p>
              <p className='text-2xl font-bold text-gray-900'>
                ₦{monthlyDeposits._sum.amount?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className='metric-card'>
          <div className='flex items-center'>
            <div className='p-3 bg-yellow-100 rounded-xl'>
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
                  d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>
                This Month Withdrawals
              </p>
              <p className='text-2xl font-bold text-gray-900'>
                ₦{monthlyWithdrawals._sum.amount?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className='card mb-8'>
        <form method='get' className='flex flex-col sm:flex-row gap-4'>
          <div className='flex-1'>
            <select name='type' defaultValue={type} className='form-input'>
              <option value=''>All Transactions</option>
              <option value='DEPOSIT'>Deposits Only</option>
              <option value='WITHDRAWAL'>Withdrawals Only</option>
            </select>
          </div>
          <div className='flex gap-2'>
            <button className='btn-primary' type='submit'>
              <svg
                className='w-4 h-4 mr-2'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'
                />
              </svg>
              Filter
            </button>
            <a href='/admin' className='btn-secondary'>
              <svg
                className='w-4 h-4 mr-2'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                />
              </svg>
              New Transaction
            </a>
          </div>
        </form>

        <div className='mt-4 flex flex-wrap gap-2'>
          <span className='text-sm text-gray-600'>Sort by:</span>
          <a
            className={`text-sm px-3 py-1 rounded-full transition-colors ${
              sort === 'createdAt'
                ? 'bg-blue-100 text-blue-800'
                : 'text-gray-600 hover:text-blue-600'
            }`}
            href={link('createdAt', dir === 'asc' ? 'desc' : 'asc')}
          >
            Date {sort === 'createdAt' ? (dir === 'asc' ? '↑' : '↓') : ''}
          </a>
          <a
            className={`text-sm px-3 py-1 rounded-full transition-colors ${
              sort === 'amount'
                ? 'bg-blue-100 text-blue-800'
                : 'text-gray-600 hover:text-blue-600'
            }`}
            href={link('amount', dir === 'asc' ? 'desc' : 'asc')}
          >
            Amount {sort === 'amount' ? (dir === 'asc' ? '↑' : '↓') : ''}
          </a>
          <a
            className={`text-sm px-3 py-1 rounded-full transition-colors ${
              sort === 'type'
                ? 'bg-blue-100 text-blue-800'
                : 'text-gray-600 hover:text-blue-600'
            }`}
            href={link('type', dir === 'asc' ? 'desc' : 'asc')}
          >
            Type {sort === 'type' ? (dir === 'asc' ? '↑' : '↓') : ''}
          </a>
        </div>
      </div>

      {/* Transactions Table */}
      <div className='card'>
        <div className='card-header'>
          <h2 className='text-xl font-semibold text-gray-900'>
            Financial Transactions
          </h2>
          <p className='text-gray-600'>{total} total transactions</p>
        </div>

        {items.length === 0 ? (
          <div className='text-center py-12'>
            <svg
              className='mx-auto h-12 w-12 text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
            <h3 className='mt-2 text-sm font-medium text-gray-900'>
              No transactions found
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              {type
                ? 'Try adjusting your filter criteria.'
                : 'Get started by creating a new transaction.'}
            </p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Type
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Amount
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Description
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Account
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    User
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Date
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {items.map(transaction => (
                  <tr key={transaction.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`status-badge ${
                          transaction.type === 'DEPOSIT'
                            ? 'status-approved'
                            : 'status-rejected'
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900'>
                      ₦{transaction.amount.toLocaleString()}
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-900'>
                      {transaction.description || transaction.note || '—'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {transaction.book.name}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {transaction.user?.name || '—'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      <div className='flex space-x-2'>
                        <button
                          className='text-blue-600 hover:text-blue-900'
                          title='View Details'
                        >
                          <svg
                            className='w-4 h-4'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                            />
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                            />
                          </svg>
                        </button>
                        <button
                          className='text-gray-600 hover:text-gray-900'
                          title='Edit'
                        >
                          <svg
                            className='w-4 h-4'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                            />
                          </svg>
                        </button>
                        <button
                          className='text-red-600 hover:text-red-900'
                          title='Delete'
                        >
                          <svg
                            className='w-4 h-4'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className='mt-6 flex items-center justify-between'>
            <div className='text-sm text-gray-700'>
              Showing {(page - 1) * pageSize + 1} to{' '}
              {Math.min(page * pageSize, total)} of {total} results
            </div>
            <nav className='flex items-center gap-2'>
              <a
                className={`btn-secondary text-sm ${page <= 1 ? 'opacity-50 pointer-events-none' : ''}`}
                href={`?type=${encodeURIComponent(type)}&sort=${sort}&dir=${dir}&page=${Math.max(1, page - 1)}&pageSize=${pageSize}`}
              >
                Previous
              </a>
              <span className='px-3 py-2 text-sm text-gray-700'>
                Page {page} of {pages}
              </span>
              <a
                className={`btn-secondary text-sm ${page >= pages ? 'opacity-50 pointer-events-none' : ''}`}
                href={`?type=${encodeURIComponent(type)}&sort=${sort}&dir=${dir}&page=${Math.min(pages, page + 1)}&pageSize=${pageSize}`}
              >
                Next
              </a>
            </nav>
          </div>
        )}
      </div>
    </main>
  );
}
