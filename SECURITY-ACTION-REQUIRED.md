# ⚠️ SECURITY ACTIONS REQUIRED

## 🚨 Immediate Action Needed

Your project has been security-audited. **Critical vulnerabilities were found and FIXED**, but you need to take action to apply the fixes.

---

## ✅ What Was Fixed (Automatically)

1. ✅ Created secure database schema (`lib/supabase/schema-secure.sql`)
2. ✅ Added environment variable validation (`lib/utils/validateEnv.ts`)
3. ✅ Created security documentation
4. ✅ Verified `.gitignore` excludes secrets

---

## 🔴 What YOU Need to Do (CRITICAL)

### Step 1: Check Git History for Exposed Secrets

**Why:** Your `.env.local` may have been committed to git history, exposing your secrets.

```bash
# Check if .env.local is tracked
git log --all --full-history -- ".env.local"

# Check for secrets in git history
git log -p | grep -i "emcogma@gmail.com\|kuafldiotehblyuvnwgu\|6Lcqeh4s"
```

**If secrets found:**
1. Consider ALL exposed secrets as compromised
2. Rotate immediately:
   - Regenerate Supabase anon key (Dashboard → Settings → API)
   - Create new reCAPTCHA keys (https://www.google.com/recaptcha/admin)
   - Update OAuth client secrets (Google, GitHub)
3. Update `.env.local` with new secrets
4. Update environment variables in Vercel/hosting platform

**To remove from history (⚠️ DESTRUCTIVE):**
```bash
# Use BFG Repo-Cleaner (recommended)
# https://rtyley.github.io/bfg-repo-cleaner/

# OR use git-filter-branch (advanced)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (WARNING: affects all collaborators)
git push origin --force --all
```

---

### Step 2: Implement Secure Database Schema

**Current Issue:** Your database schema (`lib/supabase/schema.sql`) has hardcoded admin email in 8 places.

**Solution: Use `schema-secure.sql` (RECOMMENDED)**

```bash
# 1. Open Supabase Dashboard: https://app.supabase.com
# 2. Navigate to: SQL Editor
# 3. Copy entire contents of: lib/supabase/schema-secure.sql
# 4. Paste and execute in SQL Editor

# 5. Add your admin email:
INSERT INTO admin_users (email, active)
VALUES ('your-actual-admin-email@example.com', true);

# 6. Verify it worked:
SELECT * FROM admin_users;
```

**Benefits:**
- ✅ No more hardcoded emails in RLS policies
- ✅ Easy to add/remove admins
- ✅ Can temporarily disable admin access
- ✅ Audit trail of all admins

---

### Step 3: Update `.env.local`

**Ensure your `.env.local` has NO placeholder values:**

```bash
# Open .env.local and verify:
cat .env.local

# Should look like this (with YOUR actual values):
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
ADMIN_EMAIL=your-actual-email@example.com
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-actual-site-key
RECAPTCHA_SECRET_KEY=your-actual-secret-key
```

**Common mistakes to avoid:**
- ❌ `your-project-url` (placeholder)
- ❌ `your-admin-email@example.com` (placeholder)
- ❌ `xxx` or `your-key` (placeholder)
- ✅ Real values only!

---

### Step 4: Verify `.env.local` is NOT in Git

```bash
# This should show .env.local is ignored:
git status --ignored | grep ".env.local"

# If .env.local appears in git status (BAD):
git rm --cached .env.local
git commit -m "Remove .env.local from git tracking"

# Verify it's in .gitignore:
cat .gitignore | grep ".env"
```

**Expected output:**
```
.env
.env*.local
.env.local
```

---

### Step 5: Set Up Production Environment Variables

**If deploying to Vercel:**

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to: Settings → Environment Variables
4. Add each variable:

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
ADMIN_EMAIL = your-email@example.com
NEXT_PUBLIC_RECAPTCHA_SITE_KEY = your-site-key
RECAPTCHA_SECRET_KEY = your-secret-key
```

5. Set for: Production, Preview, Development (all three)
6. Redeploy your site

---

### Step 6: Configure OAuth Providers

**Google OAuth:**
1. Go to: https://console.cloud.google.com
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
4. Copy Client ID and Secret to Supabase

**GitHub OAuth:**
1. Go to: https://github.com/settings/developers
2. Create New OAuth App
3. Set callback URL:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
4. Copy Client ID and Secret to Supabase

**In Supabase:**
1. Go to: Authentication → Providers
2. Enable Google and GitHub
3. Enter Client ID and Client Secret for each
4. Save

---

### Step 7: Test Admin Access

```bash
# Start development server
npm run dev

# Navigate to:
http://localhost:3000/admin

# You should be redirected to login
# Click "Sign in with Google" or "Sign in with GitHub"
# Use the email from your ADMIN_EMAIL environment variable

# After login, you should see the admin dashboard
# Try creating a blog post to verify everything works
```

---

## 🟡 Recommended Actions (Not Critical)

### Enable Environment Validation (Optional but Recommended)

**File:** `app/layout.tsx`

Add at the top:
```typescript
import { validateEnvOrThrow } from '@/lib/utils/validateEnv';

// In development, validate environment variables
if (process.env.NODE_ENV === 'development') {
  validateEnvOrThrow();
}
```

This will alert you immediately if environment variables are misconfigured.

---

### Add Security Headers (Recommended)

**File:** `next.config.ts`

Add security headers:
```typescript
const nextConfig = {
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
      ],
    },
  ],
};
```

---

### Set Up Database Backups

1. Go to Supabase Dashboard
2. Navigate to: Database → Backups
3. Enable automatic daily backups
4. Download a manual backup now

---

## 📋 Deployment Checklist

Before deploying to production, verify:

- [ ] `.env.local` is NOT in git
- [ ] Git history checked for secrets
- [ ] Exposed secrets rotated (if any)
- [ ] `schema-secure.sql` executed in Supabase
- [ ] Admin email added to `admin_users` table
- [ ] OAuth providers configured in Supabase
- [ ] Environment variables set in Vercel
- [ ] `.env.local` has real values (no placeholders)
- [ ] Admin login tested and working
- [ ] RLS policies verified
- [ ] Database backups enabled

---

## 🆘 Quick Reference

### Files to Review:
- ✅ `lib/supabase/schema-secure.sql` - Use this instead of schema.sql
- ✅ `SECURITY-AUDIT.md` - Complete security guide
- ✅ `SECURITY-FIXES-APPLIED.md` - What was fixed
- ✅ `.env.example` - Template for .env.local
- ✅ `.gitignore` - Verify secrets are excluded

### What's Safe to Commit:
- ✅ `.env.example` (with placeholders)
- ✅ `schema-secure.sql` (no hardcoded secrets)
- ✅ All source code files
- ✅ Documentation (now sanitized)

### What Must NEVER Be Committed:
- ❌ `.env.local`
- ❌ `.env`
- ❌ Any file with `SECRET_KEY`
- ❌ OAuth client secrets
- ❌ Database passwords
- ❌ API keys

---

## 📞 Need Help?

1. **Review Documentation:**
   - [SECURITY-AUDIT.md](SECURITY-AUDIT.md) - Comprehensive guide
   - [SECURITY-FIXES-APPLIED.md](SECURITY-FIXES-APPLIED.md) - What changed
   - [ADMIN-SETUP.md](ADMIN-SETUP.md) - Admin portal setup

2. **Common Issues:**
   - "Unauthorized" error → Check `ADMIN_EMAIL` matches login email
   - OAuth redirect fails → Verify redirect URLs in OAuth provider
   - RLS errors → Ensure `schema-secure.sql` was executed
   - Missing env vars → Run `npm run dev` and check console

3. **Security Questions:**
   - Read [SECURITY.md](SECURITY.md) first
   - For vulnerabilities, use private/secure channel
   - For general questions, use GitHub issues

---

## ⏱️ Time Estimates

- ☑️ Step 1 (Check git history): **5 minutes**
- ☑️ Step 2 (Database schema): **10 minutes**
- ☑️ Step 3 (Update .env.local): **2 minutes**
- ☑️ Step 4 (Verify gitignore): **2 minutes**
- ☑️ Step 5 (Production env vars): **5 minutes**
- ☑️ Step 6 (OAuth setup): **15 minutes**
- ☑️ Step 7 (Test admin): **5 minutes**

**Total:** ~45 minutes

---

## 🎯 Priority Order

1. **NOW** → Check git history for secrets (Step 1)
2. **NOW** → Rotate any exposed secrets
3. **TODAY** → Implement secure schema (Step 2)
4. **TODAY** → Verify `.env.local` not in git (Step 4)
5. **BEFORE DEPLOY** → Set production env vars (Step 5)
6. **BEFORE DEPLOY** → Configure OAuth (Step 6)
7. **BEFORE DEPLOY** → Test everything (Step 7)

---

**Status:** ⚠️ **ACTION REQUIRED**
**Priority:** 🔴 **HIGH**
**Estimated Time:** 45 minutes
**Impact:** Prevents unauthorized access, protects sensitive data

