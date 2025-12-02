-- Safe Migration Script: From schema.sql to schema-secure.sql
-- This version checks if tables exist before dropping policies
-- Run this in Supabase SQL Editor
--
-- ============================================================================
-- IMPORTANT: MIGRATION REQUIREMENTS
-- ============================================================================
-- This migration MUST be run with superuser or service role privileges because:
-- 1. The is_admin() function uses SECURITY DEFINER to bypass RLS
-- 2. RLS policies on admin_users table create circular dependency
-- 3. The function owner needs sufficient privileges to query admin_users without RLS
--
-- To run this migration:
-- 1. Open Supabase SQL Editor
-- 2. Ensure you're logged in as the project owner or service role
-- 3. Copy and paste this entire script
-- 4. Execute the script
-- 5. Verify the first admin was added: SELECT * FROM admin_users;
--
-- After migration, to add more admins:
-- INSERT INTO admin_users (email) VALUES ('new-admin@example.com');
--
-- To remove an admin (soft delete):
-- UPDATE admin_users SET active = false, deactivated_at = NOW(),
--   deactivated_by = 'reason' WHERE email = 'admin@example.com';
-- ============================================================================

-- ============================================================================
-- STEP 1: Create any missing tables first
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Articles table (if it doesn't exist)
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

-- Products table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT NOT NULL,
  long_description TEXT,
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
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

-- Demos table (if it doesn't exist)
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_demos_slug ON demos(slug);
CREATE INDEX IF NOT EXISTS idx_demos_published ON demos(published);

-- Enable RLS for new tables
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE demos ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: Drop existing RLS policies
-- ============================================================================

-- Drop blog_posts policies
DROP POLICY IF EXISTS "Public can view published posts" ON blog_posts;
DROP POLICY IF EXISTS "Admin can do everything with posts" ON blog_posts;
DROP POLICY IF EXISTS "Admin can manage posts" ON blog_posts;

-- Drop comments policies
DROP POLICY IF EXISTS "Public can view approved comments" ON comments;
DROP POLICY IF EXISTS "Anyone can insert comments" ON comments;
DROP POLICY IF EXISTS "Admin can moderate comments" ON comments;

-- Drop subscribers policies
DROP POLICY IF EXISTS "Anyone can subscribe" ON subscribers;
DROP POLICY IF EXISTS "Admin can view subscribers" ON subscribers;
DROP POLICY IF EXISTS "Admin can manage subscribers" ON subscribers;

-- Drop projects policies
DROP POLICY IF EXISTS "Public can view projects" ON projects;
DROP POLICY IF EXISTS "Admin can manage projects" ON projects;

-- Drop contact_submissions policies
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_submissions;
DROP POLICY IF EXISTS "Admin can view submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Admin can manage submissions" ON contact_submissions;

-- Drop articles policies
DROP POLICY IF EXISTS "Public can view published articles" ON articles;
DROP POLICY IF EXISTS "Admin can manage articles" ON articles;

-- Drop products policies
DROP POLICY IF EXISTS "Public can view active products" ON products;
DROP POLICY IF EXISTS "Admin can manage products" ON products;

-- Drop demos policies
DROP POLICY IF EXISTS "Public can view published demos" ON demos;
DROP POLICY IF EXISTS "Admin can manage demos" ON demos;

-- ============================================================================
-- STEP 3: Create admin_users table
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  deactivated_at TIMESTAMPTZ,
  deactivated_by TEXT,
  notes TEXT
);

-- Add email validation and case normalization constraints
ALTER TABLE admin_users
  ADD CONSTRAINT IF NOT EXISTS email_format
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');

ALTER TABLE admin_users
  ADD CONSTRAINT IF NOT EXISTS email_lowercase
  CHECK (email = LOWER(email));

-- Create indexes for admin_users
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(active);
-- Composite index for better query performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email_active ON admin_users(LOWER(email), active);

-- ============================================================================
-- STEP 4: Create is_admin() helper function
-- ============================================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE LOWER(email) = LOWER(COALESCE(auth.jwt() ->> 'email', ''))
    AND active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 5: Enable RLS and create new policies
-- ============================================================================

-- Admin users table policies
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- NOTE: These policies use is_admin() which queries admin_users table.
-- This circular dependency is safe because is_admin() uses SECURITY DEFINER,
-- which bypasses RLS and executes with the function owner's privileges.
CREATE POLICY "Only admins can view admin users" ON admin_users
  FOR SELECT USING (is_admin());

CREATE POLICY "Only admins can insert/update admin users" ON admin_users
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Only admins can update admin users" ON admin_users
  FOR UPDATE USING (is_admin());

-- Prevent hard deletion of admin records (use active = false instead)
CREATE POLICY "Prevent admin deletion" ON admin_users
  FOR DELETE USING (false);

-- Blog posts policies
CREATE POLICY "Public can view published posts" ON blog_posts
  FOR SELECT USING (published = true);

CREATE POLICY "Admin can manage posts" ON blog_posts
  FOR ALL USING (is_admin());

-- Comments policies
CREATE POLICY "Public can view approved comments" ON comments
  FOR SELECT USING (approved = true);

CREATE POLICY "Anyone can insert comments" ON comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can moderate comments" ON comments
  FOR ALL USING (is_admin());

-- Subscribers policies
CREATE POLICY "Anyone can subscribe" ON subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can manage subscribers" ON subscribers
  FOR ALL USING (is_admin());

-- Projects policies
CREATE POLICY "Public can view projects" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage projects" ON projects
  FOR ALL USING (is_admin());

-- Contact submissions policies
CREATE POLICY "Anyone can submit contact form" ON contact_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can manage submissions" ON contact_submissions
  FOR ALL USING (is_admin());

-- Articles policies
CREATE POLICY "Public can view published articles" ON articles
  FOR SELECT USING (published = true);

CREATE POLICY "Admin can manage articles" ON articles
  FOR ALL USING (is_admin());

-- Products policies
CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (active = true);

CREATE POLICY "Admin can manage products" ON products
  FOR ALL USING (is_admin());

-- Demos policies
CREATE POLICY "Public can view published demos" ON demos
  FOR SELECT USING (published = true);

CREATE POLICY "Admin can manage demos" ON demos
  FOR ALL USING (is_admin());

-- ============================================================================
-- STEP 6: Create/update triggers
-- ============================================================================

-- Update updated_at timestamp automatically (function should already exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for new tables
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_demos_updated_at ON demos;
CREATE TRIGGER update_demos_updated_at BEFORE UPDATE ON demos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 7: Insert your admin email
-- ============================================================================

INSERT INTO admin_users (email)
VALUES ('emcogma@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Your database now uses the secure schema with:
-- ✅ All tables created (articles, products, demos)
-- ✅ is_admin() function for centralized admin checking
-- ✅ admin_users table for managing admin access
-- ✅ No hardcoded emails in RLS policies
-- ✅ Easy to add/remove admins without schema changes
-- ✅ Audit trail columns for tracking admin changes
-- ✅ Email validation and case normalization
-- ✅ Composite indexes for better performance
-- ✅ Soft delete enforcement on admin_users
-- ============================================================================

-- ============================================================================
-- ROLLBACK PROCEDURE (if migration fails or needs to be reverted)
-- ============================================================================
-- WARNING: Only run this if you need to revert to the old schema
-- This will remove the secure schema and restore hardcoded email policies
--
-- STEP 1: Drop secure schema components
-- DROP FUNCTION IF EXISTS is_admin() CASCADE;
-- DROP TABLE IF EXISTS admin_users CASCADE;
--
-- STEP 2: Recreate old policies with hardcoded email
-- Example for blog_posts (repeat for other tables):
-- CREATE POLICY "Admin can manage posts" ON blog_posts
--   FOR ALL USING (auth.jwt() ->> 'email' = 'emcogma@gmail.com');
--
-- STEP 3: Verify old policies work
-- Test admin operations with the hardcoded email
--
-- NOTE: After rollback, you'll need to update RLS policies manually
-- whenever you want to add/remove admin users
-- ============================================================================
