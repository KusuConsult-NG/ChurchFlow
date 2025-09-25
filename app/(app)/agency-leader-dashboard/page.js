import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

const prisma = new PrismaClient();

export default async function AgencyLeaderDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'AGENCY_LEADER') {
    return (
      <main className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold">Access Denied</h2>
          <p className="text-red-700 text-sm">You don't have permission to access this dashboard.</p>
        </div>
      </main>
    );
  }

  // Fetch agency-specific data
  const [pendingRequisitions, totalBudget, monthlyExpenses, activeProjects, teamMembers] = await Promise.all([
    prisma.requisition.count({ where: { status: 'PENDING', agencyId: session.user.agencyId } }),
    prisma.budget.findFirst({ where: { agencyId: session.user.agencyId, year: new Date().getFullYear() } }),
    prisma.transaction.aggregate({ 
      where: { 
        agencyId: session.user.agencyId,
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      },
      _sum: { amount: true }
    }),
    prisma.project.count({ where: { agencyId: session.user.agencyId, status: 'ACTIVE' } }),
    prisma.user.count({ where: { agencyId: session.user.agencyId, role: { in: ['STAFF', 'VOLUNTEER'] } } })
  ]);

  const recentActivities = await prisma.requisition.findMany({
    where: { agencyId: session.user.agencyId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { user: { select: { name: true } } }
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agency Leader Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage your agency operations and team</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Welcome back,</div>
            <div className="font-medium text-gray-900">{session.user.name}</div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="metric-card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-xl">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Requisitions</p>
              <p className="text-2xl font-bold text-gray-900">{pendingRequisitions}</p>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-xl">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalBudget?.amount?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                ${monthlyExpenses._sum.amount?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-xl">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Team Members</p>
              <p className="text-2xl font-bold text-gray-900">{teamMembers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Requisitions</h3>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">by {activity.user.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">${activity.amount.toLocaleString()}</p>
                  <span className={`status-badge ${
                    activity.status === 'PENDING' ? 'status-pending' :
                    activity.status === 'APPROVED' ? 'status-approved' :
                    'status-rejected'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a 
              href="/admin/requisitions" 
              className="block w-full p-4 text-left border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-lg transition-colors group"
            >
              <div className="font-medium text-gray-900 group-hover:text-blue-600">Review Requisitions</div>
              <div className="text-sm text-gray-600">Approve or reject pending requests</div>
            </a>
            <a 
              href="/admin/projects" 
              className="block w-full p-4 text-left border border-gray-200 hover:border-green-300 hover:bg-green-50 rounded-lg transition-colors group"
            >
              <div className="font-medium text-gray-900 group-hover:text-green-600">Manage Projects</div>
              <div className="text-sm text-gray-600">Create and track project progress</div>
            </a>
            <a 
              href="/admin/accounts" 
              className="block w-full p-4 text-left border border-gray-200 hover:border-purple-300 hover:bg-purple-50 rounded-lg transition-colors group"
            >
              <div className="font-medium text-gray-900 group-hover:text-purple-600">Financial Reports</div>
              <div className="text-sm text-gray-600">View budget and expense reports</div>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
