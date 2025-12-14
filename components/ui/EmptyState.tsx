/**
 * Empty State Component
 *
 * Display when no data is available.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import type { EmptyStateProps } from '@/lib/types';

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && (
        <div className="mb-4 text-6xl opacity-50">
          {typeof icon === 'string' ? icon : icon}
        </div>
      )}

      <h3 className="text-xl font-semibold text-gray-300 mb-2">{title}</h3>

      {description && (
        <p className="text-gray-500 max-w-md mb-6">{description}</p>
      )}

      {action && <div>{action}</div>}
    </div>
  );
}
