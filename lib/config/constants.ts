/**
 * Application Constants
 *
 * Central configuration for app-wide constants.
 * Update these values instead of hardcoding throughout the codebase.
 */

/**
 * Brand and Author Configuration
 */
export const APP_CONFIG = {
  brand: {
    name: 'Emcogma',
    tagline: 'Engineering Tomorrow\'s Solutions',
    description:
      'EMCOGMA is a hub for future-focused engineering, delivering insights, innovation, and practical solutions that bridge today\'s challenges with tomorrow\'s possibilities.',
    motto: 'Where vision meets precision.',
  },
  author: {
    defaultName: 'Emcogma',
    email: 'emcogma@gmail.com',
  },
  social: {
    github: 'https://github.com/emcogma',
    twitter: 'https://twitter.com/emcogma',
    linkedin: 'https://linkedin.com/in/emcogma',
  },
  content: {
    postsPerPage: 12,
    projectsPerPage: 12,
    excerptLength: 200,
    maxTags: 5,
    defaultReadTime: '5 min read',
  },
  ui: {
    loadingMessages: {
      blogPosts: 'Loading blog posts...',
      projects: 'Loading projects...',
      articles: 'Loading articles...',
      products: 'Loading products...',
      demos: 'Loading demos...',
      comments: 'Loading comments...',
      default: 'Loading...',
    },
    emptyMessages: {
      blogPosts: 'No blog posts yet. Create your first one!',
      projects: 'No projects yet. Showcase your work!',
      articles: 'No articles yet. Share your knowledge!',
      products: 'No products yet. Add your first product!',
      demos: 'No demos yet. Create an interactive demo!',
      comments: 'No comments yet. Be the first to comment!',
      default: 'No items found.',
    },
    successMessages: {
      created: 'Successfully created!',
      updated: 'Successfully updated!',
      deleted: 'Successfully deleted!',
      submitted: 'Successfully submitted!',
    },
    errorMessages: {
      create: 'Failed to create item',
      update: 'Failed to update item',
      delete: 'Failed to delete item',
      fetch: 'Failed to load data',
      submit: 'Failed to submit form',
      network: 'Network error. Please try again.',
      unknown: 'An unexpected error occurred',
    },
  },
} as const;

/**
 * Validation Rules
 */
export const VALIDATION_RULES = {
  slug: {
    min: 1,
    max: 200,
    pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    message: 'Slug must be lowercase letters, numbers, and hyphens only',
  },
  title: {
    min: 1,
    max: 200,
  },
  excerpt: {
    min: 10,
    max: 500,
  },
  content: {
    min: 10,
    max: 50000,
  },
  comment: {
    author: { min: 2, max: 100 },
    content: { min: 5, max: 5000 },
  },
  contact: {
    name: { min: 2, max: 100 },
    email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    message: { min: 10, max: 5000 },
  },
  tags: {
    max: 5,
    tagLength: { min: 1, max: 50 },
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  url: {
    pattern: /^https?:\/\/.+/,
    message: 'Please enter a valid URL starting with http:// or https://',
  },
} as const;

/**
 * Security Configuration
 */
export const SECURITY_CONFIG = {
  rateLimit: {
    // API route rate limits
    api: { maxRequests: 100, windowMs: 60_000 },
    contact: { maxRequests: 5, windowMs: 60_000 },
    comments: { maxRequests: 10, windowMs: 60_000 },
    auth: { maxRequests: 5, windowMs: 900_000 }, // 15 minutes
  },
  bodySize: {
    default: 10 * 1024, // 10KB
    forms: 10 * 1024, // 10KB
    uploads: 5 * 1024 * 1024, // 5MB
    api: 10 * 1024, // 10KB
  },
  session: {
    timeoutMinutes: 10,
    cookieName: 'session_timeout',
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 10 * 60, // 10 minutes in seconds
    },
  },
  csrf: {
    tokenLength: 32,
    cookieName: 'csrf_token',
    headerName: 'x-csrf-token',
  },
} as const;

/**
 * Revalidation Intervals (ISR)
 */
export const REVALIDATION = {
  blogPosts: 60, // 60 seconds
  projects: 60,
  articles: 60,
  products: 60,
  demos: 60,
  sitemap: 3600, // 1 hour
} as const;

/**
 * Route Paths
 */
export const ROUTES = {
  home: '/',
  blog: '/blog',
  portfolio: '/portfolio',
  contact: '/contact',
  saas: '/saas',
  admin: {
    root: '/admin',
    login: '/admin/login',
  },
  api: {
    comments: '/api/comments',
    contact: '/api/contact',
  },
} as const;

/**
 * External Services
 */
export const EXTERNAL_SERVICES = {
  recaptcha: {
    siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
    secretKey: process.env.RECAPTCHA_SECRET_KEY || '',
    verifyUrl: 'https://www.google.com/recaptcha/api/siteverify',
  },
  formspree: {
    endpoint: process.env.FORMSPREE_ENDPOINT || '',
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
} as const;

/**
 * Feature Flags
 */
export const FEATURES = {
  enableComments: true,
  enableNewsletter: false,
  enableSearch: false,
  enableAnalytics: false,
  enableCSPNonce: process.env.NEXT_PUBLIC_CSP_NONCE_ENABLED === 'true',
} as const;
