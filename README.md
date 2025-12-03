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

### Technical Highlights
- **SEO Optimized** - Auto-generated sitemap, robots.txt, Open Graph tags, PWA manifest
- **Performance** - ISR (60s revalidation), static generation, Next.js Image optimization
- **Security** - Secure RLS policies with centralized `is_admin()` function, database-driven admin access, 10-minute session timeout, server-side reCAPTCHA verification
- **Responsive** - Mobile-first design, sticky navigation, adaptive layouts

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
```

See [RECAPTCHA-SETUP.md](RECAPTCHA-SETUP.md) for detailed reCAPTCHA setup.

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

## 📂 Project Structure

```
app/
├── api/
│   ├── comments/route.ts       # Comments API (Supabase)
│   └── contact/route.ts        # Contact + reCAPTCHA
├── blog/
│   ├── page.tsx                # Blog listing (ISR)
│   └── [slug]/page.tsx         # Post detail (SSG)
├── portfolio/page.tsx          # Projects (ISR)
├── contact/page.tsx            # Contact form
├── saas/page.tsx               # SaaS landing
└── page.tsx                    # Home

components/
├── blog/
│   ├── CommentSection.tsx      # Comments with Supabase
│   └── ShareButtons.tsx        # Social sharing
├── contact/
│   ├── ContactForm.tsx         # Form + API integration
│   └── ReCaptchaWrapper.tsx    # reCAPTCHA widget
├── home/                       # Hero, FeaturedProjects, etc.
├── saas/                       # Features, Pricing, etc.
└── layout/                     # Header, Footer

lib/
├── auth/
│   └── admin.ts                # Admin auth utilities (database queries)
├── security/
│   ├── index.ts                # Centralized security exports
│   ├── rateLimit.ts            # Rate limiting
│   ├── validation.ts           # Input validation
│   ├── csrf.ts                 # CSRF protection
│   ├── headers.ts              # Security headers
│   └── logger.ts               # Security logging
└── supabase/
    ├── client.ts               # Client-side Supabase
    ├── server.ts               # Server-side with static client for build-time
    ├── middleware.ts           # Session timeout & route protection
    └── schema.sql              # Secure database schema with admin_users table

proxy.ts                        # Next.js 16 middleware entry point
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
| **Framework** | Next.js 16 (App Router), React 18.3.1, TypeScript 5 |
| **Styling** | Tailwind CSS 3.4.1, Framer Motion 11.0.3 |
| **Backend** | Supabase (PostgreSQL, Auth, RLS) |
| **Forms** | Formspree (email delivery), Google reCAPTCHA v2 |
| **Build** | ESLint, PostCSS, next-sitemap 4.2.3 |
| **Deployment** | Vercel (recommended) |

## 📝 Scripts

```bash
npm run dev              # Development server
npm run build            # Production build (includes sitemap)
npm start                # Run production server
npm run lint             # ESLint check
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

**Note:** `ADMIN_EMAIL` is no longer required. Admin access is managed via the `admin_users` table in your Supabase database.

Full deployment guide: [DEPLOYMENT.md](DEPLOYMENT.md)

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

### Enterprise Security (OWASP-compliant)
- **Rate Limiting** - IP + User-Agent tracking (5-100 req/min by endpoint)
- **CSRF Protection** - Token-based validation for state-changing operations
- **XSS Prevention** - Input sanitization and Content Security Policy
- **Security Headers** - CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- **Security Logging** - Event tracking and monitoring by severity
- **Request Size Limits** - 10KB max for form submissions

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

### 🔄 Planned Features
- [ ] Newsletter subscriber management UI
- [ ] Search functionality
- [ ] Pagination for blog/portfolio
- [ ] Email sending (newsletters)
- [ ] Analytics integration
- [ ] Image upload to Supabase Storage

## 📖 Documentation

- [CLAUDE.md](CLAUDE.md) - AI context & implementation status
- [SETUP.md](SETUP.md) - Detailed setup instructions
- [ADMIN-SETUP.md](ADMIN-SETUP.md) - Admin portal setup and usage
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment guide
- [RECAPTCHA-SETUP.md](RECAPTCHA-SETUP.md) - reCAPTCHA configuration
- [SECURITY.md](SECURITY.md) - Security best practices

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
