# Production Deployment Guide

Complete guide for deploying the Emcogma website to production with Vercel and Supabase.

## Prerequisites

- [x] Code committed to GitHub
- [x] GitHub Secrets configured (TEST_RECAPTCHA_SITE_KEY, TEST_RECAPTCHA_SECRET_KEY)
- [x] GitHub Actions security pipeline passing (see [GITHUB-ACTIONS.md](GITHUB-ACTIONS.md))
- [x] Supabase project created
- [x] Database schema executed
- [x] Google reCAPTCHA keys obtained
- [x] Formspree account setup

## Step 1: Supabase Setup

### 1.1 Create Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose organization, name, database password, region
3. Wait 2-3 minutes for provisioning

### 1.2 Execute Database Schema
```sql
-- In Supabase SQL Editor, run:
-- lib/supabase/schema.sql
```

Creates tables: `blog_posts`, `comments`, `projects`, `subscribers`, `contact_submissions`
Includes: RLS policies, indexes, triggers, functions

### 1.3 Get API Credentials
**Settings > API**
- Copy Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- Copy anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 1.4 Add Admin User to Database
**After running the schema.sql, add your admin email:**
- Go to Supabase SQL Editor
- Run: `INSERT INTO admin_users (email) VALUES ('your-email@example.com');`
- Admin users can now authenticate via OAuth (Google/GitHub)

## Step 2: Deploy to Vercel

### Method A: GitHub Integration (Recommended)

1. **Ensure CI/CD Pipeline Passes**
- GitHub Actions security pipeline MUST pass before deployment
- Verify all 9 security jobs succeed (secret scanning, type checking, tests, etc.)
- Check workflow status at: `Actions` tab in GitHub repository
- If failures occur, fix issues before proceeding
- See [GITHUB-ACTIONS.md](GITHUB-ACTIONS.md) for troubleshooting

2. **Push to GitHub**
```bash
git add .
git commit -m "Production deployment"
git push origin master
```

