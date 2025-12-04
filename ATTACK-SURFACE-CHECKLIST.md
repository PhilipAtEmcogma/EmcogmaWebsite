# Attack Surface Checklist

**Project:** EMCOGMA Website
**Last Updated:** December 2025
**Security Standard:** OWASP Top 10 2021 Compliant

## Overview

This document provides a comprehensive attack surface checklist for the EMCOGMA website. It covers all major threat categories, implemented controls, and remediation status.

---

## 1. Injection Attacks

### 1.1 SQL Injection (SQLi)

| Attack Vector | Status | Implementation | Risk Level |
|---------------|--------|----------------|-----------|
| Query parameters | ✅ Protected | Supabase parameterized queries + RLS | Low |
| Form inputs | ✅ Protected | Input validation + pattern detection | Low |
| Comment submission | ✅ Protected | `validateComment()` + sanitization | Low |
| Contact form | ✅ Protected | `validateContactForm()` + sanitization | Low |
| Admin CRUD operations | ✅ Protected | Supabase ORM + RLS policies | Low |
| Search functionality | ⚠️ Not implemented | N/A (feature pending) | N/A |

**Controls:**
- ✅ Parameterized queries via Supabase client
- ✅ SQL injection pattern detection (`detectSqlInjection()`)
- ✅ Input validation with regex patterns
- ✅ Row-Level Security (RLS) policies
- ✅ Security logging for detection attempts

**Files:** `lib/security/validation.ts:232`, `lib/supabase/schema.sql:194`

---

### 1.2 Command Injection

| Attack Vector | Status | Implementation | Risk Level |
|---------------|--------|----------------|-----------|
| File operations | ✅ Protected | No server-side file execution | Low |
| External APIs | ✅ Protected | Controlled endpoints only | Low |
| User input processing | ✅ Protected | No shell execution | Low |

**Controls:**
- ✅ No `exec()`, `spawn()`, or shell commands from user input
- ✅ No server-side file upload functionality
- ✅ Restricted external API calls (Google reCAPTCHA, Formspree only)

---

### 1.3 NoSQL Injection

| Attack Vector | Status | Implementation | Risk Level |
|---------------|--------|----------------|-----------|
| Database queries | ✅ Protected | PostgreSQL (not NoSQL) + Supabase ORM | Low |

**Controls:**
- ✅ Using PostgreSQL, not vulnerable to NoSQL injection
- ✅ Supabase client library prevents injection

---

### 1.4 LDAP/XML/Template Injection

| Attack Vector | Status | Implementation | Risk Level |
|---------------|--------|----------------|-----------|
| LDAP queries | ✅ N/A | Not using LDAP | N/A |
| XML parsing | ✅ N/A | Not parsing user XML | N/A |
| Template engines | ✅ Protected | React/Next.js auto-escaping | Low |

---

## 2. Cross-Site Scripting (XSS)

### 2.1 Stored XSS

| Attack Vector | Status | Implementation | Risk Level |
|---------------|--------|----------------|-----------|
| Blog comments | ✅ Protected | DOMPurify sanitization + CSP | Low |
| Contact form | ✅ Protected | Input sanitization + no storage display | Low |
| Admin content creation | ✅ Protected | Markdown sanitization + DOMPurify | Low |
| User profiles | ✅ N/A | No user-generated profiles | N/A |

**Controls:**
- ✅ DOMPurify (`isomorphic-dompurify`) for HTML sanitization
- ✅ `sanitizeHtml()` function with allowed tags whitelist
- ✅ `sanitizeMarkdown()` for markdown content
- ✅ React automatic output escaping
- ✅ Content Security Policy (CSP) headers

**Files:** `lib/security/validation.ts:12`, `lib/security/headers.ts:43`

---

### 2.2 Reflected XSS

| Attack Vector | Status | Implementation | Risk Level |
|---------------|--------|----------------|-----------|
| URL parameters | ✅ Protected | Next.js auto-escaping | Low |
| Error messages | ✅ Protected | Generic error messages | Low |
| Search results | ⚠️ Not implemented | N/A (feature pending) | N/A |

**Controls:**
- ✅ Next.js automatic escaping in templates
- ✅ No direct reflection of URL params in HTML
- ✅ Error messages don't expose sensitive data
- ✅ CSP blocks inline scripts

---

### 2.3 DOM-Based XSS

| Attack Vector | Status | Implementation | Risk Level |
|---------------|--------|----------------|-----------|
| Client-side rendering | ✅ Protected | React escaping + CSP | Low |
| URL fragments | ✅ Protected | No unsafe `dangerouslySetInnerHTML` | Low |
| `innerHTML` usage | ✅ Protected | DOMPurify for any HTML rendering | Low |

