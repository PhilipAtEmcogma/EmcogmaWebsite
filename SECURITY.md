# Security Guide

> **📘 For comprehensive security implementation details, see [SECURITY-IMPLEMENTATION.md](SECURITY-IMPLEMENTATION.md)**

## 🛡️ Security Overview

This project implements enterprise-grade security measures following OWASP best practices:

✅ **Rate Limiting** - Prevents brute force and DDoS attacks
✅ **Input Validation** - Comprehensive sanitization against XSS and injection
✅ **CSRF Protection** - Token-based protection for state-changing operations
✅ **Security Headers** - CSP, HSTS, X-Frame-Options, and more
✅ **XSS Prevention** - Multi-layer defense with sanitization and CSP
✅ **SQL Injection Prevention** - Parameterized queries + pattern detection
✅ **Security Logging** - Real-time tracking of security events
✅ **Row-Level Security** - Database-enforced access control

## 🔒 Secrets Management

### What's Protected

The following files are **automatically excluded** from Git via `.gitignore`:

```
✓ .env
✓ .env.local
✓ .env.development.local
✓ .env.test.local
✓ .env.production.local
✓ .env.development
✓ .env.test
✓ .env.production
✓ *.env (any file ending in .env)
✓ secrets.json
✓ *.key, *.pem, *.cert files
✓ service-account*.json
```

**Exception:** `.env.example` is NOT ignored (it should be committed as a template with placeholder values)

### Sensitive Information

**Never commit these to GitHub:**

1. **Supabase Credentials:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (if using)

2. **Admin Credentials:**
   - `ADMIN_EMAIL`

3. **reCAPTCHA Keys:**
   - `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` (safe to expose - client-side)
   - `RECAPTCHA_SECRET_KEY` (MUST be server-only - NEVER expose to client)

4. **API Keys:**
   - Third-party service API keys
   - OAuth tokens
   - Authentication secrets

4. **Production URLs:**
   - `SITE_URL` (if it reveals internal infrastructure)

### How Secrets Are Managed

#### Development (.env.local)
```env
# Local development only - NEVER commit this file
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
ADMIN_EMAIL=admin@example.com
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lcxxxxxx...
RECAPTCHA_SECRET_KEY=6Lcxxxxxx...
```

#### Production (Vercel Environment Variables)
Set in Vercel Dashboard → Settings → Environment Variables

#### Template (.env.example)
```env
# Safe to commit - contains only placeholders
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_EMAIL=your-admin-email@example.com
```

## 🛡️ Security Best Practices

### Before First Commit

1. **Verify .gitignore is in place:**
   ```bash
   git status
   # Should NOT show .env or .env.local
   ```

2. **Check for secrets in code:**
   ```bash
   grep -r "SUPABASE_URL\|API_KEY\|SECRET" --exclude-dir=node_modules --exclude-dir=.next
   # Should only show process.env references, not actual values
   ```

3. **Scan for committed secrets:**
   ```bash
   git log -p | grep -i "api_key\|secret\|password"
   ```

### If You Accidentally Commit Secrets

1. **Immediately rotate all exposed credentials:**
   - Reset Supabase API keys
   - Change admin passwords
   - Revoke OAuth tokens

2. **Remove from Git history:**
   ```bash
   # For recent commit
   git reset --soft HEAD~1
   git reset HEAD .env
   git commit -c ORIG_HEAD

   # For older commits - use git filter-branch or BFG Repo Cleaner
   ```

3. **Force push to update remote:**
   ```bash
   git push --force
   ```

4. **Consider repository private** on GitHub if secrets were exposed

## 🔐 Authentication & Authorization

### Row Level Security (RLS) - Secure Schema

All Supabase tables use **secure RLS policies** with centralized admin checking:

