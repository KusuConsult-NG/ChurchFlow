'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function DataExport() {
  const { data: session } = useSession();
  const [exportJobs, setExportJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportConfig, setExportConfig] = useState({
    dataTypes: [],
    format: 'CSV',
    dateRange: {
      start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    includeArchived: false
  });

  useEffect(() => {
    fetchExportJobs();
  }, []);

  const fetchExportJobs = async () => {
    try {
      const response = await fetch('/api/data-export');
      const data = await response.json();
      setExportJobs(data.jobs || []);
    } catch (error) {
      console.error('Error fetching export jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (exportConfig.dataTypes.length === 0) {
      alert('Please select at least one data type to export');
      return;
    }

    setIsExporting(true);
    try {
      const response = await fetch('/api/data-export/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportConfig),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `churchflow-export-${new Date().toISOString().split('T')[0]}.${exportConfig.format.toLowerCase()}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        fetchExportJobs();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to export data');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDataTypeChange = (dataType) => {
    setExportConfig(prev => ({
      ...prev,
      dataTypes: prev.dataTypes.includes(dataType)
        ? prev.dataTypes.filter(type => type !== dataType)
        : [...prev.dataTypes, dataType]
    }));
  };

  const dataTypes = [
    { id: 'members', name: 'Members', description: 'Member information and contact details' },
    { id: 'transactions', name: 'Transactions', description: 'Financial transactions and records' },
    { id: 'events', name: 'Events', description: 'Church events and activities' },
    { id: 'attendance', name: 'Attendance', description: 'Attendance records and statistics' },
    { id: 'announcements', name: 'Announcements', description: 'Church announcements and communications' },
    { id: 'projects', name: 'Projects', description: 'Ministry projects and initiatives' },
    { id: 'requisitions', name: 'Requisitions', description: 'Expense requisitions and approvals' },
    { id: 'accounts', name: 'Accounts', description: 'Account books and financial accounts' }
  ];

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading export options...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Data Export & Backup</h1>
        <p className="mt-2 text-gray-600">Export and backup your church data</p>
      </div>

      {/* Export Configuration */}
      <div className="card mb-8">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">Export Configuration</h2>
          <p className="text-gray-600">Select data types and configure export settings</p>
        </div>

        <div className="space-y-6">
          {/* Data Types Selection */}
          <div>
            <label className="form-label">Select Data Types</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {dataTypes.map((dataType) => (
                <label key={dataType.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportConfig.dataTypes.includes(dataType.id)}
                    onChange={() => handleDataTypeChange(dataType.id)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{dataType.name}</div>
                    <div className="text-sm text-gray-500">{dataType.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Export Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="form-label">Export Format</label>
              <select
                value={exportConfig.format}
                onChange={(e) => setExportConfig({...exportConfig, format: e.target.value})}
                className="form-input"
              >
                <option value="CSV">CSV (Comma Separated Values)</option>
                <option value="XLSX">Excel (XLSX)</option>
                <option value="JSON">JSON</option>
                <option value="PDF">PDF Report</option>
              </select>
            </div>

            <div>
              <label className="form-label">Start Date</label>
              <input
                type="date"
                value={exportConfig.dateRange.start}
                onChange={(e) => setExportConfig({
                  ...exportConfig,
                  dateRange: {...exportConfig.dateRange, start: e.target.value}
                })}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">End Date</label>
              <input
                type="date"
                value={exportConfig.dateRange.end}
                onChange={(e) => setExportConfig({
                  ...exportConfig,
                  dateRange: {...exportConfig.dateRange, end: e.target.value}
                })}
                className="form-input"
              />
            </div>
          </div>

          {/* Additional Options */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeArchived"
              checked={exportConfig.includeArchived}
              onChange={(e) => setExportConfig({...exportConfig, includeArchived: e.target.checked})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="includeArchived" className="ml-2 block text-sm text-gray-900">
              Include archived records
            </label>
          </div>

          {/* Export Actions */}
          <div className="flex space-x-4">
            <button
              onClick={handleExport}
              disabled={isExporting || exportConfig.dataTypes.length === 0}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? 'Exporting...' : 'Export Data'}
            </button>
            <button
              onClick={() => {
                setExportConfig({
                  dataTypes: [],
                  format: 'CSV',
                  dateRange: {
                    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
                    end: new Date().toISOString().split('T')[0]
                  },
                  includeArchived: false
                });
              }}
              className="btn-secondary"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Export History */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">Export History</h2>
          <p className="text-gray-600">Previously generated exports</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Types
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Format
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Generated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {exportJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {job.dataTypes.map(type => dataTypes.find(dt => dt.id === type)?.name).join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.format}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(job.startDate).toLocaleDateString()} - {new Date(job.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`status-badge ${
                      job.status === 'COMPLETED' ? 'status-completed' :
                      job.status === 'PROCESSING' ? 'status-pending' :
                      'status-rejected'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {job.status === 'COMPLETED' && (
                        <a
                          href={`/api/data-export/${job.id}/download`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Download
                        </a>
                      )}
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this export job?')) {
                            // Handle delete
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {exportJobs.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No exports generated</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first data export.</p>
          </div>
        )}
      </div>
    </main>
  );
}
