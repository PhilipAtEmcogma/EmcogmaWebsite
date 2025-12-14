/**
 * Application Error Classes
 *
 * Custom error types for better error handling and debugging.
 */

/**
 * Base Application Error
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public userMessage?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      userMessage: this.userMessage,
      details: this.details,
    };
  }

  /**
   * Safe version for logging that redacts sensitive data in production
   */
  toSafeJSON() {
    // In development, return full details for debugging
    if (process.env.NODE_ENV === 'development') {
      return this.toJSON();
    }

    // In production, redact details to prevent sensitive data exposure
    return {
      name: this.name,
      code: this.code,
      statusCode: this.statusCode,
      // Only include userMessage, not the internal message
      userMessage: this.userMessage,
      // Redact details in production logs
      details: this.details ? '[REDACTED]' : undefined,
    };
  }
}

/**
 * Database Error
 */
export class DatabaseError extends AppError {
  constructor(
    message: string,
    public originalError?: any,
    details?: Record<string, any>
  ) {
    super(
      message,
      'DATABASE_ERROR',
      500,
      'A database error occurred. Please try again.',
      details
    );
    this.name = 'DatabaseError';
  }
}

/**
 * Validation Error
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public fields: Record<string, string>,
    details?: Record<string, any>
  ) {
    super(message, 'VALIDATION_ERROR', 400, message, { ...details, fields });
    this.name = 'ValidationError';
  }
}

/**
 * Authentication Error
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', details?: Record<string, any>) {
    super(message, 'AUTHENTICATION_ERROR', 401, 'Please sign in to continue.', details);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', details?: Record<string, any>) {
    super(
      message,
      'AUTHORIZATION_ERROR',
      403,
      'You do not have permission to perform this action.',
      details
    );
    this.name = 'AuthorizationError';
  }
}

/**
 * Not Found Error
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', details?: Record<string, any>) {
    super(
      `${resource} not found`,
      'NOT_FOUND_ERROR',
      404,
      `The requested ${resource.toLowerCase()} was not found.`,
      details
    );
    this.name = 'NotFoundError';
  }
}

/**
 * Rate Limit Error
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests', details?: Record<string, any>) {
    super(
      message,
      'RATE_LIMIT_ERROR',
      429,
      'Too many requests. Please try again later.',
      details
    );
    this.name = 'RateLimitError';
  }
}

/**
 * External Service Error
 */
export class ExternalServiceError extends AppError {
  constructor(
    serviceName: string,
    public originalError?: any,
    details?: Record<string, any>
  ) {
    super(
      `${serviceName} service error`,
      'EXTERNAL_SERVICE_ERROR',
      502,
      'An external service is currently unavailable. Please try again later.',
      details
    );
    this.name = 'ExternalServiceError';
  }
}
