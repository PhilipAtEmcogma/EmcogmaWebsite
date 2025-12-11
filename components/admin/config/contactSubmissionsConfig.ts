/**
 * Contact Submissions CRUD Configuration
 *
 * Defines fields and behavior for contact form submission management.
 */

import type { CrudConfig } from '@/lib/crud';
import type { ContactSubmission } from '@/lib/types';
import { contactSubmissionSchema } from '@/lib/validation';

export const contactSubmissionsConfig: CrudConfig<ContactSubmission> = {
  tableName: 'contact_submissions',
  displayName: 'Contact Submissions',
  icon: '📬',
  schema: contactSubmissionSchema,

  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Name',
      placeholder: 'John Doe',
      helperText: 'Contact person name',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email Address',
      placeholder: 'john@example.com',
      helperText: 'Contact person email',
      required: true,
    },
    {
      name: 'subject',
      type: 'text',
      label: 'Subject',
      placeholder: 'Inquiry about...',
      helperText: 'Message subject (optional)',
    },
    {
      name: 'message',
      type: 'textarea',
      label: 'Message',
      placeholder: 'Message content...',
      helperText: 'Full message from contact form',
      required: true,
    },
    {
      name: 'read',
      type: 'checkbox',
      label: 'Mark as Read',
      helperText: 'Has this submission been reviewed?',
    },
  ],

  defaultFormData: {
    name: '',
    email: '',
    subject: '',
    message: '',
    read: false,
  },

  orderBy: {
    column: 'created_at',
    ascending: false,
  },

  formatters: {
    read: (value) => (value ? '✅ Read' : '📧 Unread'),
    created_at: (value) => new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    message: (value) => {
      // Truncate long messages in list view
      const str = String(value);
      return str.length > 100 ? str.substring(0, 100) + '...' : str;
    },
  },

  features: {
    create: true,
    edit: true,
    delete: true,
    search: true,
  },
};