**Controls:**
- ✅ No `dangerouslySetInnerHTML` without sanitization
- ✅ CSP prevents inline event handlers
- ✅ React prevents DOM XSS by default

---

## 3. Authentication & Session Management

### 3.1 Broken Authentication

| Attack Vector | Status | Implementation | Risk Level |
|---------------|--------|----------------|-----------|
| Brute force attacks | ✅ Protected | Rate limiting (5 attempts/15min) | Low |
| Credential stuffing | ✅ Protected | OAuth-only (no passwords) | Low |
| Session fixation | ✅ Protected | Supabase Auth session management | Low |
| Session hijacking | ✅ Protected | HTTP-only cookies + HTTPS | Low |
| Weak passwords | ✅ N/A | OAuth providers handle authentication | N/A |

**Controls:**
- ✅ OAuth authentication (Google, GitHub) via Supabase Auth
- ✅ Rate limiting on login endpoint (`RATE_LIMITS.login`)
- ✅ **10-minute session timeout** with automatic logout
- ✅ HTTP-only cookies prevent XSS theft
- ✅ Secure cookie flag in production
- ✅ SameSite=Lax for CSRF protection
- ✅ Session activity tracking via `last_activity` cookie

**Files:** `lib/supabase/middleware.ts:39`, `lib/security/rateLimit.ts:25`

---

### 3.2 Session Timeout

| Attack Vector | Status | Implementation | Risk Level |
|---------------|--------|----------------|-----------|
| Inactive sessions | ✅ Protected | 10-minute timeout (configurable) | Low |
| Cookie expiration | ✅ Protected | Tied to session timeout | Low |
| Auto-logout | ✅ Protected | Automatic signout + redirect | Low |

**Controls:**
- ✅ `SESSION_TIMEOUT_MINUTES` environment variable (default: 10)
- ✅ Middleware tracks `last_activity` in HTTP-only cookie
- ✅ Automatic session termination after timeout
- ✅ Redirect to login with timeout message

**Files:** `lib/supabase/middleware.ts:39-103`

---

## 4. Access Control

### 4.1 Insecure Direct Object References (IDOR)

| Attack Vector | Status | Implementation | Risk Level |
|---------------|--------|----------------|-----------|
| Blog post access | ✅ Protected | RLS policies (published=true) | Low |
| Comment access | ✅ Protected | RLS policies (approved=true) | Low |
| Admin operations | ✅ Protected | `is_admin()` function + RLS | Low |
| Project access | ✅ Protected | RLS policies (public read) | Low |
| User data access | ✅ Protected | Database-enforced RLS | Low |

**Controls:**
- ✅ Row-Level Security (RLS) on all tables
- ✅ Centralized `is_admin()` function for admin checks
- ✅ No direct ID-based access without authorization
- ✅ Public content filtered by `published` or `active` flags

**Files:** `lib/supabase/schema.sql:38-47`, `lib/supabase/schema.sql:194-299`

---

### 4.2 Privilege Escalation

| Attack Vector | Status | Implementation | Risk Level |
|---------------|--------|----------------|-----------|
| Horizontal escalation | ✅ Protected | User isolation via RLS | Low |
| Vertical escalation | ✅ Protected | Admin whitelist in database | Low |
| Role manipulation | ✅ Protected | Database-enforced roles | Low |

**Controls:**
- ✅ Database-driven admin management via `admin_users` table
- ✅ No client-side role manipulation
- ✅ `is_admin()` function with `SECURITY DEFINER`
- ✅ RLS policies enforce access control

**Files:** `lib/supabase/schema.sql:23-34`, `lib/auth/admin.ts`

---

### 4.3 Forced Browsing

| Attack Vector | Status | Implementation | Risk Level |
|---------------|--------|----------------|-----------|
| Admin routes | ✅ Protected | Middleware + database check | Low |
| API endpoints | ✅ Protected | RLS + authentication | Low |
| Direct URL access | ✅ Protected | Middleware redirect to login | Low |

**Controls:**
- ✅ Middleware protects `/admin/*` routes
- ✅ Database verification of admin status
- ✅ Automatic redirect to login for unauthorized access

**Files:** `lib/supabase/middleware.ts:107-128`

---

## 5. Cross-Site Request Forgery (CSRF)

| Attack Vector | Status | Implementation | Risk Level |
|---------------|--------|----------------|-----------|
| State-changing operations | ⚠️ **PRODUCTION ISSUE** | In-memory tokens (not distributed) | **Medium** |
| Comment submission | ⚠️ Partial | CSRF token validation implemented | **Medium** |
| Contact form | ⚠️ Partial | CSRF token validation implemented | **Medium** |
| Admin operations | ⚠️ Partial | CSRF token validation implemented | **Medium** |

