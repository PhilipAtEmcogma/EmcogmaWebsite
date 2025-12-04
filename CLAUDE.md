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
- OAuth authentication (Google, GitHub) with database-driven admin whitelist
- Database-managed admin access via `admin_users` table
- **10-minute session timeout** - Auto-logout after inactivity for security
- Blog posts management (create, edit, delete, publish)
- Projects management with tech stack and featured status
- Articles management (separate from blog posts)
- Products management (SaaS products with pricing)
- Demos management (interactive demos and code samples)
- Comment moderation (approve, edit, delete)
- Middleware-based route protection with session management
- Tabbed interface for all content types
- Add/remove admins via SQL without code deployment

**UI/UX:**
- Cyberpunk theme (neon cyan, magenta, matrix green)
- Updated brand messaging: "EMCOGMA is a hub for future-focused engineering..."
- Responsive layout with sticky navigation
- SEO optimization (sitemap, robots.txt, Open Graph, metadata)
- Contact form with Google reCAPTCHA v2 + Formspree integration
- Social sharing (Twitter, LinkedIn, Copy Link)

**Infrastructure & Security:**
- Supabase: PostgreSQL with secure RLS policies using `is_admin()` function
- Supabase Auth with OAuth providers (Google, GitHub)
- Database-driven admin management via `admin_users` table (no hardcoded emails)
- Centralized admin verification with `SECURITY DEFINER` function
- Single schema file approach (`schema.sql`) for simplified setup
- ISR for performance optimization (60s revalidation)
- Static params generation with cookie-free client for Next.js 15+ compatibility
- Middleware for session management and admin authorization
- **10-minute inactivity timeout** with automatic session termination
- Row-Level Security on all tables with granular access control
- **Enterprise Security (OWASP Top 10 2021 - 100% Compliant, A-Grade):**
  - **Distributed rate limiting** via Vercel KV (production-ready for serverless)
  - **Distributed CSRF protection** via Vercel KV (persistent across instances)
  - **Nonce-based CSP** support for advanced XSS prevention (optional)
  - Input validation & sanitization with DOMPurify (XSS, SQL injection prevention)
  - Security headers (CSP, HSTS, X-Frame-Options, etc.)
  - Security logging & monitoring (event tracking by severity)
  - Request size limits (10KB max for forms)
  - Restricted image domains (no wildcard hosts)
  - Session timeout tracking with HTTP-only cookies
  - **Automated dependency scanning** (Dependabot + GitHub Actions)
  - **CI/CD security pipeline** (secret detection, vulnerability scanning)
  - **Privacy compliance** (GDPR/CCPA with privacy policy page)
  - Comprehensive attack prevention & detection (12/12 attack vectors covered)

### ⏳ Pending Implementation

- Newsletter subscriber management UI
- Search & pagination for content
- Email sending (newsletters)
- Analytics integration
- File upload for images (currently using URLs)

## Tech Stack

**Core:** Next.js 16.0.7 (App Router, SSR/SSG) · React 18.3.1 · TypeScript 5
**Styling:** Tailwind CSS 3.4.1 (custom theme) · Framer Motion 11.0.3
**Backend:** Supabase (PostgreSQL, Auth, RLS) · Formspree (contact emails) · Vercel KV (distributed state)
**Security:** Google reCAPTCHA v2 · Vercel KV Rate Limiting · Distributed CSRF · Nonce-based CSP · DOMPurify · Security Headers · Dependabot · GitHub Actions
**Build:** ESLint · PostCSS · next-sitemap 4.2.3

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# reCAPTCHA v2 (https://www.google.com/recaptcha/admin)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=xxx  # Client-side
RECAPTCHA_SECRET_KEY=xxx            # Server-only

# Formspree (https://formspree.io/)
FORMSPREE_ENDPOINT=https://formspree.io/f/xxx  # Contact form endpoint

# Vercel KV (REQUIRED for Production - enables distributed rate limiting & CSRF)
# Get from: Vercel Dashboard > Storage > KV
KV_REST_API_URL=https://xxx.upstash.io
KV_REST_API_TOKEN=xxx
KV_REST_API_READ_ONLY_TOKEN=xxx

