/**
 * Security logging and monitoring
 * Tracks security events for analysis and incident response
 */

export enum SecurityEventType {
  // Authentication events
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',

  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Input validation
  INVALID_INPUT = 'INVALID_INPUT',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  XSS_ATTEMPT = 'XSS_ATTEMPT',

  // CSRF
  CSRF_TOKEN_MISSING = 'CSRF_TOKEN_MISSING',
  CSRF_TOKEN_INVALID = 'CSRF_TOKEN_INVALID',

  // API security
  SUSPICIOUS_REQUEST = 'SUSPICIOUS_REQUEST',
  LARGE_PAYLOAD = 'LARGE_PAYLOAD',
  MALFORMED_REQUEST = 'MALFORMED_REQUEST',

  // Data export events
  DATA_EXPORT_SUCCESS = 'DATA_EXPORT_SUCCESS',
  DATA_EXPORT_FAILURE = 'DATA_EXPORT_FAILURE',
  DATA_EXPORT_UNAUTHORIZED = 'DATA_EXPORT_UNAUTHORIZED',

  // General security
  SECURITY_HEADER_VIOLATION = 'SECURITY_HEADER_VIOLATION',
  BLOCKED_REQUEST = 'BLOCKED_REQUEST',
}

export enum SecuritySeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface SecurityEvent {
  timestamp: Date;
  type: SecurityEventType;
  severity: SecuritySeverity;
  ip: string;
  userAgent: string;
  path: string;
  method: string;
  userId?: string;
  email?: string;
  details: Record<string, unknown>;
  message: string;
}

/**
 * Security event logger
 */
class SecurityLogger {
  private events: SecurityEvent[] = [];
  private maxEvents: number = 10000;

  /**
   * Log a security event
   */
  log(event: Omit<SecurityEvent, 'timestamp'>): void {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date(),
    };

    // Add to memory store
    this.events.push(fullEvent);

    // Limit memory usage
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      this.logToConsole(fullEvent);
    }

    // In production, you would send to a logging service
    // Example: Sentry, LogRocket, CloudWatch, etc.
    if (process.env.NODE_ENV === 'production') {
      this.logToService(fullEvent);
    }
  }

  /**
   * Log to console with color coding
   */
  private logToConsole(event: SecurityEvent): void {
    const severityColor = {
      [SecuritySeverity.LOW]: '\x1b[32m',      // Green
      [SecuritySeverity.MEDIUM]: '\x1b[33m',   // Yellow
      [SecuritySeverity.HIGH]: '\x1b[31m',     // Red
      [SecuritySeverity.CRITICAL]: '\x1b[35m', // Magenta
    };

    const color = severityColor[event.severity] || '\x1b[0m';
    const reset = '\x1b[0m';

    console.log(
      `${color}[SECURITY ${event.severity}]${reset} ${event.type} - ${event.message}`,
      {
        timestamp: event.timestamp.toISOString(),
        ip: event.ip,
        path: event.path,
        method: event.method,
        userAgent: event.userAgent.substring(0, 50),
        ...event.details,
      }
    );
  }

  /**
   * Log to external service (implement based on your service)
   */
  private logToService(event: SecurityEvent): void {
    // Example: Send to Sentry, LogRocket, or custom logging API
    // This is a placeholder for production logging

    // For critical events, you might want to send alerts
    if (event.severity === SecuritySeverity.CRITICAL) {
      this.sendAlert(event);
    }

    // You could also store in Supabase for analysis
    // await supabase.from('security_logs').insert(event);
  }

  /**
   * Send alert for critical events
   */
  private sendAlert(event: SecurityEvent): void {
    // Implement alerting logic (email, Slack, PagerDuty, etc.)
    console.error('[CRITICAL SECURITY ALERT]', event);
  }

  /**
   * Get recent events
   */
  getRecentEvents(limit: number = 100): SecurityEvent[] {
    return this.events.slice(-limit);
  }

  /**
   * Get events by type
   */
  getEventsByType(type: SecurityEventType): SecurityEvent[] {
    return this.events.filter((event) => event.type === type);
  }

  /**
   * Get events by IP
   */
  getEventsByIp(ip: string): SecurityEvent[] {
    return this.events.filter((event) => event.ip === ip);
  }

  /**
   * Get events by severity
   */
  getEventsBySeverity(severity: SecuritySeverity): SecurityEvent[] {
    return this.events.filter((event) => event.severity === severity);
  }

  /**
   * Clear old events
   */
  clear(): void {
    this.events = [];
  }

  /**
   * Get statistics
   */
  getStats(): {
    total: number;
    bySeverity: Record<SecuritySeverity, number>;
    byType: Record<SecurityEventType, number>;
  } {
    const bySeverity = Object.values(SecuritySeverity).reduce((acc, severity) => {
      acc[severity] = this.events.filter((e) => e.severity === severity).length;
      return acc;
    }, {} as Record<SecuritySeverity, number>);

    const byType = Object.values(SecurityEventType).reduce((acc, type) => {
      acc[type] = this.events.filter((e) => e.type === type).length;
      return acc;
    }, {} as Record<SecurityEventType, number>);

    return {
      total: this.events.length,
      bySeverity,
      byType,
    };
  }
}

