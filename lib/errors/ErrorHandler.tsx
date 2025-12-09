/**
 * Error Handler Hook
 *
 * Centralized error handling for React components.
 */

'use client';

import { useCallback } from 'react';
import { AppError } from './AppError';

export interface ErrorHandlerOptions {
  onError?: (error: AppError) => void;
  showToast?: (message: string, type: 'error' | 'warning') => void;
  logError?: boolean;
}

/**
 * Hook for handling errors consistently across the application
 *
 * @param options - Configuration options
 * @returns Error handling function
 *
 * @example
 * const { handleError } = useErrorHandler({
 *   showToast: (msg, type) => toast[type](msg),
 * });
 *
 * try {
 *   await doSomething();
 * } catch (error) {
 *   handleError(error);
 * }
 */
export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const {
    onError,
    showToast = (msg) => alert(msg), // Default to alert if no toast provided
    logError = true,
  } = options;

  const handleError = useCallback(
    (error: unknown): AppError => {
      let appError: AppError;

      // Convert to AppError if needed
      if (error instanceof AppError) {
        appError = error;
      } else if (error instanceof Error) {
        appError = new AppError(
          error.message,
          'UNKNOWN_ERROR',
          500,
          'An unexpected error occurred'
        );
      } else {
        appError = new AppError(
          'Unknown error',
          'UNKNOWN_ERROR',
          500,
          'An unexpected error occurred'
        );
      }

      // Log error
      if (logError) {
        console.error('[ErrorHandler]', appError.toJSON());
      }

      // Show user-friendly message
      if (showToast) {
        const type = appError.statusCode >= 500 ? 'error' : 'warning';
        showToast(appError.userMessage || appError.message, type);
      }

      // Call custom error handler
      if (onError) {
        onError(appError);
      }

      return appError;
    },
    [onError, showToast, logError]
  );

  /**
   * Handle async function with automatic error handling
   */
  const handleAsync = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T | null> => {
      try {
        return await fn();
      } catch (error) {
        handleError(error);
        return null;
      }
    },
    [handleError]
  );

  return {
    handleError,
    handleAsync,
  };
}

/**
 * React Error Boundary Component
 */
import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-cyber-dark">
          <div className="max-w-md p-8 bg-cyber-darker border border-red-500/30 rounded-lg text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-400 mb-6">{this.state.error.message}</p>
            <button
              onClick={this.reset}
              className="btn-cyber px-6 py-2 bg-cyber-primary text-cyber-dark"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
