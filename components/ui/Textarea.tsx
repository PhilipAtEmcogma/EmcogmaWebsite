/**
 * Textarea Component
 *
 * Cyberpunk-themed textarea with label, error, and helper text support.
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      id,
      required,
      disabled,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-300"
          >
            {label}
            {required && <span className="text-cyber-secondary ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={cn(
            'input-cyber w-full px-4 py-2 bg-cyber-darker border border-gray-700 rounded-lg',
            'text-white placeholder:text-gray-500',
            'focus:outline-none focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary',
            'transition-colors duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'resize-vertical',
            error && 'border-cyber-secondary focus:border-cyber-secondary focus:ring-cyber-secondary',
            className
          )}
          disabled={disabled}
          {...props}
        />

        {error && (
          <p className="text-sm text-cyber-secondary flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
