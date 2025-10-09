'use client';

import { usePathname } from 'next/navigation';

import { useAuth } from '../context/AuthContext';

export default function AuthGuard({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/signup',
    '/auth/error',
    '/health',
    '/test-sms'
  ];

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated and trying to access protected route
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return children;
}

