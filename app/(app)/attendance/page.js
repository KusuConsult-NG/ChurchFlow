import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

import { authOptions } from '../../../lib/auth';

export const revalidate = 60;
const prisma = new PrismaClient();

export default async function Attendance({ searchParams }) {
  const _session = await getServerSession(authOptions);
  
  // Await searchParams for Next.js 15 compatibility
  const params = await searchParams;
  const page = Math.max(1, Number(params.page || 1));
  const pageSize = Math.max(
    1,
    Math.min(50, Number(params.pageSize || 10))
  );
  const eventId = params.eventId || '';
  const where = eventId ? { eventId } : {};

  // Handle database connection errors gracefully
  let events = [], items = [], total = 0;

  try {
    [events, items, total] = await Promise.all([
      prisma.event.findMany({
        orderBy: { date: 'desc' },
        take: 100,
        include: { user: { select: { name: true } } }
      }),
      prisma.attendance.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          member: { select: { firstName: true, lastName: true, email: true } },
          event: { select: { title: true, date: true, location: true } }
        }
      }),
      prisma.attendance.count({ where })
    ]);
  } catch (error) {
    console.warn('Database connection failed, using default values:', error.message);
    // Use default values when database is not available
  }

  const pages = Math.max(1, Math.ceil(total / pageSize));

  // Calculate attendance statistics
  const [totalAttendance, presentCount, absentCount, lateCount] =
    await Promise.all([
      prisma.attendance.count(),
      prisma.attendance.count({ where: { status: 'PRESENT' } }),
      prisma.attendance.count({ where: { status: 'ABSENT' } }),
      prisma.attendance.count({ where: { status: 'LATE' } })
    ]);

  return (
    <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>
          Attendance Management
        </h1>
        <p className='mt-2 text-gray-600'>
          Track member attendance for events and services
        </p>
      </div>

      {/* Attendance Statistics */}
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
                  d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Total Records</p>
              <p className='text-2xl font-bold text-gray-900'>
                {totalAttendance}
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
              <p className='text-sm font-medium text-gray-600'>Present</p>
              <p className='text-2xl font-bold text-gray-900'>{presentCount}</p>
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
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Absent</p>
              <p className='text-2xl font-bold text-gray-900'>{absentCount}</p>
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
              <p className='text-sm font-medium text-gray-600'>Late</p>
              <p className='text-2xl font-bold text-gray-900'>{lateCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='card mb-8'>
        <form method='get' className='flex flex-col sm:flex-row gap-4'>
          <div className='flex-1'>
            <select
              name='eventId'
              defaultValue={eventId}
              className='form-input'
            >
              <option value=''>All Events</option>
              {events.map(e => (
                <option key={e.id} value={e.id}>
                  {e.title} - {new Date(e.date).toLocaleDateString()}
                </option>
              ))}
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
              Mark Attendance
            </a>
          </div>
        </form>
      </div>

      {/* Attendance Records */}
      <div className='card'>
        <div className='card-header'>
          <h2 className='text-xl font-semibold text-gray-900'>
            Attendance Records
          </h2>
          <p className='text-gray-600'>{total} total records</p>
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
              No attendance records found
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              {eventId
                ? 'Try selecting a different event.'
                : 'Get started by marking attendance for an event.'}
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
                    Event
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Date
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Notes
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {items.map(attendance => (
                  <tr key={attendance.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <div className='flex-shrink-0 h-10 w-10'>
                          <div className='h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center'>
                            <span className='text-sm font-medium text-blue-600'>
                              {attendance.member.firstName.charAt(0)}
                              {attendance.member.lastName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className='ml-4'>
                          <div className='text-sm font-medium text-gray-900'>
                            {attendance.member.firstName}{' '}
                            {attendance.member.lastName}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {attendance.member.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm font-medium text-gray-900'>
                        {attendance.event.title}
                      </div>
                      <div className='text-sm text-gray-500'>
                        {attendance.event.location}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {new Date(attendance.event.date).toLocaleDateString()}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`status-badge ${
                          attendance.status === 'PRESENT'
                            ? 'status-approved'
                            : attendance.status === 'ABSENT'
                              ? 'status-rejected'
                              : 'status-pending'
                        }`}
                      >
                        {attendance.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-900'>
                      {attendance.notes || '—'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      <div className='flex space-x-2'>
                        <button
                          className='text-blue-600 hover:text-blue-900'
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
                href={`?eventId=${encodeURIComponent(eventId)}&page=${Math.max(1, page - 1)}&pageSize=${pageSize}`}
              >
                Previous
              </a>
              <span className='px-3 py-2 text-sm text-gray-700'>
                Page {page} of {pages}
              </span>
              <a
                className={`btn-secondary text-sm ${page >= pages ? 'opacity-50 pointer-events-none' : ''}`}
                href={`?eventId=${encodeURIComponent(eventId)}&page=${Math.min(pages, page + 1)}&pageSize=${pageSize}`}
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
