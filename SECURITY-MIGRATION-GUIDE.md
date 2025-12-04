# Security Migration Guide

**Project:** EMCOGMA Website
**Created:** December 2025
**Status:** Ready for Production Deployment

---

## Overview

This guide walks you through deploying the enhanced security features to production. All critical security issues have been addressed with production-ready implementations.

---

## What's Been Fixed

### ✅ **CRITICAL ISSUES RESOLVED**

1. **Distributed Rate Limiting** - Now using Vercel KV
2. **Distributed CSRF Tokens** - Now using Vercel KV
3. **Nonce-Based CSP** - Optional enhanced XSS protection
4. **Automated Dependency Scanning** - Dependabot configured
5. **CI/CD Security Pipeline** - GitHub Actions workflow ready
6. **Privacy Policy** - GDPR/CCPA compliant page created

---

## Pre-Deployment Checklist

### 1. Vercel KV Setup (Required for Production)

**Step 1: Create Vercel KV Database**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Storage** → **Create Database**
3. Select **KV** (Redis-compatible)
4. Name it: `emcogma-security-kv`
5. Choose region closest to your primary users
6. Click **Create**

**Step 2: Get KV Credentials**

After creation, you'll see three environment variables:
```
KV_REST_API_URL=https://xxx.upstash.io
KV_REST_API_TOKEN=AXXXxxx...
KV_REST_API_READ_ONLY_TOKEN=Ayyy...
```

**Step 3: Add to Vercel Environment Variables**

1. Go to your project in Vercel Dashboard
2. **Settings** → **Environment Variables**
3. Add the following:

| Variable | Value | Environment |
|----------|-------|-------------|
| `KV_REST_API_URL` | (from Vercel KV) | Production, Preview |
| `KV_REST_API_TOKEN` | (from Vercel KV) | Production, Preview |
| `KV_REST_API_READ_ONLY_TOKEN` | (from Vercel KV) | Production, Preview |

---

### 2. Update Existing Environment Variables

Make sure these are set in Vercel:

| Variable | Required | Example |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | `eyJhbGc...` |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | ✅ Yes | `6Lcxxx...` |
| `RECAPTCHA_SECRET_KEY` | ✅ Yes | `6Lcxxx...` |
| `FORMSPREE_ENDPOINT` | ✅ Yes | `https://formspree.io/f/xxx` |
| `NEXT_PUBLIC_SITE_URL` | ✅ Yes | `https://yourdomain.com` |
| `SESSION_TIMEOUT_MINUTES` | ⚠️ Optional | `10` (default) |
| `NEXT_PUBLIC_CSP_NONCE_ENABLED` | ⚠️ Optional | `false` (default) |

---

### 3. Supabase Configuration

**Verify Admin Users Table:**

```sql
-- Check if admin_users table exists
SELECT * FROM admin_users;

-- If needed, add yourself as admin
INSERT INTO admin_users (email, created_by, notes)
VALUES ('your-email@example.com', 'system', 'Initial admin setup');
```

---

### 4. GitHub Configuration (Optional but Recommended)

**Step 1: Enable Dependabot**

1. Go to your GitHub repository
2. **Settings** → **Security** → **Code security and analysis**
3. Enable **Dependabot alerts**
4. Enable **Dependabot security updates**
5. The `.github/dependabot.yml` file will automatically configure it

**Step 2: Set up GitHub Actions**

1. The `.github/workflows/security.yml` is already configured
2. Push the changes to GitHub
3. Go to **Actions** tab to see security checks running

**Step 3: Add Branch Protection (Optional)**

1. **Settings** → **Branches** → **Add rule**
2. Branch name pattern: `main` or `master`
3. Enable:
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - Select: `Security Scan` workflows

---

## Deployment Steps

### Step 1: Deploy to Vercel

```bash
# Option A: Push to GitHub (auto-deploy)
git add .
git commit -m "feat: Implement enterprise security features

- Distributed rate limiting with Vercel KV
- Distributed CSRF tokens with Vercel KV
- Nonce-based CSP support
- Dependabot configuration
- GitHub Actions security pipeline
- Privacy policy page (GDPR/CCPA compliant)
"
git push origin main

# Option B: Deploy via Vercel CLI
vercel --prod
```