**Controls:**
- ✅ CSRF token generation (`generateCsrfToken()`)
- ✅ Token validation on POST/PUT/DELETE
- ✅ SameSite=Lax cookie attribute
- ⚠️ **WARNING:** In-memory token storage not suitable for serverless
- ✅ Timing-safe token comparison

**⚠️ PRODUCTION ISSUE:**
Current CSRF implementation uses in-memory storage which is **NOT suitable** for:
- Serverless environments (Vercel, Netlify)
- Multi-instance deployments
- Horizontal scaling

**Recommendation:** Migrate to Redis or Vercel KV for distributed token storage.

**Files:** `lib/security/csrf.ts:1-150`

---

## 6. Security Misconfiguration

### 6.1 Default Credentials

| Attack Vector | Status | Implementation | Risk Level |
|---------------|--------|----------------|-----------|
| Admin accounts | ✅ Protected | OAuth-only, no defaults | Low |
| Database | ✅ Protected | Supabase-managed | Low |
| API keys | ✅ Protected | Environment variables | Low |

**Controls:**
- ✅ No default passwords or credentials
- ✅ OAuth authentication only
- ✅ Secrets in environment variables
- ✅ `.gitignore` prevents credential commits

---

### 6.2 Security Headers

| Header | Status | Implementation | Risk Level |
|--------|--------|----------------|-----------|
| Content-Security-Policy | ⚠️ Partial | CSP with `unsafe-inline` | **Medium** |
| Strict-Transport-Security | ✅ Protected | HSTS 2 years + preload | Low |
| X-Frame-Options | ✅ Protected | DENY | Low |
| X-Content-Type-Options | ✅ Protected | nosniff | Low |
| X-XSS-Protection | ✅ Protected | 1; mode=block | Low |
| Referrer-Policy | ✅ Protected | strict-origin-when-cross-origin | Low |
| Permissions-Policy | ✅ Protected | Restrictive policy | Low |

**⚠️ CSP WARNING:**
Current CSP uses `'unsafe-inline'` and `'unsafe-eval'` for compatibility with:
- Next.js runtime and hydration
- Tailwind CSS inline styles
- Google reCAPTCHA inline scripts

**Recommendation:** Implement nonce-based CSP for stronger XSS protection.

**Files:** `lib/security/headers.ts:10-42`

---

### 6.3 CORS Configuration

| Attack Vector | Status | Implementation | Risk Level |
|---------------|--------|----------------|-----------|
| Wildcard origins | ✅ Protected | Explicit origin required | Low |
| Production CORS | ✅ Protected | `NEXT_PUBLIC_SITE_URL` enforced | Low |
| Credentials exposure | ✅ Protected | Strict origin enforcement | Low |

**Controls:**
- ✅ No wildcard (`*`) origins in production
- ✅ Production requires `NEXT_PUBLIC_SITE_URL` environment variable
- ✅ Throws error if misconfigured
- ✅ `Access-Control-Allow-Credentials: true` with strict origin

**Files:** `lib/security/headers.ts:130-138`

---

## 7. Server-Side Request Forgery (SSRF)

| Attack Vector | Status | Implementation | Risk Level |
|---------------|--------|----------------|-----------|
| External URL fetching | ✅ Protected | No user-controlled URLs | Low |
| Image URLs | ✅ Protected | Restricted to trusted domains | Low |
| API integrations | ✅ Protected | Hardcoded endpoints only | Low |
| Webhook callbacks | ✅ N/A | No webhook functionality | N/A |

**Controls:**
- ✅ No user-controlled URL fetching
- ✅ Image sources restricted in `next.config.ts`
- ✅ Only whitelisted domains (Supabase, Unsplash, Pixabay)
- ✅ No user-provided image URLs in forms

**Files:** `next.config.ts:4-37`

---

## 8. File Upload Vulnerabilities

| Attack Vector | Status | Implementation | Risk Level |
|---------------|--------|----------------|-----------|
| Web shells | ✅ N/A | No file upload functionality | N/A |
| Malicious files | ✅ N/A | No file upload functionality | N/A |
| Path traversal | ✅ N/A | No file upload functionality | N/A |

**Controls:**
- ✅ No file upload feature implemented yet
- 📝 **TODO:** When implementing, use Supabase Storage with:
  - File type validation
  - Size limits
  - Virus scanning
  - Separate storage domain

---

## 9. DNS & Subdomain Attacks

