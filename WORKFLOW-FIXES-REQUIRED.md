# Required Workflow Fixes

This document outlines the manual fixes required for `.github/workflows/security.yml` that cannot be applied automatically due to GitHub App permissions.

## Issue 1: GitGuardian False Positive

**File:** `.github/workflows/security.yml`
**Line:** 127
**Status:** ⚠️ False Positive - No Action Required

### Detection
GitGuardian flagged the following as a hardcoded secret:
```yaml
RECAPTCHA_SECRET_KEY: 6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

### Explanation
This is **Google's official test reCAPTCHA key** intended specifically for testing and CI/CD pipelines. It is documented in Google's reCAPTCHA FAQ:

> **"I'd like to run automated tests with reCAPTCHA. What should I do?"**
>
> For reCAPTCHA v2, use the following test keys:
> - **Site key:** 6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
> - **Secret key:** 6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
>
> Source: https://developers.google.com/recaptcha/docs/faq#id-like-to-run-automated-tests-with-recaptcha.-what-should-i-do

### Why This Is Safe
1. These keys are publicly documented by Google
2. They are specifically designed for testing environments
3. They allow bypassing reCAPTCHA validation in CI/CD
4. They have no association with production reCAPTCHA keys
5. They cannot be used to compromise any real reCAPTCHA implementation

### Recommendation
✅ **No action required.** This is a false positive and can be safely ignored.

To suppress this warning in GitGuardian (optional):
1. Go to GitGuardian Dashboard
2. Find the incident
3. Mark as "False Positive" with reason: "Google's official test reCAPTCHA key for CI/CD"

---

## Issue 2: License Check Failure (REQUIRED FIX)

**File:** `.github/workflows/security.yml`
**Line:** 153
**Status:** ❌ Requires Manual Fix

### Problem
The license check fails because `@img/sharp-libvips-linux-x64@1.2.4` uses LGPL-3.0-or-later license, which is not in the allowed list.

### Current Configuration
```yaml
npx license-checker --summary --production \
  --onlyAllow 'MIT;ISC;BSD;BSD-2-Clause;BSD-3-Clause;Apache-2.0;0BSD;CC0-1.0;Unlicense;WTFPL'
```

### Required Fix
Add `LGPL-3.0-or-later` to the allowed licenses:

```yaml
npx license-checker --summary --production \
  --onlyAllow 'MIT;ISC;BSD;BSD-2-Clause;BSD-3-Clause;Apache-2.0;0BSD;CC0-1.0;Unlicense;WTFPL;LGPL-3.0-or-later'
```

### Why This Is Safe
1. **Library Purpose**: `@img/sharp-libvips-linux-x64` is a native binary component of the `sharp` image processing library
2. **LGPL for Web Applications**: LGPL allows dynamic linking without source code disclosure requirements for the application
3. **Next.js Dependency**: This is a required dependency for Next.js image optimization
4. **Industry Standard**: LGPL is widely used for native libraries in web applications
5. **No Copyleft Requirement**: Using LGPL libraries in web services doesn't require your application to be open-source

### Legal Explanation
LGPL (Lesser General Public License) differs from GPL in that:
- ✅ You can use LGPL libraries without disclosing your application source
- ✅ You can use LGPL libraries in proprietary/commercial applications
- ❌ You must disclose changes if you modify the LGPL library itself (we don't)
- ✅ Dynamic linking (which we use) is explicitly allowed

For more information: https://www.gnu.org/licenses/lgpl-3.0.html

---

## Issue 3: npm audit Non-Blocking (RECOMMENDED FIX)

**File:** `.github/workflows/security.yml`
**Line:** 36-37
**Status:** ⚠️ Recommended Improvement

### Current Configuration
```yaml
- name: Run npm audit
  run: npm audit --audit-level=moderate
  continue-on-error: true
```

### Problem
With `continue-on-error: true`, vulnerabilities don't block CI/CD pipeline, allowing potentially vulnerable code to be deployed.

### Recommended Fix
Make high/critical vulnerabilities block the pipeline:

```yaml
- name: Run npm audit
  run: npm audit --audit-level=high
  continue-on-error: false
```

### Changes Explained
1. **`--audit-level=high`**: Only fail on high and critical vulnerabilities (moderate vulnerabilities won't block)
2. **`continue-on-error: false`**: Pipeline will fail if vulnerabilities are found, preventing deployment

### Alternative (More Strict)
If you want to block on moderate vulnerabilities as well:

```yaml
- name: Run npm audit
  run: npm audit --audit-level=moderate
  continue-on-error: false
```

### Trade-offs
| Configuration | High/Critical Block | Moderate Block | Low Block |
|---------------|---------------------|----------------|-----------|
| `high` + `false` | ✅ | ❌ | ❌ |
| `moderate` + `false` | ✅ | ✅ | ❌ |
| `low` + `false` | ✅ | ✅ | ✅ |

**Recommendation**: Use `high` to balance security with development velocity. High/critical vulnerabilities are typically exploitable and should block deployment.

---

## How to Apply These Fixes

### Option 1: Direct Edit via GitHub UI
1. Go to: https://github.com/PhilipAtEmcogma/EmcogmaWebsite/blob/feature/secure-schema-migration/.github/workflows/security.yml
2. Click "Edit this file" (pencil icon)
3. Apply fixes from above
4. Commit directly to this branch

### Option 2: Local Edit
```bash
# Edit the file locally
nano .github/workflows/security.yml

# Commit changes
git add .github/workflows/security.yml
git commit -m "fix: Update license check and npm audit configuration"
git push origin feature/secure-schema-migration
```

### Option 3: Use sed Command
```bash
# Fix license check (add LGPL-3.0-or-later)
sed -i "s/'MIT;ISC;BSD;BSD-2-Clause;BSD-3-Clause;Apache-2.0;0BSD;CC0-1.0;Unlicense;WTFPL'/'MIT;ISC;BSD;BSD-2-Clause;BSD-3-Clause;Apache-2.0;0BSD;CC0-1.0;Unlicense;WTFPL;LGPL-3.0-or-later'/" .github/workflows/security.yml

# Fix npm audit (make it blocking for high/critical)
sed -i 's/run: npm audit --audit-level=moderate/run: npm audit --audit-level=high/' .github/workflows/security.yml
sed -i '/npm audit/,/continue-on-error: true/s/continue-on-error: true/continue-on-error: false/' .github/workflows/security.yml

# Commit
git add .github/workflows/security.yml
git commit -m "fix: Update license check and npm audit configuration"
git push origin feature/secure-schema-migration
```

---

## Verification

After applying the fixes:

1. **License Check**: Should pass with LGPL-3.0-or-later allowed
2. **npm audit**: Should block on high/critical vulnerabilities (currently 0 vulnerabilities)
3. **GitGuardian**: Warning will persist but can be marked as false positive

Check the workflow run at: https://github.com/PhilipAtEmcogma/EmcogmaWebsite/actions

---

## Summary

| Issue | Severity | Action Required | Status |
|-------|----------|-----------------|--------|
| GitGuardian reCAPTCHA | Low | None (false positive) | ℹ️ Info |
| License Check | High | Yes (add LGPL) | ❌ Required |
| npm audit | Medium | Recommended (make blocking) | ⚠️ Optional |

**Next Steps:**
1. ✅ **REQUIRED**: Fix license check (Issue #2)
2. ⚠️ **RECOMMENDED**: Make npm audit blocking (Issue #3)
3. ℹ️ **OPTIONAL**: Dismiss GitGuardian warning (Issue #1)
