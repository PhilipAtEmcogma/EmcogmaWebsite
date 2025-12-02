-- Supabase Database Schema for Emcogma Website
-- Run this in your Supabase SQL editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

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

-- Create indexes for better performance
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

-- Row Level Security (RLS) Policies

-- Blog posts: Public can read published posts, admin can do everything
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published posts" ON blog_posts
  FOR SELECT USING (published = true);

CREATE POLICY "Admin can do everything with posts" ON blog_posts
  FOR ALL USING (auth.jwt() ->> 'email' = 'emcogma@gmail.com');

-- Comments: Public can read approved comments, anyone can insert, admin can moderate
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved comments" ON comments
  FOR SELECT USING (approved = true);

CREATE POLICY "Anyone can insert comments" ON comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can moderate comments" ON comments
  FOR ALL USING (auth.jwt() ->> 'email' = 'emcogma@gmail.com');

-- Subscribers: Anyone can insert, only admin can view
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe" ON subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can view subscribers" ON subscribers
  FOR SELECT USING (auth.jwt() ->> 'email' = 'emcogma@gmail.com');

-- Projects: Public can read, admin can modify
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view projects" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage projects" ON projects
  FOR ALL USING (auth.jwt() ->> 'email' = 'emcogma@gmail.com');

-- Contact submissions: Anyone can insert, admin can view
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact form" ON contact_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can view submissions" ON contact_submissions
  FOR SELECT USING (auth.jwt() ->> 'email' = 'emcogma@gmail.com');

-- Articles: Public can read published articles, admin can do everything
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published articles" ON articles
  FOR SELECT USING (published = true);

CREATE POLICY "Admin can manage articles" ON articles
  FOR ALL USING (auth.jwt() ->> 'email' = 'emcogma@gmail.com');

-- Products: Public can read active products, admin can manage
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (active = true);

CREATE POLICY "Admin can manage products" ON products
  FOR ALL USING (auth.jwt() ->> 'email' = 'emcogma@gmail.com');

-- Demos: Public can read published demos, admin can manage
ALTER TABLE demos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published demos" ON demos
  FOR SELECT USING (published = true);

CREATE POLICY "Admin can manage demos" ON demos
  FOR ALL USING (auth.jwt() ->> 'email' = 'emcogma@gmail.com');

-- Functions and triggers

-- Update updated_at timestamp automatically
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
