'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error) => {
    switch (error) {
    case 'Configuration':
      return 'There is a problem with the server configuration. Please contact support.';
    case 'AccessDenied':
      return 'Access denied. You do not have permission to sign in.';
    case 'Verification':
      return 'The verification token has expired or has already been used.';
    case 'Default':
      return 'An error occurred during authentication. Please try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
    }
  };

  const getErrorTitle = (error) => {
    switch (error) {
    case 'Configuration':
      return 'Configuration Error';
    case 'AccessDenied':
      return 'Access Denied';
    case 'Verification':
      return 'Verification Error';
    case 'Default':
      return 'Authentication Error';
    default:
      return 'Error';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {getErrorTitle(error)}
          </h1>
          
          <p className="text-gray-600 mb-6">
            {getErrorMessage(error)}
          </p>

          {error && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Error Details:</h3>
              <p className="text-sm text-gray-600 font-mono">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <Link 
              href="/auth/login" 
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </Link>
            
            <Link 
              href="/" 
              className="block w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go Home
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Need help?</p>
            <div className="space-y-2">
              <Link 
                href="/health" 
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Check System Status
              </Link>
              <br />
              <a 
                href="mailto:support@churchflow.com" 
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
