/**
 * UI Component Types
 *
 * Type definitions for UI components and props
 */

import type { ReactNode } from 'react';

/**
 * Button variants
 */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

/**
 * Size variants
 */
export type Size = 'sm' | 'md' | 'lg';

/**
 * Loading states
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Toast notification types
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast notification
 */
export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Modal props
 */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: Size;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

/**
 * Empty state props
 */
export interface EmptyStateProps {
  icon?: string | ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

/**
 * Tab configuration
 */
export interface Tab {
  id: string;
  label: string;
  icon?: string | ReactNode;
  count?: number;
  disabled?: boolean;
}

/**
 * Badge variant
 */
export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

/**
 * Card props
 */
export interface CardProps {
  title?: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
  variant?: 'default' | 'cyber' | 'glass';
  hover?: boolean;
}

/**
 * Dropdown menu item
 */
export interface DropdownItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger';
}
