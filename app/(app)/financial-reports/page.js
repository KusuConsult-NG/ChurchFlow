'use client';

import { useState, useEffect } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

export default function FinancialReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedReport, setSelectedReport] = useState('overview');
  const [reportData, setReportData] = useState(null);

  const reportTypes = [
    { id: 'overview', name: 'Financial Overview', description: 'Key financial metrics and trends' },
    { id: 'income', name: 'Income Statement', description: 'Revenue and expense breakdown' },
    { id: 'cashflow', name: 'Cash Flow Statement', description: 'Cash inflows and outflows' },
    { id: 'budget', name: 'Budget vs Actual', description: 'Budget performance analysis' },
    { id: 'balance', name: 'Balance Sheet', description: 'Assets, liabilities, and equity' },
    { id: 'trends', name: 'Financial Trends', description: 'Historical performance analysis' }
  ];

  useEffect(() => {
    fetchReportData();
  }, [selectedReport, dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/financial?start=${dateRange.start}&end=${dateRange.end}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    try {
      const response = await fetch('/api/reports/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedReport,
          format,
          dateRange
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial-report-${selectedReport}-${dateRange.start}-${dateRange.end}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
        <p className="mt-2 text-gray-600">Comprehensive financial analysis and reporting</p>
      </div>

      {/* Report Controls */}
      <div className="card mb-8">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">Report Configuration</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="form-label">Report Type</label>
            <select 
              value={selectedReport} 
              onChange={(e) => setSelectedReport(e.target.value)}
              className="form-input"
            >
              {reportTypes.map(report => (
                <option key={report.id} value={report.id}>
                  {report.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="form-input"
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={() => exportReport('pdf')} className="btn-secondary">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export PDF
          </button>
          <button onClick={() => exportReport('excel')} className="btn-secondary">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Excel
          </button>
        </div>
      </div>

      {/* Financial Overview */}
      {selectedReport === 'overview' && reportData && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="metric-card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.totalRevenue)}</p>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4m16 0l-4-4m4 4l-4 4M4 12l4-4m-4 4l4 4" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.totalExpenses)}</p>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${reportData.netIncome >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
                    <svg className={`w-5 h-5 ${reportData.netIncome >= 0 ? 'text-blue-600' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Net Income</p>
                  <p className={`text-2xl font-bold ${reportData.netIncome >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                    {formatCurrency(reportData.netIncome)}
                  </p>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${reportData.growthRate >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    <svg className={`w-5 h-5 ${reportData.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                  <p className={`text-2xl font-bold ${reportData.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(reportData.growthRate)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Income Sources */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Income Sources</h2>
              <p className="text-gray-600">Revenue breakdown by category</p>
            </div>
            <div className="space-y-4">
              {reportData.incomeSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                    <span className="font-medium text-gray-900">{source.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{formatCurrency(source.amount)}</div>
                    <div className="text-sm text-gray-600">{formatPercentage(source.percentage)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expense Categories */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Expense Categories</h2>
              <p className="text-gray-600">Expense breakdown by category</p>
            </div>
            <div className="space-y-4">
              {reportData.expenseCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{formatCurrency(category.amount)}</div>
                    <div className="text-sm text-gray-600">{formatPercentage(category.percentage)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Health Indicators */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Financial Health Indicators</h2>
              <p className="text-gray-600">Key financial ratios and metrics</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{reportData.liquidityRatio.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Liquidity Ratio</div>
                <div className="text-xs text-gray-500 mt-1">
                  {reportData.liquidityRatio >= 2 ? 'Good' : 'Needs Improvement'}
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{reportData.debtToEquityRatio.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Debt-to-Equity Ratio</div>
                <div className="text-xs text-gray-500 mt-1">
                  {reportData.debtToEquityRatio <= 0.5 ? 'Healthy' : 'Monitor Closely'}
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{formatPercentage(reportData.operatingMargin)}</div>
                <div className="text-sm text-gray-600">Operating Margin</div>
                <div className="text-xs text-gray-500 mt-1">
                  {reportData.operatingMargin >= 10 ? 'Excellent' : 'Needs Review'}
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Financial Recommendations</h2>
              <p className="text-gray-600">Actionable insights for financial improvement</p>
            </div>
            <div className="space-y-3">
              {reportData.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <p className="text-blue-800">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Other Report Types Placeholder */}
      {selectedReport !== 'overview' && (
        <div className="card">
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">{reportTypes.find(r => r.id === selectedReport)?.name}</h3>
            <p className="mt-1 text-sm text-gray-500">{reportTypes.find(r => r.id === selectedReport)?.description}</p>
            <p className="mt-2 text-sm text-gray-400">This report type is under development.</p>
          </div>
        </div>
      )}
    </main>
  );
}
