-- Supabase Database Schema for Emcogma Website
-- SECURE SCHEMA with Database-Driven Admin Management
--
-- This is the ONLY schema file you need. It includes:
-- ✅ admin_users table for database-driven admin access
-- ✅ is_admin() function for centralized admin checking
-- ✅ Secure RLS policies with NO hardcoded emails
-- ✅ All content tables (blog_posts, projects, articles, products, demos, etc.)
--
-- IMPORTANT: After running this schema, add your admin email:
--   INSERT INTO admin_users (email) VALUES ('your-email@example.com');
--
-- Run this in your Supabase SQL editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ADMIN USERS TABLE (for managing admin access)
-- ============================================================================
-- This table stores whitelisted admin emails
-- Benefit: Easy to add/remove admins without modifying RLS policies
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast email lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(active);

-- ============================================================================
-- HELPER FUNCTION: Check if user is admin
-- ============================================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE LOWER(email) = LOWER(auth.jwt() ->> 'email')
    AND active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CONTENT TABLES
-- ============================================================================

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Emcogma',
  read_time TEXT,
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_slug TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT,
  content TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (post_slug) REFERENCES blog_posts(slug) ON DELETE CASCADE
);

-- Subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  subscribed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Export audit logs table
-- Tracks all data exports for compliance and security monitoring
CREATE TABLE IF NOT EXISTS admin_export_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_email TEXT NOT NULL,
  admin_user_id UUID,
  export_type TEXT NOT NULL, -- 'subscribers', 'contacts', etc.
  record_count INTEGER NOT NULL,
  fields_exported TEXT[] DEFAULT '{}', -- Track which fields were exported
  ip_address TEXT,
  user_agent TEXT,
  exported_at TIMESTAMPTZ DEFAULT NOW(),

  -- Foreign key to admin_users for referential integrity
  CONSTRAINT fk_admin_user FOREIGN KEY (admin_user_id)
    REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Indexes for export logs query performance
CREATE INDEX IF NOT EXISTS idx_export_logs_admin_email
  ON admin_export_logs(admin_email);
CREATE INDEX IF NOT EXISTS idx_export_logs_exported_at
  ON admin_export_logs(exported_at DESC);
CREATE INDEX IF NOT EXISTS idx_export_logs_export_type
  ON admin_export_logs(export_type);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  tech TEXT[] DEFAULT '{}',
  category TEXT NOT NULL,
  image_url TEXT,
  live_url TEXT,
  github_url TEXT,
  featured BOOLEAN DEFAULT false,
  display_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact form submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Emcogma',
  read_time TEXT,
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  image_url TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table (SaaS products)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT NOT NULL,
  long_description TEXT,
  pricing_type TEXT NOT NULL CHECK (pricing_type IN ('one-time', 'recurring')),
  price DECIMAL(10,2),
  features TEXT[] DEFAULT '{}',
  image_url TEXT,
  demo_url TEXT,
  documentation_url TEXT,
  category TEXT,
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  display_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Demos table (interactive demos, code samples)
CREATE TABLE IF NOT EXISTS demos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  tech TEXT[] DEFAULT '{}',
  code_url TEXT,
  live_url TEXT,
  thumbnail_url TEXT,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  display_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_comments_post_slug ON comments(post_slug);
CREATE INDEX IF NOT EXISTS idx_comments_approved ON comments(approved);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_demos_slug ON demos(slug);
CREATE INDEX IF NOT EXISTS idx_demos_published ON demos(published);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Uses is_admin() function for centralized admin checking
-- ============================================================================

