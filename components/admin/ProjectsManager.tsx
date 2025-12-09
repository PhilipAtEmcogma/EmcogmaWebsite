/**
 * Projects Manager
 *
 * REFACTORED: Using generic CRUD system
 * Before: 347 lines of duplicated logic
 * After: 10 lines using CrudManager
 */

'use client';

import { CrudManager } from '@/lib/crud';
import { projectsConfig } from './config/projectsConfig';

export default function ProjectsManager() {
  return <CrudManager config={projectsConfig} />;
}
