import type { NextRequest } from 'next/server';

/**
 * Extract client IP address from Next.js request
 * Prioritizes x-forwarded-for header (for proxies/load balancers)
 * Falls back to x-real-ip header
 * Returns 'unknown' if no IP can be determined
 *
 * @param req - Next.js request object
 * @returns IP address string or 'unknown'
 */
export function getClientIP(req: NextRequest): string {
  // Check x-forwarded-for header (standard for proxies/load balancers)
  // Format: "client, proxy1, proxy2" - we want the first (original client)
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const ip = forwardedFor.split(',')[0].trim();
    if (ip) return ip;
  }

  // Check x-real-ip header (alternative header used by some proxies)
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  // No IP headers found
  return 'unknown';
}
