'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function ApprovalWorkflows() {
  const { data: session } = useSession();
  const [workflows, setWorkflows] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    approvalLevels: [],
    amountThreshold: '',
    department: '',
    isActive: true
  });

  useEffect(() => {
    fetchWorkflows();
    fetchPendingApprovals();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('/api/approval-workflows');
      const data = await response.json();
      setWorkflows(data.workflows || []);
    } catch (error) {
      console.error('Error fetching workflows:', error);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      const response = await fetch('/api/approval-workflows/pending');
      const data = await response.json();
      setPendingApprovals(data.approvals || []);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (approvalId, action) => {
    try {
      const response = await fetch(`/api/approval-workflows/${approvalId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        fetchPendingApprovals();
        alert(`Request ${action}d successfully`);
      } else {
        const error = await response.json();
        alert(error.message || `Failed to ${action} request`);
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/approval-workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowCreateForm(false);
        setFormData({
          name: '',
          description: '',
          approvalLevels: [],
          amountThreshold: '',
          department: '',
          isActive: true
        });
        fetchWorkflows();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create workflow');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isLoading) {
    return (
      <main className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading approval workflows...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Approval Workflows</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="h-10 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Create Workflow
        </button>
      </div>

      {/* Pending Approvals */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Approvals</h2>
        <div className="space-y-4">
          {pendingApprovals.map((approval) => (
            <div key={approval.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{approval.title}</h3>
                      <p className="text-sm text-gray-500">{approval.description}</p>
                      <p className="text-xs text-gray-600">
                        Requested by: {approval.requestedBy} • Amount: ${approval.amount?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApprove(approval.id, 'approve')}
                    className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full hover:bg-green-200"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleApprove(approval.id, 'reject')}
                    className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full hover:bg-red-200"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workflow Templates */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Workflow Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{workflow.name}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  workflow.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {workflow.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{workflow.description}</p>
              <div className="text-xs text-gray-500">
                Threshold: ${workflow.amountThreshold?.toLocaleString() || 'N/A'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Workflow Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Approval Workflow</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Workflow Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Threshold</label>
                <input
                  type="number"
                  name="amountThreshold"
                  value={formData.amountThreshold}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select department</option>
                  <option value="Finance">Finance</option>
                  <option value="Ministry">Ministry</option>
                  <option value="Administration">Administration</option>
                  <option value="Mission">Mission</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Active Workflow</label>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-10 px-4 rounded-lg bg-blue-600 text-white disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Create Workflow'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
