/**
 * Centralized security utilities
 * Import all security features from one place
 */

// Rate limiting
export {
  type RateLimitConfig,
  type RateLimitResult,
  RATE_LIMITS,
  getClientIdentifier,
  rateLimit,
  checkRateLimit,
  createRateLimitHeaders,
  clearRateLimits,
  destroyRateLimitStore,
} from './rateLimit';

// Input validation and sanitization
export {
  sanitizeHtml,
  escapeHtml,
  validateEmail,
  validateUrl,
  validateLength,
  sanitizeInput,
  validateSlug,
  sanitizeMarkdown,
  validateBodySize,
  detectSqlInjection,
  validateComment,
  validateContactForm,
  type ValidationResult,
} from './validation';

// CSRF protection
export {
  generateCsrfToken,
  createCsrfToken,
  validateCsrfToken,
  getSessionId,
  extractCsrfToken,
  validateCsrfRequest,
  clearCsrfToken,
  getOrCreateCsrfToken,
  shouldExcludePath,
  type CsrfConfig,
} from './csrf';

// Security headers
export {
  getContentSecurityPolicy,
  getSecurityHeaders,
  getApiSecurityHeaders,
  getDevSecurityHeaders,
  applySecurityHeaders,
  createSecureResponse,
  addSecurityHeaders,
} from './headers';

// Security logging
export {
  SecurityEventType,
  SecuritySeverity,
  logSecurityEvent,
  getRequestContext,
  getSecurityLogger,
  SecurityLog,
  type SecurityEvent,
} from './logger';

/**
 * Complete security check for API routes
 * Combines rate limiting, CSRF, and input validation
 */
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, createRateLimitHeaders, type RateLimitConfig } from './rateLimit';
import { validateCsrfRequest } from './csrf';
import { getRequestContext, SecurityLog } from './logger';

export interface SecurityCheckOptions {
  rateLimit?: RateLimitConfig;
  requireCsrf?: boolean;
  validateBody?: boolean;
  maxBodySize?: number;
}

export interface SecurityCheckResult {
  passed: boolean;
  response?: NextResponse;
  error?: string;
}

/**
 * Perform comprehensive security check on request
 */
export async function performSecurityCheck(
  request: NextRequest,
  options: SecurityCheckOptions = {}
): Promise<SecurityCheckResult> {
  const context = getRequestContext(request);

  // Check rate limit
  if (options.rateLimit) {
    const rateLimitResult = checkRateLimit(request, options.rateLimit);

    if (!rateLimitResult.success) {
      SecurityLog.rateLimitExceeded(context, rateLimitResult.limit);

      return {
        passed: false,
        response: NextResponse.json(
          {
            error: 'Too many requests. Please try again later.',
            retryAfter: rateLimitResult.retryAfter,
          },
          {
            status: 429,
            headers: createRateLimitHeaders(rateLimitResult),
          }
        ),
      };
    }
  }

  // Check CSRF token for non-GET requests
  if (options.requireCsrf && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    try {
      const body = await request.clone().json();
      const isValidCsrf = validateCsrfRequest(request, body);

      if (!isValidCsrf) {
        SecurityLog.csrfTokenInvalid(context);

        return {
          passed: false,
          response: NextResponse.json(
            { error: 'Invalid or missing CSRF token' },
            { status: 403 }
          ),
        };
      }
    } catch {
      SecurityLog.csrfTokenMissing(context);

      return {
        passed: false,
        response: NextResponse.json(
          { error: 'Invalid request format' },
          { status: 400 }
        ),
      };
    }
  }

  // Validate body size
  if (options.validateBody && options.maxBodySize) {
    try {
      const body = await request.clone().json();
      const bodyString = JSON.stringify(body);
      const sizeBytes = new Blob([bodyString]).size;

      if (sizeBytes > options.maxBodySize) {
        SecurityLog.suspiciousRequest(context, `Large payload: ${sizeBytes} bytes`);

        return {
          passed: false,
          response: NextResponse.json(
            { error: 'Request payload too large' },
            { status: 413 }
          ),
        };
      }
    } catch {
      return {
        passed: false,
        response: NextResponse.json(
          { error: 'Invalid request body' },
          { status: 400 }
        ),
      };
    }
  }

  return { passed: true };
}

/**
 * Create a secure API response with headers and logging
 */
export function createSecureApiResponse(
  data: unknown,
  status: number = 200,
  additionalHeaders?: HeadersInit
): NextResponse {
  const response = NextResponse.json(data, { status });

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'no-referrer');

  // Add additional headers if provided
  if (additionalHeaders) {
    Object.entries(additionalHeaders).forEach(([key, value]) => {
      if (typeof value === 'string') {
        response.headers.set(key, value);
      }
    });
  }

  return response;
}
