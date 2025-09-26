import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

const prisma = new PrismaClient();

export default async function GCCDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'GCC') {
    return (
      <main className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold">Access Denied</h2>
          <p className="text-red-700 text-sm">You don't have permission to access this dashboard.</p>
        </div>
      </main>
    );
  }

  // Fetch GCC-specific data (National HQ level)
  const [totalDistricts, totalAgencies, nationalBudget, globalProjects, pendingApprovals, missionReports] = await Promise.all([
    prisma.district.count(),
    prisma.agency.count(),
    prisma.budget.aggregate({ 
      where: { year: new Date().getFullYear() },
      _sum: { amount: true }
    }),
    prisma.project.count({ where: { status: 'ACTIVE' } }),
    prisma.requisition.count({ where: { status: 'PENDING', amount: { gte: 10000 } } }), // High-value approvals
    prisma.missionReport.count({ where: { status: 'PENDING' } })
  ]);

  const recentHighValueRequisitions = await prisma.requisition.findMany({
    where: { status: 'PENDING', amount: { gte: 10000 } },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { 
      user: { select: { name: true } },
      district: { select: { name: true } },
      agency: { select: { name: true } }
    }
  });

  const recentGlobalProjects = await prisma.project.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { 
      district: { select: { name: true } },
      agency: { select: { name: true } }
    }
  });

  const executiveSummary = await prisma.executiveSummary.findFirst({
    where: { year: new Date().getFullYear() },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">GCC National HQ Dashboard</h1>
        <div className="text-sm text-gray-600">
          General Coordinator: {session.user.name}
        </div>
      </div>

      {/* Executive Summary */}
      {executiveSummary && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">Executive Summary</h2>
          <p className="text-blue-800">{executiveSummary.summary}</p>
          <div className="mt-4 text-sm text-blue-700">
            Last updated: {new Date(executiveSummary.createdAt).toLocaleDateString()}
          </div>
        </div>
      )}

      {/* Key National Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Districts</p>
              <p className="text-2xl font-semibold text-gray-900">{totalDistricts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Agencies</p>
              <p className="text-2xl font-semibold text-gray-900">{totalAgencies}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">National Budget</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${nationalBudget._sum.amount?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-semibold text-gray-900">{pendingApprovals}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Mission Oversight */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">High-Value Requisitions</h3>
          <div className="space-y-3">
            {recentHighValueRequisitions.map((requisition) => (
              <div key={requisition.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">{requisition.description}</p>
                  <p className="text-xs text-gray-500">
                    {requisition.district.name} • {requisition.agency.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">${requisition.amount.toLocaleString()}</p>
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                    {requisition.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Global Projects</h3>
          <div className="space-y-3">
            {recentGlobalProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">{project.title}</p>
                  <p className="text-xs text-gray-500">
                    {project.district.name} • {project.agency.name}
                  </p>
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
      </div>

      {/* Global Mission Oversight Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Global Mission Oversight</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <a 
            href="/admin/approval-workflows" 
            className="p-4 text-center bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <div className="font-medium text-blue-900">Approval Workflows</div>
            <div className="text-sm text-blue-700">Manage high-level approval processes</div>
          </a>
          <a 
            href="/admin/global-mission-oversight" 
            className="p-4 text-center bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <div className="font-medium text-green-900">Mission Oversight</div>
            <div className="text-sm text-green-700">Monitor global mission activities</div>
          </a>
          <a 
            href="/admin/executive-summary" 
            className="p-4 text-center bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <div className="font-medium text-purple-900">Executive Summary</div>
            <div className="text-sm text-purple-700">Generate executive reports</div>
          </a>
          <a 
            href="/admin/financial-analytics" 
            className="p-4 text-center bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
          >
            <div className="font-medium text-yellow-900">Financial Analytics</div>
            <div className="text-sm text-yellow-700">National financial analysis</div>
          </a>
        </div>
      </div>
    </main>
  );
}
