import { NextRequest } from 'next/server';

/**
 * Rate limit configuration for different endpoints
 */
export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Custom message when rate limit is exceeded */
  message?: string;
}

/**
 * Default rate limit configurations
 */
export const RATE_LIMITS = {
  // API endpoints
  api: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  contact: { maxRequests: 5, windowMs: 60 * 1000 }, // 5 requests per minute
  comments: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 requests per minute

  // Auth endpoints
  login: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes

  // General endpoints
  strict: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 requests per minute
  moderate: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
} as const;

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * In-memory rate limit store
 *
 * ⚠️ PRODUCTION WARNING ⚠️
 * This in-memory implementation is NOT suitable for production environments with:
 * - Multiple server instances (serverless, load-balanced)
 * - Horizontal scaling requirements
 * - Vercel/Netlify deployments (each invocation has separate memory)
 *
 * Why this is a security concern:
 * - Each server instance maintains its own rate limit state
 * - Attackers can bypass limits by distributing requests across instances
 * - Rate limits reset on server restart/cold starts
 *
 * PRODUCTION SOLUTION:
 * Use Redis or Vercel KV for distributed rate limiting:
 * - Redis: Shared state across all instances
 * - Vercel KV: Built-in Vercel solution with automatic scaling
 * - Upstash: Serverless Redis with REST API
 *
 * Example with Vercel KV:
 * ```typescript
 * import { kv } from '@vercel/kv';
 * const count = await kv.incr(`ratelimit:${identifier}`);
 * await kv.expire(`ratelimit:${identifier}`, windowSeconds);
 * ```
 */
class RateLimitStore {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;
  private warningShown = false;

  constructor() {
    // Show production warning once
    if (process.env.NODE_ENV === 'production' && !this.warningShown) {
      console.warn(
        '⚠️  SECURITY WARNING: In-memory rate limiting is active in production. ' +
        'This is NOT suitable for serverless/multi-instance deployments. ' +
        'Use Redis or Vercel KV for distributed rate limiting. ' +
        'See lib/security/rateLimit.ts for details.'
      );
      this.warningShown = true;
    }

    // Note: setInterval removed as it doesn't work in serverless environments.
    // Cleanup happens inline during get() calls to prevent memory leaks.
    this.cleanupInterval = null as any; // Keep property for compatibility
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now) {
        this.store.delete(key);
      }
    }
  }

  get(key: string): RateLimitEntry | undefined {
    const entry = this.store.get(key);
    if (entry && entry.resetTime < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry;
  }

  set(key: string, value: RateLimitEntry): void {
    this.store.set(key, value);
  }

  clear(): void {
    this.store.clear();
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

// Global rate limit store
const rateLimitStore = new RateLimitStore();

/**
 * Get client identifier from request
 * Uses IP address and User-Agent for more accurate identification
 */
export function getClientIdentifier(request: NextRequest): string {
  // Get IP address from various headers (for proxy/CDN support)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0].trim() || realIp || 'unknown';

  // Include User-Agent for additional uniqueness
  const userAgent = request.headers.get('user-agent') || 'unknown';

  return `${ip}:${userAgent}`;
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

/**
 * Apply rate limiting to a request
 * @param identifier - Unique identifier for the client
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = `${identifier}`;

  const entry = rateLimitStore.get(key);

  if (!entry) {
    // First request in window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: now + config.windowMs,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: entry.resetTime,
      retryAfter,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - entry.count,
    reset: entry.resetTime,
  };
}

/**
 * Rate limit middleware wrapper for API routes
 * @param request - Next.js request
 * @param config - Rate limit configuration
 * @returns Rate limit result or null if passed
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): RateLimitResult {
  const identifier = getClientIdentifier(request);
  return rateLimit(identifier, config);
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(result: RateLimitResult): HeadersInit {
  const headers: HeadersInit = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString(),
  };

  if (result.retryAfter) {
    headers['Retry-After'] = result.retryAfter.toString();
  }

  return headers;
}

/**
 * Clear rate limit for testing
 */
export function clearRateLimits(): void {
  rateLimitStore.clear();
}

/**
 * Destroy rate limit store (for cleanup)
 */
export function destroyRateLimitStore(): void {
  rateLimitStore.destroy();
}
