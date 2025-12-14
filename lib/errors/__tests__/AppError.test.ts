import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  AppError,
  DatabaseError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  ExternalServiceError,
} from '../AppError'

describe('AppError', () => {
  it('should create error with all properties', () => {
    const error = new AppError(
      'Internal error',
      'TEST_ERROR',
      500,
      'User-friendly message',
      { key: 'value' }
    )

    expect(error.name).toBe('AppError')
    expect(error.message).toBe('Internal error')
    expect(error.code).toBe('TEST_ERROR')
    expect(error.statusCode).toBe(500)
    expect(error.userMessage).toBe('User-friendly message')
    expect(error.details).toEqual({ key: 'value' })
  })

  it('should use default statusCode', () => {
    const error = new AppError('Error', 'TEST_ERROR')
    expect(error.statusCode).toBe(500)
  })

  it('should serialize to JSON', () => {
    const error = new AppError('Error', 'TEST_ERROR', 400, 'User message', {
      field: 'value',
    })

    const json = error.toJSON()
    expect(json).toEqual({
      name: 'AppError',
      message: 'Error',
      code: 'TEST_ERROR',
      statusCode: 400,
      userMessage: 'User message',
      details: { field: 'value' },
    })
  })

  describe('toSafeJSON', () => {
    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it('should return full details in development', () => {
      vi.stubEnv('NODE_ENV', 'development')

      const error = new AppError('Internal error', 'TEST_ERROR', 500, 'User message', {
        sensitive: 'data',
      })

      const safe = error.toSafeJSON()
      expect(safe.details).toEqual({ sensitive: 'data' })
      expect(safe.name).toBe('AppError')
    })

    it('should redact details in production', () => {
      vi.stubEnv('NODE_ENV', 'production')

      const error = new AppError('Internal error', 'TEST_ERROR', 500, 'User message', {
        sensitive: 'data',
      })

      const safe = error.toSafeJSON()
      expect(safe.details).toBe('[REDACTED]')
      expect(safe.userMessage).toBe('User message')
      // Internal message should not be included
      expect('message' in safe).toBe(false)
    })

    it('should handle undefined details in production', () => {
      vi.stubEnv('NODE_ENV', 'production')

      const error = new AppError('Internal error', 'TEST_ERROR')
      const safe = error.toSafeJSON()
      expect(safe.details).toBeUndefined()
    })
  })

  it('should have stack trace', () => {
    const error = new AppError('Test', 'TEST_ERROR')
    expect(error.stack).toBeDefined()
    expect(error.stack).toContain('AppError')
  })
})

describe('DatabaseError', () => {
  it('should create database error', () => {
    const originalError = new Error('Connection failed')
    const error = new DatabaseError('Query failed', originalError, { query: 'SELECT *' })

    expect(error.name).toBe('DatabaseError')
    expect(error.code).toBe('DATABASE_ERROR')
    expect(error.statusCode).toBe(500)
    expect(error.userMessage).toBe('A database error occurred. Please try again.')
    expect(error.originalError).toBe(originalError)
    expect(error.details).toEqual({ query: 'SELECT *' })
  })

  it('should work without original error', () => {
    const error = new DatabaseError('Query failed')
    expect(error.originalError).toBeUndefined()
  })
})

describe('ValidationError', () => {
  it('should create validation error with fields', () => {
    const fields = { email: 'Invalid email', name: 'Name is required' }
    const error = new ValidationError('Validation failed', fields, { extra: 'data' })

    expect(error.name).toBe('ValidationError')
    expect(error.code).toBe('VALIDATION_ERROR')
    expect(error.statusCode).toBe(400)
    expect(error.fields).toEqual(fields)
    expect(error.details).toEqual({ extra: 'data', fields })
  })

  it('should use message as userMessage', () => {
    const error = new ValidationError('Invalid input', {})
    expect(error.userMessage).toBe('Invalid input')
  })
})

describe('AuthenticationError', () => {
  it('should create authentication error', () => {
    const error = new AuthenticationError()

    expect(error.name).toBe('AuthenticationError')
    expect(error.code).toBe('AUTHENTICATION_ERROR')
    expect(error.statusCode).toBe(401)
    expect(error.message).toBe('Authentication required')
    expect(error.userMessage).toBe('Please sign in to continue.')
  })

  it('should accept custom message', () => {
    const error = new AuthenticationError('Token expired')
    expect(error.message).toBe('Token expired')
  })
})

describe('AuthorizationError', () => {
  it('should create authorization error', () => {
    const error = new AuthorizationError()

    expect(error.name).toBe('AuthorizationError')
    expect(error.code).toBe('AUTHORIZATION_ERROR')
    expect(error.statusCode).toBe(403)
    expect(error.message).toBe('Insufficient permissions')
    expect(error.userMessage).toBe('You do not have permission to perform this action.')
  })

  it('should accept custom message', () => {
    const error = new AuthorizationError('Admin only')
    expect(error.message).toBe('Admin only')
  })
})

describe('NotFoundError', () => {
  it('should create not found error with default resource', () => {
    const error = new NotFoundError()

    expect(error.name).toBe('NotFoundError')
    expect(error.code).toBe('NOT_FOUND_ERROR')
    expect(error.statusCode).toBe(404)
    expect(error.message).toBe('Resource not found')
    expect(error.userMessage).toBe('The requested resource was not found.')
  })

  it('should accept custom resource name', () => {
    const error = new NotFoundError('Blog Post')
    expect(error.message).toBe('Blog Post not found')
    expect(error.userMessage).toBe('The requested blog post was not found.')
  })
})

describe('RateLimitError', () => {
  it('should create rate limit error', () => {
    const error = new RateLimitError()

    expect(error.name).toBe('RateLimitError')
    expect(error.code).toBe('RATE_LIMIT_ERROR')
    expect(error.statusCode).toBe(429)
    expect(error.message).toBe('Too many requests')
    expect(error.userMessage).toBe('Too many requests. Please try again later.')
  })

  it('should accept custom message', () => {
    const error = new RateLimitError('API limit exceeded', { limit: 100 })
    expect(error.message).toBe('API limit exceeded')
    expect(error.details).toEqual({ limit: 100 })
  })
})

describe('ExternalServiceError', () => {
  it('should create external service error', () => {
    const originalError = new Error('Service unavailable')
    const error = new ExternalServiceError('Stripe', originalError, { attempt: 1 })

    expect(error.name).toBe('ExternalServiceError')
    expect(error.code).toBe('EXTERNAL_SERVICE_ERROR')
    expect(error.statusCode).toBe(502)
    expect(error.message).toBe('Stripe service error')
    expect(error.userMessage).toBe('An external service is currently unavailable. Please try again later.')
    expect(error.originalError).toBe(originalError)
    expect(error.details).toEqual({ attempt: 1 })
  })

  it('should work without original error', () => {
    const error = new ExternalServiceError('PayPal')
    expect(error.originalError).toBeUndefined()
  })
})
