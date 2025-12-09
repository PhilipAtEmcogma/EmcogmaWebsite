/**
 * Articles CRUD Configuration
 */

import type { CrudConfig } from '@/lib/crud';
import type { Article } from '@/lib/types';
import { articleSchema } from '@/lib/validation';
import { APP_CONFIG } from '@/lib/config';

export const articlesConfig: CrudConfig<Article> = {
  tableName: 'articles',
  displayName: 'Articles',
  icon: '📰',
  schema: articleSchema,

  fields: [
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      placeholder: 'my-article',
      helperText: 'URL-friendly identifier (lowercase, hyphens only)',
      required: true,
    },
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      placeholder: 'My Article Title',
      required: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Excerpt',
      placeholder: 'Brief summary...',
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
      placeholder: 'technology, innovation, research',
      helperText: 'Comma-separated tags',
    },
    {
      name: 'category',
      type: 'text',
      label: 'Category',
      placeholder: 'Technology',
      required: true,
    },
    {
      name: 'image_url',
      type: 'url',
      label: 'Image URL',
      placeholder: 'https://example.com/image.jpg',
    },
    {
      name: 'published',
      type: 'checkbox',
      label: 'Published',
      helperText: 'Make this article visible to the public',
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
    category: '',
    image_url: '',
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
