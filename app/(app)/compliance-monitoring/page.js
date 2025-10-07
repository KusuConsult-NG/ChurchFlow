'use client';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function ComplianceMonitoring() {
  const { data: session } = useSession();
  const [complianceIssues, setComplianceIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    severity: 'MEDIUM',
    status: 'OPEN',
    assignedTo: '',
    dueDate: '',
    priority: 'NORMAL'
  });

  useEffect(() => { // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchComplianceIssues();
  }, []);

  const fetchComplianceIssues = async () => {
    try {
      const response = await fetch('/api/compliance-issues');
      const data = await response.json();
      setComplianceIssues(data.issues || []);
    } catch (error) {
      // console.error('Error fetching compliance issues:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/compliance-issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowCreateForm(false);
        setFormData({
          title: '',
          description: '',
          category: '',
          severity: 'MEDIUM',
          status: 'OPEN',
          assignedTo: '',
          dueDate: '',
          priority: 'NORMAL'
        });
        fetchComplianceIssues();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create compliance issue');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const updateIssueStatus = async (issueId, newStatus) => {
    try {
      const response = await fetch(`/api/compliance-issues/${issueId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchComplianceIssues();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update issue status');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
  };

  const categories = [
    'Financial Compliance',
    'Data Protection',
    'Regulatory Requirements',
    'Internal Policies',
    'Audit Findings',
    'Risk Management',
    'Documentation',
    'Training Requirements'
  ];

  const severityLevels = [
    { id: 'LOW', name: 'Low', color: 'bg-green-100 text-green-800' },
    { id: 'MEDIUM', name: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'HIGH', name: 'High', color: 'bg-orange-100 text-orange-800' },
    { id: 'CRITICAL', name: 'Critical', color: 'bg-red-100 text-red-800' }
  ];

  const statusOptions = [
    { id: 'OPEN', name: 'Open', color: 'bg-blue-100 text-blue-800' },
    {
      id: 'IN_PROGRESS',
      name: 'In Progress',
      color: 'bg-yellow-100 text-yellow-800'
    },
    { id: 'RESOLVED', name: 'Resolved', color: 'bg-green-100 text-green-800' },
    { id: 'CLOSED', name: 'Closed', color: 'bg-gray-100 text-gray-800' }
  ];

  const priorityLevels = [
    { id: 'LOW', name: 'Low' },
    { id: 'NORMAL', name: 'Normal' },
    { id: 'HIGH', name: 'High' },
    { id: 'URGENT', name: 'Urgent' }
  ];

  if (isLoading) {
    return (
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-gray-600'>Loading compliance issues...</div>
        </div>
      </main>
    );
  }

  return (
    <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>
          Compliance Monitoring
        </h1>
        <p className='mt-2 text-gray-600'>
          Monitor and manage compliance issues across the district
        </p>
      </div>

      {/* Compliance Overview */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
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
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Open Issues</p>
              <p className='text-2xl font-bold text-gray-900'>
                {
                  complianceIssues.filter(issue => issue.status === 'OPEN')
                    .length
                }
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
              <p className='text-sm font-medium text-gray-600'>In Progress</p>
              <p className='text-2xl font-bold text-gray-900'>
                {
                  complianceIssues.filter(
                    issue => issue.status === 'IN_PROGRESS'
                  ).length
                }
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
              <p className='text-sm font-medium text-gray-600'>Resolved</p>
              <p className='text-2xl font-bold text-gray-900'>
                {
                  complianceIssues.filter(issue => issue.status === 'RESOLVED')
                    .length
                }
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
                  d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Total Issues</p>
              <p className='text-2xl font-bold text-gray-900'>
                {complianceIssues.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Issues */}
      <div className='card mb-8'>
        <div className='card-header'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-xl font-semibold text-gray-900'>
                Compliance Issues
              </h2>
              <p className='text-gray-600'>
                Track and manage compliance issues
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className='btn-primary'
            >
              Create Issue
            </button>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Issue
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Category
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Severity
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Due Date
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {complianceIssues.map(issue => (
                <tr key={issue.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4'>
                    <div className='text-sm font-medium text-gray-900'>
                      {issue.title}
                    </div>
                    <div className='text-sm text-gray-500'>
                      {issue.description}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {issue.category}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`status-badge ${
                        severityLevels.find(s => s.id === issue.severity)
                          ?.color || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {severityLevels.find(s => s.id === issue.severity)
                        ?.name || issue.severity}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`status-badge ${
                        statusOptions.find(s => s.id === issue.status)?.color ||
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {statusOptions.find(s => s.id === issue.status)?.name ||
                        issue.status}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {issue.dueDate
                      ? new Date(issue.dueDate).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <div className='flex space-x-2'>
                      {issue.status === 'OPEN' && (
                        <button
                          onClick={() =>
                            updateIssueStatus(issue.id, 'IN_PROGRESS')
                          }
                          className='text-blue-600 hover:text-blue-900'
                        >
                          Start
                        </button>
                      )}
                      {issue.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() =>
                            updateIssueStatus(issue.id, 'RESOLVED')
                          }
                          className='text-green-600 hover:text-green-900'
                        >
                          Resolve
                        </button>
                      )}
                      <button
                        onClick={() => {
                          // Handle edit
                        }}
                        className='text-gray-600 hover:text-gray-900'
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {complianceIssues.length === 0 && (
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
                d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            <h3 className='mt-2 text-sm font-medium text-gray-900'>
              No compliance issues
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              Great! No compliance issues to track at the moment.
            </p>
          </div>
        )}
      </div>

      {/* Create Issue Form Modal */}
      {showCreateForm && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>
              Create Compliance Issue
            </h2>
            <form onSubmit={handleSubmit} className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='form-label'>Issue Title</label>
                  <input
                    type='text'
                    name='title'
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className='form-input'
                    placeholder='Brief description of the issue'
                  />
                </div>

                <div>
                  <label className='form-label'>Category</label>
                  <select
                    name='category'
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className='form-input'
                  >
                    <option value=''>Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className='form-label'>Description</label>
                <textarea
                  name='description'
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className='form-input'
                  placeholder='Detailed description of the compliance issue...'
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div>
                  <label className='form-label'>Severity</label>
                  <select
                    name='severity'
                    value={formData.severity}
                    onChange={handleChange}
                    required
                    className='form-input'
                  >
                    {severityLevels.map(level => (
                      <option key={level.id} value={level.id}>
                        {level.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='form-label'>Priority</label>
                  <select
                    name='priority'
                    value={formData.priority}
                    onChange={handleChange}
                    required
                    className='form-input'
                  >
                    {priorityLevels.map(level => (
                      <option key={level.id} value={level.id}>
                        {level.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='form-label'>Due Date</label>
                  <input
                    type='date'
                    name='dueDate'
                    value={formData.dueDate}
                    onChange={handleChange}
                    className='form-input'
                  />
                </div>
              </div>

              <div className='flex space-x-4'>
                <button
                  type='submit'
                  disabled={isLoading}
                  className='btn-primary disabled:opacity-50'
                >
                  {isLoading ? 'Creating...' : 'Create Issue'}
                </button>
                <button
                  type='button'
                  onClick={() => setShowCreateForm(false)}
                  className='btn-secondary'
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
