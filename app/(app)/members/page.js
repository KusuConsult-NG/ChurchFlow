import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

import { authOptions } from '../../../lib/auth';

import FileUploadButton from './FileUploadButton';

export const revalidate = 60;
const prisma = new PrismaClient();

export default async function Members({ searchParams }) {
  const _session = await getServerSession(authOptions);
  
  // Await searchParams for Next.js 15 compatibility
  const params = await searchParams;
  const page = Math.max(1, Number(params.page || 1));
  const pageSize = Math.max(
    1,
    Math.min(50, Number(params.pageSize || 10))
  );
  const q = (params.q || '').trim();
  const where = q
    ? {
      OR: [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } }
      ]
    }
    : {};

  // Handle database connection errors gracefully
  let items = [], total = 0;

  try {
    [items, total] = await Promise.all([
      prisma.member.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { user: { select: { name: true } } }
      }),
      prisma.member.count({ where })
    ]);
  } catch (error) {
    console.warn('Database connection failed, using default values:', error.message);
    // Use default values when database is not available
  }

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>Members</h1>
        <p className='mt-2 text-gray-600'>
          Manage church members and their information
        </p>
      </div>

      {/* Search and Actions */}
      <div className='card mb-8'>
        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='flex-1'>
            <form method='get' className='flex gap-2'>
              <input
                name='q'
                defaultValue={q}
                placeholder='Search members...'
                className='form-input'
              />
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
                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                  />
                </svg>
                Search
              </button>
            </form>
          </div>
          <div className='flex gap-2'>
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
              Add Member
            </a>
            <a href='/api/members/export' className='btn-secondary'>
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
                  d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
              Export CSV
            </a>
            <FileUploadButton />
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className='card'>
        <div className='card-header'>
          <h2 className='text-xl font-semibold text-gray-900'>
            Members Directory
          </h2>
          <p className='text-gray-600'>{total} total members</p>
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
                d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
              />
            </svg>
            <h3 className='mt-2 text-sm font-medium text-gray-900'>
              No members found
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              {q
                ? 'Try adjusting your search terms.'
                : 'Get started by adding a new member.'}
            </p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Member
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Contact
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Join Date
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {items.map(member => (
                  <tr key={member.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <div className='flex-shrink-0 h-10 w-10'>
                          <div className='h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center'>
                            <span className='text-sm font-medium text-blue-600'>
                              {member.firstName.charAt(0)}
                              {member.lastName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className='ml-4'>
                          <div className='text-sm font-medium text-gray-900'>
                            {member.firstName} {member.lastName}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {member.role || 'Member'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-gray-900'>
                        {member.email || '—'}
                      </div>
                      <div className='text-sm text-gray-500'>
                        {member.phone || '—'}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`status-badge ${
                          member.status === 'ACTIVE'
                            ? 'status-approved'
                            : member.status === 'INACTIVE'
                              ? 'status-rejected'
                              : 'status-pending'
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {new Date(member.joinDate).toLocaleDateString()}
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
                href={`?q=${encodeURIComponent(q)}&page=${Math.max(1, page - 1)}&pageSize=${pageSize}`}
              >
                Previous
              </a>
              <span className='px-3 py-2 text-sm text-gray-700'>
                Page {page} of {pages}
              </span>
              <a
                className={`btn-secondary text-sm ${page >= pages ? 'opacity-50 pointer-events-none' : ''}`}
                href={`?q=${encodeURIComponent(q)}&page=${Math.min(pages, page + 1)}&pageSize=${pageSize}`}
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