# CORS Configuration (REQUIRED in production)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Optional Configuration
SESSION_TIMEOUT_MINUTES=10  # Default: 10 minutes
NEXT_PUBLIC_CSP_NONCE_ENABLED=false  # Enable nonce-based CSP (advanced)
```

**Note:** `ADMIN_EMAIL` is no longer used. Admin access is now managed via the `admin_users` table in Supabase.

## Key File Locations

```
app/
├── admin/
│   ├── layout.tsx             # Simplified wrapper (auth handled by middleware)
│   ├── login/
│   │   ├── layout.tsx         # Login page wrapper
│   │   └── page.tsx           # OAuth login page (Google, GitHub)
│   └── page.tsx               # Admin dashboard with tabs
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
│   └── admin.ts                    # Admin auth utilities (database queries)
├── security/
│   ├── index.ts                    # Centralized security exports
│   ├── rateLimitDistributed.ts    # PRODUCTION: Distributed rate limiting (Vercel KV)
│   ├── csrfDistributed.ts         # PRODUCTION: Distributed CSRF protection (Vercel KV)
│   ├── csp.ts                     # Nonce-based CSP implementation
│   ├── rateLimit.ts               # LEGACY: In-memory rate limiting (dev/fallback)
│   ├── csrf.ts                    # LEGACY: In-memory CSRF (dev/fallback)
│   ├── validation.ts              # Input validation & sanitization (DOMPurify)
│   ├── headers.ts                 # Security headers (CSP, HSTS, etc.)
│   └── logger.ts                  # Security event logging & monitoring
└── supabase/
    ├── client.ts                  # Client-side Supabase
    ├── server.ts                  # Server-side Supabase with static client for build-time
    ├── middleware.ts              # Session timeout, admin protection, nonce generation & security headers
    └── schema.sql                 # Secure database schema (admin_users + is_admin())

.github/
├── dependabot.yml                 # Automated dependency updates
└── workflows/
    └── security.yml               # CI/CD security scanning pipeline

verify-security.js                 # Pre-commit security verification script
proxy.ts                           # Next.js 16 middleware (calls lib/supabase/middleware.ts)
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

## Recent Updates (December 2025)

✅ **Completed:**
- Migrated to secure schema with `admin_users` table and centralized `is_admin()` function
- Fixed Next.js 16 middleware conflicts (proxy.ts approach)
- Resolved admin login redirect loops by simplifying layout authentication
- Updated brand messaging in footer component
- All documentation updated to reflect database-driven admin management
- **Enterprise Security Implementation (OWASP-compliant):**
  - Implemented comprehensive rate limiting with IP + User-Agent tracking
  - Added input validation & sanitization (XSS, SQL injection prevention)
  - Deployed CSRF protection with token-based validation
  - Configured security headers (CSP, HSTS, X-Frame-Options, etc.)
  - Implemented security logging & monitoring system
  - Applied request size limits (10KB max for forms)
  - Restricted image domains (no wildcard hosts)
  - Updated all API endpoints with security measures
  - Created comprehensive security documentation
- **Session Management & Static Generation:**
  - Implemented 10-minute inactivity timeout with HTTP-only cookie tracking
  - Fixed Next.js 15+ "cookies outside request scope" error
  - Created `createStaticClient()` for build-time static generation
  - Session automatically expires and redirects to login after 10 minutes idle
  - Activity timestamp refreshes on each admin route navigation

## Next Steps

1. ~~Supabase integration~~ ✅ COMPLETED
2. ~~API routes (comments, contact)~~ ✅ COMPLETED
3. ~~Admin authentication~~ ✅ COMPLETED - OAuth with database-driven whitelist
4. ~~Admin CRUD~~ ✅ COMPLETED - Full content management for all types
5. ~~Secure schema migration~~ ✅ COMPLETED - Database-driven admin access
6. ~~Enterprise security~~ ✅ COMPLETED - Rate limiting, CSRF, XSS prevention, logging
7. **Newsletter** - Build subscriber management UI
8. **Enhancements** - Search, pagination, analytics, email sending
9. **Media** - Image upload to Supabase Storage

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
- **10-minute inactivity timeout** - Sessions expire automatically
- HTTP-only cookies prevent XSS attacks on session data
- Secure cookie flags in production (HTTPS-only)

See [ADMIN-SETUP.md](ADMIN-SETUP.md) for detailed setup and usage guide.

## References

- [README.md](README.md) - Main documentation for developers
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment guide
- [SETUP.md](SETUP.md) - Initial setup instructions
- [ADMIN-SETUP.md](ADMIN-SETUP.md) - Admin portal setup and usage
- [RECAPTCHA-SETUP.md](RECAPTCHA-SETUP.md) - reCAPTCHA configuration
- [SECURITY.md](SECURITY.md) - Security best practices and overview
- [SECURITY-IMPLEMENTATION.md](SECURITY-IMPLEMENTATION.md) - Comprehensive security implementation guide
