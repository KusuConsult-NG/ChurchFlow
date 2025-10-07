'use client';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function ExecutiveFinancialAnalytics() {
  const { data: session } = useSession();
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => { // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(
        `/api/analytics/financial?start=${dateRange.start}&end=${dateRange.end}`
      );
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      // console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <main className='p-6'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-gray-600'>Loading financial analytics...</div>
        </div>
      </main>
    );
  }

  return (
    <main className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Executive Financial Analytics</h1>
        <div className='flex items-center space-x-4'>
          <div className='flex items-center space-x-2'>
            <label className='text-sm font-medium text-gray-700'>From:</label>
            <input
              type='date'
              value={dateRange.start}
              onChange={e => handleDateRangeChange('start', e.target.value)}
              className='h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div className='flex items-center space-x-2'>
            <label className='text-sm font-medium text-gray-700'>To:</label>
            <input
              type='date'
              value={dateRange.end}
              onChange={e => handleDateRangeChange('end', e.target.value)}
              className='h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <div className='bg-white border border-gray-200 rounded-lg p-6'>
          <div className='flex items-center'>
            <div className='p-2 bg-green-100 rounded-lg'>
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
                  d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Total Revenue</p>
              <p className='text-2xl font-semibold text-gray-900'>
                ${analytics?.totalRevenue?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white border border-gray-200 rounded-lg p-6'>
          <div className='flex items-center'>
            <div className='p-2 bg-red-100 rounded-lg'>
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
                  d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>
                Total Expenses
              </p>
              <p className='text-2xl font-semibold text-gray-900'>
                ${analytics?.totalExpenses?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white border border-gray-200 rounded-lg p-6'>
          <div className='flex items-center'>
            <div
              className={`p-2 rounded-lg ${(analytics?.netIncome || 0) >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}
            >
              <svg
                className={`w-6 h-6 ${(analytics?.netIncome || 0) >= 0 ? 'text-blue-600' : 'text-orange-600'}`}
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
              <p className='text-sm font-medium text-gray-600'>Net Income</p>
              <p
                className={`text-2xl font-semibold ${(analytics?.netIncome || 0) >= 0 ? 'text-gray-900' : 'text-orange-600'}`}
              >
                ${analytics?.netIncome?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white border border-gray-200 rounded-lg p-6'>
          <div className='flex items-center'>
            <div className='p-2 bg-purple-100 rounded-lg'>
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
                  d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Growth Rate</p>
              <p className='text-2xl font-semibold text-gray-900'>
                {analytics?.growthRate?.toFixed(1) || '0'}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue vs Expenses Chart */}
      <div className='bg-white border border-gray-200 rounded-lg p-6'>
        <h2 className='text-xl font-semibold text-gray-900 mb-4'>
          Revenue vs Expenses Trend
        </h2>
        <div className='h-64 flex items-center justify-center bg-gray-50 rounded-lg'>
          <div className='text-gray-500'>Chart visualization would go here</div>
        </div>
      </div>

      {/* Income Source Analysis */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white border border-gray-200 rounded-lg p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>
            Income Sources
          </h2>
          <div className='space-y-3'>
            {analytics?.incomeSources?.map((source, index) => (
              <div key={index} className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <div
                    className={`w-4 h-4 rounded-full bg-${['blue', 'green', 'yellow', 'purple', 'red'][index % 5]}-500`}
                  ></div>
                  <span className='text-sm font-medium text-gray-900'>
                    {source.name}
                  </span>
                </div>
                <div className='text-right'>
                  <div className='text-sm font-medium text-gray-900'>
                    ${source.amount.toLocaleString()}
                  </div>
                  <div className='text-xs text-gray-500'>
                    {source.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='bg-white border border-gray-200 rounded-lg p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>
            Expense Categories
          </h2>
          <div className='space-y-3'>
            {analytics?.expenseCategories?.map((category, index) => (
              <div key={index} className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <div
                    className={`w-4 h-4 rounded-full bg-${['blue', 'green', 'yellow', 'purple', 'red'][index % 5]}-500`}
                  ></div>
                  <span className='text-sm font-medium text-gray-900'>
                    {category.name}
                  </span>
                </div>
                <div className='text-right'>
                  <div className='text-sm font-medium text-gray-900'>
                    ${category.amount.toLocaleString()}
                  </div>
                  <div className='text-xs text-gray-500'>
                    {category.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Health Indicators */}
      <div className='bg-white border border-gray-200 rounded-lg p-6'>
        <h2 className='text-xl font-semibold text-gray-900 mb-4'>
          Financial Health Indicators
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-gray-900 mb-1'>
              {analytics?.liquidityRatio?.toFixed(2) || '0.00'}
            </div>
            <div className='text-sm text-gray-600'>Liquidity Ratio</div>
            <div className='text-xs text-gray-500'>
              Current Assets / Current Liabilities
            </div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-gray-900 mb-1'>
              {analytics?.debtToEquityRatio?.toFixed(2) || '0.00'}
            </div>
            <div className='text-sm text-gray-600'>Debt-to-Equity Ratio</div>
            <div className='text-xs text-gray-500'>
              Total Debt / Total Equity
            </div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-gray-900 mb-1'>
              {analytics?.operatingMargin?.toFixed(1) || '0.0'}%
            </div>
            <div className='text-sm text-gray-600'>Operating Margin</div>
            <div className='text-xs text-gray-500'>
              Operating Income / Revenue
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
        <h2 className='text-xl font-semibold text-blue-900 mb-4'>
          Financial Recommendations
        </h2>
        <div className='space-y-2'>
          {analytics?.recommendations?.map((recommendation, index) => (
            <div key={index} className='flex items-start space-x-2'>
              <div className='w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0'></div>
              <p className='text-blue-800 text-sm'>{recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
