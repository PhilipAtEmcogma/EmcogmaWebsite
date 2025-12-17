import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { checkEdgeRateLimit, getEdgeRateLimitConfig } from '@/lib/security/edgeRateLimit';

/**
 * Next.js 16 middleware with Edge Runtime support
 * Performs ultra-fast rate limiting at CDN edge before serverless execution
 */
export async function proxy(request: NextRequest) {
  // Edge rate limiting (runs at CDN layer for <5ms latency)
  const edgeConfig = getEdgeRateLimitConfig(request.nextUrl.pathname);

  if (edgeConfig) {
    const { blocked, remaining } = await checkEdgeRateLimit(request, edgeConfig);

    if (blocked) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Too many requests. Please slow down.',
          retryAfter: edgeConfig.windowSeconds,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': edgeConfig.windowSeconds.toString(),
            'X-RateLimit-Limit': edgeConfig.maxRequests.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
          },
        }
      );
    }
  }

  // Continue to serverless layer for full session/auth checks
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
  // Edge Runtime for ultra-fast execution at CDN layer
  // Note: Some Node.js APIs unavailable in Edge (crypto.randomBytes, fs, etc.)
  // Session validation still runs in serverless layer
  runtime: 'experimental-edge',
};
