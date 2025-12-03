/**
 * Input validation and sanitization utilities
 * Prevents XSS, SQL injection, and other input-based attacks
 */

/**
 * Sanitize HTML to prevent XSS attacks
 * Removes dangerous tags and attributes
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';

  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');

  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:text\/html/gi, '');

  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  // Remove object and embed tags
  sanitized = sanitized.replace(/<(object|embed)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '');

  return sanitized.trim();
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  if (!text) return '';

  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Validate and sanitize email address
 */
export function validateEmail(email: string): { valid: boolean; sanitized: string; error?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, sanitized: '', error: 'Email is required' };
  }

  const sanitized = email.trim().toLowerCase();

  // Check length
  if (sanitized.length > 254) {
    return { valid: false, sanitized: '', error: 'Email is too long' };
  }

  // Email regex (RFC 5322 simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(sanitized)) {
    return { valid: false, sanitized: '', error: 'Invalid email format' };
  }

  return { valid: true, sanitized };
}

/**
 * Validate and sanitize URL
 */
export function validateUrl(url: string, allowedProtocols: string[] = ['http', 'https']): { valid: boolean; sanitized: string; error?: string } {
  if (!url || typeof url !== 'string') {
    return { valid: false, sanitized: '', error: 'URL is required' };
  }

  const sanitized = url.trim();

  try {
    const parsed = new URL(sanitized);

    // Check protocol
    if (!allowedProtocols.includes(parsed.protocol.replace(':', ''))) {
      return { valid: false, sanitized: '', error: 'Invalid URL protocol' };
    }

    // Check for dangerous patterns
    if (parsed.protocol === 'javascript:' || parsed.protocol === 'data:') {
      return { valid: false, sanitized: '', error: 'Dangerous URL protocol' };
    }

    return { valid: true, sanitized: parsed.toString() };
  } catch {
    return { valid: false, sanitized: '', error: 'Invalid URL format' };
  }
}

/**
 * Validate string length
 */
export function validateLength(
  value: string,
  min: number,
  max: number,
  fieldName: string = 'Field'
): { valid: boolean; error?: string } {
  if (!value || typeof value !== 'string') {
    return { valid: false, error: `${fieldName} is required` };
  }

  const length = value.trim().length;

  if (length < min) {
    return { valid: false, error: `${fieldName} must be at least ${min} characters` };
  }

  if (length > max) {
    return { valid: false, error: `${fieldName} must be at most ${max} characters` };
  }

  return { valid: true };
}

/**
 * Sanitize user input by removing dangerous characters
 */
export function sanitizeInput(input: string, maxLength: number = 10000): string {
  if (!input) return '';

  let sanitized = input.trim();

  // Limit length to prevent DoS
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Remove null bytes (can cause issues)
  sanitized = sanitized.replace(/\0/g, '');

  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  return sanitized;
}

/**
 * Validate slug format (for URLs)
 */
export function validateSlug(slug: string): { valid: boolean; error?: string } {
  if (!slug || typeof slug !== 'string') {
    return { valid: false, error: 'Slug is required' };
  }

  const sanitized = slug.trim().toLowerCase();

  // Slug pattern: lowercase letters, numbers, and hyphens only
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  if (!slugRegex.test(sanitized)) {
    return { valid: false, error: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only' };
  }

  if (sanitized.length < 1 || sanitized.length > 200) {
    return { valid: false, error: 'Slug must be between 1 and 200 characters' };
  }

  return { valid: true };
}

/**
 * Validate and sanitize markdown content
 * Allows markdown syntax but prevents XSS
 */
export function sanitizeMarkdown(content: string, maxLength: number = 50000): string {
  if (!content) return '';

  let sanitized = content.trim();

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Remove script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers in HTML tags within markdown
  sanitized = sanitized.replace(/(<[^>]+\s)on\w+\s*=\s*["'][^"']*["']/gi, '$1');

  // Remove javascript: protocol in links
  sanitized = sanitized.replace(/\[([^\]]+)\]\(javascript:[^\)]*\)/gi, '[$1](#)');

  return sanitized;
}

/**
 * Validate request body size
 */
export function validateBodySize(body: unknown, maxSizeBytes: number = 1024 * 1024): { valid: boolean; error?: string } {
  const bodyString = JSON.stringify(body);
  const sizeBytes = new Blob([bodyString]).size;

  if (sizeBytes > maxSizeBytes) {
    return {
      valid: false,
      error: `Request body too large. Maximum size: ${maxSizeBytes} bytes`,
    };
  }

  return { valid: true };
}

/**
 * Detect potential SQL injection patterns
 * Note: Parameterized queries are the primary defense, this is secondary
 */
export function detectSqlInjection(input: string): boolean {
  if (!input) return false;

  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(;|\-\-|\/\*|\*\/)/,
    /(\bOR\b.*=.*)/i,
    /(\bUNION\b.*\bSELECT\b)/i,
    /('+\s*(OR|AND)\s*'+\s*=\s*')/i,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Comprehensive input validation for forms
 */
export interface ValidationResult {
  valid: boolean;
  errors: { [field: string]: string };
  sanitized: { [field: string]: string };
}

/**
 * Validate comment submission
 */
export function validateComment(data: {
  author: string;
  authorEmail?: string;
  content: string;
  postSlug: string;
}): ValidationResult {
  const errors: { [field: string]: string } = {};
  const sanitized: { [field: string]: string } = {};

  // Validate author
  const authorValidation = validateLength(data.author, 2, 100, 'Author name');
  if (!authorValidation.valid) {
    errors.author = authorValidation.error!;
  } else {
    sanitized.author = sanitizeInput(data.author, 100);
  }

  // Validate email if provided
  if (data.authorEmail) {
    const emailValidation = validateEmail(data.authorEmail);
    if (!emailValidation.valid) {
      errors.authorEmail = emailValidation.error!;
    } else {
      sanitized.authorEmail = emailValidation.sanitized;
    }
  }

  // Validate content
  const contentValidation = validateLength(data.content, 5, 5000, 'Comment');
  if (!contentValidation.valid) {
    errors.content = contentValidation.error!;
  } else {
    const cleanContent = sanitizeHtml(data.content);
    if (detectSqlInjection(cleanContent)) {
      errors.content = 'Invalid content detected';
    } else {
      sanitized.content = cleanContent;
    }
  }

  // Validate slug
  const slugValidation = validateSlug(data.postSlug);
  if (!slugValidation.valid) {
    errors.postSlug = slugValidation.error!;
  } else {
    sanitized.postSlug = data.postSlug.trim().toLowerCase();
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitized,
  };
}

/**
 * Validate contact form submission
 */
export function validateContactForm(data: {
  name: string;
  email: string;
  message: string;
}): ValidationResult {
  const errors: { [field: string]: string } = {};
  const sanitized: { [field: string]: string } = {};

  // Validate name
  const nameValidation = validateLength(data.name, 2, 100, 'Name');
  if (!nameValidation.valid) {
    errors.name = nameValidation.error!;
  } else {
    sanitized.name = sanitizeInput(data.name, 100);
  }

  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.error!;
  } else {
    sanitized.email = emailValidation.sanitized;
  }

  // Validate message
  const messageValidation = validateLength(data.message, 10, 5000, 'Message');
  if (!messageValidation.valid) {
    errors.message = messageValidation.error!;
  } else {
    const cleanMessage = sanitizeInput(data.message, 5000);
    if (detectSqlInjection(cleanMessage)) {
      errors.message = 'Invalid content detected';
    } else {
      sanitized.message = cleanMessage;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitized,
  };
}
