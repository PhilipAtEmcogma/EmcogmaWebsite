/**
 * Database Entity Types
 *
 * Central source of truth for all database table schemas.
 * These types match the Supabase database schema defined in lib/supabase/schema.sql
 */

/**
 * Base interface for all entities with timestamps
 */
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Admin Users Table
 * Controls admin access via database with full audit trail
 */
export interface AdminUser {
  id: string;
  email: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  deactivated_at: string | null;
  deactivated_by: string | null;
  notes: string | null;
}

/**
 * Blog Posts Table
 * Main content type for blog articles
 */
export interface BlogPost extends BaseEntity {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  read_time: string;
  tags: string[];
  published: boolean;
}

/**
 * Comments Table
 * User comments on blog posts with moderation
 */
export interface Comment {
  id: string;
  post_slug: string;
  author_name: string;
  author_email: string | null;
  content: string;
  approved: boolean;
  created_at: string;
}

/**
 * Projects Table
 * Portfolio projects showcase
 */
export interface Project extends BaseEntity {
  slug: string;
  title: string;
  description: string;
  long_description: string;
  tech: string[];
  category: string;
  image_url: string;
  live_url: string;
  github_url: string;
  featured: boolean;
  display_order: number;
}

/**
 * Articles Table
 * Additional content type separate from blog posts
 */
export interface Article extends BaseEntity {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  read_time: string;
  tags: string[];
  category: string;
  image_url: string;
  published: boolean;
}

/**
 * Products Table
 * SaaS products with pricing information
 */
export interface Product extends BaseEntity {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  long_description: string;
  price_monthly: number | null;
  price_yearly: number | null;
  features: string[];
  image_url: string;
  demo_url: string | null;
  documentation_url: string | null;
  category: string;
  featured: boolean;
  active: boolean;
  display_order: number;
}

/**
 * Demos Table
 * Interactive demos and code samples
 */
export interface Demo extends BaseEntity {
  slug: string;
  title: string;
  description: string;
  category: string;
  tech: string[];
  code_url: string;
  live_url: string | null;
  thumbnail_url: string;
  featured: boolean;
  published: boolean;
  display_order: number;
}

/**
 * Subscribers Table
 * Newsletter subscriber management
 */
export interface Subscriber {
  id: string;
  email: string;
  subscribed: boolean;
  created_at: string;
}

/**
 * Contact Submissions Table
 * Contact form submissions tracking
 */
export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  read: boolean;
  created_at: string;
}

/**
 * Table name type for type-safe database queries
 */
export type TableName =
  | 'admin_users'
  | 'blog_posts'
  | 'comments'
  | 'projects'
  | 'articles'
  | 'products'
  | 'demos'
  | 'subscribers'
  | 'contact_submissions';

/**
 * Map table names to their entity types
 */
export type TableEntityMap = {
  admin_users: AdminUser;
  blog_posts: BlogPost;
  comments: Comment;
  projects: Project;
  articles: Article;
  products: Product;
  demos: Demo;
  subscribers: Subscriber;
  contact_submissions: ContactSubmission;
};
