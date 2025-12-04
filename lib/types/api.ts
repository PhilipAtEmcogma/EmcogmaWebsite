/**
 * API Request/Response Types
 *
 * Type definitions for API endpoints and data transfer objects (DTOs)
 */

/**
 * Comment Submission (POST /api/comments)
 */
export interface CommentSubmissionRequest {
  postSlug: string;
  author: string;
  authorEmail?: string;
  content: string;
}

export interface CommentSubmissionResponse {
  success: boolean;
  message: string;
  comment?: {
    id: string;
    author_name: string;
    content: string;
    created_at: string;
  };
}

/**
 * Contact Form Submission (POST /api/contact)
 */
export interface ContactFormRequest {
  name: string;
  email: string;
  subject?: string;
  message: string;
  recaptchaToken: string;
}

export interface ContactFormResponse {
  success: boolean;
  message: string;
}

/**
 * API Error Response
 */
export interface ApiErrorResponse {
  error: string;
  errors?: Record<string, string>;
  code?: string;
}

/**
 * Generic API Response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Filter options for content queries
 */
export interface ContentFilters {
  published?: boolean;
  featured?: boolean;
  category?: string;
  tags?: string[];
  search?: string;
}