#### Centralized Admin Function
```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE email = auth.jwt() ->> 'email'
    AND active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Benefits of Secure Schema
- **No Hardcoded Emails**: All RLS policies use `is_admin()` function instead of hardcoded email checks
- **Database-driven Access**: Admin access controlled via `admin_users` table
- **Easy Admin Management**: Add/remove admins via SQL without schema changes or code deployment
- **Centralized Logic**: Single source of truth for admin verification

#### RLS Policy Structure
- **Public read** for published/active content (e.g., `published = true`, `active = true`)
- **Admin-only writes** via `is_admin()` function check
- **Comment moderation**: Public can insert, admin can approve/edit/delete

### Admin Access

Admin routes (`/admin`) are protected by multiple layers:

1. **OAuth Authentication** (Google/GitHub via Supabase Auth)
2. **Middleware** checking user session
3. **Database Check** via `admin_users` table
4. **Row Level Security** on all database operations using `is_admin()`

### Admin Management

#### Add New Admin
```sql
INSERT INTO admin_users (email)
VALUES ('new-admin@example.com');
```

#### Remove/Deactivate Admin
```sql
UPDATE admin_users
SET active = false
WHERE email = 'admin@example.com';
```

#### View All Admins
```sql
SELECT email, active, created_at
FROM admin_users
ORDER BY created_at DESC;
```

### API Security

- **Public routes**: Read-only, published content
- **Protected routes**: Require authentication + `is_admin()` check
- **Service role key**: Never exposed to client
- **RLS enforcement**: All queries subject to row-level security

## 🚨 Security Headers

Security headers are automatically applied via middleware to all responses:

### Applied Headers

- **Content-Security-Policy**: Restricts resource loading to prevent XSS
- **Strict-Transport-Security**: Forces HTTPS for 2 years
- **X-Frame-Options**: `DENY` - Prevents clickjacking
- **X-Content-Type-Options**: `nosniff` - Prevents MIME sniffing
- **X-XSS-Protection**: `1; mode=block` - Legacy XSS protection
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features

### Implementation

Headers are applied in:
1. `lib/supabase/middleware.ts` - All requests
2. `lib/security/headers.ts` - Security header configurations
3. `next.config.ts` - Backup headers

## 🔒 Rate Limiting

All API endpoints are protected with rate limiting:

- **API Routes**: 100 requests/minute
- **Contact Form**: 5 requests/minute
- **Comments**: 10 requests/minute
- **Login Attempts**: 5 attempts/15 minutes

Rate limits track both IP address and User-Agent for accuracy.

### Response Headers

When rate limited, responses include:
- `X-RateLimit-Limit`: Maximum allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp
- `Retry-After`: Seconds until retry

## 🧹 Input Validation

All user input is validated and sanitized:

### Validation Features

- **HTML Sanitization**: Removes dangerous tags and scripts
- **Email Validation**: RFC 5322 compliant
- **URL Validation**: Protocol and format checking
- **Length Limits**: Prevents oversized inputs
- **SQL Injection Detection**: Pattern-based detection
- **XSS Prevention**: Strips event handlers and dangerous protocols

### Protected Endpoints

- `/api/comments` - Comment validation with XSS prevention
- `/api/contact` - Contact form with email validation + reCAPTCHA

## 📊 Security Logging

All security events are logged for monitoring:

### Logged Events

- Rate limit violations
- Invalid input attempts
- SQL injection attempts
- XSS attempts
- CSRF token failures
- Unauthorized access attempts

### Severity Levels

- **LOW**: Minor validation errors
- **MEDIUM**: Rate limiting, invalid tokens
- **HIGH**: Injection attempts, unauthorized access
- **CRITICAL**: Active attacks, system compromises

Logs are available in development console and can be integrated with monitoring services (Sentry, LogRocket, CloudWatch) in production.

## 📋 Security Checklist

Before deploying:

- [ ] `.gitignore` includes all environment files
- [ ] No `.env` files committed to repository
- [ ] All secrets use environment variables
- [ ] `.env.example` has placeholder values only
- [ ] Supabase RLS policies are enabled (using secure schema)
- [ ] `is_admin()` function created in Supabase
- [ ] `admin_users` table populated with admin emails
- [ ] Secure schema ([lib/supabase/schema.sql](lib/supabase/schema.sql)) executed in Supabase
- [ ] OAuth providers configured (Google/GitHub) in Supabase Auth
- [ ] Production secrets set in Vercel dashboard
- [ ] SSL/TLS enabled (automatic with Vercel)
- [ ] Security headers configured
- [ ] Dependencies audited (`npm audit`)

## 🔍 Regular Security Audits

### Monthly

```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

### After Major Updates

```bash
# Full security audit
npm audit fix

# Test authentication flows
# Review Supabase logs
# Check Vercel analytics for anomalies
```

## 📞 Incident Response

If you suspect a security breach:

1. **Immediately:**
   - Rotate all API keys and secrets
   - Check Supabase auth logs
   - Review Vercel deployment logs

2. **Investigate:**
   - Review recent code changes
   - Check for unauthorized access
   - Analyze database activity

3. **Remediate:**
   - Patch vulnerabilities
   - Update security policies
   - Notify affected users if necessary

## 📚 Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Vercel Security](https://vercel.com/docs/security/overview)

---

**Remember:** Security is an ongoing process, not a one-time setup. Regularly review and update your security practices.
