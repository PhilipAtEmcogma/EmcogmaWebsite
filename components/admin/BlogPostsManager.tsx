/**
 * Blog Posts Manager
 *
 * REFACTORED: Using generic CRUD system
 * Before: 326 lines of duplicated logic
 * After: 10 lines using CrudManager
 */

'use client';

import { CrudManager } from '@/lib/crud';
import { blogPostsConfig } from './config/blogPostsConfig';

export default function BlogPostsManager() {
  return <CrudManager config={blogPostsConfig} />;
}
