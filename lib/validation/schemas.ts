/**
 * Validation Schemas
 *
 * Zod schemas for all data types.
 * Shared between client and server for consistent validation.
 */

import { z } from 'zod';
import { VALIDATION_RULES } from '@/lib/config';

/**
 * Common field schemas
 */
const slugSchema = z
  .string()
  .min(VALIDATION_RULES.slug.min, 'Slug is required')
  .max(VALIDATION_RULES.slug.max, 'Slug is too long')
  .regex(VALIDATION_RULES.slug.pattern, VALIDATION_RULES.slug.message);

const titleSchema = z
  .string()
  .min(VALIDATION_RULES.title.min, 'Title is required')
  .max(VALIDATION_RULES.title.max, 'Title is too long');

const excerptSchema = z
  .string()
  .min(VALIDATION_RULES.excerpt.min, 'Excerpt must be at least 10 characters')
  .max(VALIDATION_RULES.excerpt.max, 'Excerpt is too long');

const contentSchema = z
  .string()
  .min(VALIDATION_RULES.content.min, 'Content must be at least 10 characters')
  .max(VALIDATION_RULES.content.max, 'Content is too long');

const emailSchema = z
  .string()
  .regex(VALIDATION_RULES.email.pattern, VALIDATION_RULES.email.message);

const urlSchema = z
  .string()
  .regex(VALIDATION_RULES.url.pattern, VALIDATION_RULES.url.message);

const tagsSchema = z
  .array(z.string().min(1).max(VALIDATION_RULES.tags.tagLength.max))
  .max(VALIDATION_RULES.tags.max, `Maximum ${VALIDATION_RULES.tags.max} tags allowed`);

/**
 * Blog Post Schema
 */
export const blogPostSchema = z.object({
  slug: slugSchema,
  title: titleSchema,
  excerpt: excerptSchema,
  content: contentSchema,
  author: z.string().min(1, 'Author is required'),
  read_time: z.string().default('5 min read'),
  tags: tagsSchema,
  published: z.boolean().default(false),
});

export const createBlogPostSchema = blogPostSchema;
export const updateBlogPostSchema = blogPostSchema.partial().extend({
  id: z.string().uuid(),
});

/**
 * Project Schema
 */
export const projectSchema = z.object({
  slug: slugSchema,
  title: titleSchema,
  description: z.string().min(10, 'Description is required'),
  long_description: z.string().min(10, 'Long description is required'),
  tech: z.array(z.string()).min(1, 'At least one technology is required'),
  category: z.string().min(1, 'Category is required'),
  image_url: urlSchema.optional().or(z.literal('')),
  live_url: urlSchema.optional().or(z.literal('')),
  github_url: urlSchema.optional().or(z.literal('')),
  featured: z.boolean().default(false),
  display_order: z.number().int().min(0).default(0),
});

export const createProjectSchema = projectSchema;
export const updateProjectSchema = projectSchema.partial().extend({
  id: z.string().uuid(),
});

/**
 * Article Schema
 */
export const articleSchema = z.object({
  slug: slugSchema,
  title: titleSchema,
  excerpt: excerptSchema,
  content: contentSchema,
  author: z.string().min(1, 'Author is required'),
  read_time: z.string().default('5 min read'),
  tags: tagsSchema,
  category: z.string().min(1, 'Category is required'),
  image_url: urlSchema.optional().or(z.literal('')),
  published: z.boolean().default(false),
});

export const createArticleSchema = articleSchema;
export const updateArticleSchema = articleSchema.partial().extend({
  id: z.string().uuid(),
});

/**
 * Product Schema
 */
