'use client';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function LeaveManagement() {
  const { data: session } = useSession();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'ANNUAL',
    startDate: '',
    endDate: '',
    reason: '',
    emergencyContact: '',
    contactPhone: '',
    workHandover: ''
  });

  useEffect(() => { // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const response = await fetch('/api/leave-requests');
      const data = await response.json();
      setLeaveRequests(data.requests || []);
    } catch (error) {
      // console.error('Error fetching leave requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/leave-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowCreateForm(false);
        setFormData({
          leaveType: 'ANNUAL',
          startDate: '',
          endDate: '',
          reason: '',
          emergencyContact: '',
          contactPhone: '',
          workHandover: ''
        });
        fetchLeaveRequests();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create leave request');
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

  const handleStatusUpdate = async (requestId, newStatus, comments = '') => {
    try {
      const response = await fetch(`/api/leave-requests/${requestId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, comments })
      });

      if (response.ok) {
        fetchLeaveRequests();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update leave request status');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
  };

  const leaveTypes = [
    {
      id: 'ANNUAL',
      name: 'Annual Leave',
      maxDays: 21,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'SICK',
      name: 'Sick Leave',
      maxDays: 10,
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 'PERSONAL',
      name: 'Personal Leave',
      maxDays: 5,
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'MATERNITY',
      name: 'Maternity Leave',
      maxDays: 90,
      color: 'bg-pink-100 text-pink-800'
    },
    {
      id: 'PATERNITY',
      name: 'Paternity Leave',
      maxDays: 14,
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'COMPASSIONATE',
      name: 'Compassionate Leave',
      maxDays: 7,
      color: 'bg-gray-100 text-gray-800'
    },
    {
      id: 'STUDY',
      name: 'Study Leave',
      maxDays: 30,
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 'EMERGENCY',
      name: 'Emergency Leave',
      maxDays: 3,
      color: 'bg-orange-100 text-orange-800'
    }
  ];

  const statusOptions = [
    { id: 'PENDING', name: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'APPROVED', name: 'Approved', color: 'bg-green-100 text-green-800' },
    { id: 'REJECTED', name: 'Rejected', color: 'bg-red-100 text-red-800' },
    { id: 'CANCELLED', name: 'Cancelled', color: 'bg-gray-100 text-gray-800' }
  ];

  const calculateLeaveDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  if (isLoading) {
    return (
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-gray-600'>Loading leave requests...</div>
        </div>
      </main>
    );
  }

  return (
    <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>Leave Management</h1>
        <p className='mt-2 text-gray-600'>
          Manage staff leave requests and approvals
        </p>
      </div>

      {/* Leave Statistics */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
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
                {
                  leaveRequests.filter(request => request.status === 'PENDING')
                    .length
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
              <p className='text-sm font-medium text-gray-600'>Approved</p>
              <p className='text-2xl font-bold text-gray-900'>
                {
                  leaveRequests.filter(request => request.status === 'APPROVED')
                    .length
                }
              </p>
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
              <p className='text-sm font-medium text-gray-600'>Rejected</p>
              <p className='text-2xl font-bold text-gray-900'>
                {
                  leaveRequests.filter(request => request.status === 'REJECTED')
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
                  d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>
                Total Requests
              </p>
              <p className='text-2xl font-bold text-gray-900'>
                {leaveRequests.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Requests */}
      <div className='card mb-8'>
        <div className='card-header'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-xl font-semibold text-gray-900'>
                Leave Requests
              </h2>
              <p className='text-gray-600'>
                Review and manage staff leave requests
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className='btn-primary'
            >
              Request Leave
            </button>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Staff Member
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Leave Type
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Duration
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Requested Date
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {leaveRequests.map(request => (
                <tr key={request.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm font-medium text-gray-900'>
                      {request.user?.name || 'Unknown'}
                    </div>
                    <div className='text-sm text-gray-500'>
                      {request.user?.email || ''}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`status-badge ${
                        leaveTypes.find(t => t.id === request.leaveType)
                          ?.color || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {leaveTypes.find(t => t.id === request.leaveType)?.name ||
                        request.leaveType}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {new Date(request.startDate).toLocaleDateString()} -{' '}
                    {new Date(request.endDate).toLocaleDateString()}
                    <div className='text-xs text-gray-500'>
                      {calculateLeaveDays(request.startDate, request.endDate)}{' '}
                      days
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`status-badge ${
                        statusOptions.find(s => s.id === request.status)
                          ?.color || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {statusOptions.find(s => s.id === request.status)?.name ||
                        request.status}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <div className='flex space-x-2'>
                      {request.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusUpdate(request.id, 'APPROVED')
                            }
                            className='text-green-600 hover:text-green-900'
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              const comments = prompt(
                                'Enter rejection reason:'
                              );
                              if (comments) {
                                handleStatusUpdate(
                                  request.id,
                                  'REJECTED',
                                  comments
                                );
                              }
                            }}
                            className='text-red-600 hover:text-red-900'
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          // Handle view details
                        }}
                        className='text-blue-600 hover:text-blue-900'
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {leaveRequests.length === 0 && (
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
                d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
              />
            </svg>
            <h3 className='mt-2 text-sm font-medium text-gray-900'>
              No leave requests
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              No leave requests have been submitted yet.
            </p>
          </div>
        )}
      </div>

      {/* Create Leave Request Form Modal */}
      {showCreateForm && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>
              Request Leave
            </h2>
            <form onSubmit={handleSubmit} className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='form-label'>Leave Type</label>
                  <select
                    name='leaveType'
                    value={formData.leaveType}
                    onChange={handleChange}
                    required
                    className='form-input'
                  >
                    {leaveTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name} (Max: {type.maxDays} days)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='form-label'>Emergency Contact</label>
                  <input
                    type='text'
                    name='emergencyContact'
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    required
                    className='form-input'
                    placeholder='Emergency contact name'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='form-label'>Start Date</label>
                  <input
                    type='date'
                    name='startDate'
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className='form-input'
                  />
                </div>

                <div>
                  <label className='form-label'>End Date</label>
                  <input
                    type='date'
                    name='endDate'
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    className='form-input'
                  />
                </div>
              </div>

              <div>
                <label className='form-label'>Contact Phone</label>
                <input
                  type='tel'
                  name='contactPhone'
                  value={formData.contactPhone}
                  onChange={handleChange}
                  required
                  className='form-input'
                  placeholder='Emergency contact phone number'
                />
              </div>

              <div>
                <label className='form-label'>Reason for Leave</label>
                <textarea
                  name='reason'
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  rows={3}
                  className='form-input'
                  placeholder='Please provide a detailed reason for your leave request...'
                />
              </div>

              <div>
                <label className='form-label'>Work Handover</label>
                <textarea
                  name='workHandover'
                  value={formData.workHandover}
                  onChange={handleChange}
                  rows={3}
                  className='form-input'
                  placeholder='Describe how your work will be covered during your absence...'
                />
              </div>

              {formData.startDate && formData.endDate && (
                <div className='bg-blue-50 p-4 rounded-lg'>
                  <p className='text-sm text-blue-800'>
                    <strong>Leave Duration:</strong>{' '}
                    {calculateLeaveDays(formData.startDate, formData.endDate)}{' '}
                    days
                  </p>
                </div>
              )}

              <div className='flex space-x-4'>
                <button
                  type='submit'
                  disabled={isLoading}
                  className='btn-primary disabled:opacity-50'
                >
                  {isLoading ? 'Submitting...' : 'Submit Request'}
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
