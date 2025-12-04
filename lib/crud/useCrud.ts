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
      console.error(`Error fetching ${config.displayName}:`, err);
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
        console.error(`Error creating ${config.displayName}:`, err);
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
        console.error(`Error updating ${config.displayName}:`, err);
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
        const { error: deleteError } = await supabase
          .from(config.tableName)
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;

        // Refresh list
        await fetchItems();

        return { success: true };
      } catch (err: any) {
        console.error(`Error deleting ${config.displayName}:`, err);
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
