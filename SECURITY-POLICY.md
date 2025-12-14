# Security Policy

**Organization:** EMCOGMA
**Application:** EMCOGMA Personal Brand Website
**Effective Date:** December 2025
**Version:** 1.0
**Classification:** Public
**Review Cycle:** Quarterly

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Scope](#2-scope)
3. [Security Governance](#3-security-governance)
4. [Security Standards & Compliance](#4-security-standards--compliance)
5. [Access Control](#5-access-control)
6. [Data Protection](#6-data-protection)
7. [Application Security](#7-application-security)
8. [Infrastructure Security](#8-infrastructure-security)
9. [Incident Response](#9-incident-response)
10. [Security Monitoring](#10-security-monitoring)
11. [Vulnerability Management](#11-vulnerability-management)
12. [Third-Party Security](#12-third-party-security)
13. [Secure Development Lifecycle](#13-secure-development-lifecycle)
14. [Security Training & Awareness](#14-security-training--awareness)
15. [Policy Compliance & Enforcement](#15-policy-compliance--enforcement)
16. [Responsible Disclosure](#16-responsible-disclosure)

---

## 1. Executive Summary

### 1.1 Purpose

This Security Policy establishes the security requirements, controls, and procedures for the EMCOGMA website. The policy aims to:

- Protect user data and organizational assets
- Ensure compliance with industry security standards
- Maintain confidentiality, integrity, and availability of systems
- Provide a framework for secure development and operations

### 1.2 Policy Statement

EMCOGMA is committed to:
- Implementing industry-standard security controls
- Following OWASP Top 10 best practices
- Continuous security monitoring and improvement
- Transparent communication about security issues
- Protecting user privacy and data

### 1.3 Applicability

This policy applies to:
- All developers and contributors
- System administrators
- Third-party service providers
- Users of the EMCOGMA platform

---

## 2. Scope

### 2.1 In Scope

**Applications:**
- EMCOGMA Next.js website (primary application)
- Admin portal (`/admin`)
- Public-facing API endpoints (`/api/*`)

**Infrastructure:**
- Vercel hosting platform
- Supabase database and authentication
- Third-party integrations (Formspree, Google reCAPTCHA)

**Data:**
- User authentication data (OAuth)
- Blog posts, comments, contact submissions
- Admin user records
- Security logs and monitoring data

### 2.2 Out of Scope

- User personal devices
- Third-party platforms (beyond integration points)
- Network infrastructure (managed by Vercel/Supabase)

---

## 3. Security Governance

### 3.1 Roles & Responsibilities

#### Security Owner
- **Role:** Project Owner (EMCOGMA)
- **Responsibilities:**
  - Overall security accountability
  - Approve security policy changes
  - Resource allocation for security initiatives
  - Final decision on security incidents

#### Security Lead (if team grows)
- **Responsibilities:**
  - Implement security controls
  - Conduct security reviews
  - Manage vulnerability remediation
  - Security training and awareness

#### Developers
- **Responsibilities:**
  - Follow secure coding practices
  - Participate in security training
  - Report security issues
  - Implement security controls in code

### 3.2 Security Committee (Future)

When team expands, establish:
- Quarterly security review meetings
- Incident response team
- Change control board for security updates

---

## 4. Security Standards & Compliance

### 4.1 Applicable Standards

**Primary Standards:**
- ✅ **OWASP Top 10 2021** - Web application security
- ✅ **CIS Controls** - Critical security controls
- ✅ **NIST Cybersecurity Framework** - Security best practices

**Compliance Frameworks (as applicable):**
- ⚠️ **GDPR** - Data protection (if EU users)
- ⚠️ **CCPA** - California privacy rights (if CA users)
- ✅ **SOC 2 Type I** - Security controls (via Supabase/Vercel)

### 4.2 Security Control Mapping

| OWASP Top 10 | Control Status | Implementation |
|--------------|----------------|----------------|
| A01 - Broken Access Control | ✅ Implemented | RLS policies + middleware |
| A02 - Cryptographic Failures | ✅ Implemented | HTTPS + secure cookies + HSTS |
| A03 - Injection | ✅ Implemented | Input validation + parameterized queries |
| A04 - Insecure Design | ✅ Implemented | Security by design + threat modeling |
| A05 - Security Misconfiguration | ⚠️ Partial | CSP needs improvement (nonce-based) |
| A06 - Vulnerable Components | ⚠️ Partial | Manual audits (needs automation) |
| A07 - Auth & Session Mgmt | ✅ Implemented | OAuth + 10-min timeout + HTTP-only cookies |
| A08 - Software & Data Integrity | ✅ Implemented | Signed builds + SRI (where applicable) |
| A09 - Logging & Monitoring | ✅ Implemented | Security logging + event tracking |
| A10 - Server-Side Request Forgery | ✅ Implemented | No user-controlled URLs |

---

## 5. Access Control

### 5.1 Authentication Requirements

**Admin Access:**
- ✅ **Multi-Factor Authentication (MFA):** Enforced via OAuth providers (Google/GitHub)
- ✅ **OAuth 2.0:** Industry-standard authentication
- ✅ **No Password Storage:** OAuth-only authentication
- ✅ **Session Management:** 10-minute timeout with HTTP-only cookies

**Public Access:**
- ✅ **reCAPTCHA v2:** Bot protection on forms
- ✅ **Rate Limiting:** Prevents brute force attacks

### 5.2 Authorization Model

**Role-Based Access Control (RBAC):**

| Role | Access Level | Permissions |
|------|--------------|-------------|
| **Anonymous** | Public | Read published content |
| **Authenticated** | User | Submit comments (pending approval) |
| **Admin** | Full | All CRUD operations, comment moderation |

**Database-Level Enforcement:**
- Row-Level Security (RLS) on all tables
- Centralized `is_admin()` function
- Database-driven admin whitelist

**Files:** [lib/supabase/schema.sql:38-47](lib/supabase/schema.sql#L38-L47)

### 5.3 Admin User Management

**Adding Admins:**
```sql
INSERT INTO admin_users (email, created_by, notes)
VALUES ('new-admin@example.com', 'current-admin@example.com', 'Reason for access');
```

**Removing Admins (Soft Delete):**
```sql
UPDATE admin_users
SET active = false,
    deactivated_at = NOW(),
    deactivated_by = 'admin@example.com',
    notes = 'Access revoked - reason here'
WHERE email = 'admin@example.com';
```

**Audit Requirements:**
- All admin additions/removals must be logged
- Quarterly review of active admin accounts
- Immediate revocation upon role change or departure

### 5.4 Session Management

**Requirements:**
- ✅ **Session Timeout:** 10 minutes (configurable via `SESSION_TIMEOUT_MINUTES`)
- ✅ **Idle Timeout:** Automatic logout after inactivity
- ✅ **Secure Cookies:** HTTP-only, Secure flag in production, SameSite=Lax
- ✅ **Session Tracking:** `last_activity` cookie for timeout enforcement
- ✅ **Automatic Logout:** Redirect to login with timeout message

**Files:** [lib/supabase/middleware.ts:39-103](lib/supabase/middleware.ts#L39-L103)

---

## 6. Data Protection

### 6.1 Data Classification

| Classification | Examples | Protection Level |
|----------------|----------|------------------|
| **Public** | Published blog posts, projects | Standard encryption in transit |
| **Internal** | Pending comments, contact submissions | Encryption + access controls |
| **Confidential** | Admin emails, user OAuth tokens | Encryption + strict access controls + audit logging |
| **Restricted** | API keys, database credentials | Secrets management + environment variables |

### 6.2 Data Encryption

**In Transit:**
- ✅ **HTTPS (TLS 1.2+):** All communications encrypted
- ✅ **HSTS Enabled:** Force HTTPS for 2 years
- ✅ **Certificate Management:** Automated via Vercel

**At Rest:**
- ✅ **Database Encryption:** Supabase PostgreSQL encryption
- ✅ **Backup Encryption:** Managed by Supabase

**In Use:**
- ✅ **No Plaintext Secrets:** Environment variables only
- ✅ **OAuth Tokens:** Managed by Supabase Auth

### 6.3 Data Retention

| Data Type | Retention Period | Deletion Method |
|-----------|------------------|-----------------|
| Blog posts | Indefinite | Manual deletion by admin |
| Comments (approved) | Indefinite | Manual deletion by admin |
| Comments (pending) | 90 days | Automatic purge |
| Contact submissions | 1 year | Automatic archival |
| Security logs | 90 days | Automatic rotation |
| Session data | Session expiry | Automatic cleanup |

### 6.4 Data Privacy

**User Rights (GDPR/CCPA Compliance):**
- ✅ **Right to Access:** Contact form for data requests
- ✅ **Right to Deletion:** Email-based data deletion requests
- ⚠️ **Right to Portability:** Not yet implemented (TODO)
- ⚠️ **Privacy Policy:** Not yet published (TODO)

**Personal Data Minimization:**
- ✅ Comment author email is optional
- ✅ No tracking cookies beyond session management
- ✅ No third-party analytics (currently)

---

## 7. Application Security

### 7.1 Input Validation

**All User Input Must:**
- ✅ Be validated against expected format
- ✅ Be sanitized using DOMPurify
- ✅ Have length constraints enforced
- ✅ Be checked for SQL injection patterns
- ✅ Be logged for security monitoring

**Validation Functions:**
- `validateEmail()` - RFC 5322 compliant
- `validateUrl()` - Protocol and format checking
- `validateSlug()` - URL-safe format
- `sanitizeHtml()` - DOMPurify-based XSS prevention
- `sanitizeMarkdown()` - Safe markdown rendering

**Files:** [lib/security/validation.ts](lib/security/validation.ts)

### 7.2 Output Encoding

**Requirements:**
- ✅ React automatic escaping for all dynamic content
- ✅ DOMPurify for any user-generated HTML
- ✅ Markdown sanitization before rendering
- ✅ No `dangerouslySetInnerHTML` without sanitization

### 7.3 Cross-Site Scripting (XSS) Prevention

**Defense Layers:**
1. ✅ **Input Validation:** DOMPurify sanitization
2. ✅ **Output Encoding:** React automatic escaping
3. ⚠️ **Content Security Policy:** CSP with `unsafe-inline` (needs improvement)
4. ✅ **HTTP Headers:** X-XSS-Protection enabled

**TODO:** Implement nonce-based CSP to remove `unsafe-inline`

### 7.4 SQL Injection Prevention

**Controls:**
- ✅ **Parameterized Queries:** Supabase ORM prevents injection
- ✅ **Input Validation:** SQL pattern detection
- ✅ **Row-Level Security:** Database-enforced access control
- ✅ **Security Logging:** Detection attempts logged

**Files:** [lib/security/validation.ts:232](lib/security/validation.ts#L232)

### 7.5 Cross-Site Request Forgery (CSRF) Prevention

**Controls:**
- ✅ **CSRF Tokens:** Token-based validation
- ✅ **SameSite Cookies:** SameSite=Lax attribute
- ⚠️ **Token Storage:** In-memory (needs distributed storage for production)

**Production Requirement:**
- 🔴 **Migrate to Redis/Vercel KV** for distributed CSRF token storage

**Files:** [lib/security/csrf.ts](lib/security/csrf.ts)

### 7.6 Rate Limiting

**Endpoint Limits:**
- API endpoints: 100 requests/minute
- Contact form: 5 requests/minute
- Comments: 10 requests/minute
- Login attempts: 5 attempts/15 minutes

**Production Requirement:**
- 🔴 **Migrate to Redis/Vercel KV** for distributed rate limiting

**Files:** [lib/security/rateLimit.ts](lib/security/rateLimit.ts)

---

## 8. Infrastructure Security

### 8.1 Hosting Security (Vercel)

**Vercel Provides:**
- ✅ Automatic HTTPS/TLS certificates
- ✅ DDoS protection
- ✅ Global CDN with edge caching
- ✅ Automatic security updates
- ✅ SOC 2 Type II compliance

**Configuration:**
- ✅ Environment variables for secrets
- ✅ Production/preview environment separation
- ✅ Deployment protection (preview deployments require auth)

### 8.2 Database Security (Supabase)

**Supabase Provides:**
- ✅ PostgreSQL with encryption at rest
- ✅ Automated backups (daily)
- ✅ Row-Level Security (RLS)
- ✅ Connection pooling
- ✅ SOC 2 Type II compliance

**Configuration:**
- ✅ RLS policies on all tables
- ✅ Centralized admin function (`is_admin()`)
- ✅ Secure connection strings (environment variables)
- ✅ API key rotation capability

### 8.3 DNS & Domain Security

**Controls:**
- ✅ Vercel-managed DNS
- ✅ DNSSEC support
- ✅ CAA records for certificate authority authorization
- ✅ No dangling DNS records

### 8.4 Secrets Management

**Requirements:**
- ✅ **Never commit secrets to git**
- ✅ **Use environment variables** for all secrets
- ✅ **Separate secrets per environment** (dev, staging, prod)
- ✅ **Rotate secrets quarterly** or on compromise
- ✅ **Audit secret access** via Vercel/Supabase logs

**Secret Types:**
- `NEXT_PUBLIC_SUPABASE_URL` - Public (client-safe)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public (client-safe, RLS-protected)
- `SUPABASE_SERVICE_ROLE_KEY` - **Server-only** (never expose)
- `RECAPTCHA_SECRET_KEY` - **Server-only**
- `FORMSPREE_ENDPOINT` - Internal use only

**Files:** [.gitignore](.gitignore)

---

## 9. Incident Response

### 9.1 Incident Classification

| Severity | Definition | Response Time | Notification |
|----------|------------|---------------|--------------|
| **P1 - Critical** | Active data breach, site compromise | < 15 minutes | All stakeholders |
| **P2 - High** | Vulnerability being exploited | < 1 hour | Security team |
| **P3 - Medium** | Vulnerability discovered | < 4 hours | Development team |
| **P4 - Low** | Minor security issue | < 24 hours | Logged only |

### 9.2 Incident Response Process

**1. Detection (0-15 minutes)**
- Identify incident via monitoring alerts
- Classify severity level
- Assemble incident response team

**2. Containment (15-30 minutes)**
- Block malicious IPs via Vercel/Cloudflare
- Disable compromised accounts
- Enable maintenance mode if needed
- Preserve evidence (logs, database snapshots)

**3. Eradication (30 minutes - 2 hours)**
- Identify root cause
- Deploy emergency patch
- Rotate compromised credentials
- Invalidate all sessions if needed

**4. Recovery (2-4 hours)**
- Restore normal operations
- Monitor for recurrence
- Verify fix effectiveness
- Communicate with affected users

**5. Post-Incident Review (24-48 hours)**
- Document incident timeline
- Conduct root cause analysis
- Update security controls
- Lessons learned session
- Policy/procedure updates

### 9.3 Communication Plan

**Internal Communication:**
- Slack/email for immediate alerts
- Incident log in shared document
- Status updates every 30 minutes

**External Communication (if needed):**
- Email notification to affected users
- Status page update
- Public disclosure (if severe)

**Regulatory Reporting:**
- GDPR breach notification (72 hours)
- Follow applicable data breach laws

### 9.4 Evidence Preservation

**Requirements:**
- Preserve logs for 90 days minimum
- Take database snapshots before remediation
- Document all actions taken
- Chain of custody for forensic evidence

---

## 10. Security Monitoring

### 10.1 Security Event Logging

**Logged Events:**
- Authentication attempts (success/failure)
- Authorization failures
- Rate limit violations
- Input validation failures
- SQL injection attempts
- XSS attempts
- CSRF token failures
- Admin operations (CRUD)
- Session timeouts

**Log Retention:**
- Security logs: 90 days
- Audit logs: 1 year
- System logs: 30 days

**Files:** [lib/security/logger.ts](lib/security/logger.ts)

### 10.2 Monitoring Alerts

**Alert Thresholds:**
- Failed logins: > 10/hour
- Rate limit violations: > 100/hour
- SQL injection attempts: > 1
- XSS attempts: > 1
- CSRF failures: > 10/hour
- Unauthorized access: > 5/hour
- Error rate: > 5%

**Alert Channels:**
- Email for critical events (P1, P2)
- Slack for all security events
- Dashboard for metrics

### 10.3 Performance & Availability Monitoring

**Metrics:**
- Uptime: Target 99.9%
- Response time: < 500ms (p95)
- Error rate: < 1%

**Tools:**
- Vercel Analytics (built-in)
- Supabase monitoring dashboard
- Custom security event dashboard (TODO)

---

## 11. Vulnerability Management

### 11.1 Vulnerability Scanning

**Automated Scans:**
- ✅ `npm audit` - Weekly
- ⚠️ Dependabot - Not yet configured
- ⚠️ Snyk - Not yet configured
- ⚠️ OWASP ZAP - Not yet configured

**Manual Testing:**
- Quarterly penetration testing
- Code review for security issues
- Configuration review

### 11.2 Vulnerability Remediation

**SLA by Severity:**
- **Critical:** 24 hours
- **High:** 7 days
- **Medium:** 30 days
- **Low:** 90 days

**Process:**
1. Vulnerability identified
2. Risk assessment and prioritization
3. Patch development
4. Testing in staging environment
5. Production deployment
6. Verification
7. Documentation

### 11.3 Patch Management

**Requirements:**
- Security patches applied within SLA
- Tested in non-production first
- Rollback plan for each deployment
- Change log maintained

**Dependency Updates:**
- Security updates: Immediate
- Minor versions: Monthly
- Major versions: Quarterly (with testing)

---

## 12. Third-Party Security

### 12.1 Vendor Security Assessment

**Critical Vendors:**

| Vendor | Service | Security Certification | Data Access |
|--------|---------|------------------------|-------------|
| Vercel | Hosting | SOC 2 Type II | Infrastructure |
| Supabase | Database/Auth | SOC 2 Type II | All application data |
| Google | reCAPTCHA | ISO 27001 | Form submission metadata |
| Formspree | Email delivery | N/A | Contact form data |

### 12.2 Vendor Requirements

**All vendors must:**
- ✅ Use encryption in transit (TLS 1.2+)
- ✅ Provide security certifications (SOC 2, ISO 27001)
- ✅ Have incident response process
- ✅ Support data deletion requests
- ✅ Provide audit logs

### 12.3 API Security

**External API Calls:**
- Google reCAPTCHA (HTTPS only)
- Formspree (HTTPS only)
- Supabase (HTTPS/WSS only)

**Requirements:**
- ✅ API keys stored in environment variables
- ✅ Rate limiting on all API calls
- ✅ Input validation before API requests
- ✅ Error handling for API failures

---

## 13. Secure Development Lifecycle (SDLC)

### 13.1 Development Phases

**1. Requirements & Design**
- Security requirements definition
- Threat modeling
- Data flow diagrams
- Privacy impact assessment

**2. Development**
- Secure coding guidelines
- Code review for security
- Static analysis (linting)
- Unit tests for security functions

**3. Testing**
- Security testing (manual)
- Penetration testing
- Vulnerability scanning
- Integration testing

**4. Deployment**
- Security configuration review
- Secrets rotation
- Smoke tests
- Rollback plan

**5. Maintenance**
- Continuous monitoring
- Patch management
- Incident response
- Security updates

### 13.2 Code Review Requirements

**All code changes must:**
- ✅ Pass automated security checks (ESLint security rules)
- ✅ Be reviewed by at least one other developer
- ✅ Include security considerations in PR description
- ✅ Pass all tests (including security tests)

**Security-Focused Review:**
- Input validation and sanitization
- Authentication and authorization
- Sensitive data handling
- Error handling and logging
- Third-party dependencies

### 13.3 Version Control Security

**Requirements:**
- ✅ No secrets committed to git
- ✅ `.gitignore` configured properly
- ✅ Pre-commit hooks for secret detection
- ✅ Signed commits (recommended)
- ✅ Branch protection on main/master

### 13.4 Dependency Management

**Requirements:**
- ✅ Version pinning in `package.json`
- ⚠️ Weekly `npm audit` (manual)
- ⚠️ Automated dependency scanning (TODO: Dependabot)
- ✅ Review dependency changes in PRs
- ✅ Avoid dependencies with known vulnerabilities

---

## 14. Security Training & Awareness

### 14.1 Developer Security Training

**Required Training:**
- OWASP Top 10 (annual)
- Secure coding practices (annual)
- Incident response procedures (annual)
- Privacy and data protection (annual)

**Recommended Training:**
- Web security certifications (CEH, OSCP, etc.)
- Security conferences and workshops
- Bug bounty program participation

### 14.2 Security Awareness

**Topics:**
- Phishing awareness
- Password management
- Social engineering
- Secure remote work practices
- Data classification and handling

### 14.3 Security Champions

**When team grows, designate:**
- Security champion per team
- Monthly security knowledge sharing
- Security newsletter distribution
- Security metrics review

---

## 15. Policy Compliance & Enforcement

### 15.1 Compliance Monitoring

**Quarterly Reviews:**
- Security control effectiveness
- Policy compliance audit
- Access control review
- Third-party vendor assessment

**Annual Reviews:**
- Full security audit (internal or external)
- Penetration testing
- Disaster recovery testing
- Policy updates

### 15.2 Non-Compliance Handling

**Violations:**
- Immediate investigation
- Remediation plan
- Documentation
- Training if needed

**Severe Violations:**
- Access revocation
- Incident response activation
- Management escalation
- Legal consultation if needed

### 15.3 Policy Updates

**Update Triggers:**
- Security incident learnings
- Regulatory changes
- Technology changes
- Quarterly review findings

**Update Process:**
1. Draft changes
2. Review by security team
3. Stakeholder approval
4. Communication to team
5. Training if needed
6. Version control

---

## 16. Responsible Disclosure

### 16.1 Reporting Security Issues

**How to Report:**
- **Email:** emcogma@gmail.com
- **Subject:** "Security Vulnerability Report"
- **Include:**
  - Vulnerability description
  - Steps to reproduce
  - Impact assessment
  - Suggested remediation (if any)

**Response Timeline:**
- Acknowledgment: Within 24 hours
- Initial assessment: Within 72 hours
- Status update: Weekly until resolution
- Fix deployment: Based on severity SLA

### 16.2 Responsible Disclosure Guidelines

**We Request:**
- ✅ Give us reasonable time to fix (90 days)
- ✅ Do not exploit the vulnerability
- ✅ Do not access/modify user data
- ✅ Do not perform DoS attacks
- ✅ Keep the issue confidential until fixed

**We Promise:**
- ✅ Acknowledge your report within 24 hours
- ✅ Provide regular status updates
- ✅ Credit you in our security acknowledgments (if desired)
- ✅ Not pursue legal action for good-faith research

### 16.3 Bug Bounty Program

**Status:** Not currently active

**Future Consideration:**
- When traffic reaches 10,000+ monthly users
- Bounty range: $50 - $500 based on severity
- Scope: Public-facing application only
- Platform: HackerOne or Bugcrowd

---

## 17. Security Metrics & KPIs

### 17.1 Security Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Critical vulnerabilities | 0 | 0 | ✅ |
| High vulnerabilities | < 3 | 2* | ⚠️ |
| Security incidents (P1/P2) | 0/month | 0 | ✅ |
| Mean time to patch (MTTP) | < 48 hours | N/A | - |
| Dependencies up-to-date | > 90% | ~85% | ⚠️ |
| Failed login attempts | < 50/day | < 5 | ✅ |
| Session timeout compliance | 100% | 100% | ✅ |

*In-memory rate limiting and CSRF tokens (production deployment issue)

### 17.2 Compliance Dashboard

**Monthly Review:**
- OWASP Top 10 compliance: 90%
- Security control coverage: 85%
- Patch management compliance: 95%
- Training completion: 100%

---

## 18. Document Control

### 18.1 Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | EMCOGMA | Initial security policy |

### 18.2 Review Schedule

- **Quarterly:** Security controls effectiveness review
- **Annually:** Full policy review and update
- **As-needed:** After security incidents or major changes

### 18.3 Approval

**Approved by:** EMCOGMA (Project Owner)
**Date:** December 2025
**Next Review:** March 2026

---

## 19. Related Documents

- [SECURITY.md](SECURITY.md) - Security overview and best practices
- [SECURITY-IMPLEMENTATION.md](SECURITY-IMPLEMENTATION.md) - Technical security implementation
- [ATTACK-SURFACE-CHECKLIST.md](ATTACK-SURFACE-CHECKLIST.md) - Comprehensive attack surface analysis
- [SECURITY-SCANNING-PIPELINE.md](SECURITY-SCANNING-PIPELINE.md) - Automated security scanning procedures
- [ADMIN-SETUP.md](ADMIN-SETUP.md) - Admin portal security setup
- [DEPLOYMENT.md](DEPLOYMENT.md) - Secure deployment procedures

---

## 20. Contact Information

**Security Team:**
- **Primary Contact:** emcogma@gmail.com
- **Emergency:** (Same as primary for now)

**Business Hours:** 9 AM - 5 PM EST
**Response Time:** 24 hours for non-critical, 1 hour for critical

---

**Classification:** Public
**Distribution:** All team members, contractors, and authorized users
**Confidentiality:** This document may be shared publicly as it contains no sensitive information

---

*This Security Policy is a living document and will be updated regularly to reflect evolving security practices and regulatory requirements.*
