/**
 * Security event monitoring and alerting
 * Framework-agnostic design - works with Sentry, DataDog, LogRocket, etc.
 */

export type SecurityEventSeverity = 'info' | 'warning' | 'error' | 'fatal';

export interface SecurityEventContext {
  ip?: string;
  userAgent?: string;
  path?: string;
  userId?: string;
  email?: string;
  metadata?: Record<string, unknown>;
}

export interface SecurityEvent {
  type: string;
  message: string;
  severity: SecurityEventSeverity;
  context: SecurityEventContext;
  timestamp: Date;
}

/**
 * Security monitoring service interface
 * Implement this for your monitoring provider (Sentry, DataDog, etc.)
 */
export interface SecurityMonitoringService {
  captureEvent(event: SecurityEvent): Promise<void>;
  captureException(error: Error, context: SecurityEventContext): Promise<void>;
}

/**
 * Console-based monitoring (development/fallback)
 */
class ConsoleMonitoring implements SecurityMonitoringService {
  async captureEvent(event: SecurityEvent): Promise<void> {
    const level = event.severity === 'fatal' || event.severity === 'error' ? 'error' : 'warn';
    console[level]('[SECURITY EVENT]', {
      type: event.type,
      message: event.message,
      severity: event.severity,
      timestamp: event.timestamp.toISOString(),
      context: event.context,
    });
  }

  async captureException(error: Error, context: SecurityEventContext): Promise<void> {
    console.error('[SECURITY EXCEPTION]', {
      message: error.message,
      stack: error.stack,
      context,
    });
  }
}

/**
 * Sentry monitoring integration
 * Uncomment and configure when ready to use Sentry
 */
class SentryMonitoring implements SecurityMonitoringService {
  private initialized = false;

  private async ensureInitialized() {
    if (this.initialized) return;

    // Lazy load Sentry only when needed
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      try {
        // In a real implementation, you'd import @sentry/nextjs here
        // const Sentry = await import('@sentry/nextjs');
        // Sentry.init({ dsn: process.env.NEXT_PUBLIC_SENTRY_DSN });
        this.initialized = true;
      } catch (error) {
        console.error('Failed to initialize Sentry:', error);
      }
    }
  }

  async captureEvent(event: SecurityEvent): Promise<void> {
    await this.ensureInitialized();

    if (!this.initialized) {
      // Fallback to console
      return new ConsoleMonitoring().captureEvent(event);
    }

    // In production with Sentry installed:
    // const Sentry = await import('@sentry/nextjs');
    // Sentry.captureMessage(event.message, {
    //   level: event.severity as Sentry.SeverityLevel,
    //   tags: { type: event.type },
    //   contexts: { security: event.context },
    // });

    // Temporary: use console until Sentry is configured
    console.warn('[SECURITY EVENT]', event);
  }

  async captureException(error: Error, context: SecurityEventContext): Promise<void> {
    await this.ensureInitialized();

    if (!this.initialized) {
      return new ConsoleMonitoring().captureException(error, context);
    }

    // In production with Sentry installed:
    // const Sentry = await import('@sentry/nextjs');
    // Sentry.captureException(error, { contexts: { security: context } });

    // Temporary: use console until Sentry is configured
    console.error('[SECURITY EXCEPTION]', error, context);
  }
}

/**
 * Global monitoring service singleton
 */
class SecurityMonitor {
  private service: SecurityMonitoringService;

  constructor() {
    // Choose monitoring service based on environment
    if (process.env.NEXT_PUBLIC_SENTRY_DSN && process.env.NODE_ENV === 'production') {
      this.service = new SentryMonitoring();
    } else {
      this.service = new ConsoleMonitoring();
    }
  }

  /**
   * Report a security event
   */
  async reportEvent(
    type: string,
    message: string,
    severity: SecurityEventSeverity,
    context: SecurityEventContext = {}
  ): Promise<void> {
    const event: SecurityEvent = {
      type,
      message,
      severity,
      context,
      timestamp: new Date(),
    };

    await this.service.captureEvent(event);

    // Trigger alert for critical events
    if (severity === 'fatal') {
      await this.triggerAlert(event);
    }
  }

  /**
   * Report an exception
   */
  async reportException(error: Error, context: SecurityEventContext = {}): Promise<void> {
    await this.service.captureException(error, context);
  }