export const productSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
  tagline: z.string().min(10, 'Tagline is required').max(200, 'Tagline is too long'),
  description: z.string().min(10, 'Description is required'),
  long_description: z.string().min(10, 'Long description is required'),
  pricing_type: z.enum(['one-time', 'recurring'], {
    message: 'Pricing type is required',
  }),
  price: z.number().min(0, 'Price must be positive').nullable(),
  features: z.array(z.string().min(1)).min(1, 'At least one feature is required'),
  image_url: urlSchema.optional().or(z.literal('')),
  demo_url: urlSchema.nullable().optional(),
  documentation_url: urlSchema.nullable().optional(),
  category: z.string().min(1, 'Category is required'),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  display_order: z.number().int().min(0).default(0),
});

export const createProductSchema = productSchema;
export const updateProductSchema = productSchema.partial().extend({
  id: z.string().uuid(),
});

/**
 * Demo Schema
 */
export const demoSchema = z.object({
  slug: slugSchema,
  title: titleSchema,
  description: z.string().min(10, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  tech: z.array(z.string()).min(1, 'At least one technology is required'),
  code_url: urlSchema,
  live_url: urlSchema.nullable().optional(),
  thumbnail_url: urlSchema,
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  display_order: z.number().int().min(0).default(0),
});

export const createDemoSchema = demoSchema;
export const updateDemoSchema = demoSchema.partial().extend({
  id: z.string().uuid(),
});

/**
 * Comment Schema
 */
export const commentSchema = z.object({
  post_slug: slugSchema,
  author_name: z
    .string()
    .min(VALIDATION_RULES.comment.author.min, 'Name is too short')
    .max(VALIDATION_RULES.comment.author.max, 'Name is too long'),
  author_email: emailSchema.nullable().optional(),
  content: z
    .string()
    .min(VALIDATION_RULES.comment.content.min, 'Comment is too short')
    .max(VALIDATION_RULES.comment.content.max, 'Comment is too long'),
  approved: z.boolean().default(false),
});

export const createCommentSchema = commentSchema.omit({ approved: true });
export const updateCommentSchema = commentSchema.partial().extend({
  id: z.string().uuid(),
});

/**
 * Contact Form Schema
 */
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(VALIDATION_RULES.contact.name.min, 'Name is too short')
    .max(VALIDATION_RULES.contact.name.max, 'Name is too long'),
  email: emailSchema,
  subject: z.string().min(3, 'Subject is too short').max(200, 'Subject is too long').optional(),
  message: z
    .string()
    .min(VALIDATION_RULES.contact.message.min, 'Message is too short')
    .max(VALIDATION_RULES.contact.message.max, 'Message is too long'),
  recaptchaToken: z.string().min(1, 'reCAPTCHA verification is required'),
});

/**
 * Subscriber Schema
 */
export const subscriberSchema = z.object({
  email: emailSchema,
  subscribed: z.boolean().default(true),
});

export const createSubscriberSchema = subscriberSchema;
export const updateSubscriberSchema = subscriberSchema.partial().extend({
  id: z.string().uuid(),
});

/**
 * Contact Submission Schema
 */
export const contactSubmissionSchema = z.object({
  name: z
    .string()
    .min(VALIDATION_RULES.contact.name.min, 'Name is too short')
    .max(VALIDATION_RULES.contact.name.max, 'Name is too long'),
  email: emailSchema,
  subject: z.string().max(200, 'Subject is too long').optional(),
  message: z
    .string()
    .min(VALIDATION_RULES.contact.message.min, 'Message is too short')
    .max(VALIDATION_RULES.contact.message.max, 'Message is too long'),
  read: z.boolean().default(false),
});

export const createContactSubmissionSchema = contactSubmissionSchema.omit({ read: true });
export const updateContactSubmissionSchema = contactSubmissionSchema.partial().extend({
  id: z.string().uuid(),
});

/**
 * Type exports (infer from schemas)
 */
export type BlogPostInput = z.infer<typeof blogPostSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type ArticleInput = z.infer<typeof articleSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type DemoInput = z.infer<typeof demoSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type SubscriberInput = z.infer<typeof subscriberSchema>;
export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;
