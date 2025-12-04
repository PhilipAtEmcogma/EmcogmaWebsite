/**
 * Demos CRUD Configuration
 */

import type { CrudConfig } from '@/lib/crud';
import type { Demo } from '@/lib/types';
import { demoSchema } from '@/lib/validation';

export const demosConfig: CrudConfig<Demo> = {
  tableName: 'demos',
  displayName: 'Demos',
  icon: '🎮',
  schema: demoSchema,

  fields: [
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      placeholder: 'my-demo',
      required: true,
    },
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      placeholder: 'Interactive Demo Title',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      placeholder: 'Demo description...',
      required: true,
    },
    {
      name: 'category',
      type: 'text',
      label: 'Category',
      placeholder: 'Web Development',
      required: true,
    },
    {
      name: 'tech',
      type: 'array',
      label: 'Technologies',
      placeholder: 'React, TypeScript, WebGL',
      helperText: 'Comma-separated list of technologies',
      required: true,
    },
    {
      name: 'code_url',
      type: 'url',
      label: 'Code URL',
      placeholder: 'https://github.com/user/demo',
      required: true,
    },
    {
      name: 'live_url',
      type: 'url',
      label: 'Live Demo URL',
      placeholder: 'https://demo.example.com',
    },
    {
      name: 'thumbnail_url',
      type: 'url',
      label: 'Thumbnail URL',
      placeholder: 'https://example.com/thumbnail.jpg',
      required: true,
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Featured',
      helperText: 'Show on homepage',
    },
    {
      name: 'published',
      type: 'checkbox',
      label: 'Published',
      helperText: 'Make this demo visible to the public',
    },
    {
      name: 'display_order',
      type: 'number',
      label: 'Display Order',
      defaultValue: 0,
    },
  ],

  defaultFormData: {
    slug: '',
    title: '',
    description: '',
    category: '',
    tech: [],
    code_url: '',
    live_url: null,
    thumbnail_url: '',
    featured: false,
    published: false,
    display_order: 0,
  },

  orderBy: {
    column: 'display_order',
    ascending: true,
  },

  formatters: {
    tech: (tech) => tech.join(', '),
  },
};
