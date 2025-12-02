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
INSERT INTO admin_users (email, created_by, notes)
VALUES ('new-admin@example.com', 'admin@example.com', 'Added for project management');
```

**Note:** Email must be lowercase (enforced by constraint) and match email format validation.

#### Remove/Deactivate Admin (Soft Delete)
```sql
UPDATE admin_users
SET active = false,
    deactivated_at = NOW(),
    deactivated_by = 'admin@example.com',
    notes = 'Access no longer required'
WHERE email = 'admin@example.com';
```

**Important:** Hard deletion of admin records is prevented by RLS policy to maintain audit trail.

#### View All Admins with Audit Trail
```sql
SELECT email, active, created_at, created_by,
       deactivated_at, deactivated_by, notes
FROM admin_users
ORDER BY created_at DESC;
```

#### Audit Trail Features
The `admin_users` table includes comprehensive audit tracking:
- **created_by**: Email of admin who added this user
- **deactivated_at**: Timestamp when admin was deactivated
- **deactivated_by**: Email of admin who deactivated this user
- **notes**: Context about why admin was added/removed

This provides full accountability for admin access changes.

### API Security

- **Public routes**: Read-only, published content
- **Protected routes**: Require authentication + `is_admin()` check
- **Service role key**: Never exposed to client
- **RLS enforcement**: All queries subject to row-level security

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

## 🔒 Input Validation & Constraints

### Email Validation
All admin emails are validated with multiple layers of security:

**Format Validation:**
```sql
-- Enforced by database constraint
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
```

**Case Normalization:**
```sql
-- All emails must be lowercase
CHECK (email = LOWER(email))
```

**Benefits:**
- Prevents invalid email formats
- Ensures consistent email casing
- Reduces case-sensitivity bugs
- Improves index performance

### Performance Optimization
The secure schema includes optimized indexes:
- Single column index on `email` for fast lookups
- Single column index on `active` for filtering
- **Composite index** on `(LOWER(email), active)` for optimal `is_admin()` performance

This ensures admin authentication remains fast even as the admin list grows.

## 📋 Security Checklist

Before deploying:

- [ ] `.gitignore` includes all environment files
- [ ] No `.env` files committed to repository
- [ ] All secrets use environment variables
- [ ] `.env.example` has placeholder values only
- [ ] Supabase RLS policies are enabled (using secure schema)
- [ ] `is_admin()` function created in Supabase
- [ ] `admin_users` table populated with admin emails
- [ ] Migration to secure schema completed ([migrate-to-secure-schema-safe.sql](lib/supabase/migrate-to-secure-schema-safe.sql))
- [ ] Email validation constraints in place (format + lowercase)
- [ ] Audit trail columns added to admin_users
- [ ] Soft delete enforcement enabled (no hard deletes)
- [ ] Composite indexes created for performance
- [ ] OAuth providers configured (Google/GitHub) in Supabase Auth
- [ ] Production secrets set in Vercel dashboard
- [ ] SSL/TLS enabled (automatic with Vercel)
- [ ] Security headers configured
- [ ] Dependencies audited (`npm audit`)
- [ ] RLS policies tested (see ADMIN-SETUP.md Testing section)

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
