/**
 * Edge Runtime-compatible rate limiting
 * Ultra-fast rate limiting checks at Vercel Edge (CDN layer)
 * Falls back to serverless rate limiting for complex checks
 */

import { NextRequest } from 'next/server';

/**
 * Edge-compatible rate limit configuration
 */
export interface EdgeRateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

/**
 * Quick rate limit check at edge
 * Returns true if request should be blocked
 *
 * Note: This performs a lightweight check at the edge.
 * For distributed state, it still calls Vercel KV which is edge-compatible.
 */
export async function checkEdgeRateLimit(
  request: NextRequest,
  config: EdgeRateLimitConfig
): Promise<{ blocked: boolean; remaining: number }> {
  try {
    // Edge runtime has access to KV
    const { kv } = await import('@vercel/kv');

    // Get client identifier
    const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const key = `edge-rl:${ip}`;

    // Atomic increment with expiry
    const count = await kv.incr(key);

    // Set expiry on first request
    if (count === 1) {
      await kv.expire(key, config.windowSeconds);
    }

    const blocked = count > config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - count);

    return { blocked, remaining };
  } catch (error) {
    // If KV unavailable at edge, allow request (fail-open for availability)
    // Serverless layer will perform full rate limiting
    console.error('Edge rate limit check failed:', error);
    return { blocked: false, remaining: 0 };
  }
}

/**
 * Edge runtime configurations for different routes
 */
export const EDGE_RATE_LIMITS = {
  // Very aggressive limits at edge to stop attacks early
  api: { maxRequests: 200, windowSeconds: 60 }, // 200/min at edge, 100/min at serverless
  contact: { maxRequests: 10, windowSeconds: 60 }, // 10/min at edge, 5/min at serverless
  comments: { maxRequests: 20, windowSeconds: 60 }, // 20/min at edge, 10/min at serverless
  login: { maxRequests: 10, windowSeconds: 900 }, // 10/15min at edge, 5/15min at serverless
} as const;

/**
 * Get edge rate limit config for a path
 */
export function getEdgeRateLimitConfig(pathname: string): EdgeRateLimitConfig | null {
  if (pathname.startsWith('/api/contact')) return EDGE_RATE_LIMITS.contact;
  if (pathname.startsWith('/api/comments')) return EDGE_RATE_LIMITS.comments;
  if (pathname.startsWith('/api/auth')) return EDGE_RATE_LIMITS.login;
  if (pathname.startsWith('/api/')) return EDGE_RATE_LIMITS.api;

  return null; // No edge rate limiting for this route
}
