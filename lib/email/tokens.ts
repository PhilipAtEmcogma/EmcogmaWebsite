import crypto from 'crypto';

/**
 * SECURE EMAIL TOKEN SYSTEM
 *
 * Uses HMAC-SHA256 to create secure, verifiable tokens for unsubscribe links.
 * Email addresses are NEVER exposed in URLs or tokens.
 *
 * Token format: {subscriberId}.{timestamp}.{signature}
 * - subscriberId: Database ID (UUID), not email
 * - timestamp: Unix timestamp for expiration
 * - signature: HMAC-SHA256 of subscriberId + timestamp + secret
 */

const SECRET_KEY = process.env.UNSUBSCRIBE_TOKEN_SECRET || 'change-me-in-production';

if (SECRET_KEY === 'change-me-in-production' && process.env.NODE_ENV === 'production') {
  console.error('⚠️  WARNING: UNSUBSCRIBE_TOKEN_SECRET not set in production!');
}

/**
 * Generate a secure unsubscribe token
 * @param subscriberId - Database UUID (NOT email address)
 * @param expiresInDays - Token expiration in days (default: 90 days)
 * @returns Secure token string
 */
export function generateUnsubscribeToken(
  subscriberId: string,
  expiresInDays: number = 90
): string {
  const timestamp = Math.floor(Date.now() / 1000) + expiresInDays * 24 * 60 * 60;
  const data = `${subscriberId}.${timestamp}`;

  // SECURE: Create HMAC signature to prevent tampering
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(data)
    .digest('hex');

  return `${data}.${signature}`;
}

/**
 * Verify and decode an unsubscribe token
 * @param token - Token to verify
 * @returns Subscriber ID if valid, null if invalid/expired
 */
export function verifyUnsubscribeToken(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [subscriberId, timestamp, signature] = parts;
    const data = `${subscriberId}.${timestamp}`;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(data)
      .digest('hex');

    // SECURE: Constant-time comparison to prevent timing attacks
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    // Check expiration
    const expirationTime = parseInt(timestamp, 10);
    const currentTime = Math.floor(Date.now() / 1000);

    if (currentTime > expirationTime) {
      return null; // Token expired
    }

    return subscriberId;
  } catch (error) {
    // SECURE: Don't log token details
    console.error('Token verification failed');
    return null;
  }
}

/**
 * Generate a secure unsubscribe URL
 * @param subscriberId - Database UUID
 * @param baseUrl - Site base URL (e.g., https://emcogma.com)
 * @returns Full unsubscribe URL with secure token
 */
export function generateUnsubscribeUrl(subscriberId: string, baseUrl: string): string {
  const token = generateUnsubscribeToken(subscriberId);
  return `${baseUrl}/unsubscribe?token=${token}`;
}
