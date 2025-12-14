/**
 * Validation Exports
 *
 * Central export point for all validation utilities.
 */

// Schemas
export * from './schemas';

// Client-side hooks
export { useFormValidation, type ValidationResult } from './useFormValidation';

// Server-side utilities
export {
  validateSchema,
  createValidator,
  sanitizeHtml,
  validateAndSanitizeString,
  isValidEmail,
  isValidUrl,
  isValidSlug,
  type ServerValidationResult,
} from './server';