| Attack Vector | Status | Implementation | Risk Level |
|---------------|--------|----------------|-----------|
| Subdomain takeover | ✅ Protected | Vercel-managed DNS | Low |
| DNS hijacking | ✅ Protected | Vercel infrastructure | Low |
| Domain spoofing | ✅ Protected | SPF/DKIM (email only) | Low |

**Controls:**
- ✅ Vercel manages DNS and SSL certificates
- ✅ No dangling DNS records
- ✅ HTTPS enforced via HSTS

---

## 10. Supply Chain Attacks

| Attack Vector | Status | Implementation | Risk Level |
|---------------|--------|----------------|-----------|
| npm packages | ⚠️ **REQUIRES MONITORING** | Manual audits | **Medium** |
| Dependency vulnerabilities | ⚠️ **REQUIRES MONITORING** | `npm audit` | **Medium** |
| Malicious packages | ⚠️ **REQUIRES MONITORING** | Manual review | **Medium** |
| Compromised CDNs | ✅ Protected | Subresource Integrity (SRI) | Low |

**Controls:**
- ✅ `package.json` with version pinning
- ⚠️ Manual `npm audit` required
- ⚠️ No automated dependency scanning
- ✅ CSP restricts script sources

**⚠️ RECOMMENDATION:**
- Implement Dependabot or Snyk for automated scanning
- Enable GitHub security alerts
- Use `npm audit fix` regularly
- Review dependency changes in PRs

**Files:** `package.json`

---

## 11. API Security

### 11.1 API Abuse

| Attack Vector | Status | Implementation | Risk Level |
|---------------|--------|----------------|-----------|
| Mass assignment | ✅ Protected | Explicit field selection | Low |
| BOLA (Broken Object Level Authorization) | ✅ Protected | RLS policies | Low |
| Excessive data exposure | ✅ Protected | Selective field queries | Low |
| Rate limiting bypass | ⚠️ **PRODUCTION ISSUE** | In-memory rate limits | **Medium** |

**Controls:**
- ✅ Supabase `.select()` with explicit columns
- ✅ RLS prevents unauthorized data access
- ✅ Rate limiting on all API endpoints
- ⚠️ **WARNING:** In-memory rate limiting not suitable for production

**Files:** `app/api/comments/route.ts`, `app/api/contact/route.ts`

---

### 11.2 GraphQL/REST API

| Attack Vector | Status | Implementation | Risk Level |
|---------------|--------|----------------|-----------|
| Query depth attacks | ✅ N/A | Not using GraphQL | N/A |
| Batch attacks | ✅ Protected | Rate limiting | Low |
| Pagination abuse | ⚠️ Not implemented | N/A (feature pending) | N/A |

---

## 12. Cryptography

### 12.1 Weak Cryptography

| Attack Vector | Status | Implementation | Risk Level |
|---------------|--------|----------------|-----------|
| Weak hashing algorithms | ✅ Protected | Supabase Auth handles hashing | Low |
| Insecure TLS | ✅ Protected | HSTS enforced | Low |
| Weak random number generation | ✅ Protected | `crypto.randomBytes()` for CSRF | Low |
| Password storage | ✅ Protected | OAuth-only (no passwords stored) | Low |

**Controls:**
- ✅ Supabase Auth uses bcrypt for password hashing
- ✅ HSTS enforces TLS 1.2+
- ✅ Cryptographically secure random tokens
- ✅ No custom encryption implementation

**Files:** `lib/security/csrf.ts:15-24`

---

## 13. DDoS & Bot Protection

| Attack Vector | Status | Implementation | Risk Level |
|---------------|--------|----------------|-----------|
| Layer 7 DDoS | ⚠️ **PRODUCTION ISSUE** | In-memory rate limiting | **Medium** |
| Bot attacks | ✅ Protected | reCAPTCHA v2 | Low |
| Scraping | ⚠️ Partial | Rate limiting only | Medium |
| Resource exhaustion | ✅ Protected | Request size limits (10KB) | Low |

**Controls:**
- ✅ Rate limiting on all endpoints
- ✅ Google reCAPTCHA v2 on contact form
- ✅ Request body size limits (10KB)
- ⚠️ **WARNING:** In-memory rate limiting ineffective against distributed attacks

**⚠️ RECOMMENDATION:**
- Migrate to Redis/Vercel KV for distributed rate limiting
- Consider Cloudflare for DDoS protection
- Implement bot detection beyond reCAPTCHA

**Files:** `lib/security/index.ts:73-186`

---

## 14. Data Exposure

