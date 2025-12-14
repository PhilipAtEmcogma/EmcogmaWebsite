/**
 * Products Manager
 *
 * REFACTORED: Using generic CRUD system
 * Before: 416 lines of duplicated logic
 * After: 10 lines using CrudManager
 */

'use client';

import { CrudManager } from '@/lib/crud';
import { productsConfig } from './config/productsConfig';

export default function ProductsManager() {
  return <CrudManager config={productsConfig} />;
}
