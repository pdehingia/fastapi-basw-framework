/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { UI_MESSAGES, AUTH_MESSAGES } from '@/constants/messages';

interface ErrorBoundaryProps {
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  children: ReactNode;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0;
  private maxRetries = 3;
  private retryTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error details:', errorInfo);

    // Store error info in state
    this.setState({
      errorInfo,
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Auto-retry for certain types of errors
    if (this.shouldAutoRetry(error)) {
      this.scheduleRetry();
    }

    // Report to error tracking service (e.g., Sentry)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset error state when reset keys change
    if (hasError && resetKeys && prevProps.resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== prevProps.resetKeys![index]
      );
      
      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }

    // Reset on any prop change if enabled
    if (hasError && resetOnPropsChange && prevProps !== this.props) {
      this.resetErrorBoundary();
    }
  }

  private shouldAutoRetry = (error: Error): boolean => {
    // Auto-retry for network errors and chunk load errors
    return (
      this.retryCount < this.maxRetries &&
      (error.message.includes('chunk') ||
       error.message.includes('network') ||
       error.message.includes('fetch'))
    );
  };

  private scheduleRetry = () => {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    // Exponential backoff: 1s, 2s, 4s
    const delay = Math.pow(2, this.retryCount) * 1000;
    
    this.retryTimeoutId = setTimeout(() => {
      this.retryCount++;
      this.resetErrorBoundary();
    }, delay);
  };

  private resetErrorBoundary = () => {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = null;
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleRetry = () => {
    this.retryCount = 0;
    this.resetErrorBoundary();
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    const { hasError, error } = this.state;
    const { fallback: FallbackComponent, children } = this.props;

    if (hasError && error) {
      // Render custom fallback UI if provided
      if (FallbackComponent) {
        return <FallbackComponent error={error} retry={this.handleRetry} />;
      }

      // Default fallback UI
      return <DefaultErrorFallback error={error} retry={this.handleRetry} />;
    }

    return children;
  }
}

// Default Error Fallback Component
interface DefaultErrorFallbackProps {
  error: Error;
  retry: () => void;
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({ error, retry }) => {
  const getErrorMessage = (error: Error): string => {
    if (error.message.includes('chunk')) {
      return 'Application update detected. Please refresh the page.';
    }
    
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return UI_MESSAGES.ERROR.NETWORK;
    }

    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      return AUTH_MESSAGES.LOGIN.SESSION_EXPIRED;
    }

    return UI_MESSAGES.ERROR.GENERIC;
  };

  const getErrorTitle = (error: Error): string => {
    if (error.message.includes('chunk')) {
      return 'Update Available';
    }
    
    return 'Something went wrong';
  };

  const showErrorDetails = import.meta.env.MODE === 'development';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {getErrorTitle(error)}
          </h1>
          <p className="text-gray-600">
            {getErrorMessage(error)}
          </p>
        </div>

        {showErrorDetails && (
          <div className="mb-6 p-4 bg-gray-50 rounded-md text-left">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Error Details:
            </h3>
            <pre className="text-xs text-gray-700 overflow-auto">
              {error.message}
            </pre>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={retry}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {UI_MESSAGES.ACTIONS.REFRESH}
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for error boundary
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
};

export default ErrorBoundary;