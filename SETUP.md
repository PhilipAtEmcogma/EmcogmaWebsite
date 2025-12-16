# Emcogma Website - Setup Guide

This guide will help you set up and deploy the Emcogma cyberpunk-themed personal brand website.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (free tier works)
- Vercel account for deployment (optional)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your project details:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google reCAPTCHA v2 (get from https://www.google.com/recaptcha/admin)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key

# Vercel KV (REQUIRED for production - distributed rate limiting & CSRF)
KV_REST_API_URL=https://xxx.upstash.io
KV_REST_API_TOKEN=your-kv-token
KV_REST_API_READ_ONLY_TOKEN=your-kv-read-only-token

# Email Notifications (Resend API - Optional but recommended)
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=noreply@emcogma.com
UNSUBSCRIBE_TOKEN_SECRET=your_long_random_secret_here

# CORS Configuration (REQUIRED in production)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

**Note:** `ADMIN_EMAIL` is no longer used. Admin access is now managed via the `admin_users` table in Supabase.

See [RECAPTCHA-SETUP.md](RECAPTCHA-SETUP.md) for detailed reCAPTCHA configuration.

**Email Notifications Setup:** See [EMAIL-QUICKSTART.md](EMAIL-QUICKSTART.md) for 5-minute email system setup or [EMAIL-NOTIFICATIONS-SETUP.md](EMAIL-NOTIFICATIONS-SETUP.md) for comprehensive configuration.

### 3. Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `lib/supabase/schema.sql`
4. Run the SQL to create tables and set up Row Level Security

**This schema includes:**
- ✅ `admin_users` table for database-driven admin access
- ✅ `is_admin()` function for centralized admin checking
- ✅ Secure RLS policies with no hardcoded emails
- ✅ All content tables (blog_posts, projects, articles, products, demos, comments, subscribers, contact_submissions)

5. **Add your admin email** to the database:
   ```sql
   INSERT INTO admin_users (email) VALUES ('emcogma@gmail.com');
   ```

### 4. Configure OAuth Providers

In your Supabase dashboard:

1. Go to Authentication > Providers
2. Enable **Google OAuth** and/or **GitHub OAuth**
3. Configure redirect URLs (see [ADMIN-SETUP.md](ADMIN-SETUP.md) for details)
4. Set Site URL to your development and production URLs

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your site.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Run production server
- `npm run lint` - Run ESLint

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── comments/     # Comments GET/POST (Supabase-connected)
│   │   ├── contact/      # Contact form (reCAPTCHA + Formspree)
│   │   ├── subscribe/    # Email subscription endpoints
│   │   │   └── check/    # Subscription status check (POST)
│   │   ├── unsubscribe/  # Token-based unsubscribe
│   │   └── notify-subscribers/ # Admin-only email notifications
│   ├── blog/              # Blog pages (Supabase-connected)
│   ├── portfolio/         # Portfolio page (Supabase-connected)
│   ├── contact/           # Contact page with reCAPTCHA
│   ├── saas/              # SaaS/Product landing page
│   ├── admin/             # Admin dashboard (OAuth authentication)
│   ├── unsubscribe/       # Unsubscribe landing page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── home/             # Home page components
│   ├── saas/             # SaaS page components
│   ├── blog/             # Blog components (CommentSection, ShareButtons)
│   ├── contact/          # Contact form (ContactForm, ReCaptchaWrapper)
│   ├── portfolio/        # Portfolio components
│   ├── admin/            # Admin components (includes NotifySubscribersButton)
│   └── layout/           # Layout components
├── lib/                   # Utilities and libraries
│   ├── email/            # Email system (tokens, templates, send)
│   └── supabase/         # Supabase client and utilities
├── public/               # Static assets
└── Documentation files   # CLAUDE.md, README.md, SETUP.md, etc.

```

## Customization

### Theme Colors

Edit `tailwind.config.ts` to customize the cyberpunk color palette:

```typescript
colors: {
  cyber: {
    dark: '#0a0a0f',
    primary: '#00f0ff',    // Neon cyan
    secondary: '#ff00ff',  // Neon magenta
    accent: '#00ff41',     // Matrix green
    // ... add more colors
  }
}
```

### Content

- **Blog Posts**:
  - Add via Admin Dashboard at `/admin` (OAuth authentication required)
  - Or manually via Supabase Table Editor → `blog_posts`
  - Posts appear automatically on blog listing and detail pages
- **Portfolio Projects**:
  - Add via Admin Dashboard at `/admin`
  - Or manually via Supabase Table Editor → `projects`
  - Set `featured = true` for featured section
- **Articles, Products, Demos**:
  - Manage via Admin Dashboard at `/admin`
  - Full CRUD interface with tabbed navigation
- **Comments**:
  - Users submit via blog post comment forms
  - Moderate via Admin Dashboard (approve, edit, delete)
  - Or manually via Supabase Table Editor → set `approved = true`
- **Home Page**: Edit `components/home/*` components

See [ADMIN-SETUP.md](ADMIN-SETUP.md) for complete admin portal documentation.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

### Environment Variables for Production

In your Vercel project settings, add:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- `RECAPTCHA_SECRET_KEY`
- `KV_REST_API_URL` (REQUIRED for production - Vercel KV)
- `KV_REST_API_TOKEN` (REQUIRED for production - Vercel KV)
- `KV_REST_API_READ_ONLY_TOKEN` (REQUIRED for production - Vercel KV)
- `RESEND_API_KEY` (optional but recommended - for email notifications)
- `FROM_EMAIL` (optional but recommended - for email notifications)
- `UNSUBSCRIBE_TOKEN_SECRET` (optional but recommended - for email notifications)
- `NEXT_PUBLIC_SITE_URL` (your production URL)

**Note:** `ADMIN_EMAIL` is no longer required. Admin access is managed via the `admin_users` table in Supabase.

## Supabase Configuration

### Row Level Security (RLS) - Secure Schema

The secure schema includes RLS policies that:

- **Centralized Admin Check**: Uses `is_admin()` function to verify admin access via `admin_users` table
- **No Hardcoded Emails**: All policies use the centralized function instead of hardcoded email checks
- **Public Read Access**: Published/active content is publicly readable
- **Admin-Only Writes**: Only verified admins can insert/update/delete content
- **Comment Moderation**: Anyone can submit comments, but approval is required

**Managing Admins:**
```sql
-- Add new admin (with audit trail)
INSERT INTO admin_users (email, created_by, notes)
VALUES ('new-admin@example.com', 'admin@example.com', 'Project collaborator');

-- Remove admin (soft delete with audit trail)
UPDATE admin_users
SET active = false,
    deactivated_at = NOW(),
    deactivated_by = 'admin@example.com',
    notes = 'Access no longer needed'
WHERE email = 'admin@example.com';
```

**Security Features:**
- Email validation (format and lowercase enforcement)
- Audit trail for all admin changes
- Soft delete only (hard deletes prevented by RLS)
- Composite indexes for optimal performance

### Real-time Subscriptions (Optional)

To enable real-time features:

1. Go to Supabase > Database > Replication
2. Enable replication for tables you want to subscribe to
3. Implement real-time subscriptions in your components

## SEO

The site includes:

- Automatic sitemap generation
- `robots.txt` configuration
- Open Graph meta tags
- Twitter Card support
- Structured metadata on all pages

Sitemap is automatically generated at `/sitemap.xml` after build.

## Security

- **Secure RLS Policies**: Centralized `is_admin()` function for all admin checks
- **Database-driven Admin Access**: `admin_users` table eliminates hardcoded emails
- **OAuth Authentication**: Google/GitHub sign-in for admin portal
- **Protected Routes**: Admin routes secured by middleware and session checks
- **Security Headers**: Configured in `vercel.json`
- **Environment Variables**: All secrets stored securely

See [SECURITY.md](SECURITY.md) for comprehensive security documentation.

## Performance

- Optimized images with Next.js Image component
- Code splitting by route
- Font optimization with next/font
- Static generation where possible

## Troubleshooting

### Build Errors

If you encounter build errors:

1. Delete `.next` folder and `node_modules`
2. Run `npm install` again
3. Try `npm run build`

### Supabase Connection Issues

- Verify environment variables are correct
- Check Supabase project is active
- Ensure RLS policies are properly configured

### TypeScript Errors

Run `npx tsc --noEmit` to check for type errors.

## Support

For issues or questions:

- Check the CLAUDE.md file for project guidelines
- Review Supabase documentation at [supabase.com/docs](https://supabase.com/docs)
- Check Next.js 16 documentation at [nextjs.org/docs](https://nextjs.org/docs)
- Email setup: [EMAIL-QUICKSTART.md](EMAIL-QUICKSTART.md)

## License

This project is private and proprietary to Emcogma.
