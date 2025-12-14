/**
 * Error Handling Exports
 *
 * Central export point for error handling utilities.
 */

// Error classes
export {
  AppError,
  DatabaseError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  ExternalServiceError,
} from './AppError';

// Error handler hook and boundary
export {
  useErrorHandler,
  ErrorBoundary,
  type ErrorHandlerOptions,
} from './ErrorHandler';
