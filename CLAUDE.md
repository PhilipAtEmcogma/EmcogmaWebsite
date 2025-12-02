# Project Overview

Next.js 16 cyberpunk-themed personal brand website with Supabase backend. Core features: blog with comments, portfolio, SaaS landing page, contact form with reCAPTCHA.

## Implementation Status

### ✅ Completed Features

**Dynamic Content (Supabase-connected):**
- Blog posts with ISR (60s revalidation), static generation, markdown rendering
- Portfolio projects with featured status and category filtering
- Articles, products, and demos content types
- Comments system with moderation (fetch approved, submit for approval)
- API routes: `/api/comments` (GET/POST), `/api/contact` (POST with reCAPTCHA)

**Admin Portal (Full CRUD):**
- OAuth authentication (Google, GitHub) with email whitelist
- Blog posts management (create, edit, delete, publish)
- Projects management with tech stack and featured status
- Articles management (separate from blog posts)
- Products management (SaaS products with pricing)
- Demos management (interactive demos and code samples)
- Comment moderation (approve, edit, delete)
- Middleware-based route protection
- Tabbed interface for all content types

**UI/UX:**
- Cyberpunk theme (neon cyan, magenta, matrix green)
- Responsive layout with sticky navigation
- SEO optimization (sitemap, robots.txt, Open Graph, metadata)
- Contact form with Google reCAPTCHA v2 + Formspree integration
- Social sharing (Twitter, LinkedIn, Copy Link)

**Infrastructure:**
- Supabase: PostgreSQL with secure RLS policies using `is_admin()` function
- Supabase Auth with OAuth providers (Google, GitHub)
- Database-driven admin management via `admin_users` table
- ISR for performance optimization
- Static params generation for blog posts
- Middleware for session management and admin authorization

### ⏳ Pending Implementation

- Newsletter subscriber management UI
- Search & pagination for content
- Email sending (newsletters)
- Analytics integration
- File upload for images (currently using URLs)

## Tech Stack

**Core:** Next.js 16 (App Router, SSR/SSG) · React 18.3.1 · TypeScript 5
**Styling:** Tailwind CSS 3.4.1 (custom theme) · Framer Motion 11.0.3
**Backend:** Supabase (PostgreSQL, Auth, RLS) · Formspree (contact emails)
**Security:** Google reCAPTCHA v2 (server-side verification)
**Build:** ESLint · PostCSS · next-sitemap 4.2.3

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
ADMIN_EMAIL=admin@example.com

# reCAPTCHA v2 (https://www.google.com/recaptcha/admin)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=xxx  # Client-side
RECAPTCHA_SECRET_KEY=xxx            # Server-only

# Formspree (https://formspree.io/)
FORMSPREE_ENDPOINT=https://formspree.io/f/xxx  # Contact form endpoint
```

## Key File Locations

```
app/
├── admin/
│   ├── layout.tsx             # Admin auth guard
│   ├── page.tsx               # Admin dashboard with tabs
│   └── login/page.tsx         # OAuth login page
├── api/
│   ├── comments/route.ts      # Comments GET/POST (Supabase)
│   └── contact/route.ts       # Contact form (reCAPTCHA + Formspree)
├── blog/
│   ├── page.tsx               # Blog listing (Supabase ISR)
│   └── [slug]/page.tsx        # Blog detail (static generation)
├── portfolio/page.tsx         # Projects (Supabase ISR)
├── contact/page.tsx           # Contact form
└── saas/page.tsx              # SaaS landing page

components/
├── admin/
│   ├── BlogPostsManager.tsx   # Blog CRUD
│   ├── ProjectsManager.tsx    # Projects CRUD
│   ├── ArticlesManager.tsx    # Articles CRUD
│   ├── ProductsManager.tsx    # Products CRUD
│   ├── DemosManager.tsx       # Demos CRUD
│   └── CommentsManager.tsx    # Comment moderation
├── blog/
│   ├── CommentSection.tsx     # Comments with Supabase
│   └── ShareButtons.tsx       # Social sharing
└── contact/
    ├── ContactForm.tsx        # Form with API integration
    └── ReCaptchaWrapper.tsx   # reCAPTCHA component

lib/
├── auth/
│   └── admin.ts               # Admin auth utilities
└── supabase/
    ├── client.ts              # Client-side Supabase
    ├── server.ts              # Server-side Supabase (SSR)
    ├── middleware.ts          # Session & admin route protection
    ├── schema.sql             # Database schema with RLS
    └── migrate-to-secure-schema-safe.sql  # Secure schema migration

