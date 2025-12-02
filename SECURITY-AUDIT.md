# Security Audit & Best Practices

## 🔒 Security Status: ENHANCED

This document outlines the security measures implemented in the Emcogma website and provides guidance for secure deployment.

## ✅ Security Measures Implemented

### 1. Environment Variable Protection

**Status:** ✅ **SECURE**

All sensitive information is stored in environment variables:

```env
# .env.local (NEVER commit this file)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_EMAIL=your-admin-email@example.com
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-site-key
RECAPTCHA_SECRET_KEY=your-secret-key
```

**Protected by:**
- `.gitignore` excludes all `.env*` files except `.env.example`
- No hardcoded secrets in source code
- Environment variables only accessible server-side (except NEXT_PUBLIC_* prefixed ones)

### 2. Database Security (Row Level Security)

**Status:** ✅ **SECURE - TWO IMPLEMENTATIONS**

#### Option A: Enhanced Schema with Admin Users Table (RECOMMENDED)
**File:** `lib/supabase/schema-secure.sql`

**Benefits:**
- ✅ No hardcoded emails in RLS policies
- ✅ Uses `is_admin()` function that checks `admin_users` table
- ✅ Easy to add/remove admins without schema changes
- ✅ Can temporarily disable admin access
- ✅ Audit trail of all admin users

**Setup:**
```sql
-- 1. Run schema-secure.sql
-- 2. Insert your admin email:
INSERT INTO admin_users (email) VALUES ('your-admin-email@example.com');

-- To add more admins:
INSERT INTO admin_users (email) VALUES ('another-admin@example.com');

-- To revoke access:
UPDATE admin_users SET active = false WHERE email = 'admin@example.com';
```

#### Option B: Legacy Schema with Hardcoded Email
**File:** `lib/supabase/schema.sql`

**⚠️ WARNING:** Contains hardcoded admin email in 8 places
**Recommendation:** Use `schema-secure.sql` instead

### 3. Authentication Security

**Status:** ✅ **SECURE**

- OAuth-only authentication (Google, GitHub)
- No password storage
- Email whitelist validation in middleware
- Session management via Supabase Auth
- Automatic token refresh
- Secure cookie handling

### 4. API Route Security

**Status:** ✅ **SECURE**

**Contact Form (`/api/contact`):**
- Server-side reCAPTCHA verification
- Secret key never exposed to client
- Rate limiting via reCAPTCHA
- Input validation

**Comments API (`/api/comments`):**
- POST: Public can submit (requires approval)
- GET: Only returns approved comments
- Admin approval required via admin portal

### 5. Middleware Protection

**Status:** ✅ **SECURE**

**Protected Routes:**
- `/admin/*` - Requires OAuth login + email whitelist match
- Automatic redirect to `/admin/login` if unauthorized
- Session validation on every request

### 6. Client-Side Security

**Status:** ✅ **SECURE**

- HTTPS enforced in production (Vercel)
- Secure cookies (HttpOnly, Secure, SameSite)
- No sensitive data in localStorage
- XSS protection via React's automatic escaping
- CSRF protection via Supabase Auth

## 🚨 Removed Security Issues

### Fixed: Hardcoded Admin Email in Schema
**Before:** Admin email hardcoded in 8 RLS policies
**After:** Created `schema-secure.sql` with `is_admin()` function

### Fixed: Exposed Supabase URL in Documentation
**Before:** Real Supabase URL visible in docs
**After:** Replaced with placeholders

### Fixed: Exposed Admin Email in Documentation
**Before:** Real admin email visible in docs
**After:** Replaced with placeholders

## 🔐 Secrets That MUST Stay Secret

### ❌ NEVER Expose These:

1. **RECAPTCHA_SECRET_KEY** - Server-only verification key
2. **SUPABASE_SERVICE_ROLE_KEY** - Bypasses RLS (if used)
3. **Admin Email** - Only in .env.local
4. **OAuth Client Secrets** - Only in Supabase dashboard
5. **Private API Keys** - Never commit to git

### ✅ Safe to Expose (Public):

1. **NEXT_PUBLIC_SUPABASE_URL** - Public Supabase endpoint
2. **NEXT_PUBLIC_SUPABASE_ANON_KEY** - Client-side key with RLS
3. **NEXT_PUBLIC_RECAPTCHA_SITE_KEY** - Public reCAPTCHA site key

