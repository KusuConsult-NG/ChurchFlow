'use client';

import { useEffect, useState } from 'react';

export default function AuthenticatedLayout({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }, []);

  return (
    <div className='flex h-screen bg-gray-50'>
      {/* Left Sidebar */}
      <div className='hidden md:flex md:w-64 md:flex-col'>
        <div className='flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-200'>
          {/* Logo */}
          <div className='flex items-center flex-shrink-0 px-4 mb-8'>
            <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
              <svg
                className='w-5 h-5 text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                />
              </svg>
            </div>
            <span className='ml-3 text-xl font-bold text-gray-900'>
              ChurchFlow
            </span>
          </div>

          {/* Navigation */}
          <nav className='mt-5 flex-1 px-2 space-y-1'>
            <a
              href='/dashboard'
              className='group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            >
              <svg className='mr-3 h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' />
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z' />
              </svg>
              Dashboard
            </a>
            <a
              href='/announcements'
              className='group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            >
              <svg className='mr-3 h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' />
              </svg>
              Announcements
            </a>
            <a
              href='/giving'
              className='group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            >
              <svg className='mr-3 h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1' />
              </svg>
              Giving
            </a>
            <a
              href='/members'
              className='group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            >
              <svg className='mr-3 h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' />
              </svg>
              Members
            </a>
            <a
              href='/events'
              className='group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            >
              <svg className='mr-3 h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
              </svg>
              Events
            </a>
            <a
              href='/attendance'
              className='group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            >
              <svg className='mr-3 h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' />
              </svg>
              Attendance
            </a>
            <a
              href='/fund-transfer'
              className='group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            >
              <svg className='mr-3 h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' />
              </svg>
              Fund Transfer
            </a>
            <a
              href='/financial-reports'
              className='group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            >
              <svg className='mr-3 h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
              </svg>
              Reports
            </a>
          </nav>

          {/* User Profile Section */}
          <div className='flex-shrink-0 flex border-t border-gray-200 p-4'>
            <div className='flex items-center'>
              <div className='ml-3'>
                <p className='text-sm font-medium text-gray-700 group-hover:text-gray-900'>
                  {user?.name || 'User'}
                </p>
                <p className='text-xs font-medium text-gray-500 group-hover:text-gray-700'>
                  {user?.role || 'Member'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex flex-col flex-1 overflow-hidden'>
        {/* Top Navigation */}
        <header className='bg-white shadow-sm border-b border-gray-200'>
          <div className='flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16'>
            <div className='flex items-center'>
              <button
                type='button'
                className='md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500'
              >
                <span className='sr-only'>Open sidebar</span>
                <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
                </svg>
              </button>
              <h1 className='ml-2 text-lg font-semibold text-gray-900'>
                ChurchFlow
              </h1>
            </div>

            <div className='flex items-center space-x-4'>
              <button
                type='button'
                className='p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <span className='sr-only'>View notifications</span>
                <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828z' />
                </svg>
              </button>
              <div className='relative'>
                <button
                  type='button'
                  className='flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <span className='sr-only'>Open user menu</span>
                  <div className='h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center'>
                    <span className='text-sm font-medium text-white'>
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className='flex-1 overflow-y-auto'>
          {children}
        </main>
      </div>
    </div>
  );
}
