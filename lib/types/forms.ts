/**
 * Form-Specific Types
 *
 * Type definitions for form data and field configurations
 */

import type {
  BlogPost,
  Project,
  Article,
  Product,
  Demo,
  Comment,
} from './database';

/**
 * Create DTOs (Data Transfer Objects)
 * Used when creating new entities (omit id and timestamps)
 */
export type CreateBlogPostDTO = Omit<
  BlogPost,
  'id' | 'created_at' | 'updated_at'
>;
export type CreateProjectDTO = Omit<
  Project,
  'id' | 'created_at' | 'updated_at'
>;
export type CreateArticleDTO = Omit<
  Article,
  'id' | 'created_at' | 'updated_at'
>;
export type CreateProductDTO = Omit<
  Product,
  'id' | 'created_at' | 'updated_at'
>;
export type CreateDemoDTO = Omit<Demo, 'id' | 'created_at' | 'updated_at'>;
export type CreateCommentDTO = Omit<Comment, 'id' | 'created_at'>;

/**
 * Update DTOs
 * Used when updating existing entities (all fields optional except id)
 */
export type UpdateBlogPostDTO = Partial<CreateBlogPostDTO> & { id: string };
export type UpdateProjectDTO = Partial<CreateProjectDTO> & { id: string };
export type UpdateArticleDTO = Partial<CreateArticleDTO> & { id: string };
export type UpdateProductDTO = Partial<CreateProductDTO> & { id: string };
export type UpdateDemoDTO = Partial<CreateDemoDTO> & { id: string };
export type UpdateCommentDTO = Partial<
  Omit<Comment, 'id' | 'created_at' | 'post_slug'>
> & { id: string };

/**
 * Field Types for dynamic form generation
 */
export type FieldType =
  | 'text'
  | 'email'
  | 'url'
  | 'number'
  | 'textarea'
  | 'markdown'
  | 'checkbox'
  | 'select'
  | 'tags'
  | 'array'
  | 'date';

/**
 * Field Configuration for dynamic forms
 */
export interface FieldConfig<T = any> {
  name: keyof T;
  type: FieldType;
  label: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
  };
  options?: Array<{ label: string; value: string | number }>;
  defaultValue?: any;
}

/**
 * Form State Management
 */
export interface FormState<T> {
  data: Partial<T>;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

/**
 * Form Field Error
 */
export interface FieldError {
  field: string;
  message: string;
}

/**
 * Form Submission Result
 */
export interface FormSubmissionResult<T = any> {
  success: boolean;
  data?: T;
  errors?: FieldError[];
  message?: string;
}
