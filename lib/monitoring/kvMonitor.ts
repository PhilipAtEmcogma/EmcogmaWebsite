/**
 * Vercel KV health monitoring and statistics
 * Tracks KV performance, availability, and usage
 */

import { kv } from '@vercel/kv';

export interface KVHealthStatus {
  healthy: boolean;
  latency: number;
  lastCheck: Date;
  error?: string;
}

export interface KVStats {
  totalKeys?: number;
  storageUsed?: number;
  hitRate?: number;
  uptime?: number;
}

/**
 * Check KV health with latency measurement
 */
export async function checkKvHealth(): Promise<KVHealthStatus> {
  const startTime = Date.now();

  try {
    // Perform a simple ping operation
    await kv.set('health-check', Date.now(), { ex: 10 });
    const value = await kv.get('health-check');

    const latency = Date.now() - startTime;

    // Alert if latency is too high
    if (latency > 100) {
      console.warn(`⚠️ KV high latency detected: ${latency}ms`);
    }

    return {
      healthy: value !== null,
      latency,
      lastCheck: new Date(),
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error('❌ KV health check failed:', errorMessage);

    return {
      healthy: false,
      latency,
      lastCheck: new Date(),
      error: errorMessage,
    };
  }
}

/**
 * Monitor KV health continuously
 * Call this periodically (e.g., in middleware, API routes)
 */
export async function monitorKvHealth(): Promise<boolean> {
  const health = await checkKvHealth();

  if (!health.healthy) {
    // Critical: KV is down
    console.error('🚨 CRITICAL: Vercel KV unavailable', {
      error: health.error,
      timestamp: health.lastCheck.toISOString(),
    });

    // In production, trigger alert to ops team
    if (process.env.NODE_ENV === 'production') {
      // Send to monitoring service (Sentry, PagerDuty, etc.)
      // await triggerAlert('kv_unavailable', health);
    }

    return false;
  }

  if (health.latency > 100) {
    // Warning: KV is slow
    console.warn('⚠️ WARNING: Vercel KV high latency', {
      latency: `${health.latency}ms`,
      threshold: '100ms',
      timestamp: health.lastCheck.toISOString(),
    });
  }

  return true;
}

/**
 * Get KV usage statistics
 * Note: Vercel KV doesn't expose all metrics via SDK
 * These are approximations based on our usage
 */
export async function getKvStats(): Promise<KVStats> {
  try {
    // Get approximate key count by scanning known prefixes
    const prefixes = [
      'rate-limit:',
      'edge-rl:',
      'csrf:',
      'violations:',
      'blocked:',
      'login-attempts:',
      'login-lock:',
      'event-count:',
    ];

    let totalKeys = 0;

    // This is an approximation - KV doesn't provide exact counts
    for (const prefix of prefixes) {
      try {
        // Use SCAN to count keys with this prefix
        // Note: This is expensive in production - use sparingly
        const keys = await kv.keys(`${prefix}*`);
        totalKeys += keys.length;
      } catch (error) {
        console.error(`Failed to count keys for prefix ${prefix}:`, error);
      }
    }

    return {
      totalKeys,
      // Storage size not available via SDK
      storageUsed: undefined,
      // Hit rate not available via SDK
      hitRate: undefined,
      // Uptime not available via SDK
      uptime: undefined,
    };
  } catch (error) {
    console.error('Error getting KV stats:', error);
    return {};
  }
}

/**
 * Clean up expired or orphaned KV keys
 * Call this periodically via cron job or admin endpoint
 */
export async function cleanupKvKeys(): Promise<{
  deleted: number;
  errors: number;
}> {
  let deleted = 0;
  let errors = 0;

  try {
    // Health check keys
    const healthKeys = await kv.keys('health-check*');
    for (const key of healthKeys) {
      try {
        await kv.del(key);
        deleted++;
      } catch (error) {
        console.error(`Failed to delete key ${key}:`, error);
        errors++;
      }
    }

    console.log(`KV cleanup complete: ${deleted} keys deleted, ${errors} errors`);
  } catch (error) {
    console.error('KV cleanup failed:', error);
    errors++;
  }

  return { deleted, errors };
}

/**
 * Export KV metrics for monitoring dashboard
 */
export async function exportKvMetrics(): Promise<{
  health: KVHealthStatus;
  stats: KVStats;
}> {
  const [health, stats] = await Promise.all([
    checkKvHealth(),
    getKvStats(),
  ]);

  return {
    health,
    stats,
  };
}

/**
 * Integration helper for middleware
 * Lightweight health check that doesn't impact performance
 */
export async function quickKvCheck(): Promise<boolean> {
  try {
    const startTime = Date.now();
    await kv.get('health-check');
    const latency = Date.now() - startTime;

    // Only log if there's an issue
    if (latency > 200) {
      console.warn(`KV slow response: ${latency}ms`);
    }

    return true;
  } catch (error) {
    console.error('KV unavailable, using fallback');
    return false;
  }
}

/**
 * Get KV connection info (for debugging)
 */
export function getKvConnectionInfo(): {
  configured: boolean;
  url?: string;
} {
  const hasUrl = !!process.env.KV_REST_API_URL;
  const hasToken = !!process.env.KV_REST_API_TOKEN;

  return {
    configured: hasUrl && hasToken,
    url: hasUrl ? process.env.KV_REST_API_URL?.split('@')[1] : undefined,
  };
}
