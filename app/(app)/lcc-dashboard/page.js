import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

const prisma = new PrismaClient();

export default async function LCCDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'LCC') {
    return (
      <main className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold">Access Denied</h2>
          <p className="text-red-700 text-sm">You don't have permission to access this dashboard.</p>
        </div>
      </main>
    );
  }

  // Fetch LCC-specific data (Sub-district level)
  const [pendingRequisitions, localProjects, subDistrictBudget, monthlyExpenses, localAnnouncements, congregationCount] = await Promise.all([
    prisma.requisition.count({ where: { status: 'PENDING', subDistrictId: session.user.subDistrictId } }),
    prisma.project.count({ where: { subDistrictId: session.user.subDistrictId, status: 'ACTIVE' } }),
    prisma.budget.aggregate({ 
      where: { subDistrictId: session.user.subDistrictId, year: new Date().getFullYear() },
      _sum: { amount: true }
    }),
    prisma.transaction.aggregate({ 
      where: { 
        subDistrictId: session.user.subDistrictId,
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      },
      _sum: { amount: true }
    }),
    prisma.announcement.count({ where: { subDistrictId: session.user.subDistrictId } }),
    prisma.congregation.count({ where: { subDistrictId: session.user.subDistrictId } })
  ]);

  const recentRequisitions = await prisma.requisition.findMany({
    where: { subDistrictId: session.user.subDistrictId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { 
      user: { select: { name: true } },
      congregation: { select: { name: true } }
    }
  });

  const localProjects = await prisma.project.findMany({
    where: { subDistrictId: session.user.subDistrictId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { congregation: { select: { name: true } } }
  });

  const congregationActivities = await prisma.congregation.findMany({
    where: { subDistrictId: session.user.subDistrictId },
    select: {
      name: true,
      memberCount: true,
      _count: {
        select: {
          projects: true,
          requisitions: true
        }
      }
    },
    take: 5
  });

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">LCC Sub-District Dashboard</h1>
        <div className="text-sm text-gray-600">
          Local Coordinator: {session.user.name}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Requisitions</p>
              <p className="text-2xl font-semibold text-gray-900">{pendingRequisitions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Local Projects</p>
              <p className="text-2xl font-semibold text-gray-900">{localProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Congregations</p>
              <p className="text-2xl font-semibold text-gray-900">{congregationCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sub-District Budget</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${subDistrictBudget._sum.amount?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities and Congregation Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Requisitions</h3>
          <div className="space-y-3">
            {recentRequisitions.map((requisition) => (
              <div key={requisition.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">{requisition.description}</p>
                  <p className="text-xs text-gray-500">
                    {requisition.congregation.name} • {requisition.user.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">${requisition.amount.toLocaleString()}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    requisition.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    requisition.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {requisition.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Congregation Activities</h3>
          <div className="space-y-3">
            {congregationActivities.map((congregation) => (
              <div key={congregation.name} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">{congregation.name}</p>
                  <p className="text-xs text-gray-500">{congregation.memberCount} members</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    {congregation._count.projects} projects • {congregation._count.requisitions} requisitions
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Local Projects */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Local Projects</h3>
        <div className="space-y-3">
          {localProjects.map((project) => (
            <div key={project.id} className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">{project.title}</p>
                <p className="text-xs text-gray-500">{project.congregation.name}</p>
              </div>
              <div className="text-right">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  project.status === 'PLANNING' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {project.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Local Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <a 
            href="/admin/lcc-requisition-approval" 
            className="p-4 text-center bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <div className="font-medium text-blue-900">Approve Requisitions</div>
            <div className="text-sm text-blue-700">Review local requisitions</div>
          </a>
          <a 
            href="/admin/local-projects" 
            className="p-4 text-center bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <div className="font-medium text-green-900">Manage Projects</div>
            <div className="text-sm text-green-700">Oversee local project portfolio</div>
          </a>
          <a 
            href="/admin/congregation-management" 
            className="p-4 text-center bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <div className="font-medium text-purple-900">Congregations</div>
            <div className="text-sm text-purple-700">Manage local congregations</div>
          </a>
          <a 
            href="/admin/local-communication" 
            className="p-4 text-center bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
          >
            <div className="font-medium text-yellow-900">Communication Hub</div>
            <div className="text-sm text-yellow-700">Local communication center</div>
          </a>
        </div>
      </div>
    </main>
  );
}
