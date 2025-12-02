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
ADMIN_EMAIL=your-admin-email@example.com

# Google reCAPTCHA v2 (get from https://www.google.com/recaptcha/admin)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
```

See [RECAPTCHA-SETUP.md](RECAPTCHA-SETUP.md) for detailed reCAPTCHA configuration.

### 3. Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `lib/supabase/schema.sql`
4. Run the SQL to create tables and set up Row Level Security

### 4. Create Admin User

In your Supabase dashboard:

1. Go to Authentication > Users
2. Click "Invite User"
3. Use the email you specified in `ADMIN_EMAIL`
4. Complete the signup process

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
│   │   └── contact/      # Contact form (reCAPTCHA + Formspree)
│   ├── blog/              # Blog pages (Supabase-connected)
│   ├── portfolio/         # Portfolio page (Supabase-connected)
│   ├── contact/           # Contact page with reCAPTCHA
│   ├── saas/              # SaaS/Product landing page
│   ├── admin/             # Admin dashboard (auth pending)
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── home/             # Home page components
│   ├── saas/             # SaaS page components
│   ├── blog/             # Blog components (CommentSection, ShareButtons)
│   ├── contact/          # Contact form (ContactForm, ReCaptchaWrapper)
│   ├── portfolio/        # Portfolio components
│   ├── admin/            # Admin components
│   └── layout/           # Layout components
├── lib/                   # Utilities and libraries
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
  - Add via Supabase Table Editor → `blog_posts`
  - Or via Admin Dashboard (once authentication is implemented)
  - Posts appear automatically on blog listing and detail pages
- **Portfolio Projects**:
  - Add via Supabase Table Editor → `projects`
  - Set `featured = true` for featured section
- **Comments**:
  - Users submit via blog post comment forms
  - Approve via Supabase Table Editor → set `approved = true`
- **Home Page**: Edit `components/home/*` components

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
- `ADMIN_EMAIL`
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- `RECAPTCHA_SECRET_KEY`
- `SITE_URL` (your production URL)

## Supabase Configuration

### Row Level Security (RLS)

The schema includes RLS policies that:

- Allow public read access to published content
- Restrict admin operations to authenticated admin user
- Allow anyone to submit comments (moderation required)

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

- Row Level Security enabled on all Supabase tables
- Admin routes protected by authentication
- Security headers configured in `vercel.json`
- Environment variables for sensitive data

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
- Review Supabase documentation
- Check Next.js 14+ documentation

## License

This project is private and proprietary to Emcogma.