middleware.ts                  # Root middleware
```

## Database Schema

**admin_users:** id, email (unique, lowercase, validated), active, timestamps, created_by, deactivated_at, deactivated_by, notes - Controls admin access via database with full audit trail
**blog_posts:** id, slug (unique), title, excerpt, content (markdown), author, read_time, tags[], published, timestamps
**comments:** id, post_slug (FK), author_name, author_email, content, approved (moderation), created_at
**projects:** id, slug, title, description, long_description, tech[], category, image_url, live_url, github_url, featured, display_order, timestamps
**articles:** id, slug, title, excerpt, content (markdown), author, read_time, tags[], category, image_url, published, timestamps
**products:** id, slug, name, tagline, description, long_description, price_monthly, price_yearly, features[], image_url, demo_url, documentation_url, category, featured, active, display_order, timestamps
**demos:** id, slug, title, description, category, tech[], code_url, live_url, thumbnail_url, featured, published, display_order, timestamps
**subscribers:** id, email (unique), subscribed, created_at
**contact_submissions:** id, name, email, subject, message, read, created_at

**RLS Policies:** Secure policies using `is_admin()` function that checks `admin_users` table. No hardcoded emails in policies. Public read for published/active content, admin-only writes via centralized function.

## API Endpoints

**GET /api/comments?postSlug={slug}**
Fetch approved comments for a blog post

**POST /api/comments**
Submit comment for approval
Body: `{ postSlug, author, content }`

**POST /api/contact**
Submit contact form with reCAPTCHA verification
Body: `{ name, email, message, recaptchaToken }`
Forwards to Formspree after verification

## Development Conventions

**Code Style:**
- TypeScript strict mode, functional components only
- Client components: `'use client'` directive
- Server components: async functions with Supabase server client
- Clean naming: camelCase (variables), PascalCase (components)

**Component Patterns:**
- One component per file
- Props interface defined above component
- Separate UI from data-fetching logic
- ISR with `export const revalidate = 60`

**SEO:**
- `generateMetadata()` for dynamic metadata
- `generateStaticParams()` for static generation
- Semantic HTML, proper heading hierarchy
- next/image for optimized images

**Security:**
- Secure RLS policies using centralized `is_admin()` function
- Database-driven admin access via `admin_users` table
- No hardcoded emails in RLS policies for easy admin management
- Server-side reCAPTCHA verification
- Environment variables for secrets
- Input validation on forms
- HTTPS enforced in production

## Cyberpunk Theme

**Colors:**
```typescript
cyber-dark: '#0a0a0f'     // Main background
cyber-darker: '#050508'   // Darker sections
cyber-primary: '#00f0ff'  // Neon cyan
cyber-secondary: '#ff00ff' // Neon magenta
cyber-accent: '#00ff41'   // Matrix green
```

**Utilities:**
- `.neon-text` - Glowing cyan text
- `.gradient-text` - Multi-color gradient
- `.card-cyber` - Card with border glow
- `.btn-cyber` - Button with hover effects
- `.input-cyber` - Styled form inputs

## Commands

```bash
npm install              # Install dependencies
npm run dev             # Dev server (localhost:3000)
npm run build           # Production build (includes sitemap)
npm start               # Run production server
npm run lint            # ESLint
```

## Next Steps

1. ~~Supabase integration~~ ✅ COMPLETED
2. ~~API routes (comments, contact)~~ ✅ COMPLETED
3. ~~Admin authentication~~ ✅ COMPLETED - OAuth with email whitelist
4. ~~Admin CRUD~~ ✅ COMPLETED - Full content management for all types
5. **Newsletter** - Build subscriber management UI
6. **Enhancements** - Search, pagination, analytics, email sending
7. **Media** - Image upload to Supabase Storage

## Admin Portal

Access: `/admin` (requires OAuth login with admin email in database)

**Features:**
- OAuth authentication (Google/GitHub)
- Database-driven admin whitelist via `admin_users` table
- Current admin: `emcogma@gmail.com` (stored in database)
- Add/remove admins via SQL without schema changes
- Full CRUD for: Blog Posts, Projects, Articles, Products, Demos
- Comment moderation: Approve, edit, delete
- Real-time updates with Supabase

**Admin Management:**
To add a new admin with audit trail, run in Supabase SQL Editor:
```sql
INSERT INTO admin_users (email, created_by, notes)
VALUES ('new-admin@example.com', 'admin@example.com', 'Added for project management');
```

To remove an admin (soft delete with audit trail):
```sql
UPDATE admin_users
SET active = false,
    deactivated_at = NOW(),
    deactivated_by = 'admin@example.com',
    notes = 'Access no longer needed'
WHERE email = 'admin@example.com';
```

**Security Features:**
- Email format validation (regex constraint)
- Lowercase enforcement for consistent email handling
- Audit trail for all admin changes (created_by, deactivated_at, deactivated_by, notes)
- Hard deletion prevented by RLS policy (soft delete only)
- Composite indexes for optimal `is_admin()` performance

See [ADMIN-SETUP.md](ADMIN-SETUP.md) for detailed setup and usage guide.

## References

- [README.md](README.md) - Main documentation for developers
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment guide
- [SETUP.md](SETUP.md) - Initial setup instructions
- [ADMIN-SETUP.md](ADMIN-SETUP.md) - Admin portal setup and usage
- [RECAPTCHA-SETUP.md](RECAPTCHA-SETUP.md) - reCAPTCHA configuration
- [SECURITY.md](SECURITY.md) - Security best practices
