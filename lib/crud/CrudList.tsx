/**
 * Generic CRUD List Component
 *
 * Displays list of items with edit/delete actions.
 */

'use client';

import React from 'react';
import type { CrudConfig, CrudEntity } from './types';
import { Button, Badge } from '@/components/ui';
import { formatDate, truncate } from '@/lib/utils';

export interface CrudListProps<T extends CrudEntity> {
  config: CrudConfig<T>;
  items: T[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

export function CrudList<T extends CrudEntity>({
  config,
  items,
  onEdit,
  onDelete,
}: CrudListProps<T>) {
  /**
   * Format value for display
   */
  const formatValue = (key: keyof T, value: any): string => {
    // Use custom formatter if provided
    if (config.formatters?.[key]) {
      return config.formatters[key]!(value);
    }

    // Default formatting
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);

    const str = String(value);

    // Truncate long strings
    if (str.length > 100) {
      return truncate(str, 100);
    }

    return str;
  };

  /**
   * Get primary fields to display (first 3 non-id fields)
   */
  const getDisplayFields = () => {
    return config.fields
      .filter((f) => f.name !== 'id' && f.type !== 'markdown')
      .slice(0, 3);
  };

  const displayFields = getDisplayFields();

  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="card-cyber p-5 bg-cyber-darker/50 hover:bg-cyber-darker/70 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            {/* Content */}
            <div className="flex-1 space-y-2">
              {/* Primary field as title */}
              {displayFields[0] && (
                <h3 className="text-lg font-semibold text-white">
                  {formatValue(
                    displayFields[0].name,
                    item[displayFields[0].name]
                  )}
                </h3>
              )}

              {/* Secondary fields */}
              <div className="space-y-1">
                {displayFields.slice(1).map((field) => (
                  <div
                    key={field.name as string}
                    className="text-sm text-gray-400"
                  >
                    <span className="font-medium text-gray-300">
                      {field.label}:
                    </span>{' '}
                    {formatValue(field.name, item[field.name])}
                  </div>
                ))}
              </div>

              {/* Boolean badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                {config.fields
                  .filter(
                    (f) =>
                      f.type === 'checkbox' &&
                      item[f.name] !== undefined &&
                      item[f.name] !== null
                  )
                  .map((field) => {
                    const value = item[field.name] as boolean;
                    return (
                      value && (
                        <Badge
                          key={field.name as string}
                          variant="success"
                        >
                          {field.label}
                        </Badge>
                      )
                    );
                  })}
              </div>

              {/* Metadata */}
              {item.created_at && (
                <div className="text-xs text-gray-500 pt-2">
                  Created {formatDate(item.created_at)}
                </div>
              )}
            </div>

            {/* Actions */}
            {(onEdit || onDelete) && (
              <div className="flex gap-2">
                {onEdit && (
                  <Button
                    onClick={() => onEdit(item)}
                    variant="ghost"
                    size="sm"
                  >
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    onClick={() => onDelete(item)}
                    variant="danger"
                    size="sm"
                  >
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
