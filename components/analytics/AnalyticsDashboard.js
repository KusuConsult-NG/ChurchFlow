// components/analytics/AnalyticsDashboard.js
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

import { analyticsUtils } from '../../lib/analytics.js';

// Mock data generator for demonstration
const generateMockData = (days = 30) => {
  const data = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(now, i);
    data.push({
      date: format(date, 'MMM dd'),
      fullDate: date,
      pageViews: Math.floor(Math.random() * 100) + 50,
      users: Math.floor(Math.random() * 50) + 20,
      sessions: Math.floor(Math.random() * 60) + 30,
      events: Math.floor(Math.random() * 200) + 100,
      conversions: Math.floor(Math.random() * 10) + 2
    });
  }

  return data;
};

// Analytics dashboard component
export const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from the API
      // const response = await fetch(`/api/analytics/data?timeRange=${timeRange}`);
      // const result = await response.json();

      // For demo purposes, use mock data
      const mockData = generateMockData(parseInt(timeRange.replace('d', '')));
      setData(mockData);

      // Calculate metrics
      const calculatedMetrics = analyticsUtils.calculateMetrics(mockData);
      setMetrics(calculatedMetrics);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            Analytics Dashboard
          </h1>
          <p className='text-gray-600'>
            Track your church's digital engagement
          </p>
        </div>

        <select
          value={timeRange}
          onChange={e => setTimeRange(e.target.value)}
          className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
        >
          {timeRangeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Key Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center'>
            <div className='p-2 bg-blue-100 rounded-lg'>
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
                  d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                />
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>
                Total Page Views
              </p>
              <p className='text-2xl font-semibold text-gray-900'>
                {data
                  .reduce((sum, day) => sum + day.pageViews, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
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
                  d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Unique Users</p>
              <p className='text-2xl font-semibold text-gray-900'>
                {data.reduce((sum, day) => sum + day.users, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center'>
            <div className='p-2 bg-yellow-100 rounded-lg'>
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
                  d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Sessions</p>
              <p className='text-2xl font-semibold text-gray-900'>
                {data
                  .reduce((sum, day) => sum + day.sessions, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
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
              <p className='text-sm font-medium text-gray-600'>
                Conversion Rate
              </p>
              <p className='text-2xl font-semibold text-gray-900'>
                {(
                  (data.reduce((sum, day) => sum + day.conversions, 0) /
                    data.reduce((sum, day) => sum + day.users, 0)) *
                  100
                ).toFixed(1)}
                %
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Page Views Over Time */}
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Page Views Over Time
          </h3>
          <ResponsiveContainer width='100%' height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='date' />
              <YAxis />
              <Tooltip />
              <Area
                type='monotone'
                dataKey='pageViews'
                stroke='#3B82F6'
                fill='#3B82F6'
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* User Engagement */}
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            User Engagement
          </h3>
          <ResponsiveContainer width='100%' height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='date' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type='monotone'
                dataKey='users'
                stroke='#10B981'
                strokeWidth={2}
              />
              <Line
                type='monotone'
                dataKey='sessions'
                stroke='#F59E0B'
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Event Types Distribution */}
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Event Types Distribution
          </h3>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Page Views', value: 45 },
                  { name: 'User Actions', value: 25 },
                  { name: 'Events', value: 15 },
                  { name: 'Conversions', value: 10 },
                  { name: 'Other', value: 5 }
                ]}
                cx='50%'
                cy='50%'
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill='#8884d8'
                dataKey='value'
              >
                {[0, 1, 2, 3, 4].map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Pages */}
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Top Pages
          </h3>
          <div className='space-y-3'>
            {[
              { page: '/dashboard', views: 1250, percentage: 35 },
              { page: '/events', views: 890, percentage: 25 },
              { page: '/members', views: 720, percentage: 20 },
              { page: '/announcements', views: 540, percentage: 15 },
              { page: '/reports', views: 180, percentage: 5 }
            ].map((item, index) => (
              <div key={index} className='flex items-center justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center justify-between mb-1'>
                    <span className='text-sm font-medium text-gray-900'>
                      {item.page}
                    </span>
                    <span className='text-sm text-gray-500'>
                      {item.views.toLocaleString()}
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-blue-600 h-2 rounded-full'
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Activity */}
      <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Recent Activity
        </h3>
        <div className='space-y-3'>
          {[
            {
              user: 'John Doe',
              action: 'Viewed dashboard',
              time: '2 minutes ago'
            },
            {
              user: 'Jane Smith',
              action: 'Created new event',
              time: '5 minutes ago'
            },
            {
              user: 'Mike Johnson',
              action: 'Updated member profile',
              time: '8 minutes ago'
            },
            {
              user: 'Sarah Wilson',
              action: 'Sent announcement',
              time: '12 minutes ago'
            },
            {
              user: 'David Brown',
              action: 'Generated report',
              time: '15 minutes ago'
            }
          ].map((activity, index) => (
            <div
              key={index}
              className='flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0'
            >
              <div className='flex items-center'>
                <div className='w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center'>
                  <span className='text-sm font-medium text-gray-600'>
                    {activity.user
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </span>
                </div>
                <div className='ml-3'>
                  <p className='text-sm font-medium text-gray-900'>
                    {activity.user}
                  </p>
                  <p className='text-sm text-gray-500'>{activity.action}</p>
                </div>
              </div>
              <span className='text-sm text-gray-500'>{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};