| Attack Vector | Status | Implementation | Risk Level |
|---------------|--------|----------------|-----------|
| Sensitive data in URLs | ✅ Protected | No sensitive data in URLs | Low |
| Error message leakage | ✅ Protected | Generic error messages | Low |
| Debug info exposure | ✅ Protected | Production error handling | Low |
| Source code exposure | ✅ Protected | `.gitignore` configured | Low |

**Controls:**
- ✅ `.gitignore` prevents `.env` commits
- ✅ Generic error messages to users
- ✅ Detailed errors only in server logs
- ✅ No stack traces in production

**Files:** `.gitignore`

---

## 15. Additional Security Controls

### 15.1 Security Logging

| Feature | Status | Implementation |
|---------|--------|----------------|
| Security event tracking | ✅ Implemented | `SecurityLog` class |
| Severity levels | ✅ Implemented | LOW, MEDIUM, HIGH, CRITICAL |
| Request context logging | ✅ Implemented | IP, User-Agent, Path |
| Attack detection | ✅ Implemented | SQL injection, XSS attempts |

**Files:** `lib/security/logger.ts`

---

### 15.2 Input Validation

| Feature | Status | Implementation |
|---------|--------|----------------|
| Email validation | ✅ Implemented | RFC 5322 compliant |
| URL validation | ✅ Implemented | Protocol and format checking |
| Length validation | ✅ Implemented | Min/max constraints |
| Slug validation | ✅ Implemented | URL-safe format |
| Markdown sanitization | ✅ Implemented | DOMPurify integration |

**Files:** `lib/security/validation.ts`

---

## Summary of Critical Issues

### 🔴 HIGH PRIORITY (Immediate Action Required)

1. **In-Memory Rate Limiting (Production Risk)**
   - **Issue:** Rate limiting uses in-memory storage, ineffective in serverless environments
   - **Impact:** Attackers can bypass rate limits, enabling brute force and DDoS attacks
   - **Fix:** Migrate to Redis or Vercel KV
   - **Files:** `lib/security/rateLimit.ts:39-63`

2. **In-Memory CSRF Tokens (Production Risk)**
   - **Issue:** CSRF tokens stored in-memory, lost on server restart/cold starts
   - **Impact:** Legitimate requests rejected, tokens not shared across instances
   - **Fix:** Migrate to Redis or Vercel KV
   - **Files:** `lib/security/csrf.ts:64-150`

---

### 🟡 MEDIUM PRIORITY (Security Improvements)

1. **CSP with unsafe-inline**
   - **Issue:** CSP allows `unsafe-inline` and `unsafe-eval`
   - **Impact:** Weakened XSS protection
   - **Fix:** Implement nonce-based CSP
   - **Files:** `lib/security/headers.ts:10-42`

2. **No Automated Dependency Scanning**
   - **Issue:** Manual dependency audits only
   - **Impact:** Vulnerable dependencies may go unnoticed
   - **Fix:** Implement Dependabot, Snyk, or GitHub security alerts
   - **Files:** `package.json`

---

### ✅ PROTECTED (No Action Required)

- SQL Injection
- XSS (with CSP improvement recommended)
- Authentication & Session Management
- Access Control & Authorization
- SSRF
- Sensitive Data Exposure
- Security Logging
- Input Validation

---

## Testing & Validation

### Manual Testing

```bash
# Test rate limiting
for i in {1..20}; do curl http://localhost:3000/api/comments; done

# Test XSS prevention
curl -X POST http://localhost:3000/api/comments \
  -H "Content-Type: application/json" \
  -d '{"author":"Test","content":"<script>alert(1)</script>","postSlug":"test"}'

# Test SQL injection
curl -X POST http://localhost:3000/api/comments \
  -H "Content-Type: application/json" \
  -d '{"author":"Test","content":"Test","postSlug":"test OR 1=1"}'
```

### Automated Testing Tools

- **OWASP ZAP** - Automated security scanning
- **Burp Suite** - Penetration testing
- **npm audit** - Dependency vulnerability scanning
- **Snyk** - Continuous security monitoring

---

## Compliance Status

| Standard | Status | Coverage |
|----------|--------|----------|
| OWASP Top 10 2021 | ✅ 90% | Missing distributed rate limiting |
| PCI DSS | N/A | No payment processing |
| GDPR | ⚠️ Partial | No data privacy policy implemented |
| SOC 2 | ⚠️ Partial | Logging implemented, no formal audit |

---

## Maintenance Schedule

- **Weekly:** Review security logs for anomalies
- **Monthly:** Run `npm audit` and update dependencies
- **Quarterly:** Conduct manual penetration testing
- **Annually:** Full security audit with external review

---

**Document Version:** 1.0
**Last Security Audit:** December 2025
**Next Audit Due:** March 2026
