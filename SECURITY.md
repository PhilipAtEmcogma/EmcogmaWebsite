# Security Guide

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

### Row Level Security (RLS)

All Supabase tables use RLS policies:

- **Public read** for published content
- **Authenticated users only** for admin operations
- **Email-based admin check** via `auth.jwt() ->> 'email'`

### Admin Access

Admin routes (`/admin`) are protected by:

1. Supabase Authentication
2. Middleware checking user session
3. Row Level Security on database operations

### API Security

- Public routes: Read-only, published content
- Protected routes: Require authentication
- Service role key: Never exposed to client

## 🚨 Security Headers

Configured in `vercel.json`:

```json
{
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin"
}
```

## 📋 Security Checklist

Before deploying:

- [ ] `.gitignore` includes all environment files
- [ ] No `.env` files committed to repository
- [ ] All secrets use environment variables
- [ ] `.env.example` has placeholder values only
- [ ] Supabase RLS policies are enabled
- [ ] Admin email is set in environment variables
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
