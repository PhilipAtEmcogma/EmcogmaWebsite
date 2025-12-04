/**
 * Form Validation Hook
 *
 * React hook for client-side form validation with Zod schemas.
 */

'use client';

import { useState, useCallback } from 'react';
import { z } from 'zod';

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors: Record<string, string>;
}

/**
 * Hook for form validation with Zod schemas
 *
 * @param schema - Zod schema to validate against
 * @returns Validation utilities
 *
 * @example
 * const { errors, validate, clearErrors } = useFormValidation(contactFormSchema);
 *
 * const handleSubmit = async (data) => {
 *   const result = validate(data);
 *   if (!result.success) return;
 *   // Submit validated data
 * };
 */
export function useFormValidation<T extends z.ZodType>(schema: T) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Validate data against schema
   */
  const validate = useCallback(
    (data: unknown): ValidationResult<z.infer<T>> => {
      const result = schema.safeParse(data);

      if (!result.success) {
        const fieldErrors: Record<string, string> = {};

        result.error.issues.forEach((issue) => {
          const path = issue.path.join('.');
          if (!fieldErrors[path]) {
            fieldErrors[path] = issue.message;
          }
        });

        setErrors(fieldErrors);

        return {
          success: false,
          errors: fieldErrors,
        };
      }

      setErrors({});

      return {
        success: true,
        data: result.data,
        errors: {},
      };
    },
    [schema]
  );

  /**
   * Validate a single field
   */
  const validateField = useCallback(
    (fieldName: string, value: unknown): string | undefined => {
      try {
        // Extract field schema if possible
        if ('shape' in schema && schema.shape) {
          const fieldSchema = (schema.shape as any)[fieldName];
          if (fieldSchema) {
            fieldSchema.parse(value);

            // Clear error for this field
            setErrors((prev) => {
              const next = { ...prev };
              delete next[fieldName];
              return next;
            });

            return undefined;
          }
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          const message = error.issues[0]?.message || 'Invalid value';

          setErrors((prev) => ({
            ...prev,
            [fieldName]: message,
          }));

          return message;
        }
      }

      return undefined;
    },
    [schema]
  );

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Clear error for specific field
   */
  const clearFieldError = useCallback((fieldName: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  }, []);

  /**
   * Set manual error
   */
  const setFieldError = useCallback((fieldName: string, message: string) => {
    setErrors((prev) => ({
      ...prev,
      [fieldName]: message,
    }));
  }, []);

  /**
   * Check if form has errors
   */
  const hasErrors = Object.keys(errors).length > 0;

  /**
   * Check if specific field has error
   */
  const hasFieldError = (fieldName: string) => Boolean(errors[fieldName]);

  return {
    errors,
    validate,
    validateField,
    clearErrors,
    clearFieldError,
    setFieldError,
    hasErrors,
    hasFieldError,
  };
}
