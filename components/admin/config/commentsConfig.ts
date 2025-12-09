/**
 * Comments CRUD Configuration
 */

import type { CrudConfig } from '@/lib/crud';
import type { Comment } from '@/lib/types';
import { commentSchema } from '@/lib/validation';

export const commentsConfig: CrudConfig<Comment> = {
  tableName: 'comments',
  displayName: 'Comments',
  icon: '💬',
  schema: commentSchema,

  fields: [
    {
      name: 'post_slug',
      type: 'text',
      label: 'Post Slug',
      placeholder: 'blog-post-slug',
      helperText: 'The blog post this comment belongs to',
      required: true,
    },
    {
      name: 'author_name',
      type: 'text',
      label: 'Author Name',
      placeholder: 'John Doe',
      required: true,
    },
    {
      name: 'author_email',
      type: 'email',
      label: 'Author Email',
      placeholder: 'john@example.com',
    },
    {
      name: 'content',
      type: 'textarea',
      label: 'Comment Content',
      placeholder: 'Comment text...',
      required: true,
    },
    {
      name: 'approved',
      type: 'checkbox',
      label: 'Approved',
      helperText: 'Allow this comment to be visible publicly',
    },
  ],

  defaultFormData: {
    post_slug: '',
    author_name: '',
    author_email: null,
    content: '',
    approved: false,
  },

  orderBy: {
    column: 'created_at',
    ascending: false,
  },

  // Default to show only unapproved comments for moderation
  defaultFilters: {
    // Note: Remove this filter to show all comments
  },

  formatters: {
    content: (content) => content.substring(0, 100) + (content.length > 100 ? '...' : ''),
  },
};
