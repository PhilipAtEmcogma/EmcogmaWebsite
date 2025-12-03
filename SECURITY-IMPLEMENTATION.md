# Security Implementation Guide

## Overview

This document outlines the comprehensive security measures implemented in the EMCOGMA website to protect against common web vulnerabilities and attacks. All implementations follow OWASP security best practices.

## Table of Contents

- [Security Features](#security-features)
- [Rate Limiting](#rate-limiting)
- [Input Validation & Sanitization](#input-validation--sanitization)
- [CSRF Protection](#csrf-protection)
- [Security Headers](#security-headers)
- [XSS Prevention](#xss-prevention)
- [Security Logging](#security-logging)
- [API Security](#api-security)
- [Best Practices](#best-practices)
- [Monitoring & Incident Response](#monitoring--incident-response)

---

## Security Features

### ✅ Implemented Security Measures

1. **Rate Limiting** - Prevents brute force and DDoS attacks
2. **Input Validation** - Comprehensive validation and sanitization
3. **CSRF Protection** - Protects against cross-site request forgery
4. **Security Headers** - CSP, HSTS, X-Frame-Options, etc.
5. **XSS Prevention** - Sanitization of user-generated content
6. **SQL Injection Prevention** - Parameterized queries + detection
7. **Security Logging** - Tracks security events and anomalies
8. **Request Size Limits** - Prevents large payload attacks
9. **Secure Image Hosting** - Restricted to trusted domains only
10. **Database-Level Security** - Row-Level Security (RLS) policies

---

## Rate Limiting

### Implementation

Located in: `lib/security/rateLimit.ts`

### Features

- **IP-based tracking** with User-Agent for accuracy
- **Configurable limits** per endpoint
- **In-memory storage** (Redis recommended for production)
- **Automatic cleanup** of expired entries

### Rate Limit Configuration

```typescript
// Default configurations
RATE_LIMITS = {
  api: { maxRequests: 100, windowMs: 60000 },      // 100 req/min
  contact: { maxRequests: 5, windowMs: 60000 },    // 5 req/min
  comments: { maxRequests: 10, windowMs: 60000 },  // 10 req/min
  login: { maxRequests: 5, windowMs: 900000 },     // 5 req/15min
}
```

### Usage Example

```typescript
import { checkRateLimit, RATE_LIMITS } from '@/lib/security';

const rateLimitResult = checkRateLimit(request, RATE_LIMITS.contact);
if (!rateLimitResult.success) {
  return NextResponse.json(
    { error: 'Too many requests' },
    { status: 429, headers: createRateLimitHeaders(rateLimitResult) }
  );
}
```

### Response Headers

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: When the limit resets (ISO 8601)
- `Retry-After`: Seconds until retry (when exceeded)

---

## Input Validation & Sanitization

### Implementation

Located in: `lib/security/validation.ts`

### Features

- **HTML sanitization** - Removes dangerous tags and attributes
- **Email validation** - RFC 5322 compliant
- **URL validation** - Protocol and format checking
- **Length validation** - Prevents oversized inputs
- **SQL injection detection** - Pattern-based detection
- **Markdown sanitization** - Safe markdown with XSS prevention
- **Slug validation** - URL-safe format enforcement

### Key Functions

#### Sanitize HTML
```typescript
sanitizeHtml(input: string): string
```
Removes `<script>`, event handlers, `javascript:` protocol, iframes, etc.

#### Validate Email
```typescript
validateEmail(email: string): { valid: boolean; sanitized: string; error?: string }
```
Validates format, length, and returns sanitized lowercase email.

#### Validate Form Input
```typescript
validateComment(data): ValidationResult
validateContactForm(data): ValidationResult
```
Comprehensive validation with error messages and sanitized output.

### XSS Prevention Techniques

1. **Remove script tags** and their content
2. **Strip event handlers** (onclick, onerror, etc.)
3. **Block dangerous protocols** (javascript:, data:)
4. **Escape HTML characters** (&, <, >, ", ', /)
5. **Validate markdown** while preserving formatting

---

## CSRF Protection

### Implementation

Located in: `lib/security/csrf.ts`

### Features

- **Token generation** - Cryptographically secure random tokens
- **Token expiry** - 1-hour expiration
- **Session-based** - Tied to user session
- **Timing-safe comparison** - Prevents timing attacks
- **Automatic cleanup** - Removes expired tokens

### Usage

**Generate token:**
```typescript
const sessionId = getSessionId(request);
const token = createCsrfToken(sessionId);
```

**Validate token:**
```typescript
const isValid = validateCsrfRequest(request, body);
if (!isValid) {
  return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
}
```

### Token Sources

CSRF tokens are checked in:
1. `X-CSRF-Token` header (recommended)
2. Request body `csrfToken` field

### Safe Methods

GET, HEAD, and OPTIONS requests skip CSRF validation.

---

## Security Headers

### Implementation

Located in: `lib/security/headers.ts`

### Headers Applied

#### Content Security Policy (CSP)
```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' data: https: http:;
connect-src 'self' https://*.supabase.co wss://*.supabase.co;
frame-ancestors 'none';
```

#### HTTP Strict Transport Security (HSTS)
```
max-age=63072000; includeSubDomains; preload
```
Forces HTTPS for 2 years including subdomains.

#### Other Security Headers

- **X-Frame-Options**: `DENY` - Prevents clickjacking
- **X-Content-Type-Options**: `nosniff` - Prevents MIME sniffing
- **X-XSS-Protection**: `1; mode=block` - Legacy XSS protection
- **Referrer-Policy**: `strict-origin-when-cross-origin`
- **Permissions-Policy**: Restricts browser features
- **Cross-Origin-***: Isolates documents

### Application Points

1. **Middleware** (`lib/supabase/middleware.ts`) - All requests
2. **API Routes** - Via `createSecureApiResponse()`
3. **Next.js Config** - Backup headers

---

## XSS Prevention

### Multi-Layer Defense

1. **Input Sanitization**
   - Strip dangerous HTML tags
   - Remove event handlers
   - Block javascript: protocol

2. **Output Encoding**
   - Escape HTML special characters
   - Use React's built-in escaping

3. **Content Security Policy**
   - Restrict script sources
   - Block inline scripts (where possible)
   - Sandbox untrusted content

4. **Markdown Rendering**
   - Sanitize before rendering
   - Remove script tags from markdown
   - Validate links and images

### User-Generated Content

All user-generated content (comments, contact forms) is:
1. Validated on submission
2. Sanitized before storage
3. Escaped on display
4. Requires admin approval (comments)

---

## Security Logging

### Implementation

Located in: `lib/security/logger.ts`

### Event Types

- `LOGIN_SUCCESS` / `LOGIN_FAILURE`
- `LOGOUT` / `UNAUTHORIZED_ACCESS`
- `RATE_LIMIT_EXCEEDED`
- `INVALID_INPUT` / `SQL_INJECTION_ATTEMPT` / `XSS_ATTEMPT`
- `CSRF_TOKEN_MISSING` / `CSRF_TOKEN_INVALID`
- `SUSPICIOUS_REQUEST` / `BLOCKED_REQUEST`

### Severity Levels

- **LOW** - Minor validation errors
- **MEDIUM** - Rate limiting, invalid tokens
- **HIGH** - Injection attempts, unauthorized access
- **CRITICAL** - Active attacks, system compromises

### Usage

```typescript
import { SecurityLog, getRequestContext } from '@/lib/security';

const context = getRequestContext(request);

// Log specific event
SecurityLog.rateLimitExceeded(context, 100);
SecurityLog.sqlInjectionAttempt(context, maliciousInput);
SecurityLog.unauthorizedAccess(context, email);
```

### Storage

- **Development**: Console logs with color coding
- **Production**: External logging service (Sentry, LogRocket, CloudWatch)
- **Critical events**: Real-time alerts

### Monitoring

Access logs programmatically:
```typescript
const logger = getSecurityLogger();
const recentEvents = logger.getRecentEvents(100);
const stats = logger.getStats();
```

---

## API Security

### Comprehensive Security Checks

All API routes use `performSecurityCheck()`:

```typescript
const securityCheck = await performSecurityCheck(request, {
  rateLimit: RATE_LIMITS.contact,      // Rate limiting
  requireCsrf: true,                    // CSRF validation
  validateBody: true,                   // Body size check
  maxBodySize: 10 * 1024,              // 10KB limit
});

if (!securityCheck.passed) {
  return securityCheck.response!;
}
```

### Protected Endpoints

#### `/api/comments` (GET)
- Rate limit: 100 req/min
- Slug validation
- SQL injection detection
- Secure response headers

#### `/api/comments` (POST)
- Rate limit: 10 req/min
- Body size limit: 10KB
- Comprehensive input validation
- XSS prevention
- Admin approval required

#### `/api/contact` (POST)
- Rate limit: 5 req/min
- Body size limit: 10KB
- reCAPTCHA verification
- Email validation
- Formspree integration

### Response Format

All API responses use `createSecureApiResponse()`:
```typescript
return createSecureApiResponse(
  { data: result },
  200,
  additionalHeaders
);
```

Automatically adds:
- Security headers
- JSON response
- Proper error handling

---

## Best Practices

### Development Guidelines

1. **Never trust user input** - Always validate and sanitize
2. **Use parameterized queries** - Prevent SQL injection
3. **Apply least privilege** - Database RLS policies
4. **Implement defense in depth** - Multiple security layers
5. **Log security events** - Track and monitor
6. **Keep dependencies updated** - Regular security patches
7. **Use environment variables** - Never hardcode secrets
8. **Test security measures** - Regular penetration testing

### Code Security Checklist

- [ ] Input validated and sanitized
- [ ] Rate limiting applied
- [ ] CSRF protection for state-changing operations
- [ ] Security headers on responses
- [ ] Error messages don't leak sensitive info
- [ ] Logging includes security events
- [ ] Database queries use parameterization
- [ ] File uploads restricted and validated
- [ ] Authentication properly implemented
- [ ] Authorization checked at every endpoint

### Common Vulnerabilities Prevented

✅ **SQL Injection** - Supabase parameterized queries + detection
✅ **XSS** - Input sanitization + CSP + output encoding
✅ **CSRF** - Token-based protection
✅ **Clickjacking** - X-Frame-Options: DENY
✅ **MIME Sniffing** - X-Content-Type-Options
✅ **DDoS** - Rate limiting
✅ **Brute Force** - Rate limiting + account lockout
✅ **Insecure Direct Object References** - RLS policies
✅ **Sensitive Data Exposure** - HTTPS + HSTS
✅ **Broken Authentication** - OAuth + session management

---

## Monitoring & Incident Response

### Real-Time Monitoring

1. **Security Event Dashboard**
   - View recent security events
   - Filter by severity and type
   - Track attack patterns

2. **Rate Limit Monitoring**
   - Identify potential attackers
   - Adjust limits based on traffic
   - Whitelist legitimate users if needed

3. **Error Tracking**
   - Monitor unusual error rates
   - Identify attack attempts
   - Track system health

### Incident Response Plan

**If an attack is detected:**

1. **Immediate Actions**
   - Review security logs
   - Identify attack vector
   - Block malicious IPs if needed
   - Assess damage

2. **Mitigation**
   - Apply temporary restrictions
   - Increase rate limits temporarily
   - Deploy emergency patches
   - Notify affected users

3. **Post-Incident**
   - Conduct root cause analysis
   - Update security measures
   - Document lessons learned
   - Improve monitoring

### Security Maintenance

**Regular Tasks:**

- [ ] Review security logs weekly
- [ ] Update dependencies monthly
- [ ] Audit permissions quarterly
- [ ] Penetration testing annually
- [ ] Security training for team
- [ ] Backup and disaster recovery testing

---

## Environment Variables

### Required Security Variables

```env
# Supabase (with RLS enabled)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# reCAPTCHA v2
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=xxx
RECAPTCHA_SECRET_KEY=xxx

# Formspree
FORMSPREE_ENDPOINT=https://formspree.io/f/xxx
```

### Production Recommendations

1. **Use Secrets Manager** - AWS Secrets Manager, Vault, etc.
2. **Rotate keys regularly** - Every 90 days
3. **Restrict API keys** - Domain restrictions for client-side keys
4. **Monitor key usage** - Detect anomalies
5. **Use different keys per environment** - Dev, staging, production

---

## File Structure

```
lib/security/
├── index.ts                # Central exports
├── rateLimit.ts           # Rate limiting
├── validation.ts          # Input validation
├── csrf.ts                # CSRF protection
├── headers.ts             # Security headers
└── logger.ts              # Security logging

app/api/
├── comments/route.ts      # Secured with rate limiting + validation
└── contact/route.ts       # Secured with rate limiting + reCAPTCHA

lib/supabase/
├── middleware.ts          # Session + security headers
└── schema.sql             # RLS policies + is_admin()
```

---

## Testing Security

### Manual Testing

**Test rate limiting:**
```bash
# Send multiple requests rapidly
for i in {1..20}; do curl http://localhost:3000/api/comments; done
```

**Test XSS prevention:**
```bash
# Try submitting malicious content
curl -X POST http://localhost:3000/api/comments \
  -H "Content-Type: application/json" \
  -d '{"author":"Test","content":"<script>alert(1)</script>","postSlug":"test"}'
```

**Test SQL injection:**
```bash
# Try SQL injection patterns
curl -X POST http://localhost:3000/api/comments \
  -H "Content-Type: application/json" \
  -d '{"author":"Test","content":"Test","postSlug":"test OR 1=1"}'
```

### Automated Testing

Consider adding:
- **OWASP ZAP** - Automated security scanning
- **Burp Suite** - Penetration testing
- **npm audit** - Dependency vulnerability scanning
- **Snyk** - Continuous security monitoring

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Supabase Security](https://supabase.com/docs/guides/security)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [HTTP Security Headers](https://securityheaders.com/)

---

## Support & Reporting

**Found a security vulnerability?**

Please report it responsibly:
- Email: emcogma@gmail.com
- Include: Description, reproduction steps, impact assessment
- Response time: Within 24 hours

Do NOT disclose publicly until fixed.

---

**Last Updated**: December 2025
**Version**: 1.0.0
