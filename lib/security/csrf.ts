import { NextRequest } from 'next/server';
import { randomBytes, createHash } from 'crypto';

/**
 * CSRF (Cross-Site Request Forgery) Protection
 * Generates and validates tokens to prevent CSRF attacks
 */

const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

interface CsrfToken {
  token: string;
  expiresAt: number;
}

// In-memory token store (use Redis in production for distributed systems)
const tokenStore = new Map<string, CsrfToken>();

/**
 * Generate a cryptographically secure random token
 */
export function generateCsrfToken(): string {
  return randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Create a CSRF token with expiry
 */
export function createCsrfToken(sessionId: string): string {
  const token = generateCsrfToken();
  const expiresAt = Date.now() + CSRF_TOKEN_EXPIRY;

  tokenStore.set(sessionId, { token, expiresAt });

  // Cleanup expired tokens
  cleanupExpiredTokens();

  return token;
}

/**
 * Validate CSRF token
 */
export function validateCsrfToken(sessionId: string, token: string): boolean {
  const stored = tokenStore.get(sessionId);

  if (!stored) {
    return false;
  }

  // Check if token expired
  if (stored.expiresAt < Date.now()) {
    tokenStore.delete(sessionId);
    return false;
  }

  // Use constant-time comparison to prevent timing attacks
  return timingSafeEqual(stored.token, token);
}

/**
 * Timing-safe string comparison
 * Prevents timing attacks by comparing all characters
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Cleanup expired tokens
 */
function cleanupExpiredTokens(): void {
  const now = Date.now();
  for (const [sessionId, token] of tokenStore.entries()) {
    if (token.expiresAt < now) {
      tokenStore.delete(sessionId);
    }
  }
}

/**
 * Get session ID from request
 * Uses cookies or generates a temporary identifier
 */
export function getSessionId(request: NextRequest): string {
  // Try to get session from Supabase auth cookie
  const authCookie = request.cookies.get('sb-access-token');
  if (authCookie) {
    return createHash('sha256').update(authCookie.value).digest('hex');
  }

  // Fallback: Use IP + User-Agent as session identifier
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0].trim() || realIp || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  return createHash('sha256').update(`${ip}:${userAgent}`).digest('hex');
}

/**
 * Extract CSRF token from request
 * Checks headers and body
 */
export function extractCsrfToken(request: NextRequest, body?: { csrfToken?: string }): string | null {
  // Check header first
  const headerToken = request.headers.get('x-csrf-token');
  if (headerToken) {
    return headerToken;
  }

  // Check body
  if (body?.csrfToken) {
    return body.csrfToken;
  }

  return null;
}

/**
 * Validate CSRF for a request
 */
export function validateCsrfRequest(request: NextRequest, body?: { csrfToken?: string }): boolean {
  // Skip CSRF for GET, HEAD, OPTIONS (safe methods)
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return true;
  }

  const sessionId = getSessionId(request);
  const token = extractCsrfToken(request, body);

  if (!token) {
    return false;
  }

  return validateCsrfToken(sessionId, token);
}

/**
 * Clear CSRF token for a session
 */
export function clearCsrfToken(sessionId: string): void {
  tokenStore.delete(sessionId);
}

/**
 * Get or create CSRF token for a session
 */
export function getOrCreateCsrfToken(sessionId: string): string {
  const stored = tokenStore.get(sessionId);

  if (stored && stored.expiresAt > Date.now()) {
    return stored.token;
  }

  return createCsrfToken(sessionId);
}

/**
 * CSRF protection configuration
 */
export interface CsrfConfig {
  /** Paths to exclude from CSRF protection */
  excludePaths?: string[];
  /** Custom error message */
  errorMessage?: string;
}

/**
 * Check if path should be excluded from CSRF protection
 */
export function shouldExcludePath(path: string, excludePaths: string[] = []): boolean {
  return excludePaths.some((excluded) => {
    if (excluded.endsWith('*')) {
      const prefix = excluded.slice(0, -1);
      return path.startsWith(prefix);
    }
    return path === excluded;
  });
}