### Step 2: Verify Deployment

**Check Security Headers:**
```bash
curl -I https://yourdomain.com | grep -i "strict-transport-security\|x-content-type-options\|x-frame-options\|content-security-policy"
```

Expected output:
```
strict-transport-security: max-age=63072000; includeSubDomains; preload
x-content-type-options: nosniff
x-frame-options: DENY
content-security-policy: default-src 'self'; ...
```

**Test Rate Limiting:**
```bash
# Should succeed first 5 times, then get 429 Too Many Requests
for i in {1..7}; do
  echo "Request $i:"
  curl -X POST https://yourdomain.com/api/contact \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test@test.com","message":"Test"}' \
    -w "\nStatus: %{http_code}\n\n"
done
```

**Verify KV Integration:**

1. Go to Vercel Dashboard → Storage → Your KV database
2. Click **Data Browser**
3. After making some requests, you should see keys like:
   - `ratelimit:xxx.xxx.xxx.xxx:Mozilla...`
   - `csrf:xxxxx...`

### Step 3: Monitor Initial Traffic

1. **Vercel Analytics:** Check for errors or unusual patterns
2. **Supabase Logs:** Monitor for authentication issues
3. **GitHub Actions:** Ensure security scans pass

---

## Feature Activation

### Enabling Nonce-Based CSP (Optional - Advanced)

**Why Enable:**
- Stronger XSS protection
- Removes `unsafe-inline` from CSP
- Industry best practice

**When NOT to Enable:**
- If you have inline scripts without nonce support
- During initial deployment (enable after stability)
- If using third-party scripts that require `unsafe-inline`

**How to Enable:**

1. Add environment variable in Vercel:
   ```
   NEXT_PUBLIC_CSP_NONCE_ENABLED=true
   ```

2. Redeploy

3. Test thoroughly - some scripts may break without nonces

**Troubleshooting CSP Issues:**

If pages break after enabling nonces:
1. Check browser console for CSP violations
2. Add `nonce` attribute to any inline scripts
3. Or disable nonces temporarily: `NEXT_PUBLIC_CSP_NONCE_ENABLED=false`

---

## Post-Deployment Verification

### Security Checklist

- [ ] **Rate Limiting Works**
  - Test API endpoints get rate limited after threshold
  - Check Vercel KV has rate limit keys

- [ ] **CSRF Protection Works**
  - Forms require valid CSRF tokens
  - Invalid tokens are rejected

- [ ] **Session Timeout Works**
  - Admin session expires after 10 minutes idle
  - User is redirected to login with timeout message

- [ ] **Security Headers Present**
  - All required headers in responses
  - CSP configured correctly

- [ ] **Admin Access Works**
  - OAuth login successful
  - Admin operations functional
  - Unauthorized users blocked

- [ ] **Supabase RLS Working**
  - Public can only see published content
  - Admin can perform CRUD operations

- [ ] **Privacy Policy Accessible**
  - Visit https://yourdomain.com/privacy
  - Page renders correctly

### Performance Checklist

- [ ] **No Performance Regression**
  - Page load times similar to before
  - API response times acceptable
  - Vercel KV latency < 50ms

- [ ] **No Breaking Changes**
  - All pages load correctly
  - Forms submit successfully
  - Comments display properly

---

## Rollback Plan (If Issues Occur)

### Emergency Rollback

**Option 1: Revert Deployment (Vercel Dashboard)**
1. Go to **Deployments** in Vercel
2. Find previous working deployment
3. Click **⋯** → **Promote to Production**

**Option 2: Disable New Features**

Set these environment variables in Vercel to temporarily disable new features:

```bash
# This will NOT work - we've migrated to distributed implementations
# You would need to revert code changes
```

**Note:** The new implementations are production-ready. Rollback should only be needed for unexpected issues.

### Partial Rollback (Disable Specific Features)

**Disable Nonce-Based CSP:**
```
NEXT_PUBLIC_CSP_NONCE_ENABLED=false
```

**Fallback to In-Memory (NOT RECOMMENDED):**
Would require code changes - not a simple environment variable change.

---

## Monitoring & Maintenance

### Weekly Tasks

- [ ] Check Dependabot PRs and merge if safe
- [ ] Review GitHub Actions security scan results
- [ ] Monitor rate limiting thresholds

