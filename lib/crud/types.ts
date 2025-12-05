/**
 * CRUD System Types
 *
 * Type definitions for the generic CRUD system.
 */

import type { FieldConfig } from '@/lib/types';
import type { z } from 'zod';

/**
 * Base entity requirements
 */
export interface CrudEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * CRUD Configuration
 */
export interface CrudConfig<T extends CrudEntity> {
  /**
   * Database table name
   */
  tableName: string;

  /**
   * Display name (plural)
   */
  displayName: string;

  /**
   * Icon or emoji
   */
  icon?: string;

  /**
   * Field configurations for form generation
   */
  fields: FieldConfig<T>[];

  /**
   * Validation schema for create operations (Zod)
   * Must be a ZodObject to support .partial() for updates
   */
  schema?: z.ZodObject<any>;

  /**
   * Validation schema for update operations (Zod)
   * If not provided, falls back to schema.partial()
   */
  updateSchema?: z.ZodObject<any>;

  /**
   * Default form data for creation
   */
  defaultFormData: Partial<T>;

  /**
   * Custom query filters
   */
  defaultFilters?: Record<string, any>;

  /**
   * Order by configuration
   */
  orderBy?: {
    column: keyof T;
    ascending?: boolean;
  };

  /**
   * Columns to select (default: '*')
   */
  selectColumns?: string;

  /**
   * Enable/disable features
   */
  features?: {
    create?: boolean;
    edit?: boolean;
    delete?: boolean;
    search?: boolean;
    filter?: boolean;
  };

  /**
   * Custom formatters for display
   */
  formatters?: {
    [K in keyof T]?: (value: T[K]) => string;
  };

  /**
   * Custom list item renderer
   */
  renderListItem?: (item: T) => React.ReactNode;
}

/**
 * CRUD Operation Result
 */
export interface CrudResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * CRUD Hooks Return Type
 */
export interface UseCrudReturn<T extends CrudEntity> {
  // State
  items: T[];
  loading: boolean;
  error: string | null;
  editingItem: T | null;
  isCreating: boolean;
  formData: Partial<T>;

  // Operations
  fetchItems: () => Promise<void>;
  createItem: (data: Partial<T>) => Promise<CrudResult<T>>;
  updateItem: (id: string, data: Partial<T>) => Promise<CrudResult<T>>;
  deleteItem: (id: string) => Promise<CrudResult<void>>;

  // UI Helpers
  startEdit: (item: T) => void;
  startCreate: () => void;
  cancelEdit: () => void;
  setFormData: (data: Partial<T>) => void;
  resetForm: () => void;
}
