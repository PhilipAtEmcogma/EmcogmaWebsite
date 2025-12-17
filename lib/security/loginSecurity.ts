/**
 * Account-level brute force protection
 * Tracks failed login attempts per email address
 * Complements IP-based rate limiting with account-level lockout
 */

import { kv } from '@vercel/kv';

export interface LoginAttemptResult {
  canAttempt: boolean;
  attemptsRemaining: number;
  lockedUntil?: Date;
  reason?: string;
}

export interface AccountLockoutConfig {
  maxAttempts: number;
  windowMinutes: number;
  lockoutMinutes: number;
}

/**
 * Default account lockout configuration
 */
const DEFAULT_CONFIG: AccountLockoutConfig = {
  maxAttempts: 10, // 10 failed attempts
  windowMinutes: 60, // Within 1 hour
  lockoutMinutes: 30, // Lock for 30 minutes
};

/**
 * Check if an account can attempt login
 * Tracks failed attempts per email address across all IPs
 */
export async function checkLoginAttempts(
  email: string,
  config: AccountLockoutConfig = DEFAULT_CONFIG
): Promise<LoginAttemptResult> {
  try {
    if (!email) {
      return {
        canAttempt: false,
        attemptsRemaining: 0,
        reason: 'Email required',
      };
    }

    const normalizedEmail = email.toLowerCase().trim();
    const lockKey = `login-lock:${normalizedEmail}`;
    const attemptsKey = `login-attempts:${normalizedEmail}`;

    // Check if account is currently locked
    const lockExpiry = await kv.get<number>(lockKey);
    if (lockExpiry && lockExpiry > Date.now()) {
      return {
        canAttempt: false,
        attemptsRemaining: 0,
        lockedUntil: new Date(lockExpiry),
        reason: 'Account temporarily locked due to too many failed attempts',
      };
    }

    // Check number of recent failed attempts
    const attempts = (await kv.get<number>(attemptsKey)) || 0;
    const remaining = Math.max(0, config.maxAttempts - attempts);

    if (attempts >= config.maxAttempts) {
      // Lock the account
      const lockUntil = Date.now() + config.lockoutMinutes * 60 * 1000;
      await kv.set(lockKey, lockUntil, {
        ex: config.lockoutMinutes * 60,
      });

      // Clear attempts counter (will start fresh after lockout)
      await kv.del(attemptsKey);

      return {
        canAttempt: false,
        attemptsRemaining: 0,
        lockedUntil: new Date(lockUntil),
        reason: `Too many failed attempts. Account locked for ${config.lockoutMinutes} minutes.`,
      };
    }

    return {
      canAttempt: true,
      attemptsRemaining: remaining,
    };
  } catch (error) {
    console.error('Error checking login attempts:', error);
    // Fail-open: allow login if KV unavailable
    // IP-based rate limiting will still protect
    return {
      canAttempt: true,
      attemptsRemaining: DEFAULT_CONFIG.maxAttempts,
    };
  }
}

/**
 * Record a failed login attempt
 * Increments failure counter for the email address
 */
export async function recordFailedAttempt(
  email: string,
  config: AccountLockoutConfig = DEFAULT_CONFIG
): Promise<void> {
  try {
    if (!email) return;

    const normalizedEmail = email.toLowerCase().trim();
    const attemptsKey = `login-attempts:${normalizedEmail}`;

    // Increment attempts counter with expiry
    const attempts = await kv.incr(attemptsKey);

    // Set expiry on first attempt
    if (attempts === 1) {
      await kv.expire(attemptsKey, config.windowMinutes * 60);
    }
  } catch (error) {
    console.error('Error recording failed attempt:', error);
    // Non-critical: continue even if recording fails
  }
}

/**
 * Record a successful login
 * Clears any failed attempt counters for the email
 */
export async function recordSuccessfulLogin(email: string): Promise<void> {
  try {
    if (!email) return;

    const normalizedEmail = email.toLowerCase().trim();
    const attemptsKey = `login-attempts:${normalizedEmail}`;
    const lockKey = `login-lock:${normalizedEmail}`;

    // Clear both attempts and lock
    await Promise.all([kv.del(attemptsKey), kv.del(lockKey)]);
  } catch (error) {
    console.error('Error recording successful login:', error);
    // Non-critical: continue even if recording fails
  }
}

/**
 * Manually unlock an account (admin function)
 * Useful for customer support scenarios
 */
export async function unlockAccount(email: string): Promise<void> {
  try {
    if (!email) return;

    const normalizedEmail = email.toLowerCase().trim();
    const attemptsKey = `login-attempts:${normalizedEmail}`;
    const lockKey = `login-lock:${normalizedEmail}`;

    await Promise.all([kv.del(attemptsKey), kv.del(lockKey)]);

    console.log(`Account unlocked manually: ${normalizedEmail}`);
  } catch (error) {
    console.error('Error unlocking account:', error);
    throw new Error('Failed to unlock account');
  }
}

/**
 * Get account lockout status
 * Useful for showing informative messages to users
 */
export async function getAccountStatus(email: string): Promise<{
  isLocked: boolean;
  failedAttempts: number;
  lockedUntil?: Date;
}> {
  try {
    if (!email) {
      return { isLocked: false, failedAttempts: 0 };
    }

    const normalizedEmail = email.toLowerCase().trim();
    const lockKey = `login-lock:${normalizedEmail}`;
    const attemptsKey = `login-attempts:${normalizedEmail}`;

    const [lockExpiry, attempts] = await Promise.all([
      kv.get<number>(lockKey),
      kv.get<number>(attemptsKey),
    ]);

    const isLocked = lockExpiry ? lockExpiry > Date.now() : false;

    return {
      isLocked,
      failedAttempts: attempts || 0,
      lockedUntil: isLocked && lockExpiry ? new Date(lockExpiry) : undefined,
    };
  } catch (error) {
    console.error('Error getting account status:', error);
    return { isLocked: false, failedAttempts: 0 };
  }
}
