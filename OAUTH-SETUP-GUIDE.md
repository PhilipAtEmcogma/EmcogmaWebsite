# OAuth Setup Guide for Admin Portal

## Problem
The admin portal requires OAuth (Google or GitHub) login, but OAuth providers aren't configured in Supabase yet. This causes the JWT to have no email, preventing admin access.

## Quick Fix for Development

### Option 1: Set up Google OAuth (Recommended)

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** (or select existing)
3. **Enable Google+ API**:
   - APIs & Services → Library
   - Search "Google+ API"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**:
   - APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: "Emcogma Admin Portal"
   - Authorized redirect URIs:
     ```
     https://kuafldiotehblyuvmwgu.supabase.co/auth/v1/callback
     http://localhost:3001/auth/callback
     ```
   - Click "Create"
   - Copy the **Client ID** and **Client Secret**

5. **Configure in Supabase**:
   - Supabase Dashboard → Authentication → Providers
   - Find "Google" and toggle it ON
   - Paste Client ID and Client Secret
   - Click "Save"

6. **Test Login**:
   - Go to http://localhost:3001/admin/login
   - Click "Sign in with Google"
   - Complete OAuth flow
   - Should redirect to admin dashboard

### Option 2: Set up GitHub OAuth (Alternative)

1. **Go to GitHub Settings**: https://github.com/settings/developers
2. **New OAuth App**:
   - Application name: "Emcogma Admin Portal"
   - Homepage URL: `http://localhost:3001`
   - Authorization callback URL:
     ```
     https://kuafldiotehblyuvmwgu.supabase.co/auth/v1/callback
     ```
   - Click "Register application"
   - Copy the **Client ID**
   - Generate a **Client Secret** and copy it

3. **Configure in Supabase**:
   - Supabase Dashboard → Authentication → Providers
   - Find "GitHub" and toggle it ON
   - Paste Client ID and Client Secret
   - Click "Save"

### Option 3: Temporary Bypass with Service Role Key (Development Only - NOT SECURE)

**⚠️ WARNING: This is for development testing ONLY. Do NOT use in production!**

If you need to test the delete functionality immediately without setting up OAuth, you can temporarily use the Supabase service role key:

1. Get your service role key from Supabase:
   - Settings → API → `service_role` key

2. Run this in Supabase SQL Editor to temporarily bypass RLS:
   ```sql
   -- TEMPORARY: Allow all deletes (REMOVE AFTER TESTING)
   DROP POLICY IF EXISTS "Admin can manage subscribers" ON subscribers;
   CREATE POLICY "Admin can manage subscribers" ON subscribers
     FOR ALL USING (true);
   ```

3. Test the delete in admin dashboard

4. **IMPORTANT**: Restore the secure policy after testing:
   ```sql
   -- RESTORE: Secure admin-only policy
   DROP POLICY IF EXISTS "Admin can manage subscribers" ON subscribers;
   CREATE POLICY "Admin can manage subscribers" ON subscribers
     FOR ALL USING (is_admin());
   ```

## Verify OAuth is Working

After setting up OAuth, run this in Supabase SQL Editor:

```sql
-- Check your JWT email
SELECT auth.jwt() ->> 'email' AS my_email;

-- Check if you're recognized as admin
SELECT is_admin() AS am_i_admin;
```

Both should return valid values (not NULL and true).

## Troubleshooting

### "my_jwt_email" still returns NULL
- OAuth providers not enabled in Supabase
- OAuth credentials incorrect
- Callback URLs don't match
- Need to log out and log in again after configuring OAuth

### "is_admin()" returns false
- Email in JWT doesn't match email in `admin_users` table
- Run: `SELECT * FROM admin_users WHERE LOWER(email) = LOWER('your-email@gmail.com');`
- If no results, insert: `INSERT INTO admin_users (email, active) VALUES ('your-email@gmail.com', true);`

### OAuth redirect errors
- Check callback URLs match exactly (including http vs https)
- Ensure OAuth app is not restricted to specific domains
- Check Supabase logs: Authentication → Logs

## Production Deployment

For production on Vercel:

1. Update OAuth redirect URIs to include your production domain:
   ```
   https://yourdomain.com/auth/callback
   ```

2. Add to Supabase authorized redirect URLs:
   - Authentication → URL Configuration
   - Add: `https://yourdomain.com/**`

3. Test OAuth flow on production before going live

## Current Status

- ✅ `is_admin()` function updated with case-insensitive comparison
- ✅ Admin user exists in database (emcogma@gmail.com)
- ❌ OAuth providers not configured (JWT email is NULL)
- ❌ Cannot delete subscribers until OAuth is working

**Next Step**: Set up Google or GitHub OAuth following Option 1 or 2 above.
