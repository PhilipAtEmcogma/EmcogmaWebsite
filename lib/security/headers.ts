/**
 * Security headers configuration
 * Implements OWASP security best practices
 */

/**
 * Content Security Policy (CSP)
 * Prevents XSS and other code injection attacks
 *
 * ⚠️ SECURITY NOTE ⚠️
 * Current implementation uses 'unsafe-inline' and 'unsafe-eval' for compatibility with:
 * - Next.js runtime and hydration
 * - Tailwind CSS inline styles
 * - Google reCAPTCHA inline scripts
 *
 * These directives weaken XSS protection. For stronger security, consider:
 *
 * 1. NONCE-BASED CSP (Recommended for Next.js 13+):
 *    - Generate unique nonce per request in middleware
 *    - Add nonce to <script> and <style> tags
 *    - Replace 'unsafe-inline' with 'nonce-{random}'
 *
 *    Example implementation:
 *    ```typescript
 *    // In middleware:
 *    const nonce = crypto.randomBytes(16).toString('base64');
 *    request.headers.set('x-nonce', nonce);
 *
 *    // In CSP:
 *    script-src 'self' 'nonce-${nonce}' https://www.google.com
 *
 *    // In pages:
 *    <script nonce={nonce}>...</script>
 *    ```
 *
 * 2. HASH-BASED CSP:
 *    - Calculate SHA-256 hash of inline scripts
 *    - Add 'sha256-{hash}' to script-src
 *    - Works for static inline scripts only
 *
 * See: https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
 */
export function getContentSecurityPolicy(): string {
  const policies = [
    // Default source
    "default-src 'self'",

    // Scripts: Allow self, inline scripts (for Next.js), and trusted CDNs
    // TODO: Replace 'unsafe-inline' with nonce-based CSP for better security
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://www.googletagmanager.com",

    // Styles: Allow self, inline styles (for Tailwind), and Google Fonts
    // TODO: Replace 'unsafe-inline' with nonce-based CSP for better security
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

    // Images: Allow self, data URIs, and common image CDNs
    "img-src 'self' data: https: http:",

    // Fonts: Allow self and Google Fonts
    "font-src 'self' data: https://fonts.gstatic.com",

    // Connect: Allow self, Supabase, and Formspree
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://formspree.io https://www.google.com",

    // Frame: Allow Google reCAPTCHA
    "frame-src 'self' https://www.google.com",

    // Object: Disallow plugins
    "object-src 'none'",

    // Base URI: Restrict to self
    "base-uri 'self'",

    // Form action: Restrict to self and trusted services
    "form-action 'self' https://formspree.io",

    // Frame ancestors: Prevent clickjacking
    "frame-ancestors 'none'",

    // Upgrade insecure requests
    "upgrade-insecure-requests",
  ];

  return policies.join('; ');
}

/**
 * Get all security headers
 */
export function getSecurityHeaders(): HeadersInit {
  return {
    // Content Security Policy
    'Content-Security-Policy': getContentSecurityPolicy(),

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
