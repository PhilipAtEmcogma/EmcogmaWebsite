/**
 * Products CRUD Configuration
 */

import type { CrudConfig } from '@/lib/crud';
import type { Product } from '@/lib/types';
import { productSchema } from '@/lib/validation';

export const productsConfig: CrudConfig<Product> = {
  tableName: 'products',
  displayName: 'Products',
  icon: '💼',
  schema: productSchema,

  fields: [
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      placeholder: 'my-product',
      required: true,
    },
    {
      name: 'name',
      type: 'text',
      label: 'Product Name',
      placeholder: 'My Awesome Product',
      required: true,
    },
    {
      name: 'tagline',
      type: 'text',
      label: 'Tagline',
      placeholder: 'Revolutionary software solution',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Short Description',
      placeholder: 'Brief product description...',
      required: true,
    },
    {
      name: 'long_description',
      type: 'textarea',
      label: 'Long Description',
      placeholder: 'Detailed product description...',
      required: true,
    },
    {
      name: 'pricing_type',
      type: 'select',
      label: 'Pricing Type',
      required: true,
      options: [
        { value: 'one-time', label: 'One-time Payment' },
        { value: 'recurring', label: 'Monthly Recurring' },
      ],
    },
    {
      name: 'price',
      type: 'number',
      label: 'Price ($)',
      placeholder: '29.99',
      required: true,
    },
    {
      name: 'features',
      type: 'array',
      label: 'Features',
      placeholder: 'Feature 1, Feature 2, Feature 3',
      helperText: 'Comma-separated list of features',
      required: true,
    },
    {
      name: 'image_url',
      type: 'url',
      label: 'Image URL',
      placeholder: 'https://example.com/product.jpg',
    },
    {
      name: 'demo_url',
      type: 'url',
      label: 'Demo URL',
      placeholder: 'https://demo.example.com',
    },
    {
      name: 'documentation_url',
      type: 'url',
      label: 'Documentation URL',
      placeholder: 'https://docs.example.com',
    },
    {
      name: 'category',
      type: 'text',
      label: 'Category',
      placeholder: 'SaaS',
      required: true,
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Featured',
      helperText: 'Show on homepage',
    },
    {
      name: 'active',
      type: 'checkbox',
      label: 'Active',
      helperText: 'Product is available for purchase',
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
    name: '',
    tagline: '',
    description: '',
    long_description: '',
    pricing_type: 'one-time',
    price: null,
    features: [],
    image_url: '',
    demo_url: null,
    documentation_url: null,
    category: '',
    featured: false,
    active: true,
    display_order: 0,
  },

  orderBy: {
    column: 'display_order',
    ascending: true,
  },

  formatters: {
    features: (features) => features.join(', '),
    price: (price) => price ? `$${price}` : '-',
    pricing_type: (type) => type === 'one-time' ? 'One-time' : 'Monthly',
  },
};