// Singleton instance
const securityLogger = new SecurityLogger();

/**
 * Log a security event
 */
export function logSecurityEvent(
  type: SecurityEventType,
  severity: SecuritySeverity,
  message: string,
  context: {
    ip: string;
    userAgent: string;
    path: string;
    method: string;
    userId?: string;
    email?: string;
    details?: Record<string, unknown>;
  }
): void {
  securityLogger.log({
    type,
    severity,
    message,
    ip: context.ip,
    userAgent: context.userAgent,
    path: context.path,
    method: context.method,
    userId: context.userId,
    email: context.email,
    details: context.details || {},
  });
}

/**
 * Helper function to extract request context
 */
export function getRequestContext(request: Request): {
  ip: string;
  userAgent: string;
  path: string;
  method: string;
} {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0].trim() || realIp || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const url = new URL(request.url);

  return {
    ip,
    userAgent,
    path: url.pathname,
    method: request.method,
  };
}

/**
 * Get security logger instance
 */
export function getSecurityLogger(): SecurityLogger {
  return securityLogger;
}

/**
 * Redact sensitive information from URLs and data
 */
export function redactSensitiveData(data: unknown): unknown {
  // Sensitive parameter names to redact
  const sensitiveParams = [
    'code',
    'token',
    'access_token',
    'refresh_token',
    'id_token',
    'password',
    'secret',
    'api_key',
    'apikey',
    'auth',
    'authorization',
    'session',
    'cookie',
  ];

  if (typeof data === 'string') {
    // Check if it's a URL
    try {
      const url = new URL(data);

      // Redact query parameters
      sensitiveParams.forEach(param => {
        if (url.searchParams.has(param)) {
          url.searchParams.set(param, '[REDACTED]');
        }
      });

      return url.toString();
    } catch {
      // Not a URL, return as-is (or could implement further text redaction)
      return data;
    }
  }

  if (typeof data === 'object' && data !== null) {
    if (Array.isArray(data)) {
      return data.map(item => redactSensitiveData(item));
    }

    const redacted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();

      // Check if key is sensitive
      const isSensitive = sensitiveParams.some(param =>
        lowerKey.includes(param)
      );

      if (isSensitive) {
        redacted[key] = '[REDACTED]';
      } else if (typeof value === 'object' || typeof value === 'string') {
        redacted[key] = redactSensitiveData(value);
      } else {
        redacted[key] = value;
      }
    }
    return redacted;
  }

  return data;
}

/**
 * Safely log a URL with sensitive parameters redacted
 */
export function logSecureUrl(label: string, url: string): void {
  const redactedUrl = redactSensitiveData(url);
  if (process.env.NODE_ENV === 'development') {
    console.log(`${label}:`, redactedUrl);
  }
}

/**
 * Convenience functions for common security events
 */
