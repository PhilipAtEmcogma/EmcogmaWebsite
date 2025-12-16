/**
 * Generic CRUD Form Component
 *
 * Dynamically generates form fields based on configuration.
 */

'use client';

import React from 'react';
import type { CrudConfig, CrudEntity } from './types';
import { Button, Input, Textarea } from '@/components/ui';
import { stringToTags, tagsToString } from '@/lib/utils';

export interface CrudFormProps<T extends CrudEntity> {
  config: CrudConfig<T>;
  formData: Partial<T>;
  setFormData: (data: Partial<T>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function CrudForm<T extends CrudEntity>({
  config,
  formData,
  setFormData,
  onSubmit,
  onCancel,
}: CrudFormProps<T>) {
  /**
   * Handle field change
   */
  const handleChange = (
    name: keyof T,
    value: any
  ) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  /**
   * Render field based on type
   */
  const renderField = (field: typeof config.fields[0]) => {
    const value = (formData[field.name as keyof T] as any) ?? field.defaultValue ?? '';

    switch (field.type) {
      case 'textarea':
      case 'markdown':
        return (
          <Textarea
            key={field.name as string}
            label={field.label}
            value={value as string}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            helperText={field.helperText}
            required={field.required}
            disabled={field.disabled}
            rows={field.type === 'markdown' ? 15 : 4}
          />
        );

      case 'checkbox':
        return (
          <div key={field.name as string} className="flex items-center gap-2">
            <input
              type="checkbox"
              id={field.name as string}
              checked={value as boolean}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              disabled={field.disabled}
              className="w-4 h-4 rounded border-gray-700 bg-cyber-darker text-cyber-primary focus:ring-cyber-primary"
            />
            <label
              htmlFor={field.name as string}
              className="text-sm font-medium text-gray-300"
            >
              {field.label}
            </label>
            {field.helperText && (
              <span className="text-xs text-gray-500 ml-2">
                {field.helperText}
              </span>
            )}
          </div>
        );

      case 'number':
        return (
          <Input
            key={field.name as string}
            type="number"
            label={field.label}
            value={value as number}
            onChange={(e) =>
              handleChange(field.name, parseFloat(e.target.value) || 0)
            }
            placeholder={field.placeholder}
            helperText={field.helperText}
            required={field.required}
            disabled={field.disabled}
          />
        );

      case 'select':
        return (
          <div key={field.name as string} className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              {field.label}
              {field.required && (
                <span className="text-cyber-secondary ml-1">*</span>
              )}
            </label>
            <select
              value={value as string}
              onChange={(e) => handleChange(field.name, e.target.value)}
              required={field.required}
              disabled={field.disabled}
              className="input-cyber w-full px-4 py-2 bg-cyber-darker border border-gray-700 rounded-lg text-white"
            >
              <option value="">Select...</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {field.helperText && (
              <p className="text-sm text-gray-500">{field.helperText}</p>
            )}
          </div>
        );

      case 'tags':
        return (
          <Input
            key={field.name as string}
            type="text"
            label={field.label}
            value={Array.isArray(value) ? tagsToString(value) : (value as string) || ''}
            onChange={(e) =>
              handleChange(field.name, e.target.value as any)
            }
            onBlur={(e) => {
              // Convert to array on blur to preserve commas while typing
              const tags = stringToTags(e.target.value);
              handleChange(field.name, tags as any);
            }}
            placeholder={field.placeholder || 'tag1, tag2, tag3'}
            helperText={
              field.helperText || 'Separate tags with commas'
            }
            required={field.required}
            disabled={field.disabled}
          />
        );

      case 'array':
        return (
          <Input
            key={field.name as string}
            type="text"
            label={field.label}
            value={Array.isArray(value) ? tagsToString(value) : (value as string) || ''}
            onChange={(e) =>
              handleChange(field.name, e.target.value as any)
            }
            onBlur={(e) => {
              // Convert to array on blur to preserve commas while typing
              const tags = stringToTags(e.target.value);
              handleChange(field.name, tags as any);
            }}
            placeholder={field.placeholder || 'item1, item2, item3'}
            helperText={
              field.helperText || 'Separate items with commas'
            }
            required={field.required}
            disabled={field.disabled}
          />
        );

      default:
        // text, email, url
        return (
          <Input
            key={field.name as string}
            type={field.type as any}
            label={field.label}
            value={value as string}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            helperText={field.helperText}
            required={field.required}
            disabled={field.disabled}
          />
        );
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {config.fields.map((field) => renderField(field))}

      <div className="flex gap-3 pt-4">
        <Button type="submit" variant="primary">
          Save
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
