/**
 * Projects CRUD Configuration
 */

import type { CrudConfig } from '@/lib/crud';
import type { Project } from '@/lib/types';
import { projectSchema } from '@/lib/validation';

export const projectsConfig: CrudConfig<Project> = {
  tableName: 'projects',
  displayName: 'Projects',
  icon: '🚀',
  schema: projectSchema,

  fields: [
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      placeholder: 'my-project',
      required: true,
    },
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      placeholder: 'My Amazing Project',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Short Description',
      placeholder: 'Brief project description...',
      required: true,
    },
    {
      name: 'long_description',
      type: 'textarea',
      label: 'Long Description',
      placeholder: 'Detailed project description...',
      required: true,
    },
    {
      name: 'tech',
      type: 'array',
      label: 'Technologies',
      placeholder: 'React, TypeScript, Node.js',
      helperText: 'Comma-separated list of technologies',
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
      name: 'image_url',
      type: 'url',
      label: 'Image URL',
      placeholder: 'https://example.com/image.jpg',
    },
    {
      name: 'live_url',
      type: 'url',
      label: 'Live URL',
      placeholder: 'https://project.com',
    },
    {
      name: 'github_url',
      type: 'url',
      label: 'GitHub URL',
      placeholder: 'https://github.com/user/repo',
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Featured',
      helperText: 'Show on homepage',
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
    long_description: '',
    tech: [],
    category: '',
    image_url: '',
    live_url: '',
    github_url: '',
    featured: false,
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
