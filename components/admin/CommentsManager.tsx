/**
 * Comments Manager
 *
 * REFACTORED: Using generic CRUD system
 * Before: 280 lines of duplicated logic
 * After: 10 lines using CrudManager
 */

'use client';

import { CrudManager } from '@/lib/crud';
import { commentsConfig } from './config/commentsConfig';

export default function CommentsManager() {
  return <CrudManager config={commentsConfig} />;
}