3. **Import to Vercel**
- Go to [vercel.com](https://vercel.com) → New Project
- Import your GitHub repository
- Configure:
  - Framework Preset: Next.js
  - Root Directory: `./`
  - Build Command: `npm run build`
  - Output Directory: `.next`

4. **Add Environment Variables**

In Vercel Dashboard → Settings → Environment Variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# reCAPTCHA (https://www.google.com/recaptcha/admin)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-site-key
RECAPTCHA_SECRET_KEY=your-secret-key

# Optional
SITE_URL=https://your-domain.vercel.app
```

**Note:** `ADMIN_EMAIL` is no longer required. Admin access is managed via the `admin_users` table in your Supabase database.

**Important:**
- Set for Production, Preview, and Development
- reCAPTCHA site key needs domain whitelist in Google reCAPTCHA admin

4. **Deploy**
- Click "Deploy"
- Wait 2-3 minutes
- Site live at `your-project.vercel.app`

### Method B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_RECAPTCHA_SITE_KEY
vercel env add RECAPTCHA_SECRET_KEY

# Note: ADMIN_EMAIL is no longer needed - admin access via admin_users table

# Production deployment
vercel --prod
```

## Step 3: Configure Custom Domain (Optional)

### 3.1 Add Domain to Vercel
**Vercel Dashboard → Domains → Add Domain**
- Enter your domain (e.g., `emcogma.com`)
- Follow DNS configuration instructions

### 3.2 Configure DNS

**If using Cloudflare (Recommended):**
1. Add domain to Cloudflare
2. Update nameservers at domain registrar
3. Add DNS records:
   ```
   Type: CNAME
   Name: @ (or subdomain)
   Target: cname.vercel-dns.com
   Proxy: ON (orange cloud)
   ```
4. SSL/TLS → Full
5. Enable performance features:
   - Auto Minify (HTML, CSS, JS)
   - Brotli compression
   - Rocket Loader (optional)

**Without Cloudflare:**
- Add CNAME record pointing to `cname.vercel-dns.com`
- Or A record to Vercel's IP (shown in Vercel dashboard)

### 3.3 Update reCAPTCHA Domain Whitelist
**Google reCAPTCHA Admin Console:**
- Add your custom domain to authorized domains
- Add `localhost` for development

## Step 4: Post-Deployment Verification

### 4.1 Test Core Features
- [ ] Homepage loads correctly
- [ ] Navigation works (all pages accessible)
- [ ] Blog displays posts from Supabase
- [ ] Portfolio displays projects from Supabase
- [ ] Contact form works (submit + reCAPTCHA)
- [ ] Comments can be submitted
- [ ] Sitemap accessible: `/sitemap.xml`
- [ ] Robots.txt accessible: `/robots.txt`

### 4.2 Test Supabase Integration

**Blog Posts:**
```bash
# Add test post in Supabase Table Editor
INSERT INTO blog_posts (slug, title, excerpt, content, author, published)
VALUES ('test-post', 'Test Post', 'Description', '# Content', 'Admin', true);
```
Visit `/blog` - should display new post

**Portfolio Projects:**
```bash
INSERT INTO projects (slug, title, description, category, featured)
VALUES ('test-project', 'Test Project', 'Description', 'Web App', true);
```
Visit `/portfolio` - should display project

**Comments:**
1. Visit blog post → submit comment
2. Supabase → Table Editor → `comments` → verify entry exists
3. Set `approved = true`
4. Refresh blog post → comment appears

**Contact Form:**
1. Visit `/contact`
2. Fill form + complete reCAPTCHA
3. Submit
4. Check Formspree for email delivery

### 4.3 SEO Verification
- [ ] Sitemap: `https://your-domain.com/sitemap.xml`
- [ ] Test Open Graph: [opengraph.xyz](https://www.opengraph.xyz/)
- [ ] View page source → verify meta tags
- [ ] Submit sitemap to [Google Search Console](https://search.google.com/search-console)
- [ ] Submit to [Bing Webmaster Tools](https://www.bing.com/webmasters)

### 4.4 Performance Check
- [ ] Run [Lighthouse](https://pagespeed.web.dev/)
- [ ] Check [Vercel Analytics](https://vercel.com/docs/analytics)
- [ ] Verify Core Web Vitals

## Step 5: Content Management

### Adding Blog Posts

**Via Supabase Table Editor:**
```sql
INSERT INTO blog_posts (
  slug,           -- URL-friendly, unique (e.g., 'my-first-post')
  title,          -- Post title
  excerpt,        -- Short description
  content,        -- Markdown or HTML
  author,         -- Author name
  read_time,      -- e.g., '5 min read'
  tags,           -- Array: ARRAY['nextjs', 'react']
  published       -- true/false
) VALUES (
  'my-first-post',
  'My First Post',
  'A brief description',
  '# Heading\n\nContent here...',
  'John Doe',
  '5 min read',
  ARRAY['tutorial', 'nextjs'],
  true
);
```

**Via Admin Dashboard (once implemented):**
1. Login to `/admin`
2. Navigate to Blog Posts
3. Click "New Post"
4. Fill form and publish

### Managing Projects

**Supabase Table Editor → projects:**
```sql
INSERT INTO projects (
  slug,              -- URL-friendly
  title,             -- Project name
  description,       -- Short description
  long_description,  -- Detailed description
  tech,              -- ARRAY['Next.js', 'TypeScript']
  category,          -- 'Web App', 'AI/ML', 'Developer Tools', etc.
  image_url,         -- Project screenshot URL
  live_url,          -- Demo URL
  github_url,        -- Repository URL
  featured,          -- true/false (shows in featured section)
  display_order      -- Integer for sorting
) VALUES (
  'my-project',
  'My Awesome Project',
  'Short description',
  'Detailed description...',
  ARRAY['Next.js', 'TypeScript', 'Supabase'],
  'Web App',
  '/projects/screenshot.jpg',
  'https://demo.example.com',
  'https://github.com/user/repo',
  true,
  1
);
```

### Moderating Comments

**Supabase Table Editor → comments:**
1. View new comments (`WHERE approved = false`)
2. Review content
3. Approve: `UPDATE comments SET approved = true WHERE id = 'xxx'`
4. Delete spam: `DELETE FROM comments WHERE id = 'xxx'`
5. Approved comments appear immediately on blog posts

### Managing Subscribers

**Supabase Table Editor → subscribers:**
- View all: `SELECT * FROM subscribers WHERE subscribed = true`
- Export for newsletters
- Unsubscribe: `UPDATE subscribers SET subscribed = false WHERE id = 'xxx'`

## Step 6: Monitoring & Maintenance

### Vercel Analytics
**Vercel Dashboard → Analytics**
- Real-time traffic
- Core Web Vitals
- Top pages
- Geographic distribution

### Supabase Monitoring
**Supabase Dashboard:**
- **Logs** → Database errors
- **API** → Usage metrics
- **Reports** → Database performance

### Error Tracking
**Vercel Dashboard → Deployments → Logs**
- Runtime errors
- Build errors
- Function logs

### Regular Maintenance

**Weekly:**
- Review comment moderation queue
- Check error logs
- Monitor traffic spikes

**Monthly:**
```bash
# Update dependencies
npm update

# Security audit
npm audit

# Check for major version updates
npm outdated
```

**Quarterly:**
- Review Supabase database size (free tier: 500MB)
- Check Vercel bandwidth usage
- Audit RLS policies
- Review and update content

## Troubleshooting

### Build Fails on Vercel
**Check build logs:**
- TypeScript errors → `npx tsc --noEmit` locally
- Missing environment variables → Add in Vercel settings
- Dependency issues → Delete `node_modules`, `npm install`, test build locally

### Supabase Connection Issues
- Verify environment variables are correct
- Check Supabase project is not paused (free tier pauses after 7 days inactivity)
- Ensure RLS policies allow access
- Test connection locally with same credentials

### reCAPTCHA Errors
- Verify domain is whitelisted in Google reCAPTCHA admin
- Check site key vs secret key (don't mix them up)
- Ensure server-side verification is working (`RECAPTCHA_SECRET_KEY` set)

### Comments Not Appearing
- Check `approved = true` in Supabase
- Verify `post_id` matches blog post ID
- Clear browser cache
- Check for JavaScript errors in console

### ISR Not Updating
- Wait 60 seconds (revalidation interval)
- Force redeploy in Vercel
- Check Supabase data has `published = true`

### Performance Issues
**Optimize:**
- Enable Vercel Edge caching
- Use Cloudflare CDN
- Optimize images (already using next/image)
- Review Lighthouse recommendations
- Check database query performance in Supabase

## Security Checklist

### Core Security
- [x] Environment variables not in GitHub
- [x] Row Level Security enabled on all tables
- [x] Admin routes protected
- [x] SSL/TLS enabled (automatic with Vercel)
- [x] reCAPTCHA secret key server-only
- [x] No `NEXT_PUBLIC_` prefix on server-only secrets
- [ ] Regular dependency updates
- [ ] Supabase database backups enabled
- [ ] Cloudflare WAF rules configured (if using)

### Sensitive Data Protection (Dec 2025) ✅
- [x] **Zero sensitive data exposure** - Comprehensive audit completed
- [x] **OAuth code redaction** - `logSecureUrl()` implemented
- [x] **Environment-aware logging** - Production logs never expose sensitive data
- [x] **Safe error serialization** - `AppError.toSafeJSON()` prevents data leaks
- [x] **No hardcoded credentials** - Verified via comprehensive scan
- [x] **API response filtering** - Email addresses never exposed publicly
- [x] **User-friendly error messages** - Internal errors never shown to users
- [x] **OWASP A09:2021 compliant** - Security Logging and Monitoring Failures addressed
- [x] **GDPR/Privacy compliant** - No PII in production logs

**Audit Report**: See [SECURITY-AUDIT-REPORT.md](SECURITY-AUDIT-REPORT.md) for complete details

## Backup Strategy

### Supabase Automatic Backups
**Database → Backups:**
- Free tier: Daily backups (7 days retention)
- Pro tier: Point-in-time recovery

### Manual Backup
```bash
# Export tables via Supabase SQL Editor
COPY blog_posts TO '/backup/blog_posts.csv' CSV HEADER;
COPY projects TO '/backup/projects.csv' CSV HEADER;
COPY comments TO '/backup/comments.csv' CSV HEADER;
```

### Code Backup
- GitHub repository (automatic)
- Tag releases: `git tag v1.0.0 && git push --tags`

## Support & Resources

- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Tailwind CSS:** [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **reCAPTCHA:** [developers.google.com/recaptcha](https://developers.google.com/recaptcha)

---

**Deployment Complete!** 🚀

Your cyberpunk-themed website is now live and ready to showcase your brand.

[← Back to README](README.md) | [View Setup Guide](SETUP.md) | [Security Guide](SECURITY.md)
