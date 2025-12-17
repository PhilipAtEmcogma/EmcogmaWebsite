# Security Incident Response Playbook

**Version:** 1.0
**Last Updated:** December 2025
**Owner:** Security Team

---

## Table of Contents

1. [Incident Classification](#incident-classification)
2. [Immediate Actions (First 5 Minutes)](#immediate-actions-first-5-minutes)
3. [Investigation Phase (5-30 Minutes)](#investigation-phase-5-30-minutes)
4. [Mitigation Phase (30-60 Minutes)](#mitigation-phase-30-60-minutes)
5. [Communication](#communication)
6. [Post-Incident Review](#post-incident-review)
7. [Specific Incident Types](#specific-incident-types)

---

## Incident Classification

### Severity Levels

| Severity | Description | Response Time | Example |
|----------|-------------|---------------|---------|
| **P0 - Critical** | Active breach, data exposure, service down | Immediate | Database breach, credential leak |
| **P1 - High** | Security vulnerability exploited, service degradation | < 15 min | DDoS attack, XSS exploit |
| **P2 - Medium** | Potential vulnerability, suspicious activity | < 1 hour | Excessive rate limit violations |
| **P3 - Low** | Minor security issue, false positive | < 24 hours | Single failed login attempt |

---

## Immediate Actions (First 5 Minutes)

### 1. Verify the Incident

```bash
# Check security monitoring dashboard
# Vercel Dashboard → Logs → Filter by security events

# Check Sentry for errors (if configured)
# https://sentry.io/organizations/your-org/issues/

# Check KV health
# Vercel Dashboard → Storage → KV → Metrics
```

### 2. Alert the Team

**Who to notify:**
- Security Lead (email/Slack/PagerDuty)
- On-call Engineer
- Product Owner (for P0/P1 only)

**Communication channels:**
- Slack: `#security-incidents` (create if doesn't exist)
- PagerDuty: Trigger incident alert
- Email: `security@yourdomain.com`

### 3. Begin Incident Log

Create incident document:

```markdown
# Incident Report: [INCIDENT-YYYY-MM-DD-NNN]

**Detected:** 2025-XX-XX HH:MM UTC
**Severity:** P[0-3]
**Type:** [DDoS / Data Breach / XSS / etc.]
**Status:** ACTIVE / CONTAINED / RESOLVED

## Timeline
- HH:MM - Incident detected
- HH:MM - Team notified
- HH:MM - [Next action]

## Impact
- Affected users: [count/all/none]
- Affected systems: [list]
- Data exposed: [yes/no/unknown]

## Actions Taken
1. [Action with timestamp]
```

### 4. Isolate Affected Component (If Needed)

**For compromised admin account:**
```sql
-- Disable admin access immediately
UPDATE admin_users
SET active = false
WHERE email = 'compromised@example.com';
```

**For IP-based attack:**
```typescript
// Add to vercel.json firewall rules
{
  "name": "Emergency block malicious IP",
  "action": { "mitigate": { "action": "deny" } },
  "condition": {
    "op": "eq",
    "key": "request.ip",
    "value": "ATTACKER_IP"
  }
}
```

**For severe DDoS:**
- Enable Vercel DDoS Protection (Enterprise feature)
- Contact Vercel support immediately
- Consider enabling maintenance mode

---

## Investigation Phase (5-30 Minutes)

### 1. Gather Evidence

**Review logs:**

```bash
# Vercel CLI - recent logs
vercel logs --follow

# Filter for security events
vercel logs | grep -i "security\|error\|unauthorized"

# Supabase logs
# Supabase Dashboard → Logs → Filter by timestamp
```

**Check security monitoring:**

```typescript
// Admin endpoint to view recent security events
// GET /api/admin/security-events

// Check KV for abuse patterns
// GET /api/admin/kv-stats
```

**Database queries:**

```sql
-- Check recent admin activity
SELECT * FROM admin_export_logs
WHERE exported_at > NOW() - INTERVAL '24 hours'
ORDER BY exported_at DESC;

-- Check failed login attempts
-- (Check KV keys: login-attempts:*, login-lock:*)

-- Check suspicious newsletter subscriptions
SELECT * FROM subscribers
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

### 2. Determine Root Cause

**Common attack vectors:**

1. **SQL Injection**
   - Check: API route logs for malformed SQL
   - Tool: Search logs for `' OR 1=1`, `UNION SELECT`, etc.

2. **XSS (Cross-Site Scripting)**
   - Check: CSP violation reports (`/api/csp-report` logs)
   - Tool: Search for `<script>`, `javascript:`, `onerror=`

3. **CSRF (Cross-Site Request Forgery)**
   - Check: CSRF token validation failures
   - Tool: Search logs for `csrf_token_invalid`

4. **Brute Force**
   - Check: Rate limit violations, login attempts
   - Tool: KV keys `violations:*`, `login-attempts:*`

5. **Data Exfiltration**
   - Check: Unexpected export activity, large data fetches
   - Tool: `admin_export_logs` table, Supabase query logs

### 3. Assess Impact Scope

**Questions to answer:**

- [ ] How many users affected?
- [ ] What data was accessed?
- [ ] Was data modified or deleted?
- [ ] Is the attack still active?
- [ ] Are credentials compromised?
- [ ] Is this a targeted or automated attack?

**Impact assessment matrix:**

| Factor | None | Low | Medium | High | Critical |
|--------|------|-----|--------|------|----------|
| Users affected | 0 | 1-10 | 11-100 | 101-1000 | >1000 or all |
| Data exposed | None | Non-PII | PII (emails) | Sensitive PII | Credentials/Secrets |
| Service impact | None | <5% slow | 5-50% slow | 50%+ slow | Full outage |
| Attack duration | N/A | <5 min | 5-30 min | 30-60 min | >1 hour |

---

## Mitigation Phase (30-60 Minutes)

### 1. Apply Immediate Fix

**For compromised credentials:**

```bash
# Rotate all secrets immediately
# Vercel Dashboard → Settings → Environment Variables → Regenerate

# Update in GitHub Secrets
# GitHub → Settings → Secrets and variables → Actions

# Force logout all admin sessions
# Option 1: Update Supabase Auth settings
# Option 2: Manually invalidate sessions via Supabase API
```

**For DDoS/Rate Limit Attack:**

```typescript
// Tighten rate limits temporarily in vercel.json
{
  "firewall": {
    "rules": [
      {
        "name": "Emergency rate limit",
        "action": {
          "mitigate": {
            "action": "rate_limit",
            "rateLimit": {
              "algo": "sliding_window",
              "window": "1m",
              "limit": 10  // Reduced from 100
            }
          }
        },
        "condition": {
          "op": "prefixmatch",
          "key": "request.pathname",
          "value": "/api"
        }
      }
    ]
  }
}
```

**For XSS/Injection Attack:**

```typescript
// Enable strict CSP temporarily
// Set NEXT_PUBLIC_CSP_NONCE_ENABLED=true

// Add to DOMPurify sanitization
// Review lib/security/validation.ts
```

### 2. Increase Monitoring

```typescript
// Enable debug logging
// Set LOG_LEVEL=debug in Vercel env vars

// Increase alert sensitivity
// lib/security/monitoring.ts - reduce thresholds temporarily
```

### 3. Deploy Fix

```bash
# Quick deploy via Vercel CLI
vercel --prod

# Or via Git (faster rollback capability)
git add .
git commit -m "Security fix: [INCIDENT-ID]"
git push origin main

# Monitor deployment
vercel logs --follow
```

### 4. Test Fix

```bash
# Verify fix doesn't break legitimate traffic
curl -H "User-Agent: legitimate" https://yourdomain.com/api/test

# Verify attack is blocked
curl -H "User-Agent: attacker" https://yourdomain.com/api/test
# Expected: 403 or 429

# Check monitoring
# Confirm attack stopped in Vercel logs
```

---

## Communication

### Internal Communication

**During incident (every 30 min updates):**

```markdown
**Incident Update #N - HH:MM UTC**

**Status:** ACTIVE / CONTAINED / RESOLVED
**Severity:** P[0-3]

**Progress:**
- [What we know]
- [What we've done]
- [What's next]

**ETA to resolution:** [estimate or "unknown"]
**Next update:** [time]
```

### External Communication (If Data Exposed)

**GDPR/CCPA requirements:**

- [ ] Notify affected users within 72 hours (GDPR)
- [ ] Provide clear description of breach
- [ ] Explain data affected
- [ ] Outline steps taken
- [ ] Provide contact information

**Email template:**

```markdown
Subject: Security Incident Notification

Dear [User],

We are writing to inform you of a security incident that may have affected your account.

**What happened:**
[Brief description]

**What information was affected:**
[Specific data types - email, name, etc.]

**What we're doing:**
- [Mitigation steps]
- [Security improvements]

**What you should do:**
- Change your password immediately
- Review recent account activity
- Enable two-factor authentication (if available)

**Questions?**
Contact us at security@yourdomain.com

We sincerely apologize for this incident.

[Company Name] Security Team
```

### Status Page Update

```markdown
**Investigating** - We are investigating reports of [issue]
**Identified** - We have identified the cause and are working on a fix
**Monitoring** - Fix deployed, monitoring for stability
**Resolved** - Incident resolved
```

---

## Post-Incident Review

### Within 48 Hours

**Schedule post-mortem meeting:**

- [ ] All stakeholders present
- [ ] Blameless culture
- [ ] Focus on systems, not individuals

**Document in post-mortem report:**

```markdown
# Post-Mortem: [INCIDENT-ID]

**Date:** YYYY-MM-DD
**Severity:** P[0-3]
**Duration:** [start - end]
**Impact:** [summary]

## What Happened
[Chronological timeline]

## Root Cause
[Technical explanation]

## What Went Well
- [Positive aspects]

## What Went Wrong
- [Issues in response]

## Action Items
| Action | Owner | Due Date | Priority |
|--------|-------|----------|----------|
| [Task] | [Name] | [Date] | P[0-3] |

## Lessons Learned
[Key takeaways]
```

### Within 1 Week

**Implement preventative measures:**

- [ ] Update security policies
- [ ] Add new monitoring/alerts
- [ ] Improve documentation
- [ ] Conduct security training
- [ ] Update incident response plan

---

## Specific Incident Types

### DDoS Attack

**Detection:**
- Sudden traffic spike (10x+ normal)
- High rate limit violations
- Slow response times
- 503/504 errors

**Response:**
1. Enable Vercel DDoS Protection (contact support)
2. Tighten rate limits in `vercel.json`
3. Block attacking IPs via firewall rules
4. Enable CDN caching for static assets
5. Consider maintenance mode if severe

**Tools:**
```bash
# Check traffic patterns
vercel logs | grep -E "429|503|504" | wc -l

# Identify attacking IPs
vercel logs | grep 429 | awk '{print $NF}' | sort | uniq -c | sort -rn | head -20
```

---

### Rate Limit Abuse

**Detection:**
- KV event count threshold exceeded
- Multiple 429 responses from single IP
- Unusual API call patterns

**Response:**
```typescript
// Check violation count
const stats = await getAbuseStats(ip);

// Clear violations for legitimate user
await clearViolations(ip);

// Block malicious IP
await blockIdentifier(ip, 86400); // 24 hours
```

**Monitoring:**
```bash
# Check recent rate limits
# Vercel KV Dashboard → Keys → Search "violations:"
```

---

### SQL Injection Attempt

**Detection:**
- CSP violations with suspicious patterns
- Security logger events: `sql_injection_attempt`
- Database errors in logs

**Response:**
1. Block attacking IP immediately
2. Review all SQL queries in affected endpoint
3. Verify parameterized queries used
4. Check database audit logs
5. Scan for injected data

**Prevention:**
```typescript
// All queries should use parameterized queries
const { data } = await supabase
  .from('table')
  .select('*')
  .eq('column', userInput); // Supabase handles escaping

// NEVER concatenate user input
// ❌ BAD: `SELECT * FROM table WHERE column = '${userInput}'`
```

---

### XSS Attack

**Detection:**
- CSP violation reports (`/api/csp-report`)
- Blocked inline scripts
- Suspicious content in database

**Response:**
1. Review CSP violation details
2. Check affected pages for unsanitized user input
3. Verify DOMPurify sanitization applied
4. Scan database for malicious scripts
5. Force re-sanitization of affected content

**Tools:**
```typescript
// Check CSP violations
// GET /api/csp-report logs

// Re-sanitize content
import DOMPurify from 'isomorphic-dompurify';

const clean = DOMPurify.sanitize(dirtyContent, {
  ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a'],
  ALLOWED_ATTR: ['href'],
});
```

---

### CSRF Token Invalid

**Detection:**
- Multiple `csrf_token_invalid` events
- Failed form submissions
- Security monitor alerts

**Response:**
1. Check if legitimate issue (expired tokens, clock skew)
2. Review CSRF implementation
3. Verify token generation/validation
4. Check for token leakage in logs

**Debugging:**
```typescript
// lib/security/csrfDistributed.ts
// Enable debug logging temporarily

// Check KV for CSRF tokens
// Vercel KV → Keys → Search "csrf:"
```

---

### Unauthorized Admin Access

**Detection:**
- Failed admin route access
- Unexpected admin activity
- Session IP changes

**Response:**
```sql
-- Check recent admin activity
SELECT * FROM admin_export_logs
ORDER BY exported_at DESC
LIMIT 100;

-- Disable suspicious admin
UPDATE admin_users
SET active = false
WHERE email = 'suspicious@example.com';

-- Check active sessions
-- Supabase Dashboard → Authentication → Users → Sessions
```

**Immediate actions:**
1. Force logout all admin sessions
2. Reset admin passwords
3. Review audit logs
4. Enable 2FA (if not already)
5. Rotate all API keys

---

### Session Hijacking

**Detection:**
- Session IP address changes
- Multiple simultaneous sessions from different locations
- Unexpected session activity

**Response:**
1. Force logout affected session immediately
2. Notify user of suspicious activity
3. Require password reset
4. Review session cookies for tampering
5. Check for session fixation vulnerability

**Prevention:**
```typescript
// lib/session/validation.ts
// Already implements IP validation and session timeout
// Ensure HTTPS-only cookies in production
```

---

### Data Exfiltration

**Detection:**
- Unusual export activity
- Large data queries
- Unexpected CSV downloads
- Access to bulk endpoints

**Response:**
```sql
-- Check export logs
SELECT *
FROM admin_export_logs
WHERE record_count > 1000  -- Large exports
   OR exported_at > NOW() - INTERVAL '1 hour'
ORDER BY exported_at DESC;

-- Check specific admin activity
SELECT *
FROM admin_export_logs
WHERE admin_email = 'suspicious@example.com';
```

**Immediate actions:**
1. Disable affected admin account
2. Review what data was exported
3. Determine if data reached attacker
4. Notify affected users (if PII exposed)
5. Implement stricter export limits

---

## Emergency Contacts

| Role | Contact | Availability |
|------|---------|-------------|
| Security Lead | security@yourdomain.com | 24/7 |
| On-call Engineer | PagerDuty | 24/7 |
| Vercel Support | https://vercel.com/support | 24/7 (Enterprise) |
| Supabase Support | https://supabase.com/support | Email support |

---

## Tools & Resources

- **Monitoring:** Vercel Dashboard, Sentry (if configured)
- **Logs:** `vercel logs`, Supabase Dashboard
- **KV Management:** Vercel KV Dashboard
- **Security Headers:** https://securityheaders.com
- **CSP Evaluator:** https://csp-evaluator.withgoogle.com
- **OWASP:** https://owasp.org/www-project-top-ten/

---

## Appendix: Quick Reference Commands

```bash
# Check recent security events
vercel logs | grep -i security | tail -50

# Deploy emergency fix
vercel --prod

# Check KV health
curl https://yourdomain.com/api/admin/kv-stats

# Force admin logout (via Supabase)
# Supabase Dashboard → Auth → Users → Select User → Sign Out

# Emergency IP block (add to vercel.json)
# Then: git push && vercel --prod
```

---

**Document Version History:**

- v1.0 (2025-12) - Initial creation with comprehensive incident types
- Next review: 2026-06 (6 months)
