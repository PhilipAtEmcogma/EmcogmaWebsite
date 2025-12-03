# Admin Portal Setup Guide

This guide explains how to set up and use the admin portal for the Emcogma website.

## Overview

The admin portal provides a comprehensive content management system with OAuth authentication, allowing the admin user to:

1. **Manage Blog Posts** - Create, edit, publish, and delete blog posts
2. **Manage Projects** - Manage portfolio projects with images and links
3. **Manage Articles** - Create and publish standalone articles
4. **Manage Products** - Add and manage SaaS products
5. **Manage Demos** - Showcase interactive demos and code samples
6. **Moderate Comments** - Approve, edit, or delete user comments

## Prerequisites

Before using the admin portal, you need to:

1. ✅ Set up Supabase project
2. ✅ Configure OAuth providers in Supabase
3. ✅ Run the database schema
4. ✅ Set environment variables

## Step 1: Configure Supabase Authentication

### 1.1 Enable OAuth Providers

Go to your Supabase dashboard: https://app.supabase.com

Navigate to: **Authentication → Providers**

#### Google OAuth Setup:
1. Enable Google provider
2. Get credentials from [Google Cloud Console](https://console.cloud.google.com)
3. Create OAuth 2.0 Client ID
4. Add authorized redirect URI: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret to Supabase

#### GitHub OAuth Setup:
1. Enable GitHub provider
2. Go to [GitHub Developer Settings](https://github.com/settings/developers)
3. Create New OAuth App
4. Set Authorization callback URL: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret to Supabase

### 1.2 Configure Site URL

In Supabase dashboard:
- Go to **Authentication → URL Configuration**
- Set **Site URL**: `http://localhost:3000` (dev) or `https://yourdomain.com` (prod)
- Add redirect URLs:
  - `http://localhost:3000/admin`
  - `https://yourdomain.com/admin`

## Step 2: Database Setup

Run the schema in your Supabase SQL editor:

1. Navigate to Supabase SQL Editor
2. Copy the entire contents of `lib/supabase/schema.sql`
3. Paste and run the SQL

**This secure schema creates:**
- `admin_users` table - Stores admin emails with active status
- `is_admin()` function - Centralized admin checking
- All content tables (blog_posts, projects, articles, products, demos, comments, subscribers, contact_submissions)
- Secure RLS policies using `is_admin()` function (no hardcoded emails)

**After running the schema, add your admin email:**
```sql
INSERT INTO admin_users (email) VALUES ('emcogma@gmail.com');
```

**Benefits:**
- ✅ No hardcoded emails in RLS policies
- ✅ Easy admin management via SQL (no schema changes needed)
- ✅ Centralized admin verification logic
- ✅ Add/remove admins instantly without code deployment

## Step 3: Verify Environment Variables

Ensure your `.env.local` file contains:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://kuafldiotehblyuvnwgu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Admin Email (whitelisted for admin access)
ADMIN_EMAIL=emcogma@gmail.com

# reCAPTCHA (optional for admin)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key
RECAPTCHA_SECRET_KEY=your_secret_key
```

## Step 4: Access the Admin Portal

### Development:
1. Start the dev server: `npm run dev`
2. Navigate to: http://localhost:3000/admin
3. You'll be redirected to the login page
4. Click "Sign in with Google" or "Sign in with GitHub"
5. Sign in with the whitelisted admin email (emcogma@gmail.com)
6. You'll be redirected to the admin dashboard

### Production:
1. Navigate to: https://yourdomain.com/admin
2. Follow the same authentication flow

## Admin Portal Features

### Dashboard Navigation

The admin portal has 6 main tabs:

#### 📝 Blog Posts
- Create new blog posts with markdown content
- Set slug, title, excerpt, content, tags
- Toggle publish status
- Edit and delete existing posts
- All posts use markdown for content

#### 🚀 Projects
- Add portfolio projects
- Set tech stack, category, display order
- Add live URL and GitHub URL
- Upload project images
- Mark as featured

#### 📄 Articles
- Create standalone articles (separate from blog)
- Similar to blog posts but categorized differently
- Markdown content support
- Publish/draft status

#### 🛍️ Products
- Manage SaaS products
- Set pricing (monthly/yearly)
- Add features list
- Link to demos and documentation
- Mark as active/inactive and featured

#### 🎮 Demos
- Showcase interactive demos
- Add code repository links
- Set live demo URLs
- Add thumbnail images
- Publish/draft status

#### 💬 Comments
- View all comments across posts
- Filter by: All, Pending, Approved
- Approve/Unapprove comments
- Edit comment content
- Delete spam or inappropriate comments
- **All comments require approval before appearing on the site**

## Security Features

### Authentication
- OAuth-only authentication (Google/GitHub)
- No password-based login for enhanced security
- Database-driven admin whitelist via `admin_users` table

### Authorization
- Middleware checks user session
- `is_admin()` function verifies email against `admin_users` table
- Non-admin users redirected to login with error
- RLS policies enforce database-level security

### Row-Level Security (RLS) - Secure Schema
All tables use **secure RLS policies** with centralized admin checking:

**Centralized Admin Function:**
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

**Policy Structure:**
- Public can read published/active content
- Only verified admins (via `is_admin()`) can insert/update/delete
- Comments require approval before public visibility
- No hardcoded emails in policies

### Managing Admins

**Add New Admin:**
```sql
INSERT INTO admin_users (email, created_by, notes)
VALUES ('new-admin@example.com', 'admin@example.com', 'Added for project management');
```

**Remove/Deactivate Admin (Soft Delete):**
```sql
UPDATE admin_users
SET active = false,
    deactivated_at = NOW(),
    deactivated_by = 'admin@example.com',
    notes = 'No longer needs access'
WHERE email = 'admin@example.com';
```

**Reactivate Admin:**
```sql
UPDATE admin_users
SET active = true,
    deactivated_at = NULL,
    deactivated_by = NULL,
    notes = 'Reactivated for continued work'
WHERE email = 'admin@example.com';
```

**List All Admins:**
```sql
SELECT email, active, created_at, created_by, deactivated_at, deactivated_by, notes
FROM admin_users
ORDER BY created_at DESC;
```

**Audit Trail:**
The `admin_users` table includes audit columns to track admin changes:
- `created_by` - Who added this admin
- `deactivated_at` - When admin was deactivated
- `deactivated_by` - Who deactivated the admin
- `notes` - Additional context for admin changes

**Security Note:** Hard deletion of admin records is prevented by RLS policy. Always use soft delete (set `active = false`) to maintain audit history.

## File Structure

```
app/
├── admin/
│   ├── layout.tsx          # Admin layout with auth check
│   ├── page.tsx            # Main dashboard with tabs
│   └── login/
│       └── page.tsx        # OAuth login page

components/admin/
├── BlogPostsManager.tsx    # Blog CRUD interface
├── ProjectsManager.tsx     # Projects CRUD interface
├── ArticlesManager.tsx     # Articles CRUD interface
├── ProductsManager.tsx     # Products CRUD interface
├── DemosManager.tsx        # Demos CRUD interface
└── CommentsManager.tsx     # Comment moderation interface

lib/
├── auth/
│   └── admin.ts           # Admin auth utilities
└── supabase/
    ├── middleware.ts      # Session & route protection
    └── schema.sql         # Database schema with RLS

middleware.ts              # Root middleware
```

## Common Issues & Solutions

### Issue: Migration fails with permission error
**Solution**:
1. Ensure you're running the migration in Supabase SQL Editor (not via client)
2. You must be logged in as the project owner or service role
3. The `is_admin()` function requires SECURITY DEFINER which needs elevated privileges
4. Check Supabase logs for specific error messages

### Issue: "Unauthorized" error after login
**Solution**:
1. Verify your email is in the `admin_users` table:
   ```sql
   SELECT * FROM admin_users WHERE email = 'your-email@example.com';
   ```
2. If missing, add your email:
   ```sql
   INSERT INTO admin_users (email) VALUES ('your-email@example.com');
   ```
3. Ensure the `active` column is `true`
4. Verify email is lowercase (constraint enforces lowercase emails)

### Issue: Can't see content in admin
**Solution**: Check browser console for errors. Verify Supabase connection and RLS policies are correctly set up.

### Issue: OAuth redirect fails
**Solution**:
1. Check redirect URIs in OAuth provider settings
2. Verify Site URL in Supabase Authentication settings
3. Ensure `NEXT_PUBLIC_SUPABASE_URL` is correct

### Issue: Changes not saving
**Solution**:
1. Check browser console for errors
2. Verify your email is active in `admin_users` table
3. Test `is_admin()` function:
   ```sql
   SELECT is_admin();
   ```
   Should return `true` when logged in as admin
4. Check database connection

## Database Schema Reference

### Key Fields by Content Type

**Blog Posts:**
- `slug` (unique, URL-friendly)
- `title`, `excerpt`, `content` (markdown)
- `author`, `read_time`, `tags[]`
- `published` (boolean)

**Projects:**
- `slug`, `title`, `description`
- `tech[]`, `category`
- `image_url`, `live_url`, `github_url`
- `featured`, `display_order`

**Articles:**
- Similar to blog posts
- Additional `category` field
- `image_url` for hero image

**Products:**
- `slug`, `name`, `tagline`
- `price_monthly`, `price_yearly`
- `features[]`, `category`
- `active`, `featured`

**Demos:**
- `slug`, `title`, `description`
- `category`, `tech[]`
- `code_url`, `live_url`, `thumbnail_url`
- `published`, `featured`

**Comments:**
- `post_slug` (FK to blog_posts)
- `author_name`, `author_email`
- `content`
- `approved` (boolean, default false)

## Performance Monitoring

### Monitoring is_admin() Function
The `is_admin()` function is called on every admin operation. To monitor performance:

```sql
-- Check function execution stats (requires pg_stat_statements extension)
SELECT calls, total_time, mean_time, max_time
FROM pg_stat_statements
WHERE query LIKE '%is_admin%'
ORDER BY calls DESC;
```

**Performance Tips:**
- The composite index on `(LOWER(email), active)` optimizes admin checks
- Function uses SECURITY DEFINER which may have slight overhead
- Consider monitoring if admin operations feel slow
- Normal execution time should be < 5ms

**Rate Limiting Consideration:**
While the function is efficient, consider implementing application-level caching:
- Cache admin status in session for short periods (1-5 minutes)
- Reduce database queries for repeated admin checks
- Balance security (fresh checks) vs performance (cached results)

## Best Practices

1. **Admin Management:**
   - Always use lowercase emails (enforced by constraint)
   - Document why admins are added/removed in `notes` column
   - Use soft delete (set `active = false`) instead of deleting records
   - Regularly review admin list for security audit

2. **Content Creation:**
   - Use descriptive slugs (lowercase, hyphens)
   - Write clear excerpts for SEO
   - Add relevant tags/tech stack
   - Preview content before publishing

3. **Comment Moderation:**
   - Check pending comments regularly
   - Review for spam/inappropriate content
   - Edit if minor corrections needed
   - Delete if spam or abusive

4. **Media Management:**
   - Use absolute URLs for images
   - Optimize images before uploading
   - Use descriptive alt text

5. **SEO Optimization:**
   - Write unique titles and excerpts
   - Use relevant tags
   - Set accurate read times
   - Keep URLs short and descriptive

## Next Steps

After setting up the admin portal:

1. ✅ Log in and verify access
2. ✅ Create test content in each section
3. ✅ Test comment moderation workflow
4. ✅ Verify published content appears on public site
5. ✅ Set up regular backup strategy for database

## Testing RLS Policies

### Recommended Test Cases

To ensure RLS policies work correctly, test these scenarios:

**Admin Authentication Tests:**
```sql
-- 1. Test is_admin() returns true for active admin
-- (Run while logged in as admin)
SELECT is_admin(); -- Should return true

-- 2. Test is_admin() returns false for inactive admin
UPDATE admin_users SET active = false WHERE email = 'test@example.com';
SELECT is_admin(); -- Should return false (if logged in as test@example.com)

-- 3. Test case-insensitive email matching
INSERT INTO admin_users (email) VALUES ('test@example.com');
-- Login with Test@Example.com should still work
```

**Content Management Tests:**
```sql
-- 4. Test admin can create content (run as admin)
INSERT INTO blog_posts (slug, title, content, published)
VALUES ('test-post', 'Test', 'Content', true);
-- Should succeed

-- 5. Test non-admin cannot create content (logout, run as anonymous)
INSERT INTO blog_posts (slug, title, content, published)
VALUES ('test-post-2', 'Test', 'Content', true);
-- Should fail with RLS error

-- 6. Test public can read published content
SELECT * FROM blog_posts WHERE published = true;
-- Should succeed even when not logged in
```

**Subscriber & Contact Management Tests:**
```sql
-- 7. Test admin can view and manage subscribers (run as admin)
SELECT * FROM subscribers; -- Should succeed
UPDATE subscribers SET subscribed = false WHERE email = 'test@example.com'; -- Should succeed
DELETE FROM subscribers WHERE email = 'test@example.com'; -- Should succeed

-- 8. Test admin can view and manage contact submissions (run as admin)
SELECT * FROM contact_submissions; -- Should succeed
UPDATE contact_submissions SET read = true WHERE id = 'some-id'; -- Should succeed
DELETE FROM contact_submissions WHERE id = 'some-id'; -- Should succeed
```

**Security Tests:**
```sql
-- 9. Test hard delete is prevented on admin_users
DELETE FROM admin_users WHERE email = 'admin@example.com';
-- Should fail with RLS policy violation

-- 10. Test email validation
INSERT INTO admin_users (email) VALUES ('invalid-email');
-- Should fail with constraint violation

INSERT INTO admin_users (email) VALUES ('UPPERCASE@EXAMPLE.COM');
-- Should fail with lowercase constraint
```

### Test Suite Implementation
Consider implementing automated RLS policy tests:
1. Create test database or use Supabase test environment
2. Use pgTAP or similar testing framework
3. Test all CRUD operations for each content type
4. Test with different user roles (admin, anonymous, non-admin)
5. Run tests in CI/CD pipeline

## Support

For issues or questions:
- Check [CLAUDE.md](CLAUDE.md) for project overview
- Review [SETUP.md](SETUP.md) for initial setup
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- Review Supabase logs for authentication issues
- Check browser console for client-side errors