-- Drop existing policies to allow re-running this schema
DROP POLICY IF EXISTS "Only admins can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Only admins can manage admin users" ON admin_users;
DROP POLICY IF EXISTS "Public can view published posts" ON blog_posts;
DROP POLICY IF EXISTS "Admin can manage posts" ON blog_posts;
DROP POLICY IF EXISTS "Public can view approved comments" ON comments;
DROP POLICY IF EXISTS "Anyone can insert comments" ON comments;
DROP POLICY IF EXISTS "Admin can moderate comments" ON comments;
DROP POLICY IF EXISTS "Anyone can subscribe" ON subscribers;
DROP POLICY IF EXISTS "Admin can view subscribers" ON subscribers;
DROP POLICY IF EXISTS "Admin can manage subscribers" ON subscribers;
DROP POLICY IF EXISTS "Admins can view all export logs" ON admin_export_logs;
DROP POLICY IF EXISTS "Only server can insert export logs" ON admin_export_logs;
DROP POLICY IF EXISTS "Public can view projects" ON projects;
DROP POLICY IF EXISTS "Admin can manage projects" ON projects;
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_submissions;
DROP POLICY IF EXISTS "Admin can view submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Public can view published articles" ON articles;
DROP POLICY IF EXISTS "Admin can manage articles" ON articles;
DROP POLICY IF EXISTS "Public can view active products" ON products;
DROP POLICY IF EXISTS "Admin can manage products" ON products;
DROP POLICY IF EXISTS "Public can view published demos" ON demos;
DROP POLICY IF EXISTS "Admin can manage demos" ON demos;

-- Admin users table: Only admins can manage
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view admin users" ON admin_users
  FOR SELECT USING (is_admin());

CREATE POLICY "Only admins can manage admin users" ON admin_users
  FOR ALL USING (is_admin());

-- Blog posts: Public can read published posts, admin can do everything
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published posts" ON blog_posts
  FOR SELECT USING (published = true);

CREATE POLICY "Admin can manage posts" ON blog_posts
  FOR ALL USING (is_admin());

-- Comments: Public can read approved comments, anyone can insert, admin can moderate
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved comments" ON comments
  FOR SELECT USING (approved = true);

CREATE POLICY "Anyone can insert comments" ON comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can moderate comments" ON comments
  FOR ALL USING (is_admin());

-- Subscribers: Anyone can insert, only admin can view and manage
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe" ON subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can view subscribers" ON subscribers
  FOR SELECT USING (is_admin());

CREATE POLICY "Admin can manage subscribers" ON subscribers
  FOR ALL USING (is_admin());

-- Export Logs: Only admins can read their export logs
ALTER TABLE admin_export_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all export logs" ON admin_export_logs
  FOR SELECT USING (is_admin());

CREATE POLICY "Only server can insert export logs" ON admin_export_logs
  FOR INSERT WITH CHECK (is_admin());

-- Projects: Public can read, admin can modify
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view projects" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage projects" ON projects
  FOR ALL USING (is_admin());

-- Contact submissions: Anyone can insert, admin can view
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact form" ON contact_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can view submissions" ON contact_submissions
  FOR SELECT USING (is_admin());

-- Articles: Public can read published articles, admin can do everything
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published articles" ON articles
  FOR SELECT USING (published = true);

CREATE POLICY "Admin can manage articles" ON articles
  FOR ALL USING (is_admin());

-- Products: Public can read active products, admin can manage
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (active = true);

CREATE POLICY "Admin can manage products" ON products
  FOR ALL USING (is_admin());

-- Demos: Public can read published demos, admin can manage
ALTER TABLE demos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published demos" ON demos
  FOR SELECT USING (published = true);

CREATE POLICY "Admin can manage demos" ON demos
  FOR ALL USING (is_admin());

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_demos_updated_at BEFORE UPDATE ON demos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL ADMIN USER SETUP
-- ============================================================================
-- IMPORTANT: After running this schema, manually insert your admin email:
--
-- INSERT INTO admin_users (email) VALUES ('your-admin-email@example.com');
--
-- To add additional admins:
-- INSERT INTO admin_users (email) VALUES ('another-admin@example.com');
--
-- To remove admin access:
-- UPDATE admin_users SET active = false WHERE email = 'email@example.com';
--
-- ============================================================================

-- NOTE: This schema uses a centralized is_admin() function that checks
-- the admin_users table. This provides several security benefits:
--
-- 1. No hardcoded emails in RLS policies
-- 2. Easy to add/remove admins without schema changes
-- 3. Can temporarily disable admin access by setting active=false
-- 4. Audit trail of all admin users
-- 5. Single source of truth for admin permissions
