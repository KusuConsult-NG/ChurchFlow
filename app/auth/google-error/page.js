'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function GoogleAuthErrorPage() {
  const [retryAfter, setRetryAfter] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    // Check if there's a retry-after value in the URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const retryAfterParam = urlParams.get('retryAfter');
    
    if (retryAfterParam) {
      const retrySeconds = parseInt(retryAfterParam);
      setRetryAfter(retrySeconds);
      setTimeLeft(retrySeconds);
      
      // Start countdown timer
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} and ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
    }
    return `${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Too Many Authentication Attempts
          </h1>
          
          <p className="text-gray-600 mb-6">
            You've exceeded the maximum number of Google authentication attempts. This is a security measure to prevent abuse.
          </p>

          {timeLeft !== null && timeLeft > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-yellow-800 mb-2">Please Wait</h3>
              <p className="text-sm text-yellow-700">
                You can try again in: <strong>{formatTime(timeLeft)}</strong>
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-800 mb-2">Why This Happened</h3>
            <ul className="text-sm text-blue-700 text-left space-y-1">
              <li>• Multiple rapid login attempts</li>
              <li>• Invalid or expired Google credentials</li>
              <li>• Google OAuth quota limits</li>
              <li>• Security protection against abuse</li>
            </ul>
          </div>

          <div className="space-y-3">
            {timeLeft === 0 && (
              <Link 
                href="/auth/login" 
                className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Google Login Again
              </Link>
            )}
            
            <Link 
              href="/auth/login" 
              className="block w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Use Email Login Instead
            </Link>
            
            <Link 
              href="/" 
              className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
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
