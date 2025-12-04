/**
 * Distributed rate limiting using Vercel KV
 * Production-ready implementation for serverless environments
 */

import { kv } from '@vercel/kv';
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

  // Create a hash of the user agent to keep the key short
  const userAgentHash = userAgent.substring(0, 20);

  return `${ip}:${userAgentHash}`;
}

/**
 * Apply rate limiting to a request using Vercel KV
 * @param identifier - Unique identifier for the client
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export async function rateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  try {
    const now = Date.now();
    const key = `ratelimit:${identifier}`;
    const windowSeconds = Math.ceil(config.windowMs / 1000);

    // Increment the counter
    const count = await kv.incr(key);

    // Set expiry on first request
    if (count === 1) {
      await kv.expire(key, windowSeconds);
    }

    // Get TTL to calculate reset time
    const ttl = await kv.ttl(key);
    const resetTime = now + (ttl * 1000);

    // Check if limit exceeded
    if (count > config.maxRequests) {
      const retryAfter = Math.ceil(ttl);

      return {
        success: false,
        limit: config.maxRequests,
        remaining: 0,
        reset: resetTime,
        retryAfter,
      };
    }

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - count,
      reset: resetTime,
    };
  } catch (error) {
    console.error('Rate limiting error:', error);

    // Fallback: Allow request if KV is unavailable (fail-open)
    // In production, you might want to fail-closed instead
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: Date.now() + config.windowMs,
    };
  }
}

/**
 * Rate limit middleware wrapper for API routes
 * @param request - Next.js request
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
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
 * Clear rate limit for a specific identifier (for testing)
 */
export async function clearRateLimit(identifier: string): Promise<void> {
  try {
    await kv.del(`ratelimit:${identifier}`);
  } catch (error) {
    console.error('Error clearing rate limit:', error);
  }
}

/**
 * Get current rate limit status for an identifier
 */
export async function getRateLimitStatus(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  try {
    const key = `ratelimit:${identifier}`;
    const count = await kv.get<number>(key) || 0;
    const ttl = await kv.ttl(key);
    const now = Date.now();
    const resetTime = now + (ttl * 1000);

    return {
      success: count < config.maxRequests,
      limit: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - count),
      reset: resetTime,
    };
  } catch (error) {
    console.error('Error getting rate limit status:', error);
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: Date.now() + config.windowMs,
    };
  }
}
