import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

const prisma = new PrismaClient();

export const revalidate = 60;

export default async function ApprovalWorkflows() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  // Fetch workflows and approvals from database
  let workflows = [];
  let pendingApprovals = [];
  
  try {
    [workflows, pendingApprovals] = await Promise.all([
      prisma.approvalWorkflow.findMany({
        include: {
          createdByUser: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.approvalRequest.findMany({
        where: { status: 'PENDING' },
        include: {
          workflow: { select: { name: true } },
          requester: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);
  } catch (error) {
    console.error('Error fetching approval workflows:', error);
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Approval Workflows</h1>
        <p className="mt-2 text-gray-600">Manage approval processes and pending requests</p>
      </div>

      {/* Workflows Section */}
      <section className="mb-12">
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Workflow Templates</h2>
                <p className="text-gray-600">Define approval processes for different types of requests</p>
              </div>
              <button className="btn-primary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Workflow
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {workflows.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No workflows</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating your first approval workflow.</p>
              </div>
            ) : (
              workflows.map((workflow) => (
                <div key={workflow.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{workflow.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{workflow.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Created by: {workflow.createdByUser?.name || 'Unknown'}</span>
                        <span>•</span>
                        <span>Status: {workflow.isActive ? 'Active' : 'Inactive'}</span>
                        {workflow.amountThreshold && (
                          <>
                            <span>•</span>
                            <span>Threshold: ${workflow.amountThreshold}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="btn-secondary text-xs">Edit</button>
                      <button className="btn-danger text-xs">Delete</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Pending Approvals Section */}
      <section>
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900">Pending Approvals</h2>
            <p className="text-gray-600">Requests waiting for approval</p>
          </div>

          <div className="space-y-4">
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
                <p className="mt-1 text-sm text-gray-500">All approval requests have been processed.</p>
              </div>
            ) : (
              pendingApprovals.map((approval) => (
                <div key={approval.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{approval.workflow?.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{approval.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Requested by: {approval.requester?.name || 'Unknown'}</span>
                        <span>•</span>
                        <span>Amount: ${approval.amount}</span>
                        <span>•</span>
                        <span>Priority: {approval.priority}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="btn-success text-xs">Approve</button>
                      <button className="btn-danger text-xs">Reject</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}