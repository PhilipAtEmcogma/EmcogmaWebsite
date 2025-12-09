/**
 * Centralized Type Exports
 *
 * Single entry point for all application types.
 * Import types from '@/lib/types' instead of individual files.
 */

// Database entities
export type {
  BaseEntity,
  AdminUser,
  BlogPost,
  Comment,
  Project,
  Article,
  Product,
  Demo,
  Subscriber,
  ContactSubmission,
  TableName,
  TableEntityMap,
} from './database';

// API types
export type {
  CommentSubmissionRequest,
  CommentSubmissionResponse,
  ContactFormRequest,
  ContactFormResponse,
  ApiErrorResponse,
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
  ContentFilters,
} from './api';

// Form types
export type {
  CreateBlogPostDTO,
  CreateProjectDTO,
  CreateArticleDTO,
  CreateProductDTO,
  CreateDemoDTO,
  CreateCommentDTO,
  UpdateBlogPostDTO,
  UpdateProjectDTO,
  UpdateArticleDTO,
  UpdateProductDTO,
  UpdateDemoDTO,
  UpdateCommentDTO,
  FieldType,
  FieldConfig,
  FormState,
  FieldError,
  FormSubmissionResult,
} from './forms';

// UI types
export type {
  ButtonVariant,
  Size,
  LoadingState,
  ToastType,
  Toast,
  ModalProps,
  EmptyStateProps,
  Tab,
  BadgeVariant,
  CardProps,
  DropdownItem,
} from './ui';
