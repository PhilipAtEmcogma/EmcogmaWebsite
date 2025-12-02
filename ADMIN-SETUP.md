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

## Step 2: Update Database Schema

Run the updated schema in your Supabase SQL editor:

```bash
# The schema is in: lib/supabase/schema.sql
```

This creates:
- `blog_posts` table
- `projects` table
- `comments` table
- `articles` table (NEW)
- `products` table (NEW)
- `demos` table (NEW)
- `subscribers` table
- `contact_submissions` table

All tables include proper RLS policies that check for admin email: `emcogma@gmail.com`

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
- Email whitelist validation

### Authorization
- Middleware checks user email against `ADMIN_EMAIL`
- Non-admin users redirected to login with error
- RLS policies enforce database-level security

### Row-Level Security (RLS)
All tables have RLS policies:
- Public can read published content
- Only admin email can insert/update/delete
- Comments require approval before public visibility

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

### Issue: "Unauthorized" error after login
**Solution**: Ensure you're logging in with the exact email specified in `ADMIN_EMAIL` environment variable.

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
2. Verify RLS policies allow admin email to write
3. Check database connection

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

## Best Practices

1. **Content Creation:**
   - Use descriptive slugs (lowercase, hyphens)
   - Write clear excerpts for SEO
   - Add relevant tags/tech stack
   - Preview content before publishing

2. **Comment Moderation:**
   - Check pending comments regularly
   - Review for spam/inappropriate content
   - Edit if minor corrections needed
   - Delete if spam or abusive

3. **Media Management:**
   - Use absolute URLs for images
   - Optimize images before uploading
   - Use descriptive alt text

4. **SEO Optimization:**
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

## Support

For issues or questions:
- Check [CLAUDE.md](CLAUDE.md) for project overview
- Review [SETUP.md](SETUP.md) for initial setup
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- Review Supabase logs for authentication issues
- Check browser console for client-side errors
