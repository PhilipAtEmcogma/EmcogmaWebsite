/**
 * Articles Manager
 *
 * REFACTORED: Using generic CRUD system
 * Before: 327 lines of duplicated logic
 * After: 10 lines using CrudManager
 */

'use client';

import { CrudManager } from '@/lib/crud';
import { articlesConfig } from './config/articlesConfig';

export default function ArticlesManager() {
  return <CrudManager config={articlesConfig} />;
}