export const SecurityLog = {
  rateLimitExceeded: (context: ReturnType<typeof getRequestContext>, limit: number) => {
    logSecurityEvent(
      SecurityEventType.RATE_LIMIT_EXCEEDED,
      SecuritySeverity.MEDIUM,
      `Rate limit exceeded: ${limit} requests`,
      { ...context, details: { limit } }
    );
  },

  invalidInput: (context: ReturnType<typeof getRequestContext>, field: string, reason: string) => {
    logSecurityEvent(
      SecurityEventType.INVALID_INPUT,
      SecuritySeverity.LOW,
      `Invalid input detected: ${field} - ${reason}`,
      { ...context, details: { field, reason } }
    );
  },

  sqlInjectionAttempt: (context: ReturnType<typeof getRequestContext>, input: string) => {
    logSecurityEvent(
      SecurityEventType.SQL_INJECTION_ATTEMPT,
      SecuritySeverity.HIGH,
      'Potential SQL injection attempt detected',
      { ...context, details: { input: input.substring(0, 100) } }
    );
  },

  xssAttempt: (context: ReturnType<typeof getRequestContext>, input: string) => {
    logSecurityEvent(
      SecurityEventType.XSS_ATTEMPT,
      SecuritySeverity.HIGH,
      'Potential XSS attempt detected',
      { ...context, details: { input: input.substring(0, 100) } }
    );
  },

  csrfTokenMissing: (context: ReturnType<typeof getRequestContext>) => {
    logSecurityEvent(
      SecurityEventType.CSRF_TOKEN_MISSING,
      SecuritySeverity.MEDIUM,
      'CSRF token missing from request',
      context
    );
  },

  csrfTokenInvalid: (context: ReturnType<typeof getRequestContext>) => {
    logSecurityEvent(
      SecurityEventType.CSRF_TOKEN_INVALID,
      SecuritySeverity.HIGH,
      'Invalid CSRF token provided',
      context
    );
  },

  unauthorizedAccess: (context: ReturnType<typeof getRequestContext>, email?: string) => {
    logSecurityEvent(
      SecurityEventType.UNAUTHORIZED_ACCESS,
      SecuritySeverity.HIGH,
      'Unauthorized access attempt',
      { ...context, email }
    );
  },

  suspiciousRequest: (context: ReturnType<typeof getRequestContext>, reason: string) => {
    logSecurityEvent(
      SecurityEventType.SUSPICIOUS_REQUEST,
      SecuritySeverity.MEDIUM,
      `Suspicious request: ${reason}`,
      { ...context, details: { reason } }
    );
  },

  blockedRequest: (context: ReturnType<typeof getRequestContext>, reason: string) => {
    logSecurityEvent(
      SecurityEventType.BLOCKED_REQUEST,
      SecuritySeverity.HIGH,
      `Request blocked: ${reason}`,
      { ...context, details: { reason } }
    );
  },

  dataExportSuccess: (
    context: ReturnType<typeof getRequestContext>,
    email: string,
    exportType: string,
    recordCount: number
  ) => {
    logSecurityEvent(
      SecurityEventType.DATA_EXPORT_SUCCESS,
      SecuritySeverity.MEDIUM,
      `Data export successful: ${exportType} (${recordCount} records)`,
      { ...context, email, details: { exportType, recordCount } }
    );
  },

  dataExportFailure: (
    context: ReturnType<typeof getRequestContext>,
    email: string,
    exportType: string,
    reason: string
  ) => {
    logSecurityEvent(
      SecurityEventType.DATA_EXPORT_FAILURE,
      SecuritySeverity.HIGH,
      `Data export failed: ${exportType} - ${reason}`,
      { ...context, email, details: { exportType, reason } }
    );
  },

  dataExportUnauthorized: (
    context: ReturnType<typeof getRequestContext>,
    exportType: string
  ) => {
    logSecurityEvent(
      SecurityEventType.DATA_EXPORT_UNAUTHORIZED,
      SecuritySeverity.HIGH,
      `Unauthorized data export attempt: ${exportType}`,
      { ...context, details: { exportType } }
    );
  },
};
