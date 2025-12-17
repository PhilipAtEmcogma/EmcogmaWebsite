/**
 * Graduated abuse response system
 * Escalates mitigation actions based on violation severity
 */

import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import { securityMonitor } from './monitoring';

export type AbuseAction = 'rate-limit' | 'challenge' | 'block' | 'investigate';

export interface AbuseMitigation {
  action: AbuseAction;
  status: number;
  duration?: number; // Duration in seconds
  message: string;
  retryAfter?: number;
}

export interface AbuseContext {
  identifier: string; // IP or email
  violationType: string;
  ip?: string;
  userAgent?: string;
  path?: string;
}

/**
 * Get the number of recent violations for an identifier
 */
async function getViolationCount(identifier: string, windowSeconds: number = 3600): Promise<number> {
  try {
    const key = `violations:${identifier}`;
    const count = (await kv.get<number>(key)) || 0;
    return count;
  } catch (error) {
    console.error('Error getting violation count:', error);
    return 0;
  }
}

/**
 * Record a new violation
 */
async function recordViolation(
  identifier: string,
  violationType: string,
  windowSeconds: number = 3600
): Promise<number> {
  try {
    const key = `violations:${identifier}`;
    const count = await kv.incr(key);

    // Set expiry on first violation
    if (count === 1) {
      await kv.expire(key, windowSeconds);
    }

    // Also track by violation type for analytics
    const typeKey = `violations:${violationType}:${identifier}`;
    await kv.incr(typeKey);
    await kv.expire(typeKey, windowSeconds);

    return count;
  } catch (error) {
    console.error('Error recording violation:', error);
    return 1;
  }
}

/**
 * Block an identifier for a specific duration
 */
async function blockIdentifier(identifier: string, durationSeconds: number): Promise<void> {
  try {
    const blockKey = `blocked:${identifier}`;
    const blockUntil = Date.now() + durationSeconds * 1000;

    await kv.set(blockKey, blockUntil, {
      ex: durationSeconds,
    });
  } catch (error) {
    console.error('Error blocking identifier:', error);
  }
}

/**
 * Check if an identifier is currently blocked
 */
export async function isBlocked(identifier: string): Promise<{ blocked: boolean; until?: Date }> {
  try {
    const blockKey = `blocked:${identifier}`;
    const blockUntil = await kv.get<number>(blockKey);

    if (blockUntil && blockUntil > Date.now()) {
      return {
        blocked: true,
        until: new Date(blockUntil),
      };
    }

    return { blocked: false };
  } catch (error) {
    console.error('Error checking block status:', error);
    return { blocked: false };
  }
}

/**
 * Get appropriate mitigation action based on violation history
 */
export async function getAbuseResponse(
  context: AbuseContext
): Promise<AbuseMitigation> {
  const { identifier, violationType } = context;

  // Check if already blocked
  const blockStatus = await isBlocked(identifier);
  if (blockStatus.blocked) {
    const remainingSeconds = blockStatus.until
      ? Math.ceil((blockStatus.until.getTime() - Date.now()) / 1000)
      : 3600;

    return {
      action: 'block',
      status: 403,
      duration: remainingSeconds,
      message: 'Access blocked due to abuse. Please try again later.',
      retryAfter: remainingSeconds,
    };
  }

  // Record this violation
  const violations = await recordViolation(identifier, violationType);

  // Report to monitoring
  await securityMonitor.reportEvent(
    'abuse_response',
    `Graduated response triggered: ${violationType} (${violations} violations)`,
    violations >= 30 ? 'fatal' : violations >= 10 ? 'error' : 'warning',
    {
      ip: context.ip,
      userAgent: context.userAgent,
      path: context.path,
      metadata: { violations, violationType },
    }
  );

  // Graduated response based on violation count
  if (violations < 3) {
    // Level 1: Rate limit (no impact to user)
    return {
      action: 'rate-limit',
      status: 429,
      message: 'Too many requests. Please slow down.',
      retryAfter: 60,
    };
  } else if (violations < 10) {
    // Level 2: Rate limit + CAPTCHA challenge (would require frontend support)
    // For now, just stricter rate limit
    return {
      action: 'challenge',
      status: 429,
      message: 'Suspicious activity detected. Please verify you are human.',
      retryAfter: 300, // 5 minutes
    };
  } else if (violations < 30) {
    // Level 3: Temporary IP block (5 minutes)
    const duration = 300; // 5 minutes
    await blockIdentifier(identifier, duration);

    return {
      action: 'block',
      status: 403,
      duration,
      message: 'Access temporarily blocked due to abuse. Please try again in 5 minutes.',
      retryAfter: duration,
    };
  } else {
    // Level 4: Extended IP block + investigation (24 hours)
    const duration = 86400; // 24 hours
    await blockIdentifier(identifier, duration);

    // Trigger critical alert for investigation
    await securityMonitor.reportEvent(
      'severe_abuse_detected',
      `Severe abuse pattern detected: ${violationType} (${violations} violations)`,
      'fatal',
      {
        ip: context.ip,
        userAgent: context.userAgent,
        path: context.path,
        metadata: { violations, violationType, identifier },
      }
    );

    return {
      action: 'investigate',
      status: 403,
      duration,
      message: 'Access blocked due to severe abuse. Contact support if you believe this is an error.',
      retryAfter: duration,
    };
  }
}

/**
 * Create a response with graduated mitigation
 */
export function createAbuseResponse(mitigation: AbuseMitigation): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: mitigation.message,
      action: mitigation.action,
      retryAfter: mitigation.retryAfter,
    },
    {
      status: mitigation.status,
      headers: {
        'Retry-After': mitigation.retryAfter?.toString() || '60',
        'X-RateLimit-Reset': mitigation.duration
          ? new Date(Date.now() + mitigation.duration * 1000).toISOString()
          : new Date(Date.now() + 60000).toISOString(),
      },
    }
  );
}

/**
 * Clear violations for an identifier (admin function)
 */
export async function clearViolations(identifier: string): Promise<void> {
  try {
    const violationsKey = `violations:${identifier}`;
    const blockKey = `blocked:${identifier}`;

    await Promise.all([kv.del(violationsKey), kv.del(blockKey)]);

    console.log(`Violations cleared for: ${identifier}`);
  } catch (error) {
    console.error('Error clearing violations:', error);
    throw new Error('Failed to clear violations');
  }
}

/**
 * Get abuse statistics for monitoring
 */
export async function getAbuseStats(identifier: string): Promise<{
  violations: number;
  isBlocked: boolean;
  blockedUntil?: Date;
}> {
  try {
    const violations = await getViolationCount(identifier);
    const blockStatus = await isBlocked(identifier);

    return {
      violations,
      isBlocked: blockStatus.blocked,
      blockedUntil: blockStatus.until,
    };
  } catch (error) {
    console.error('Error getting abuse stats:', error);
    return {
      violations: 0,
      isBlocked: false,
    };
  }
}