## 📋 Pre-Deployment Security Checklist

### Before Deploying to Production:

- [ ] Verify `.env.local` is in `.gitignore`
- [ ] Confirm no secrets in git history: `git log -p | grep -i "secret\|password\|key"`
- [ ] Use `schema-secure.sql` instead of `schema.sql`
- [ ] Insert admin email into `admin_users` table
- [ ] Enable RLS on all Supabase tables
- [ ] Configure OAuth providers in Supabase
- [ ] Set up environment variables in Vercel/hosting platform
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Configure proper CORS policies
- [ ] Set up Supabase Auth redirect URLs
- [ ] Test admin login with OAuth
- [ ] Verify non-admin users cannot access `/admin`

### After Deployment:

- [ ] Verify `.env.local` not deployed (only platform env vars used)
- [ ] Test reCAPTCHA verification works
- [ ] Check that RLS policies enforce correctly
- [ ] Monitor Supabase logs for unauthorized access attempts
- [ ] Set up database backups
- [ ] Configure rate limiting if needed

## 🔍 Security Testing Commands

### Check for exposed secrets in codebase:
```bash
# Search for potential secrets
grep -r "SECRET\|PASSWORD\|API_KEY" . --exclude-dir={node_modules,.next,.git}

# Check git history for secrets
git log -p | grep -i "secret\|password\|key\|token"

# Verify .env files are ignored
git status --ignored | grep "\.env"
```

### Verify environment variables:
```bash
# Development
npm run dev
# Check console for missing env vars

# Production build
npm run build
# Verify no secrets in build output
```

## 🛡️ Runtime Security Validation

Create a utility to validate environment variables on startup:

**File:** `lib/utils/validateEnv.ts` (to be created)

```typescript
export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'ADMIN_EMAIL',
    'RECAPTCHA_SECRET_KEY',
    'NEXT_PUBLIC_RECAPTCHA_SITE_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(process.env.ADMIN_EMAIL!)) {
    throw new Error('ADMIN_EMAIL must be a valid email address');
  }
}
```

## 🚀 Secure Deployment Steps

### 1. Set Up Vercel Environment Variables

```bash
# Via Vercel Dashboard: Settings → Environment Variables
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
ADMIN_EMAIL=your-admin@example.com
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-site-key
RECAPTCHA_SECRET_KEY=your-secret-key
```

### 2. Configure Supabase

```sql
-- Run schema-secure.sql
-- Then add admin:
INSERT INTO admin_users (email) VALUES ('your-admin@example.com');
```

### 3. Set OAuth Redirect URLs

In Supabase Auth settings:
```
Site URL: https://yourdomain.com
Redirect URLs:
- https://yourdomain.com/admin
- https://yourdomain.com/auth/callback
```

## 📚 Additional Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)
- [Vercel Security](https://vercel.com/docs/security)

## 🆘 Security Incident Response

If you suspect a security breach:

1. **Immediately** rotate all secrets:
   - Regenerate Supabase anon key
   - Regenerate reCAPTCHA keys
   - Update OAuth client secrets

2. Review Supabase logs for unauthorized access

3. Check git history: `git log -p | grep -i "secret"`

4. If secrets were committed, consider repository as compromised:
   - Rotate ALL secrets
   - Use `git-filter-branch` or BFG Repo-Cleaner to remove from history
   - Force push (⚠️ disrupts collaborators)

5. Update `admin_users` table if admin access was compromised

## ✅ Security Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Environment Variables | ✅ SECURE | All secrets in .env files |
| Database RLS | ✅ SECURE | schema-secure.sql recommended |
| Authentication | ✅ SECURE | OAuth only, email whitelist |
| API Routes | ✅ SECURE | Server-side verification |
| Documentation | ✅ SANITIZED | No real secrets in docs |
| .gitignore | ✅ SECURE | Excludes all secrets |
| Middleware | ✅ SECURE | Route protection enabled |

## 📝 Maintenance

- Review and update admin users quarterly
- Rotate secrets annually or if compromised
- Keep dependencies updated: `npm audit fix`
- Monitor Supabase logs weekly
- Review RLS policies when adding features

---

**Last Updated:** 2025-01-02
**Next Review:** 2025-04-02
