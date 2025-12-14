/**
 * CRUD System Exports
 *
 * Central export point for the generic CRUD system.
 */

// Types
export type { CrudEntity, CrudConfig, CrudResult, UseCrudReturn } from './types';

// Hook
export { useCrud } from './useCrud';

// Components
export { CrudManager } from './CrudManager';
export { CrudForm } from './CrudForm';
export { CrudList } from './CrudList';
