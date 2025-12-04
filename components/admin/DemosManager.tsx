/**
 * Demos Manager
 *
 * REFACTORED: Using generic CRUD system
 * Before: 355 lines of duplicated logic
 * After: 10 lines using CrudManager
 */

'use client';

import { CrudManager } from '@/lib/crud';
import { demosConfig } from './config/demosConfig';

export default function DemosManager() {
  return <CrudManager config={demosConfig} />;
}
