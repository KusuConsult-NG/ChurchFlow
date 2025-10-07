import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

import { authOptions } from '../../../lib/auth';

export const revalidate = 60;
const prisma = new PrismaClient();

export default async function FundTransfer({ searchParams }) {
  const _session = await getServerSession(authOptions);
  
  // Await searchParams for Next.js 15 compatibility
  const params = await searchParams;
  const page = Math.max(1, Number(params.page || 1));
  const pageSize = Math.max(
    1,
    Math.min(50, Number(params.pageSize || 10))
  );
  const status = params.status || '';
  const where = status ? { status } : {};

  // Handle database connection errors gracefully
  let items = [], total = 0, accountBooks = [];

  try {
    [items, total, accountBooks] = await Promise.all([
      prisma.fundTransfer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          creator: { select: { name: true, email: true } },
          approver: { select: { name: true, email: true } }
        }
      }),
      prisma.fundTransfer.count({ where }),
      prisma.accountBook.findMany({
        select: { id: true, name: true, type: true, balance: true }
      })
    ]);
  } catch (error) {
    console.warn('Database connection failed, using default values:', error.message);
    // Use default values when database is not available
  }

  const pages = Math.max(1, Math.ceil(total / pageSize));

  // Calculate transfer statistics
  const [
    totalTransfers,
    pendingTransfers,
    approvedTransfers,
    completedTransfers
  ] = await Promise.all([
    prisma.fundTransfer.count(),
    prisma.fundTransfer.count({ where: { status: 'PENDING' } }),
    prisma.fundTransfer.count({ where: { status: 'APPROVED' } }),
    prisma.fundTransfer.count({ where: { status: 'COMPLETED' } })
  ]);

  const totalAmount = await prisma.fundTransfer.aggregate({
    _sum: { amount: true }
  });

  return (
    <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>
          Fund Transfer Management
        </h1>
        <p className='mt-2 text-gray-600'>
          Manage internal and external fund transfers between accounts
        </p>
      </div>

      {/* Transfer Statistics */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
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
                  d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>
                Total Transfers
              </p>
              <p className='text-2xl font-bold text-gray-900'>
                {totalTransfers}
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
                  d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Pending</p>
              <p className='text-2xl font-bold text-gray-900'>
                {pendingTransfers}
              </p>
            </div>
          </div>
        </div>

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
                  d='M5 13l4 4L19 7'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Approved</p>
              <p className='text-2xl font-bold text-gray-900'>
                {approvedTransfers}
              </p>
            </div>
          </div>
        </div>

        <div className='metric-card'>
          <div className='flex items-center'>
            <div className='p-3 bg-purple-100 rounded-xl'>
              <svg
                className='w-6 h-6 text-purple-600'
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
              <p className='text-sm font-medium text-gray-600'>Total Amount</p>
              <p className='text-2xl font-bold text-gray-900'>
                ₦{totalAmount._sum.amount?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className='card mb-8'>
        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='flex-1'>
            <form method='get' className='flex gap-2'>
              <select
                name='status'
                defaultValue={status}
                className='form-input'
              >
                <option value=''>All Status</option>
                <option value='PENDING'>Pending</option>
                <option value='APPROVED'>Approved</option>
                <option value='REJECTED'>Rejected</option>
                <option value='COMPLETED'>Completed</option>
              </select>
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
            </form>
          </div>
          <div className='flex gap-2'>
            <a href='/admin' className='btn-primary'>
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
              New Transfer
            </a>
          </div>
        </div>
      </div>

      {/* Transfer Requests */}
      <div className='card'>
        <div className='card-header'>
          <h2 className='text-xl font-semibold text-gray-900'>
            Transfer Requests
          </h2>
          <p className='text-gray-600'>{total} total transfers</p>
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
                d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
              />
            </svg>
            <h3 className='mt-2 text-sm font-medium text-gray-900'>
              No transfer requests found
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              {status
                ? 'Try adjusting your filter criteria.'
                : 'Get started by creating a new transfer request.'}
            </p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Transfer Details
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Amount
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Requested By
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
                {items.map(transfer => (
                  <tr key={transfer.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm font-medium text-gray-900'>
                        {transfer.fromAccount} → {transfer.toAccount}
                      </div>
                      <div className='text-sm text-gray-500'>
                        {transfer.reason}
                      </div>
                      <div className='text-xs text-gray-400'>
                        {transfer.transferType || 'INTERNAL'}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                      ₦{transfer.amount.toLocaleString()}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`status-badge ${
                          transfer.status === 'PENDING'
                            ? 'status-pending'
                            : transfer.status === 'APPROVED'
                              ? 'status-approved'
                              : transfer.status === 'COMPLETED'
                                ? 'status-completed'
                                : 'status-rejected'
                        }`}
                      >
                        {transfer.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {transfer.creator.name}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {new Date(transfer.createdAt).toLocaleDateString()}
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
                        {transfer.status === 'PENDING' && (
                          <button
                            className='text-green-600 hover:text-green-900'
                            title='Approve'
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
                                d='M5 13l4 4L19 7'
                              />
                            </svg>
                          </button>
                        )}
                        {transfer.status === 'PENDING' && (
                          <button
                            className='text-red-600 hover:text-red-900'
                            title='Reject'
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
                                d='M6 18L18 6M6 6l12 12'
                              />
                            </svg>
                          </button>
                        )}
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
                href={`?status=${encodeURIComponent(status)}&page=${Math.max(1, page - 1)}&pageSize=${pageSize}`}
              >
                Previous
              </a>
              <span className='px-3 py-2 text-sm text-gray-700'>
                Page {page} of {pages}
              </span>
              <a
                className={`btn-secondary text-sm ${page >= pages ? 'opacity-50 pointer-events-none' : ''}`}
                href={`?status=${encodeURIComponent(status)}&page=${Math.min(pages, page + 1)}&pageSize=${pageSize}`}
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
