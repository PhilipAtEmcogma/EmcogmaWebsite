/**
 * Environment Variable Validation Utility
 *
 * Validates that all required environment variables are present and properly formatted.
 * Call this at application startup to fail fast if configuration is missing.
 */

interface EnvValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates all required environment variables
 * @throws Error if critical environment variables are missing
 */
export function validateEnv(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required environment variables
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  // Check for missing required variables
  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  });

  // Validate Supabase URL format
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
      errors.push(
        'NEXT_PUBLIC_SUPABASE_URL must be a valid Supabase URL (https://xxx.supabase.co)'
      );
    }
  }

  // NOTE: ADMIN_EMAIL is no longer required.
  // Admin access is managed via the admin_users table in Supabase database.
  // Add admins with: INSERT INTO admin_users (email) VALUES ('email@example.com');

  // Validate reCAPTCHA configuration (optional but recommended)
  if (!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
    warnings.push(
      'NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set. Contact form reCAPTCHA will not work.'
    );
  }

  if (!process.env.RECAPTCHA_SECRET_KEY) {
    warnings.push(
      'RECAPTCHA_SECRET_KEY is not set. Contact form reCAPTCHA verification will not work.'
    );
  }

  // Check for placeholder values (common mistake)
  const placeholders = [
    'your-project-url',
    'your-anon-key',
    'your-admin-email',
    'your-recaptcha',
    'xxx',
    'example.com',
  ];

  Object.entries(process.env).forEach(([key, value]) => {
    if (value && placeholders.some((placeholder) => value.includes(placeholder))) {
      warnings.push(`${key} appears to contain a placeholder value. Please update with actual value.`);
    }
  });

  // Security check: Ensure we're not exposing secrets in public env vars
  if (process.env.RECAPTCHA_SECRET_KEY?.startsWith('NEXT_PUBLIC_')) {
    errors.push(
      'RECAPTCHA_SECRET_KEY should NOT be prefixed with NEXT_PUBLIC_ (it would be exposed to the client)'
    );
  }

  const valid = errors.length === 0;

  return { valid, errors, warnings };
}

/**
 * Validates environment and throws if invalid
 * Use this in app startup (e.g., in root layout or middleware)
 */
export function validateEnvOrThrow(): void {
  const result = validateEnv();

  // Log warnings
  if (result.warnings.length > 0) {
    console.warn('⚠️  Environment Variable Warnings:');
    result.warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }

  // Throw on errors
  if (!result.valid) {
    console.error('❌ Environment Variable Validation Failed:');
    result.errors.forEach((error) => console.error(`  - ${error}`));
    throw new Error(
      `Environment validation failed. Please check your .env.local file.\n\n${result.errors.join('\n')}`
    );
  }

  console.log('✅ Environment variables validated successfully');
}

/**
 * Safe environment variable getter with fallback
 * @param key Environment variable key
 * @param fallback Fallback value if not found
 * @returns Environment variable value or fallback
 */
export function getEnv(key: string, fallback?: string): string {
  const value = process.env[key];
  if (!value) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value;
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if we're in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Get sanitized environment info for logging (removes sensitive values)
 */
export function getSanitizedEnvInfo(): Record<string, string> {
  const sensitiveKeys = ['KEY', 'SECRET', 'PASSWORD', 'TOKEN'];

  const sanitized: Record<string, string> = {};

  Object.entries(process.env).forEach(([key, value]) => {
    if (!value) return;

    // Check if key contains sensitive words
    const isSensitive = sensitiveKeys.some((sensitive) =>
      key.toUpperCase().includes(sensitive)
    );

    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  });

  return sanitized;
}
