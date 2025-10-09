// components/ui/LoadingSpinner.js
import React from 'react';

export const LoadingSpinner = ({
  size = 'md',
  color = 'primary',
  text = '',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-600',
    green: 'text-green-600',
    red: 'text-red-600'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`}
      >
        <svg className='w-full h-full' fill='none' viewBox='0 0 24 24'>
          <circle
            className='opacity-25'
            cx='12'
            cy='12'
            r='10'
            stroke='currentColor'
            strokeWidth='4'
          />
          <path
            className='opacity-75'
            fill='currentColor'
            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
          />
        </svg>
      </div>
      {text && <p className={`mt-2 text-sm ${colorClasses[color]}`}>{text}</p>}
    </div>
  );
};

// Loading overlay component
export const LoadingOverlay = ({
  isLoading,
  text = 'Loading...',
  children
}) => {
  if (!isLoading) return children;

  return (
    <div className='relative'>
      {children}
      <div className='absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50'>
        <LoadingSpinner size='lg' text={text} />
      </div>
    </div>
  );
};

// Skeleton loader components
export const SkeletonCard = () => (
  <div className='bg-white rounded-lg shadow-md p-6 animate-pulse'>
    <div className='h-4 bg-gray-200 rounded w-3/4 mb-4'></div>
    <div className='h-3 bg-gray-200 rounded w-1/2 mb-2'></div>
    <div className='h-3 bg-gray-200 rounded w-2/3'></div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className='bg-white rounded-lg shadow-md overflow-hidden animate-pulse'>
    <div className='px-6 py-4 border-b border-gray-200'>
      <div className='h-4 bg-gray-200 rounded w-1/4'></div>
    </div>
    <div className='divide-y divide-gray-200'>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className='px-6 py-4'>
          <div className='flex space-x-4'>
            <div className='h-4 bg-gray-200 rounded w-1/4'></div>
            <div className='h-4 bg-gray-200 rounded w-1/3'></div>
            <div className='h-4 bg-gray-200 rounded w-1/6'></div>
            <div className='h-4 bg-gray-200 rounded w-1/6'></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonList = ({ items = 3 }) => (
  <div className='space-y-4 animate-pulse'>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className='flex items-center space-x-4'>
        <div className='w-10 h-10 bg-gray-200 rounded-full'></div>
        <div className='flex-1'>
          <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
          <div className='h-3 bg-gray-200 rounded w-1/2'></div>
        </div>
      </div>
    ))}
  </div>
);


