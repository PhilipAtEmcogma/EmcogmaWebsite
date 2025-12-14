/**
 * Security headers configuration
 * Implements OWASP security best practices
 */

import { getCSP, getFallbackCSP } from './csp';

/**
 * Content Security Policy (CSP)
 * Prevents XSS and other code injection attacks
 *
 * This now supports nonce-based CSP for stronger security.
 * Enable nonces by setting NEXT_PUBLIC_CSP_NONCE_ENABLED=true
 *
 * @deprecated Use getSecurityHeaders() or getSecurityHeadersWithNonce() instead
 */
export function getContentSecurityPolicy(): string {
  return getFallbackCSP();
}

/**
 * Get all security headers with optional nonce for CSP
 */
export function getSecurityHeaders(nonce?: string): HeadersInit {
  return {
    // Content Security Policy (nonce-based if nonce provided)
    'Content-Security-Policy': getCSP(nonce),

    // Strict Transport Security (HSTS)
    // Force HTTPS for 2 years, including subdomains
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',

    // X-Frame-Options: Prevent clickjacking
    'X-Frame-Options': 'DENY',

    // X-Content-Type-Options: Prevent MIME sniffing
    'X-Content-Type-Options': 'nosniff',

    // X-XSS-Protection: Enable XSS filter (legacy browsers)
    'X-XSS-Protection': '1; mode=block',

    // Referrer Policy: Control referrer information
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions Policy: Restrict browser features
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',

    // Cross-Origin policies
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',

    // Remove server information
    'X-Powered-By': '',
  };
}

/**
 * Get permissive security headers for API routes
 * Less strict CSP for API endpoints
 */
export function getApiSecurityHeaders(): HeadersInit {
  // CORS origin must be explicitly set, never use wildcard in production
  const allowedOrigin = process.env.NEXT_PUBLIC_SITE_URL;

  if (!allowedOrigin && process.env.NODE_ENV === 'production') {
    throw new Error(
      'SECURITY ERROR: NEXT_PUBLIC_SITE_URL must be set in production. ' +
      'Wildcard CORS (*) is not allowed for security reasons. ' +
      'Set NEXT_PUBLIC_SITE_URL to your production domain.'
    );
  }

  return {
    // Basic security headers
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',

    // Remove server information
    'X-Powered-By': '',

    // CORS headers - strict origin enforcement
    // In development, allow localhost; in production, require explicit origin
    'Access-Control-Allow-Origin': allowedOrigin || 'http://localhost:3000',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Security headers for development environment
 * More permissive for local development
 */
export function getDevSecurityHeaders(): HeadersInit {
  const devCsp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: http:",
    "font-src 'self' data:",
    "connect-src 'self' https: ws: wss:",
    "frame-src 'self' https:",
  ].join('; ');

  return {
    'Content-Security-Policy': devCsp,
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
  };
}

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(
  headers: Headers,
  isDev: boolean = process.env.NODE_ENV === 'development'
): void {
  const securityHeaders = isDev ? getDevSecurityHeaders() : getSecurityHeaders();

  Object.entries(securityHeaders).forEach(([key, value]) => {
    if (value) {
      headers.set(key, value);
    } else {
      headers.delete(key);
    }
  });
}

/**
 * Create response with security headers
 */
export function createSecureResponse(
  body: BodyInit | null,
  init?: ResponseInit,
  isDev: boolean = process.env.NODE_ENV === 'development'
): Response {
  const response = new Response(body, init);
  applySecurityHeaders(response.headers, isDev);
  return response;
}

/**
 * Security headers middleware helper
 */
export function addSecurityHeaders(response: Response): Response {
  const securityHeaders = getSecurityHeaders();

  Object.entries(securityHeaders).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value);
    }
  });

  return response;
}
