// tests/components/ErrorBoundary.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { ErrorBoundary } from '../../components/ui/ErrorBoundary.js';

// Test component that throws an error
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Test component for error boundary
const TestApp = ({ shouldThrow }) => (
  <ErrorBoundary>
    <ThrowError shouldThrow={shouldThrow} />
  </ErrorBoundary>
);

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test('should render children when there is no error', () => {
    render(<TestApp shouldThrow={false} />);

    expect(screen.getByText('No error')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  test('should render error UI when there is an error', () => {
    render(<TestApp shouldThrow={true} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText('An unexpected error occurred. Please try again.')
    ).toBeInTheDocument();
    expect(screen.queryByText('No error')).not.toBeInTheDocument();
  });

  test('should show retry button when there is an error', () => {
    render(<TestApp shouldThrow={true} />);

    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
  });

  test('should call onRetry when retry button is clicked', () => {
    const onRetry = jest.fn();

    render(
      <ErrorBoundary onRetry={onRetry}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('should reset error state when retry is called', () => {
    const { rerender } = render(<TestApp shouldThrow={true} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Rerender without error
    rerender(<TestApp shouldThrow={false} />);

    expect(screen.getByText('No error')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  test('should render custom error message when provided', () => {
    const customMessage = 'Custom error message';

    render(
      <ErrorBoundary errorMessage={customMessage}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(customMessage)).toBeInTheDocument();
    expect(
      screen.queryByText('An unexpected error occurred. Please try again.')
    ).not.toBeInTheDocument();
  });

  test('should render custom fallback component when provided', () => {
    const CustomFallback = ({ error, retry }) => (
      <div>
        <h2>Custom Error</h2>
        <p>Error: {error.message}</p>
        <button onClick={retry}>Custom Retry</button>
      </div>
    );

    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    expect(screen.getByText('Error: Test error')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /custom retry/i })
    ).toBeInTheDocument();
  });

  test('should call onError callback when error occurs', () => {
    const onError = jest.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Test error'
      }),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });

  test('should handle multiple errors', () => {
    const { rerender } = render(<TestApp shouldThrow={true} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Rerender with different error
    rerender(<TestApp shouldThrow={true} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  test('should not render retry button when onRetry is not provided', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(
      screen.queryByRole('button', { name: /try again/i })
    ).not.toBeInTheDocument();
  });

  test('should render with default props', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText('An unexpected error occurred. Please try again.')
    ).toBeInTheDocument();
  });
});