  /**
   * Trigger alert for critical security events
   * Extend this to integrate with PagerDuty, Slack, email, etc.
   */
  private async triggerAlert(event: SecurityEvent): Promise<void> {
    // In production, send to alerting service:
    // - PagerDuty incident
    // - Slack security channel
    // - Email to security team

    console.error('[CRITICAL SECURITY ALERT]', {
      type: event.type,
      message: event.message,
      context: event.context,
      timestamp: event.timestamp.toISOString(),
    });

    // Example: Send to Slack webhook
    if (process.env.SLACK_SECURITY_WEBHOOK) {
      try {
        await fetch(process.env.SLACK_SECURITY_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 CRITICAL SECURITY EVENT`,
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*Type:* ${event.type}\n*Message:* ${event.message}\n*IP:* ${event.context.ip || 'unknown'}\n*Path:* ${event.context.path || 'unknown'}`,
                },
              },
            ],
          }),
        });
      } catch (error) {
        console.error('Failed to send Slack alert:', error);
      }
    }
  }

  /**
   * Check for abuse patterns and alert if thresholds exceeded
   */
  async checkThresholds(eventType: string, windowSeconds: number = 60): Promise<boolean> {
    // Track event counts in KV for threshold monitoring
    try {
      const { kv } = await import('@vercel/kv');
      const key = `event-count:${eventType}`;
      const count = await kv.incr(key);

      if (count === 1) {
        await kv.expire(key, windowSeconds);
      }

      // Alert thresholds
      const thresholds: Record<string, number> = {
        rate_limit_exceeded: 100, // >100 rate limits/min
        sql_injection_attempt: 5, // Any SQL injection attempt
        xss_attempt: 10,
        csrf_token_invalid: 50,
        unauthorized_access: 20,
        abuse_pattern_detected: 10,
      };

      const threshold = thresholds[eventType] || 999999;

      if (count >= threshold) {
        await this.reportEvent(
          'threshold_exceeded',
          `Security event threshold exceeded: ${eventType} (${count} events in ${windowSeconds}s)`,
          'fatal',
          { metadata: { eventType, count, threshold } }
        );
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to check thresholds:', error);
      return false;
    }
  }
}

// Export singleton instance
export const securityMonitor = new SecurityMonitor();

/**
 * Helper functions for common security events
 */
export const SecurityEvents = {
  rateLimitExceeded: (context: SecurityEventContext) =>
    securityMonitor.reportEvent('rate_limit_exceeded', 'Rate limit exceeded', 'warning', context),

  sqlInjectionAttempt: (context: SecurityEventContext) =>
    securityMonitor.reportEvent('sql_injection_attempt', 'SQL injection attempt detected', 'error', context),

  xssAttempt: (context: SecurityEventContext) =>
    securityMonitor.reportEvent('xss_attempt', 'XSS attempt detected', 'error', context),

  csrfTokenInvalid: (context: SecurityEventContext) =>
    securityMonitor.reportEvent('csrf_token_invalid', 'Invalid CSRF token', 'warning', context),

  unauthorizedAccess: (context: SecurityEventContext) =>
    securityMonitor.reportEvent('unauthorized_access', 'Unauthorized access attempt', 'error', context),

  abusePatternDetected: (context: SecurityEventContext) =>
    securityMonitor.reportEvent('abuse_pattern_detected', 'Abuse pattern detected', 'fatal', context),

  sessionExpired: (context: SecurityEventContext) =>
    securityMonitor.reportEvent('session_expired', 'Session expired', 'info', context),

  ipAddressChanged: (context: SecurityEventContext) =>
    securityMonitor.reportEvent('ip_address_changed', 'Session IP changed', 'warning', context),

  suspiciousActivity: (context: SecurityEventContext, message: string) =>
    securityMonitor.reportEvent('suspicious_activity', message, 'warning', context),
};

/**
 * Integration setup instructions
 *
 * To enable Sentry monitoring:
 * 1. Install: npm install @sentry/nextjs
 * 2. Run: npx @sentry/wizard@latest -i nextjs
 * 3. Set NEXT_PUBLIC_SENTRY_DSN in Vercel environment variables
 * 4. Uncomment Sentry imports in SentryMonitoring class above
 *
 * To enable Slack alerts:
 * 1. Create incoming webhook in Slack
 * 2. Set SLACK_SECURITY_WEBHOOK in Vercel environment variables
 *
 * To enable PagerDuty:
 * 1. Get PagerDuty Events API v2 integration key
 * 2. Set PAGERDUTY_INTEGRATION_KEY in Vercel environment variables
 * 3. Add PagerDuty client to triggerAlert() method
 */
