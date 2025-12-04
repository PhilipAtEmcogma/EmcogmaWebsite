/**
 * Generic CRUD Manager Component
 *
 * Reusable component for managing any entity type.
 * Replaces ~1,800 lines of duplicated admin manager code.
 */

'use client';

import React from 'react';
import { useCrud } from './useCrud';
import { CrudForm } from './CrudForm';
import { CrudList } from './CrudList';
import type { CrudConfig, CrudEntity } from './types';
import { Button, Loading, EmptyState, useToast } from '@/components/ui';
import { APP_CONFIG } from '@/lib/config';

export interface CrudManagerProps<T extends CrudEntity> {
  config: CrudConfig<T>;
}

/**
 * Generic CRUD Manager
 *
 * @example
 * <CrudManager config={blogPostsConfig} />
 */
export function CrudManager<T extends CrudEntity>({
  config,
}: CrudManagerProps<T>) {
  const crud = useCrud(config);
  const { showToast } = useToast();

  const {
    items,
    loading,
    error,
    editingItem,
    isCreating,
    formData,
    createItem,
    updateItem,
    deleteItem,
    startEdit,
    startCreate,
    cancelEdit,
    setFormData,
    resetForm,
  } = crud;

  const features = config.features || {
    create: true,
    edit: true,
    delete: true,
  };

  /**
   * Handle form submit (create or update)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let result;

    if (editingItem) {
      result = await updateItem(editingItem.id, formData);
    } else {
      result = await createItem(formData);
    }

    if (result.success) {
      showToast(
        editingItem
          ? APP_CONFIG.ui.successMessages.updated
          : APP_CONFIG.ui.successMessages.created,
        'success'
      );
      resetForm();
    } else {
      showToast(result.error || 'Operation failed', 'error');
    }
  };

  /**
   * Handle delete with confirmation
   */
  const handleDelete = async (item: T) => {
    if (!confirm(`Are you sure you want to delete this ${config.displayName.slice(0, -1)}?`)) {
      return;
    }

    const result = await deleteItem(item.id);

    if (result.success) {
      showToast(APP_CONFIG.ui.successMessages.deleted, 'success');
    } else {
      showToast(result.error || 'Delete failed', 'error');
    }
  };

  if (loading && items.length === 0) {
    return (
      <Loading
        message={
          APP_CONFIG.ui.loadingMessages[
            config.tableName as keyof typeof APP_CONFIG.ui.loadingMessages
          ] || APP_CONFIG.ui.loadingMessages.default
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {config.icon && <span className="text-3xl">{config.icon}</span>}
          <h2 className="text-2xl font-bold text-white">
            {config.displayName}
          </h2>
        </div>

        {features.create && !isCreating && !editingItem && (
          <Button onClick={startCreate} variant="primary">
            + New {config.displayName.slice(0, -1)}
          </Button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Create/Edit Form */}
      {(isCreating || editingItem) && (
        <div className="card-cyber p-6 bg-cyber-darker/80">
          <h3 className="text-xl font-semibold text-white mb-4">
            {editingItem
              ? `Edit ${config.displayName.slice(0, -1)}`
              : `Create New ${config.displayName.slice(0, -1)}`}
          </h3>

          <CrudForm
            config={config}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onCancel={cancelEdit}
          />
        </div>
      )}

      {/* Items List */}
      {!isCreating && !editingItem && (
        <>
          {items.length === 0 ? (
            <EmptyState
              icon={config.icon}
              title={
                APP_CONFIG.ui.emptyMessages[
                  config.tableName as keyof typeof APP_CONFIG.ui.emptyMessages
                ] || APP_CONFIG.ui.emptyMessages.default
              }
              action={
                features.create && (
                  <Button onClick={startCreate} variant="primary">
                    Create First {config.displayName.slice(0, -1)}
                  </Button>
                )
              }
            />
          ) : (
            <CrudList
              config={config}
              items={items}
              onEdit={features.edit ? startEdit : undefined}
              onDelete={features.delete ? handleDelete : undefined}
            />
          )}
        </>
      )}
    </div>
  );
}
