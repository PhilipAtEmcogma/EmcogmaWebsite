/**
 * Generic CRUD Hook
 *
 * Reusable hook for CRUD operations on any entity type.
 * Eliminates code duplication across admin managers.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { CrudConfig, CrudEntity, CrudResult, UseCrudReturn } from './types';

/**
 * Generic CRUD hook
 *
 * @param config - CRUD configuration
 * @returns CRUD operations and state
 *
 * @example
 * const crud = useCrud(blogPostsConfig);
 *
 * useEffect(() => {
 *   crud.fetchItems();
 * }, []);
 *
 * const handleCreate = async () => {
 *   const result = await crud.createItem(crud.formData);
 *   if (result.success) {
 *     crud.resetForm();
 *   }
 * };
 */
export function useCrud<T extends CrudEntity>(
  config: CrudConfig<T>
): UseCrudReturn<T> {
  const supabase = createClient();

  // State
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<T>>(config.defaultFormData);

  /**
   * Fetch all items
   */
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from(config.tableName)
        .select(config.selectColumns || '*');

      // Apply default filters
      if (config.defaultFilters) {
        Object.entries(config.defaultFilters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      // Apply ordering
      if (config.orderBy) {
        query = query.order(config.orderBy.column as string, {
          ascending: config.orderBy.ascending ?? false,
        });
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setItems((data as unknown as T[]) || []);
    } catch (err: any) {
      // Only log error details in development to avoid exposing sensitive data
      if (process.env.NODE_ENV === 'development') {
        console.error(`Error fetching ${config.displayName}:`, err);
      } else {
        console.error(`Error fetching ${config.displayName}:`, err.message || 'Unknown error');
      }
      setError(err.message || `Failed to fetch ${config.displayName}`);
    } finally {
      setLoading(false);
    }
  }, [config, supabase]);

  /**
   * Create new item
   */
  const createItem = useCallback(
    async (data: Partial<T>): Promise<CrudResult<T>> => {
      try {
        // Validate if schema is provided
        if (config.schema) {
          const validation = config.schema.safeParse(data);
          if (!validation.success) {
            const firstError = validation.error.issues?.[0];
            return {
              success: false,
              error: firstError?.message || 'Validation failed',
            };
          }
        }

        const { data: newItem, error: createError } = await supabase
          .from(config.tableName)
          .insert([data as any])
          .select()
          .single();

        if (createError) throw createError;

        // Refresh list
        await fetchItems();

        return {
          success: true,
          data: newItem as T,
        };
      } catch (err: any) {
        // Only log error details in development to avoid exposing sensitive data
        if (process.env.NODE_ENV === 'development') {
          console.error(`Error creating ${config.displayName}:`, err);
        } else {
          console.error(`Error creating ${config.displayName}:`, err.message || 'Unknown error');
        }
        return {
          success: false,
          error: err.message || `Failed to create ${config.displayName}`,
        };
      }
    },
    [config, supabase, fetchItems]
  );

  /**
   * Update existing item
   */
  const updateItem = useCallback(
    async (id: string, data: Partial<T>): Promise<CrudResult<T>> => {
      try {
        // Validate if updateSchema or schema is provided
        const schemaToUse = config.updateSchema || config.schema;
        if (schemaToUse) {
          // For updates, use partial schema if only regular schema provided
          const validationSchema = config.updateSchema
            ? schemaToUse
            : schemaToUse.partial();

          const validation = validationSchema.safeParse({ ...data, id });
          if (!validation.success) {
            const firstError = validation.error.issues?.[0];
            return {
              success: false,
              error: firstError?.message || 'Validation failed',
            };
          }
        }

        const { data: updatedItem, error: updateError } = await supabase
          .from(config.tableName)
          .update(data as any)
          .eq('id', id)
          .select()
          .single();

        if (updateError) throw updateError;

        // Refresh list
        await fetchItems();

        return {
          success: true,
          data: updatedItem as T,
        };
      } catch (err: any) {
        // Only log error details in development to avoid exposing sensitive data
        if (process.env.NODE_ENV === 'development') {
          console.error(`Error updating ${config.displayName}:`, err);
        } else {
          console.error(`Error updating ${config.displayName}:`, err.message || 'Unknown error');
        }
        return {
          success: false,
          error: err.message || `Failed to update ${config.displayName}`,
        };
      }
    },
    [config, supabase, fetchItems]
  );

  /**
   * Delete item
   */
  const deleteItem = useCallback(
    async (id: string): Promise<CrudResult<void>> => {
      try {
        console.log(`[DELETE] Attempting to delete ${config.displayName} with id:`, id);

        const { error: deleteError, data } = await supabase
          .from(config.tableName)
          .delete()
          .eq('id', id)
          .select();

        console.log(`[DELETE] Response:`, { error: deleteError, data });

        if (deleteError) {
          console.error(`[DELETE] Error from Supabase:`, deleteError);
          throw deleteError;
        }

        console.log(`[DELETE] Success! Updating UI state...`);

        // Immediately remove from local state for instant UI update
        setItems((prevItems) => {
          const filtered = prevItems.filter((item) => item.id !== id);
          console.log(`[DELETE] Items before:`, prevItems.length, `after:`, filtered.length);
          return filtered;
        });

        // Also refresh from database to ensure consistency
        console.log(`[DELETE] Fetching items to refresh list...`);
        await fetchItems();

        return { success: true };
      } catch (err: any) {
        // Only log error details in development to avoid exposing sensitive data
        if (process.env.NODE_ENV === 'development') {
          console.error(`[DELETE] Error deleting ${config.displayName}:`, err);
        } else {
          console.error(`[DELETE] Error deleting ${config.displayName}:`, err.message || 'Unknown error');
        }
        return {
          success: false,
          error: err.message || `Failed to delete ${config.displayName}`,
        };
      }
    },
    [config, supabase, fetchItems]
  );

  /**
   * Start editing an item
   */
  const startEdit = useCallback((item: T) => {
    setEditingItem(item);
    setFormData(item);
    setIsCreating(false);
  }, []);

  /**
   * Start creating new item
   */
  const startCreate = useCallback(() => {
    setIsCreating(true);
    setEditingItem(null);
    setFormData(config.defaultFormData);
  }, [config.defaultFormData]);

  /**
   * Cancel edit/create
   */
  const cancelEdit = useCallback(() => {
    setEditingItem(null);
    setIsCreating(false);
    setFormData(config.defaultFormData);
  }, [config.defaultFormData]);

  /**
   * Reset form to default
   */
  const resetForm = useCallback(() => {
    setFormData(config.defaultFormData);
    setEditingItem(null);
    setIsCreating(false);
  }, [config.defaultFormData]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    // State
    items,
    loading,
    error,
    editingItem,
    isCreating,
    formData,

    // Operations
    fetchItems,
    createItem,
    updateItem,
    deleteItem,

    // UI Helpers
    startEdit,
    startCreate,
    cancelEdit,
    setFormData,
    resetForm,
  };
}
