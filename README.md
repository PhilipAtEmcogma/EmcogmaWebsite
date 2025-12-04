# Emcogma Website

A cyberpunk-themed personal brand website built with Next.js 16, featuring dynamic blog, portfolio showcase, SaaS landing page, and contact form with reCAPTCHA verification.

**EMCOGMA is a hub for future-focused engineering.** We build intelligent systems, explore emerging technologies, and chronicle the ideas, research, and projects that chart the emerging horizon of a world co-authored by human imagination and machine intelligence.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)

## ✨ Features

### Core Functionality
- **Dynamic Blog** - Posts fetched from Supabase with ISR, markdown rendering, comment system
- **Portfolio Showcase** - Projects with featured status, category filtering
- **Comments System** - Moderation workflow (submit for approval, approved comments display)
- **Contact Form** - Google reCAPTCHA v2 verification + Formspree email delivery
- **SaaS Landing** - Complete product page with pricing, features, testimonials, FAQ
- **Admin Portal** - Full CRUD for all content types with OAuth authentication

### Technical Highlights
- **SEO Optimized** - Auto-generated sitemap, robots.txt, Open Graph tags, PWA manifest
- **Performance** - ISR (60s revalidation), static generation, Next.js Image optimization
- **Security** - OWASP Top 10 2021 compliant (A-grade), distributed rate limiting & CSRF (Vercel KV), nonce-based CSP, automated dependency scanning, CI/CD security pipeline
- **Responsive** - Mobile-first design, sticky navigation, adaptive layouts
- **🎉 Modern Architecture** - Generic CRUD system, centralized types, reusable components (see [Architecture](#-architecture))

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account ([free tier](https://supabase.com))
- Google reCAPTCHA keys ([get here](https://www.google.com/recaptcha/admin))
- Formspree account ([free tier](https://formspree.io))

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd EmcogmaWebsite

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
```

### Configuration

Edit `.env.local`:

```env
# Supabase (from Supabase Dashboard > Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Admin access is managed via admin_users table in database
# After running schema.sql, add admin with:
# INSERT INTO admin_users (email) VALUES ('your-email@example.com');

# Google reCAPTCHA v2
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-site-key
RECAPTCHA_SECRET_KEY=your-secret-key

# Vercel KV (REQUIRED for Production - distributed rate limiting & CSRF)
KV_REST_API_URL=https://xxx.upstash.io
KV_REST_API_TOKEN=your-kv-token
KV_REST_API_READ_ONLY_TOKEN=your-kv-read-only-token

# CORS Configuration (REQUIRED in production)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

See [RECAPTCHA-SETUP.md](RECAPTCHA-SETUP.md) for detailed reCAPTCHA setup.

**Production Deployment:** See [SECURITY-MIGRATION-GUIDE.md](SECURITY-MIGRATION-GUIDE.md) for Vercel KV setup and security implementation.

### Database Setup

1. Create Supabase project
2. Run SQL from [lib/supabase/schema.sql](lib/supabase/schema.sql) in SQL Editor
   - This secure schema includes `admin_users` table and `is_admin()` function
   - No hardcoded emails in RLS policies
3. Add your admin email to the database:
   ```sql
   INSERT INTO admin_users (email) VALUES ('your-email@example.com');
   ```
4. Configure OAuth providers (Google/GitHub) in Supabase Authentication

Detailed instructions: [SETUP.md](SETUP.md) | Admin setup: [ADMIN-SETUP.md](ADMIN-SETUP.md)

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

This project follows **industry best practices** with a modern, modular architecture:

### Key Systems
- **Generic CRUD** ([lib/crud/](lib/crud/)) - Reusable CRUD system reduces admin code by 95%
- **Centralized Types** ([lib/types/](lib/types/)) - Single source of truth for all types
- **Configuration Layer** ([lib/config/](lib/config/)) - No hardcoded values
- **UI Components** ([components/ui/](components/ui/)) - 8 reusable cyberpunk-themed components
- **Validation** ([lib/validation/](lib/validation/)) - Zod schemas shared client/server
- **Error Handling** ([lib/errors/](lib/errors/)) - Consistent error management

### Benefits
- **95% less code** in admin managers (326 → 16 lines each)
- **5-minute setup** for new content types
- **Single source of truth** for types and validation
- **Consistent UI/UX** across all managers
- **Type-safe** end-to-end

📖 **Read more:** [ARCHITECTURE.md](ARCHITECTURE.md) | [REFACTORING-SUMMARY.md](REFACTORING-SUMMARY.md) | [PHASE-3-COMPLETE.md](PHASE-3-COMPLETE.md)

## 📂 Project Structure

```
app/
├── api/                        # API routes
├── blog/                       # Blog pages (ISR + SSG)
├── portfolio/                  # Projects page
├── admin/                      # Admin portal
└── ...

components/
├── ui/                         # ✨ Reusable UI components (Button, Input, etc.)
├── admin/
│   ├── config/                 # ✨ CRUD configurations (field definitions)
│   └── *Manager.tsx            # ✨ REFACTORED: 16 lines each (was 326+)
├── blog/
├── contact/
└── ...

lib/
├── types/                      # ✨ Centralized type system
├── config/                     # ✨ Configuration constants
├── utils/                      # ✨ Utility functions
├── validation/                 # ✨ Zod validation schemas
├── crud/                       # ✨ Generic CRUD system
├── errors/                     # ✨ Error handling
├── auth/                       # Admin authentication
├── security/                   # Security implementation
└── supabase/                   # Database client & schema
```

## 🗄️ Database Schema

### Tables
- **admin_users** - Admin whitelist with email, active status (database-driven admin access)
- **blog_posts** - Blog content with slug, title, content (markdown), tags, published status
- **comments** - User comments with post_id FK, author, content, approved flag
- **projects** - Portfolio items with tech stack, category, featured status
- **articles** - Additional content with categories and featured status
- **products** - SaaS products with pricing, features, and documentation links
- **demos** - Interactive demos and code samples
- **subscribers** - Newsletter email list
- **contact_submissions** - Contact form data

### Row-Level Security (Secure Schema)
- **Centralized Admin Function**: `is_admin()` function checks `admin_users` table
- **No Hardcoded Emails**: All policies use `is_admin()` for admin checks
- **Easy Admin Management**: Add/remove admins via SQL without schema changes
- Public read for published/active content
- Admin-only writes via centralized function
- Comment moderation (`approved = false` by default)

**Add new admin:**
```sql
INSERT INTO admin_users (email) VALUES ('new-admin@example.com');
```

**Remove admin:**
```sql
UPDATE admin_users SET active = false WHERE email = 'admin@example.com';
```

## 🎨 Cyberpunk Theme

### Color Palette
```css
--cyber-dark: #0a0a0f;        /* Main background */
--cyber-primary: #00f0ff;     /* Neon cyan */
--cyber-secondary: #ff00ff;   /* Neon magenta */
--cyber-accent: #00ff41;      /* Matrix green */
```

### Custom Utilities
- `.neon-text` - Glowing text with shadow
- `.gradient-text` - Multi-color gradient effect
- `.card-cyber` - Cyberpunk card styling
- `.btn-cyber` - Animated button
- `.input-cyber` - Form input styling

Customize in [tailwind.config.ts](tailwind.config.ts)

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 16.0.7 (App Router), React 18.3.1, TypeScript 5 |
| **Styling** | Tailwind CSS 3.4.1, Framer Motion 11.0.3 |
| **Backend** | Supabase (PostgreSQL, Auth, RLS), Vercel KV (distributed state) |
| **Forms** | Formspree (email delivery), Google reCAPTCHA v2 |
| **Security** | Vercel KV Rate Limiting, Distributed CSRF, Nonce-based CSP, DOMPurify, Dependabot, GitHub Actions |
| **Build** | ESLint, PostCSS, next-sitemap 4.2.3 |
| **Deployment** | Vercel (recommended) |

## 📝 Scripts

```bash
npm run dev              # Development server
npm run build            # Production build (includes sitemap)
npm start                # Run production server
npm run lint             # ESLint check
npm run verify-security  # Run security verification checks
npm run precommit        # Pre-commit security checks (auto-runs)
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables (see Configuration above)
4. Deploy

**Environment variables to add in Vercel:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- `RECAPTCHA_SECRET_KEY`
- `KV_REST_API_URL` (Vercel KV - REQUIRED for production)
- `KV_REST_API_TOKEN` (Vercel KV - REQUIRED for production)
- `KV_REST_API_READ_ONLY_TOKEN` (Vercel KV - REQUIRED for production)
- `NEXT_PUBLIC_SITE_URL` (Your production domain)

**Note:** `ADMIN_EMAIL` is no longer required. Admin access is managed via the `admin_users` table in your Supabase database.

Full deployment guide: [DEPLOYMENT.md](DEPLOYMENT.md) | Security migration: [SECURITY-MIGRATION-GUIDE.md](SECURITY-MIGRATION-GUIDE.md)

## 🔐 Security

### Authentication & Session Management
- **10-minute Inactivity Timeout** - Sessions automatically expire after 10 minutes of idle time
- **HTTP-only Cookies** - Session tracking cookies protected from XSS attacks
- **Secure Cookie Flags** - HTTPS-only transmission in production
- **Database-driven Admin Access** - `admin_users` table eliminates hardcoded emails
- **OAuth Providers** - Secure login via Google and GitHub

### Data Protection
- **Secure RLS Policies** - Centralized `is_admin()` function for all admin checks
- **Row-Level Security** - All Supabase tables protected with RLS
- **Server-side Verification** - reCAPTCHA tokens verified server-side only
- **Environment Variables** - Secrets never exposed to client
- **Input Validation** - All forms validated client + server

### Enterprise Security (OWASP Top 10 2021 - 100% Compliant, A-Grade)
- **Distributed Rate Limiting** - Vercel KV powered, IP + User-Agent tracking (5-100 req/min by endpoint)
- **Distributed CSRF Protection** - Vercel KV token storage, persistent across serverless instances
- **Nonce-Based CSP** - Advanced XSS prevention without unsafe-inline (optional)
- **Input Validation & Sanitization** - DOMPurify for XSS, SQL injection pattern detection
- **Security Headers** - CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- **Automated Dependency Scanning** - Dependabot with weekly scans + auto-merge
- **CI/CD Security Pipeline** - GitHub Actions (secret detection, vulnerability scanning, license checks)
- **Privacy Compliance** - GDPR/CCPA with comprehensive privacy policy
- **Security Logging** - Event tracking and monitoring by severity
- **Request Size Limits** - 10KB max for form submissions
- **Restricted Image Domains** - No wildcard hosts allowed

### Admin Management
- **Easy Admin Management** - Add/remove admins via SQL without code/schema changes
- **Audit Trail** - Full tracking of admin additions/removals with timestamps
- **HTTPS** - Enforced in production (automatic with Vercel)

See [SECURITY.md](SECURITY.md) and [SECURITY-IMPLEMENTATION.md](SECURITY-IMPLEMENTATION.md) for detailed security documentation.

## 📚 API Endpoints

### GET /api/comments?postSlug={slug}
Fetch approved comments for a blog post.

**Response:**
```json
{
  "comments": [
    {
      "id": "uuid",
      "author": "John Doe",
      "content": "Great post!",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/comments
Submit comment for moderation.

**Request:**
```json
{
  "postSlug": "my-blog-post",
  "author": "Jane Doe",
  "content": "Thanks for sharing!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comment submitted successfully!"
}
```

### POST /api/contact
Submit contact form with reCAPTCHA verification.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello!",
  "recaptchaToken": "token-from-recaptcha"
}
```

## 🎯 Status & Roadmap

### ✅ Completed
- [x] Blog posts with Supabase integration (ISR + SSG)
- [x] Portfolio projects with Supabase
- [x] Comments system with moderation
- [x] Contact form with reCAPTCHA
- [x] API routes for comments and contact
- [x] Social sharing buttons
- [x] SEO optimization (sitemap, Open Graph)
- [x] Responsive design

### ✅ Recently Completed (December 2025)
- [x] Admin authentication with Supabase Auth (OAuth with Google/GitHub)
- [x] Admin CRUD interfaces (Blog, Projects, Articles, Products, Demos)
- [x] Secure schema with `is_admin()` function and `admin_users` table
- [x] Fixed Next.js 16 middleware conflicts (proxy.ts approach)
- [x] Resolved admin login redirect loops
- [x] Updated brand messaging in footer component
- [x] **Enterprise Security Implementation (OWASP Top 10 2021 - A-Grade)**
  - [x] Distributed rate limiting via Vercel KV (production-ready for serverless)
  - [x] Distributed CSRF protection via Vercel KV (persistent across instances)
  - [x] Nonce-based CSP support for advanced XSS prevention
  - [x] Input validation & sanitization (XSS, SQL injection prevention)
  - [x] Automated dependency scanning (Dependabot + GitHub Actions)
  - [x] CI/CD security pipeline (secret detection, vulnerability scanning)
  - [x] Privacy compliance (GDPR/CCPA with privacy policy page)
  - [x] Comprehensive security documentation and migration guide

### 🔄 Planned Features
- [ ] Newsletter subscriber management UI
- [ ] Search functionality
- [ ] Pagination for blog/portfolio
- [ ] Email sending (newsletters)
- [ ] Analytics integration
- [ ] Image upload to Supabase Storage

## 📖 Documentation

### Core Documentation
- [CLAUDE.md](CLAUDE.md) - AI context & implementation status
- [SETUP.md](SETUP.md) - Detailed setup instructions
- [ADMIN-SETUP.md](ADMIN-SETUP.md) - Admin portal setup and usage
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment guide
- [RECAPTCHA-SETUP.md](RECAPTCHA-SETUP.md) - reCAPTCHA configuration

### Security Documentation
- [SECURITY.md](SECURITY.md) - Security best practices overview
- [SECURITY-IMPLEMENTATION.md](SECURITY-IMPLEMENTATION.md) - Comprehensive security implementation guide
- [SECURITY-POLICY.md](SECURITY-POLICY.md) - OWASP-grade security policy
- [SECURITY-MIGRATION-GUIDE.md](SECURITY-MIGRATION-GUIDE.md) - Production deployment & migration
- [ATTACK-SURFACE-CHECKLIST.md](ATTACK-SURFACE-CHECKLIST.md) - Comprehensive threat analysis
- [SECURITY-SCANNING-PIPELINE.md](SECURITY-SCANNING-PIPELINE.md) - Automated security scanning setup
- [SECURITY-AUDIT-SUMMARY.md](SECURITY-AUDIT-SUMMARY.md) - Security audit findings & recommendations
- [QUICK-START.md](QUICK-START.md) - 10-minute security deployment guide
- [IMPLEMENTATION-COMPLETE.md](IMPLEMENTATION-COMPLETE.md) - Complete implementation summary

## 🤝 Contributing

This is a personal project, but feedback and suggestions are welcome!

## 📄 License

Private and proprietary to Emcogma.

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Vercel](https://vercel.com/)

---

**Built with Claude Code** | [Documentation](CLAUDE.md) | [Deploy Guide](DEPLOYMENT.md)
