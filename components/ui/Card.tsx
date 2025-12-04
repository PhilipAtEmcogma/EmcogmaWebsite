/**
 * Card Component
 *
 * Cyberpunk-themed card container.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import type { CardProps } from '@/lib/types';

export function Card({
  title,
  description,
  footer,
  children,
  variant = 'cyber',
  hover = false,
}: CardProps) {
  const variantClasses = {
    default: 'bg-cyber-darker border border-gray-800',
    cyber: 'card-cyber bg-cyber-darker/50 border border-cyber-primary/20',
    glass: 'bg-white/5 backdrop-blur-sm border border-white/10',
  };

  return (
    <div
      className={cn(
        'rounded-lg p-6',
        variantClasses[variant],
        hover && 'transition-transform duration-300 hover:scale-105 hover:shadow-lg cursor-pointer'
      )}
    >
      {title && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-gray-400">{description}</p>
          )}
        </div>
      )}

      <div>{children}</div>

      {footer && (
        <div className="mt-6 pt-4 border-t border-gray-800">{footer}</div>
      )}
    </div>
  );
}
