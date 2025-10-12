// components/ui/ErrorBoundary.js
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50'>
          <div className='max-w-md w-full bg-white shadow-lg rounded-lg p-6'>
            <div className='flex items-center mb-4'>
              <ExclamationTriangleIcon className='h-8 w-8 text-red-500 mr-3' />
              <h2 className='text-lg font-semibold text-gray-900'>
                Something went wrong
              </h2>
            </div>

            <p className='text-gray-600 mb-4'>
              We're sorry, but something unexpected happened. Please try
              refreshing the page.
            </p>

            <div className='flex space-x-3'>
              <button
                onClick={() => window.location.reload()}
                className='flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors'
              >
                Refresh Page
              </button>
              <button
                onClick={() =>
                  this.setState({
                    hasError: false,
                    error: null,
                    errorInfo: null
                  })
                }
                className='flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors'
              >
                Try Again
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className='mt-4'>
                <summary className='cursor-pointer text-sm text-gray-500'>
                  Error Details (Development)
                </summary>
                <pre className='mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto'>
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Error message component
export const ErrorMessage = ({
  error,
  onRetry,
  title = 'Error',
  className = ''
}) => {
  if (!error) return null;

  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}
    >
      <div className='flex'>
        <ExclamationTriangleIcon className='h-5 w-5 text-red-400 mr-3 mt-0.5' />
        <div className='flex-1'>
          <h3 className='text-sm font-medium text-red-800'>{title}</h3>
          <div className='mt-2 text-sm text-red-700'>
            <p>{error.message || error}</p>
          </div>
          {onRetry && (
            <div className='mt-3'>
              <button
                onClick={onRetry}
                className='text-sm bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200 transition-colors'
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Success message component
export const SuccessMessage = ({
  message,
  onDismiss,
  title = 'Success',
  className = ''
}) => {
  if (!message) return null;

  return (
    <div
      className={`bg-green-50 border border-green-200 rounded-md p-4 ${className}`}
    >
      <div className='flex'>
        <div className='flex-shrink-0'>
          <svg
            className='h-5 w-5 text-green-400'
            viewBox='0 0 20 20'
            fill='currentColor'
          >
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
              clipRule='evenodd'
            />
          </svg>
        </div>
        <div className='ml-3 flex-1'>
          <h3 className='text-sm font-medium text-green-800'>{title}</h3>
          <div className='mt-2 text-sm text-green-700'>
            <p>{message}</p>
          </div>
        </div>
        {onDismiss && (
          <div className='ml-auto pl-3'>
            <button
              onClick={onDismiss}
              className='text-green-400 hover:text-green-600'
            >
              <span className='sr-only'>Dismiss</span>
              <svg className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
                <path
                  fillRule='evenodd'
                  d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                  clipRule='evenodd'
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Toast notification hook
export const useToast = () => {
  const [toasts, setToasts] = React.useState([]);

  const addToast = toast => {
    const id = Date.now().toString();
    const newToast = { id, ...toast };
    setToasts(prev => [...prev, newToast]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = id => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = message => addToast({ type: 'success', message });
  const error = message => addToast({ type: 'error', message });
  const info = message => addToast({ type: 'info', message });
  const warning = message => addToast({ type: 'warning', message });

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning
  };
};

// Toast container component
export const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className='fixed top-4 right-4 z-50 space-y-2'>
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 ${
            toast.type === 'success'
              ? 'border-l-4 border-green-400'
              : toast.type === 'error'
                ? 'border-l-4 border-red-400'
                : toast.type === 'warning'
                  ? 'border-l-4 border-yellow-400'
                  : 'border-l-4 border-blue-400'
          }`}
        >
          <div className='p-4'>
            <div className='flex items-start'>
              <div className='flex-shrink-0'>
                {toast.type === 'success' && (
                  <svg
                    className='h-5 w-5 text-green-400'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                      clipRule='evenodd'
                    />
                  </svg>
                )}
                {toast.type === 'error' && (
                  <ExclamationTriangleIcon className='h-5 w-5 text-red-400' />
                )}
                {toast.type === 'warning' && (
                  <svg
                    className='h-5 w-5 text-yellow-400'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                      clipRule='evenodd'
                    />
                  </svg>
                )}
                {toast.type === 'info' && (
                  <svg
                    className='h-5 w-5 text-blue-400'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                      clipRule='evenodd'
                    />
                  </svg>
                )}
              </div>
              <div className='ml-3 w-0 flex-1 pt-0.5'>
                <p className='text-sm font-medium text-gray-900'>
                  {toast.message}
                </p>
              </div>
              <div className='ml-4 flex-shrink-0 flex'>
                <button
                  onClick={() => onRemove(toast.id)}
                  className='bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                >
                  <span className='sr-only'>Close</span>
                  <svg
                    className='h-5 w-5'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                      clipRule='evenodd'
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};




