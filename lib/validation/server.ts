/**
 * Server-Side Validation Utilities
 *
 * Helper functions for validating data on the server using Zod schemas.
 */

import { z } from 'zod';

export interface ServerValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
}

/**
 * Validate data with a Zod schema (server-side)
 *
 * @param schema - Zod schema
 * @param data - Data to validate
 * @returns Validation result
 *
 * @example
 * const result = validateSchema(commentSchema, requestBody);
 * if (!result.success) {
 *   return NextResponse.json({ error: result.error, errors: result.errors }, { status: 400 });
 * }
 * // Use result.data
 */
export function validateSchema<T extends z.ZodType>(
  schema: T,
  data: unknown
): ServerValidationResult<z.infer<T>> {
  try {
    const result = schema.safeParse(data);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};

      result.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      });

      return {
        success: false,
        error: 'Validation failed',
        errors: fieldErrors,
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Invalid data format',
    };
  }
}

/**
 * Create a validation middleware for API routes
 *
 * @param schema - Zod schema to validate against
 * @returns Validation function
 *
 * @example
 * const validateComment = createValidator(commentSchema);
 *
 * export async function POST(request: Request) {
 *   const body = await request.json();
 *   const validation = validateComment(body);
 *
 *   if (!validation.success) {
 *     return NextResponse.json(
 *       { error: validation.error, errors: validation.errors },
 *       { status: 400 }
 *     );
 *   }
 *
 *   // Use validation.data
 * }
 */
export function createValidator<T extends z.ZodType>(schema: T) {
  return (data: unknown): ServerValidationResult<z.infer<T>> => {
    return validateSchema(schema, data);
  };
}

/**
 * Sanitize HTML to prevent XSS (basic implementation)
 * For production, consider using DOMPurify on the server
 *
 * @param str - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize a string
 *
 * @param str - String to process
 * @param maxLength - Maximum length
 * @returns Sanitized string or null if invalid
 */
export function validateAndSanitizeString(
  str: unknown,
  maxLength: number = 5000
): string | null {
  if (typeof str !== 'string') return null;
  if (str.trim().length === 0) return null;
  if (str.length > maxLength) return null;

  return sanitizeHtml(str.trim());
}

/**
 * Validate email format
 *
 * @param email - Email to validate
 * @returns True if valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 *
 * @param url - URL to validate
 * @returns True if valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate slug format
 *
 * @param slug - Slug to validate
 * @returns True if valid
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}
