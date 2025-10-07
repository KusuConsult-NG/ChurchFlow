import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

import { authOptions } from '../../../lib/auth';

const prisma = new PrismaClient();

export default async function DCCDashboard() {
  const _session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'DCC') {
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

  // Fetch DCC-specific data
  const [
    pendingRequisitions,
    districtProjects,
    totalBudget,
    monthlyExpenses,
    districtAnnouncements,
    complianceIssues
  ] = await Promise.all([
    prisma.requisition.count({
      where: { status: 'PENDING', districtId: session.user.districtId }
    }),
    prisma.project.count({
      where: { districtId: session.user.districtId, status: 'ACTIVE' }
    }),
    prisma.budget.aggregate({
      where: {
        districtId: session.user.districtId,
        year: new Date().getFullYear()
      },
      _sum: { amount: true }
    }),
    prisma.transaction.aggregate({
      where: {
        districtId: session.user.districtId,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      },
      _sum: { amount: true }
    }),
    prisma.announcement.count({
      where: { districtId: session.user.districtId }
    }),
    prisma.complianceIssue.count({
      where: { districtId: session.user.districtId, status: 'OPEN' }
    })
  ]);

  const recentRequisitions = await prisma.requisition.findMany({
    where: { districtId: session.user.districtId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      user: { select: { name: true } }
    }
  });

  const recentDistrictProjects = await prisma.project.findMany({
    where: { districtId: session.user.districtId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { user: { select: { name: true } } }
  });

  return (
    <main className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>DCC Regional Dashboard</h1>
        <div className='text-sm text-gray-600'>
          District Coordinator: {session.user.name}
        </div>
      </div>

      {/* Key Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <div className='bg-white border border-gray-200 rounded-lg p-6'>
          <div className='flex items-center'>
            <div className='p-2 bg-blue-100 rounded-lg'>
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
                  d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>
                Pending Requisitions
              </p>
              <p className='text-2xl font-semibold text-gray-900'>
                {pendingRequisitions}
              </p>
            </div>
          </div>
        </div>

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
                  d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>
                Active Projects
              </p>
              <p className='text-2xl font-semibold text-gray-900'>
                {districtProjects}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white border border-gray-200 rounded-lg p-6'>
          <div className='flex items-center'>
            <div className='p-2 bg-purple-100 rounded-lg'>
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
              <p className='text-sm font-medium text-gray-600'>
                District Budget
              </p>
              <p className='text-2xl font-semibold text-gray-900'>
                ${totalBudget._sum.amount?.toLocaleString() || '0'}
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
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>
                Compliance Issues
              </p>
              <p className='text-2xl font-semibold text-gray-900'>
                {complianceIssues}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities and Projects */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white border border-gray-200 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Recent Requisitions
          </h3>
          <div className='space-y-3'>
            {recentRequisitions.map(requisition => (
              <div
                key={requisition.id}
                className='flex items-center justify-between py-2 border-b border-gray-100'
              >
                <div>
                  <p className='text-sm font-medium text-gray-900'>
                    {requisition.description}
                  </p>
                  <p className='text-xs text-gray-500'>
                    {requisition.agency.name} • {requisition.user.name}
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-sm font-medium text-gray-900'>
                    ${requisition.amount.toLocaleString()}
                  </p>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      requisition.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : requisition.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {requisition.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='bg-white border border-gray-200 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            District Projects
          </h3>
          <div className='space-y-3'>
            {recentDistrictProjects.map(project => (
              <div
                key={project.id}
                className='flex items-center justify-between py-2 border-b border-gray-100'
              >
                <div>
                  <p className='text-sm font-medium text-gray-900'>
                    {project.title}
                  </p>
                  <p className='text-xs text-gray-500'>{project.agency.name}</p>
                </div>
                <div className='text-right'>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      project.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : project.status === 'PLANNING'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {project.status}
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
          District Management
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <a
            href='/admin/dcc-requisition-approval'
            className='p-4 text-center bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors'
          >
            <div className='font-medium text-blue-900'>
              Approve Requisitions
            </div>
            <div className='text-sm text-blue-700'>
              Review and approve district requisitions
            </div>
          </a>
          <a
            href='/admin/district-projects'
            className='p-4 text-center bg-green-50 hover:bg-green-100 rounded-lg transition-colors'
          >
            <div className='font-medium text-green-900'>Manage Projects</div>
            <div className='text-sm text-green-700'>
              Oversee district project portfolio
            </div>
          </a>
          <a
            href='/admin/district-announcements'
            className='p-4 text-center bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors'
          >
            <div className='font-medium text-purple-900'>
              District Announcements
            </div>
            <div className='text-sm text-purple-700'>
              Communicate with district agencies
            </div>
          </a>
          <a
            href='/admin/compliance-monitoring'
            className='p-4 text-center bg-red-50 hover:bg-red-100 rounded-lg transition-colors'
          >
            <div className='font-medium text-red-900'>
              Compliance Monitoring
            </div>
            <div className='text-sm text-red-700'>
              Monitor regulatory compliance
            </div>
          </a>
        </div>
      </div>
    </main>
  );
}
