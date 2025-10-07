'use client';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function HRReports() {
  const { data: session } = useSession();
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reportType: 'STAFF_ATTENDANCE',
    dateRange: {
      start: new Date(new Date().getFullYear(), 0, 1)
        .toISOString()
        .split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    filters: {},
    format: 'PDF'
  });

  useEffect(() => { // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/hr-reports');
      const data = await response.json();
      setReports(data.reports || []);
    } catch (error) {
      // console.error('Error fetching HR reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/hr-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowCreateForm(false);
        setFormData({
          title: '',
          description: '',
          reportType: 'STAFF_ATTENDANCE',
          dateRange: {
            start: new Date(new Date().getFullYear(), 0, 1)
              .toISOString()
              .split('T')[0],
            end: new Date().toISOString().split('T')[0]
          },
          filters: {},
          format: 'PDF'
        });
        fetchReports();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create HR report');
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

  const handleDateRangeChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }));
  };

  const generateReport = async reportId => {
    try {
      const response = await fetch(`/api/hr-reports/${reportId}/generate`, {
        method: 'POST'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hr-report-${reportId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to generate report');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
  };

  const reportTypes = [
    {
      id: 'STAFF_ATTENDANCE',
      name: 'Staff Attendance',
      description: 'Track staff attendance and punctuality'
    },
    {
      id: 'LEAVE_SUMMARY',
      name: 'Leave Summary',
      description: 'Summary of all leave requests and approvals'
    },
    {
      id: 'PERFORMANCE_REVIEW',
      name: 'Performance Review',
      description: 'Staff performance evaluation reports'
    },
    {
      id: 'PAYROLL_SUMMARY',
      name: 'Payroll Summary',
      description: 'Salary and benefits summary'
    },
    {
      id: 'TRAINING_RECORDS',
      name: 'Training Records',
      description: 'Staff training and development records'
    },
    {
      id: 'DISCIPLINARY_ACTIONS',
      name: 'Disciplinary Actions',
      description: 'Record of disciplinary actions taken'
    },
    {
      id: 'RECRUITMENT_STATUS',
      name: 'Recruitment Status',
      description: 'Current recruitment and hiring status'
    },
    {
      id: 'STAFF_TURNOVER',
      name: 'Staff Turnover',
      description: 'Analysis of staff turnover rates'
    }
  ];

  const formatOptions = [
    { id: 'PDF', name: 'PDF Document' },
    { id: 'EXCEL', name: 'Excel Spreadsheet' },
    { id: 'CSV', name: 'CSV File' },
    { id: 'WORD', name: 'Word Document' }
  ];

  if (isLoading) {
    return (
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-gray-600'>Loading HR reports...</div>
        </div>
      </main>
    );
  }

  return (
    <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>HR Reports</h1>
        <p className='mt-2 text-gray-600'>
          Generate and manage human resources reports
        </p>
      </div>

      {/* Report Statistics */}
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
                  d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Total Reports</p>
              <p className='text-2xl font-bold text-gray-900'>
                {reports.length}
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
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Generated</p>
              <p className='text-2xl font-bold text-gray-900'>
                {reports.filter(report => report.status === 'COMPLETED').length}
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
              <p className='text-sm font-medium text-gray-600'>Pending</p>
              <p className='text-2xl font-bold text-gray-900'>
                {
                  reports.filter(report => report.status === 'PROCESSING')
                    .length
                }
              </p>
            </div>
          </div>
        </div>

        <div className='metric-card'>
          <div className='flex items-center'>
            <div className='p-3 bg-purple-100 rounded-xl'>
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
                  d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Staff Members</p>
              <p className='text-2xl font-bold text-gray-900'>45</p>
            </div>
          </div>
        </div>
      </div>

      {/* HR Reports */}
      <div className='card mb-8'>
        <div className='card-header'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-xl font-semibold text-gray-900'>
                HR Reports
              </h2>
              <p className='text-gray-600'>
                Generate and manage human resources reports
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className='btn-primary'
            >
              Generate Report
            </button>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {reports.map(report => (
            <div
              key={report.id}
              className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'
            >
              <div className='flex items-center justify-between mb-3'>
                <h3 className='font-medium text-gray-900'>{report.title}</h3>
                <span
                  className={`status-badge ${
                    report.status === 'COMPLETED'
                      ? 'status-completed'
                      : report.status === 'PROCESSING'
                        ? 'status-pending'
                        : 'status-rejected'
                  }`}
                >
                  {report.status}
                </span>
              </div>

              <p className='text-sm text-gray-600 mb-3'>{report.description}</p>

              <div className='space-y-2 mb-4'>
                <div className='flex items-center text-xs text-gray-500'>
                  <span className='font-medium'>Type:</span>
                  <span className='ml-1'>
                    {reportTypes.find(t => t.id === report.reportType)?.name}
                  </span>
                </div>
                <div className='flex items-center text-xs text-gray-500'>
                  <span className='font-medium'>Format:</span>
                  <span className='ml-1'>{report.format}</span>
                </div>
                <div className='flex items-center text-xs text-gray-500'>
                  <span className='font-medium'>Created:</span>
                  <span className='ml-1'>
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className='flex space-x-2'>
                {report.status === 'COMPLETED' && (
                  <button
                    onClick={() => generateReport(report.id)}
                    className='btn-primary text-xs'
                  >
                    Download
                  </button>
                )}
                <button
                  onClick={() => {
                    // Handle edit
                  }}
                  className='btn-secondary text-xs'
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (
                      confirm('Are you sure you want to delete this report?')
                    ) {
                      // Handle delete
                    }
                  }}
                  className='btn-danger text-xs'
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {reports.length === 0 && (
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
              No HR reports generated
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              Get started by generating your first HR report.
            </p>
          </div>
        )}
      </div>

      {/* Create Report Form Modal */}
      {showCreateForm && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>
              Generate HR Report
            </h2>
            <form onSubmit={handleSubmit} className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='form-label'>Report Title</label>
                  <input
                    type='text'
                    name='title'
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className='form-input'
                    placeholder='e.g., Monthly Staff Attendance'
                  />
                </div>

                <div>
                  <label className='form-label'>Report Type</label>
                  <select
                    name='reportType'
                    value={formData.reportType}
                    onChange={handleChange}
                    required
                    className='form-input'
                  >
                    {reportTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
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
                  rows={3}
                  className='form-input'
                  placeholder='Describe the purpose of this report...'
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div>
                  <label className='form-label'>Start Date</label>
                  <input
                    type='date'
                    value={formData.dateRange.start}
                    onChange={e =>
                      handleDateRangeChange('start', e.target.value)
                    }
                    required
                    className='form-input'
                  />
                </div>

                <div>
                  <label className='form-label'>End Date</label>
                  <input
                    type='date'
                    value={formData.dateRange.end}
                    onChange={e => handleDateRangeChange('end', e.target.value)}
                    required
                    className='form-input'
                  />
                </div>

                <div>
                  <label className='form-label'>Format</label>
                  <select
                    name='format'
                    value={formData.format}
                    onChange={handleChange}
                    required
                    className='form-input'
                  >
                    {formatOptions.map(format => (
                      <option key={format.id} value={format.id}>
                        {format.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className='flex space-x-4'>
                <button
                  type='submit'
                  disabled={isLoading}
                  className='btn-primary disabled:opacity-50'
                >
                  {isLoading ? 'Generating...' : 'Generate Report'}
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