### Monthly Tasks

- [ ] Review Vercel KV usage and costs
- [ ] Run `npm audit` manually
- [ ] Check for Supabase database growth
- [ ] Review admin user list

### Quarterly Tasks

- [ ] Full security audit
- [ ] Penetration testing
- [ ] Update security documentation

---

## Cost Implications

### Vercel KV Pricing

**Hobby Plan (Free tier):**
- 256 MB storage
- 10,000 commands/day
- Should be sufficient for small-medium sites

**Pro Plan ($20/month):**
- 512 MB storage
- 100,000 commands/day
- Required for high-traffic sites

**Estimate for your site:**
- Rate limiting: ~100 requests/hour = 2,400/day
- CSRF tokens: ~50 sessions/day
- **Total: ~3,000 commands/day** (well within free tier)

### Recommendations

- Start with **Free tier**
- Monitor usage in Vercel Dashboard → Storage → Usage
- Upgrade only if approaching limits

---

## Troubleshooting

### Issue: "kv is not defined" Error

**Cause:** Vercel KV environment variables not set

**Solution:**
1. Verify KV environment variables in Vercel Dashboard
2. Redeploy after adding variables
3. Check Vercel deployment logs

---

### Issue: Rate Limiting Not Working

**Symptoms:**
- Can make unlimited requests
- No rate limit keys in Vercel KV

**Solution:**
1. Check if `KV_REST_API_TOKEN` is set correctly
2. Verify Vercel KV database is active
3. Check server logs for KV connection errors

---

### Issue: CSRF Token Failures

**Symptoms:**
- Forms always say "Invalid CSRF token"
- Even valid submissions rejected

**Solution:**
1. Check if Vercel KV is accessible
2. Verify session cookies are being set
3. Ensure `NEXT_PUBLIC_SITE_URL` matches actual domain

---

### Issue: Session Timeout Not Working

**Symptoms:**
- Admin stays logged in indefinitely
- No automatic logout after 10 minutes

**Solution:**
1. Check `SESSION_TIMEOUT_MINUTES` environment variable
2. Verify middleware is running
3. Check browser cookies (`last_activity` cookie)

---

## Success Metrics

After deployment, you should see:

✅ **Security Improvements:**
- Zero critical vulnerabilities
- Rate limiting effective
- No CSRF attack vectors
- Automated dependency updates

✅ **Performance:**
- < 50ms added latency from Vercel KV
- No noticeable performance degradation
- < 99.9% uptime maintained

✅ **Compliance:**
- GDPR compliant (privacy policy)
- OWASP Top 10 2021 compliance
- Automated security scanning

---

## Next Steps

1. **Monitor for 24 hours** - Watch for any issues
2. **Enable Branch Protection** - Require security checks to pass
3. **Schedule Quarterly Audit** - External security review
4. **Consider Bug Bounty** - When traffic reaches 10K+ users/month

---

## Support

**Issues or Questions:**
- GitHub Issues: (your repository)
- Email: emcogma@gmail.com

**Security Incidents:**
- Email: emcogma@gmail.com (monitored 24/7)
- Response Time: < 1 hour for critical issues

---

## Appendix: New Files Created

### Security Implementation
- `lib/security/rateLimitDistributed.ts` - Distributed rate limiting
- `lib/security/csrfDistributed.ts` - Distributed CSRF protection
- `lib/security/csp.ts` - Nonce-based CSP implementation

### Configuration
- `.github/dependabot.yml` - Automated dependency updates
- `.github/workflows/security.yml` - CI/CD security pipeline

### Documentation
- `ATTACK-SURFACE-CHECKLIST.md` - Comprehensive threat analysis
- `SECURITY-SCANNING-PIPELINE.md` - Automation procedures
- `SECURITY-POLICY.md` - OWASP-grade security policy
- `SECURITY-AUDIT-SUMMARY.md` - Audit findings and recommendations
- `SECURITY-MIGRATION-GUIDE.md` - This document
- `verify-security.js` - Pre-commit security checks

### Pages
- `app/privacy/page.tsx` - Privacy policy (GDPR/CCPA compliant)

---

**Version:** 1.0
**Last Updated:** December 2025
**Deployment Status:** Ready for Production ✅
