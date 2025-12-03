# Admin Portal - Quick Start Guide

## 🚀 What's Been Implemented

A complete admin portal with OAuth authentication and full content management for your Emcogma website.

## ✅ Features

### Authentication
- ✅ OAuth login (Google & GitHub)
- ✅ Email whitelist (`emcogma@gmail.com`)
- ✅ Middleware-based route protection
- ✅ Automatic redirect for unauthorized users

### Content Management (Full CRUD)
- ✅ **Blog Posts** - Create, edit, delete, publish articles
- ✅ **Projects** - Manage portfolio projects
- ✅ **Articles** - Standalone content (separate from blog)
- ✅ **Products** - SaaS products with pricing
- ✅ **Demos** - Interactive demos and code samples
- ✅ **Comments** - Approve, edit, delete user comments

## 🔧 Quick Setup (3 Steps)

### 1. Configure OAuth in Supabase

**Dashboard:** https://app.supabase.com → Your Project → Authentication → Providers

#### Enable Google:
```
1. Go to Google Cloud Console
2. Create OAuth 2.0 Client
3. Set redirect URI: https://YOUR_PROJECT.supabase.co/auth/v1/callback
4. Copy Client ID + Secret to Supabase
```

#### Enable GitHub:
```
1. Go to GitHub Settings → Developer Settings → OAuth Apps
2. Create New OAuth App
3. Set callback URL: https://YOUR_PROJECT.supabase.co/auth/v1/callback
4. Copy Client ID + Secret to Supabase
```

### 2. Run Database Schema

In Supabase SQL Editor, run: `lib/supabase/schema.sql`

This creates:
- All content tables (blog_posts, projects, articles, products, demos, comments)
- RLS policies (admin email: emcogma@gmail.com)
- Indexes and triggers

### 3. Verify Environment Variables

Check `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://kuafldiotehblyuvnwgu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

**Note:** `ADMIN_EMAIL` is no longer needed. Admin access is managed via the `admin_users` table. Ensure your email is in the database:
```sql
INSERT INTO admin_users (email) VALUES ('emcogma@gmail.com');
```

## 🎯 Access the Admin Portal

### Development:
```bash
npm run dev
# Navigate to: http://localhost:3000/admin
```

### Production:
```
https://yourdomain.com/admin
```

## 📱 How to Use

1. **Login**: Click "Sign in with Google" or "Sign in with GitHub"
2. **Dashboard**: You'll see 6 tabs (Blogs, Projects, Articles, Products, Demos, Comments)
3. **Create Content**: Click "+ New [Type]" button
4. **Edit**: Click "Edit" on any item
5. **Delete**: Click "Delete" (confirms before deletion)
6. **Moderate Comments**: Switch to Comments tab, filter by Pending/Approved

## 📂 File Structure

```
app/admin/
├── layout.tsx                    # Auth guard
├── page.tsx                      # Dashboard with tabs
└── login/page.tsx               # OAuth login

components/admin/
├── BlogPostsManager.tsx         # Blogs CRUD
├── ProjectsManager.tsx          # Projects CRUD
├── ArticlesManager.tsx          # Articles CRUD
├── ProductsManager.tsx          # Products CRUD
├── DemosManager.tsx             # Demos CRUD
└── CommentsManager.tsx          # Comment moderation

lib/auth/admin.ts                # Admin utilities
lib/supabase/middleware.ts       # Route protection
middleware.ts                    # Root middleware
```

## 🔒 Security Features

- ✅ OAuth-only authentication (no passwords)
- ✅ Email whitelist validation
- ✅ Middleware route protection
- ✅ RLS policies on all tables
- ✅ Server-side auth checks
- ✅ Auto-redirect for unauthorized users

## 🐛 Troubleshooting

### "Unauthorized" Error
→ Ensure you're logged in with `emcogma@gmail.com`

### OAuth Redirect Fails
→ Check redirect URIs in OAuth provider settings
→ Verify Site URL in Supabase Authentication settings

### Can't Save Content
→ Check browser console for errors
→ Verify RLS policies use correct admin email
→ Check Supabase connection

### Changes Not Appearing
→ ISR cache may need time (60s revalidation)
→ Check if content is marked as "published"

## 📚 Detailed Documentation

For complete setup instructions: [ADMIN-SETUP.md](ADMIN-SETUP.md)

## 🎨 Admin UI Theme

Matches the cyberpunk theme:
- Neon cyan primary buttons
- Dark background with glow effects
- Responsive design
- Form validation
- Real-time updates

## 🚨 Important Notes

1. **Email Whitelist**: Only `emcogma@gmail.com` can access admin
2. **Comment Approval**: All comments need approval before appearing on site
3. **Published Status**: Content must be marked "published" to appear publicly
4. **Markdown Support**: Blog posts, articles use markdown for content
5. **Image URLs**: Currently uses external URLs (local upload not implemented yet)

## 📋 Content Type Quick Reference

| Type | Use Case | Key Fields |
|------|----------|------------|
| Blog Posts | Regular blog articles | slug, title, content, tags, published |
| Projects | Portfolio items | title, tech, category, github_url, featured |
| Articles | Standalone content | title, content, category, published |
| Products | SaaS offerings | name, pricing, features, active |
| Demos | Code samples | title, code_url, live_url, published |
| Comments | User feedback | post_slug, content, approved |

## ✨ Next Steps

After setup:
1. ✅ Test login with OAuth
2. ✅ Create sample content in each section
3. ✅ Test comment moderation
4. ✅ Verify content appears on public site
5. ✅ Set up regular database backups

---

**Need Help?** Check [ADMIN-SETUP.md](ADMIN-SETUP.md) for detailed instructions.
