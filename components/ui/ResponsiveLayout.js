// components/ui/ResponsiveLayout.js
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';

// Mobile navigation component
export const MobileNavigation = ({ isOpen, onClose, navigation }) => {
  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden ${isOpen ? 'block' : 'hidden'}`}
    >
      <div
        className='fixed inset-0 bg-gray-600 bg-opacity-75'
        onClick={onClose}
      />

      <div className='fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white'>
        <div className='flex h-16 items-center justify-between px-4'>
          <div className='flex items-center'>
            <div className='w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center'>
              <span className='text-white font-bold text-sm'>CF</span>
            </div>
            <span className='ml-2 text-xl font-bold text-gray-900'>
              ChurchFlow
            </span>
          </div>
          <button
            onClick={onClose}
            className='rounded-md p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100'
          >
            <XMarkIcon className='h-6 w-6' />
          </button>
        </div>

        <nav className='flex-1 px-4 py-4 space-y-1'>
          {navigation.map(item => (
            <a
              key={item.name}
              href={item.href}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                item.current
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className='mr-3 h-5 w-5 flex-shrink-0' />
              {item.name}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
};

// Desktop sidebar component
export const DesktopSidebar = ({ navigation }) => {
  return (
    <div className='hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0'>
      <div className='flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto'>
        <div className='flex items-center flex-shrink-0 px-4'>
          <div className='w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center'>
            <span className='text-white font-bold text-sm'>CF</span>
          </div>
          <span className='ml-2 text-xl font-bold text-gray-900'>
            ChurchFlow
          </span>
        </div>

        <nav className='mt-5 flex-grow px-2 space-y-1'>
          {navigation.map(item => (
            <a
              key={item.name}
              href={item.href}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                item.current
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className='mr-3 h-5 w-5 flex-shrink-0' />
              {item.name}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
};

// Top navigation bar component
export const TopNavigation = ({ onMenuClick, user, notifications = [] }) => {
  return (
    <div className='sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8'>
      <button
        type='button'
        className='-m-2.5 p-2.5 text-gray-700 lg:hidden'
        onClick={onMenuClick}
      >
        <span className='sr-only'>Open sidebar</span>
        <Bars3Icon className='h-6 w-6' />
      </button>

      <div className='flex flex-1 gap-x-4 self-stretch lg:gap-x-6'>
        <div className='relative flex flex-1'></div>

        <div className='flex items-center gap-x-4 lg:gap-x-6'>
          {/* Notifications */}
          <button
            type='button'
            className='-m-2.5 p-2.5 text-gray-400 hover:text-gray-500'
          >
            <span className='sr-only'>View notifications</span>
            <BellIcon className='h-6 w-6' />
            {notifications.length > 0 && (
              <span className='absolute -mt-1 -mr-1 h-3 w-3 bg-red-500 rounded-full'></span>
            )}
          </button>

          {/* User menu */}
          <div className='flex items-center gap-x-4 lg:gap-x-6'>
            <div className='hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200' />
            <div className='flex items-center gap-x-2'>
              <div className='h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center'>
                <span className='text-sm font-medium text-gray-700'>
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className='hidden lg:block'>
                <p className='text-sm font-medium text-gray-900'>
                  {user?.name || 'User'}
                </p>
                <p className='text-xs text-gray-500'>
                  {user?.role || 'Member'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main responsive layout component
export const ResponsiveLayout = ({
  children,
  user,
  currentPage = 'Dashboard',
  notifications = []
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      current: currentPage === 'Dashboard'
    },
    {
      name: 'Members',
      href: '/members',
      icon: UserGroupIcon,
      current: currentPage === 'Members'
    },
    {
      name: 'Events',
      href: '/events',
      icon: CalendarIcon,
      current: currentPage === 'Events'
    },
    {
      name: 'Announcements',
      href: '/announcements',
      icon: DocumentTextIcon,
      current: currentPage === 'Announcements'
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: ChartBarIcon,
      current: currentPage === 'Reports'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: CogIcon,
      current: currentPage === 'Settings'
    }
  ];

  return (
    <div className='min-h-screen bg-gray-50'>
      <MobileNavigation
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navigation={navigation}
      />

      <DesktopSidebar navigation={navigation} />

      <div className='lg:pl-64'>
        <TopNavigation
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
          notifications={notifications}
        />

        <main className='py-6'>
          <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// Responsive grid component
export const ResponsiveGrid = ({
  children,
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 6
}) => {
  const gridCols = {
    sm: `grid-cols-${cols.sm}`,
    md: `md:grid-cols-${cols.md}`,
    lg: `lg:grid-cols-${cols.lg}`,
    xl: `xl:grid-cols-${cols.xl}`
  };

  return (
    <div
      className={`grid ${gridCols.sm} ${gridCols.md} ${gridCols.lg} ${gridCols.xl} gap-${gap}`}
    >
      {children}
    </div>
  );
};

// Responsive card component
export const ResponsiveCard = ({
  children,
  className = '',
  padding = 'p-6',
  shadow = 'shadow-sm'
}) => {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 ${shadow} ${padding} ${className}`}
    >
      {children}
    </div>
  );
};

// Responsive table component
export const ResponsiveTable = ({
  headers,
  data,
  className = '',
  mobileView = true
}) => {
  if (mobileView) {
    return (
      <div className='block lg:hidden space-y-4'>
        {data.map((row, index) => (
          <div
            key={index}
            className='bg-white rounded-lg border border-gray-200 p-4'
          >
            {headers.map((header, headerIndex) => (
              <div
                key={headerIndex}
                className='flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0'
              >
                <span className='text-sm font-medium text-gray-500'>
                  {header.label}
                </span>
                <span className='text-sm text-gray-900'>{row[header.key]}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`hidden lg:block overflow-x-auto ${className}`}>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-200'>
          {data.map((row, index) => (
            <tr key={index} className='hover:bg-gray-50'>
              {headers.map((header, headerIndex) => (
                <td
                  key={headerIndex}
                  className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'
                >
                  {row[header.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


