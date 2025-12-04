/**
 * Distributed CSRF protection using Vercel KV
 * Production-ready implementation for serverless environments
 */

import { kv } from '@vercel/kv';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

/**
 * CSRF configuration
 */
export interface CsrfConfig {
  /** Token expiry time in seconds (default: 1 hour) */
  expirySeconds?: number;
  /** Paths to exclude from CSRF validation */
  excludePaths?: string[];
}

/**
 * Default CSRF configuration
 */
const DEFAULT_CONFIG: CsrfConfig = {
  expirySeconds: 3600, // 1 hour
  excludePaths: ['/api/auth/'],
};

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Get or create session ID from request
 */
export function getSessionId(request: NextRequest): string {
  // Try to get session ID from cookie
  const sessionCookie = request.cookies.get('session_id');
  if (sessionCookie?.value) {
    return sessionCookie.value;
  }

  // Fallback: Create a temporary session ID based on IP and User-Agent
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
              request.headers.get('x-real-ip') ||
              'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  return crypto
    .createHash('sha256')
    .update(`${ip}:${userAgent}`)
    .digest('hex')
    .substring(0, 32);
}

/**
 * Create and store a CSRF token for a session
 */
export async function createCsrfToken(
  sessionId: string,
  config: CsrfConfig = DEFAULT_CONFIG
): Promise<string> {
  try {
    const token = generateCsrfToken();
    const key = `csrf:${sessionId}`;
    const expirySeconds = config.expirySeconds || DEFAULT_CONFIG.expirySeconds!;

    // Store token in Vercel KV with expiry
    await kv.set(key, token, { ex: expirySeconds });

    return token;
  } catch (error) {
    console.error('Error creating CSRF token:', error);
    // Fallback: Generate token without storage (less secure but functional)
    return generateCsrfToken();
  }
}

/**
 * Validate CSRF token against stored token
 */
export async function validateCsrfToken(
  sessionId: string,
  token: string
): Promise<boolean> {
  try {
    const key = `csrf:${sessionId}`;
    const storedToken = await kv.get<string>(key);

    if (!storedToken) {
      return false;
    }

    // Timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(storedToken),
      Buffer.from(token)
    );
  } catch (error) {
    console.error('Error validating CSRF token:', error);
    return false;
  }
}

/**
 * Extract CSRF token from request
 */
export function extractCsrfToken(request: NextRequest, body?: any): string | null {
  // Check header first (recommended)
  const headerToken = request.headers.get('X-CSRF-Token');
  if (headerToken) {
    return headerToken;
  }

  // Check body
  if (body && typeof body === 'object' && body.csrfToken) {
    return body.csrfToken;
  }

  return null;
}

/**
 * Check if path should be excluded from CSRF validation
 */
export function shouldExcludePath(
  path: string,
  config: CsrfConfig = DEFAULT_CONFIG
): boolean {
  const excludePaths = config.excludePaths || DEFAULT_CONFIG.excludePaths || [];
  return excludePaths.some(excludePath => path.startsWith(excludePath));
}

/**
 * Validate CSRF token from request
 */
export async function validateCsrfRequest(
  request: NextRequest,
  body?: any,
  config: CsrfConfig = DEFAULT_CONFIG
): Promise<boolean> {
  // Skip validation for excluded paths
  if (shouldExcludePath(request.nextUrl.pathname, config)) {
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
export async function clearCsrfToken(sessionId: string): Promise<void> {
  try {
    const key = `csrf:${sessionId}`;
    await kv.del(key);
  } catch (error) {
    console.error('Error clearing CSRF token:', error);
  }
}

/**
 * Get or create CSRF token for a session
 */
export async function getOrCreateCsrfToken(
  sessionId: string,
  config: CsrfConfig = DEFAULT_CONFIG
): Promise<string> {
  try {
    const key = `csrf:${sessionId}`;
    const existingToken = await kv.get<string>(key);

    if (existingToken) {
      return existingToken;
    }

    // Create new token if none exists
    return createCsrfToken(sessionId, config);
  } catch (error) {
    console.error('Error getting or creating CSRF token:', error);
    return generateCsrfToken();
  }
}

/**
 * Refresh CSRF token expiry
 */
export async function refreshCsrfToken(
  sessionId: string,
  config: CsrfConfig = DEFAULT_CONFIG
): Promise<void> {
  try {
    const key = `csrf:${sessionId}`;
    const token = await kv.get<string>(key);

    if (token) {
      const expirySeconds = config.expirySeconds || DEFAULT_CONFIG.expirySeconds!;
      await kv.expire(key, expirySeconds);
    }
  } catch (error) {
    console.error('Error refreshing CSRF token:', error);
  }
}
