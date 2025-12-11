/**
 * Subscribers CRUD Configuration
 *
 * Defines fields and behavior for subscriber management.
 */

import type { CrudConfig } from '@/lib/crud';
import type { Subscriber } from '@/lib/types';
import { subscriberSchema } from '@/lib/validation';

export const subscribersConfig: CrudConfig<Subscriber> = {
  tableName: 'subscribers',
  displayName: 'Subscribers',
  icon: '📧',
  schema: subscriberSchema,

  fields: [
    {
      name: 'email',
      type: 'email',
      label: 'Email Address',
      placeholder: 'subscriber@example.com',
      helperText: 'Subscriber email address',
      required: true,
    },
    {
      name: 'subscribed',
      type: 'checkbox',
      label: 'Subscribed',
      helperText: 'Is the subscriber active?',
    },
  ],

  defaultFormData: {
    email: '',
    subscribed: true,
  },

  orderBy: {
    column: 'created_at',
    ascending: false,
  },

  formatters: {
    subscribed: (value) => (value ? '✅ Active' : '❌ Unsubscribed'),
    created_at: (value) => new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
  },

  features: {
    create: true,
    edit: true,
    delete: true,
    search: true,
  },
};
