/**
 * Blog Posts CRUD Configuration
 *
 * Defines fields and behavior for blog post management.
 */

import type { CrudConfig } from '@/lib/crud';
import type { BlogPost } from '@/lib/types';
import { blogPostSchema } from '@/lib/validation';
import { APP_CONFIG } from '@/lib/config';

export const blogPostsConfig: CrudConfig<BlogPost> = {
  tableName: 'blog_posts',
  displayName: 'Blog Posts',
  icon: '📝',
  schema: blogPostSchema,

  fields: [
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      placeholder: 'my-blog-post',
      helperText: 'URL-friendly identifier (lowercase, hyphens only)',
      required: true,
    },
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      placeholder: 'My Awesome Blog Post',
      required: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Excerpt',
      placeholder: 'Brief summary of the post...',
      helperText: 'Short description shown in listings',
      required: true,
    },
    {
      name: 'content',
      type: 'markdown',
      label: 'Content',
      placeholder: '# Heading\n\nYour markdown content here...',
      helperText: 'Supports full markdown syntax',
      required: true,
    },
    {
      name: 'author',
      type: 'text',
      label: 'Author',
      defaultValue: APP_CONFIG.author.defaultName,
      required: true,
    },
    {
      name: 'read_time',
      type: 'text',
      label: 'Read Time',
      placeholder: '5 min read',
      defaultValue: APP_CONFIG.content.defaultReadTime,
    },
    {
      name: 'tags',
      type: 'tags',
      label: 'Tags',
      placeholder: 'typescript, nextjs, react',
      helperText: 'Comma-separated tags',
    },
    {
      name: 'published',
      type: 'checkbox',
      label: 'Published',
      helperText: 'Make this post visible to the public',
    },
  ],

  defaultFormData: {
    slug: '',
    title: '',
    excerpt: '',
    content: '',
    author: APP_CONFIG.author.defaultName,
    read_time: APP_CONFIG.content.defaultReadTime,
    tags: [],
    published: false,
  },

  orderBy: {
    column: 'created_at',
    ascending: false,
  },

  formatters: {
    tags: (tags) => tags.join(', '),
    content: (content) => content.substring(0, 100) + '...',
  },
};
