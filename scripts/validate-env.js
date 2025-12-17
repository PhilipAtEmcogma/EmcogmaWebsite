/**
 * Environment Variable Validation Script
 * Validates that all required environment variables are set and valid
 * Run: node scripts/validate-env.js
 */

const requiredEnv = {
  production: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'RECAPTCHA_SECRET_KEY',
    'NEXT_PUBLIC_RECAPTCHA_SITE_KEY',
    'KV_REST_API_URL',
    'KV_REST_API_TOKEN',
    'KV_REST_API_READ_ONLY_TOKEN',
    'RESEND_API_KEY',
    'FROM_EMAIL',
    'UNSUBSCRIBE_TOKEN_SECRET',
    'NEXT_PUBLIC_SITE_URL',
    'FORMSPREE_ENDPOINT',
  ],
  preview: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'RECAPTCHA_SECRET_KEY',
    'NEXT_PUBLIC_RECAPTCHA_SITE_KEY',
  ],
  development: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ],
};

const optionalEnv = [
  'SESSION_TIMEOUT_MINUTES',
  'NEXT_PUBLIC_CSP_NONCE_ENABLED',
  'NEXT_PUBLIC_SENTRY_DSN',
  'SLACK_SECURITY_WEBHOOK',
];

// Validation rules for specific env vars
const validationRules = {
  NEXT_PUBLIC_SUPABASE_URL: {
    pattern: /^https:\/\/[a-z0-9-]+\.supabase\.co$/,
    message: 'Must be a valid Supabase URL (https://xxx.supabase.co)',
  },
  NEXT_PUBLIC_SITE_URL: {
    pattern: /^https?:\/\/.+$/,
    message: 'Must be a valid URL with protocol',
  },
  FROM_EMAIL: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Must be a valid email address',
  },
  UNSUBSCRIBE_TOKEN_SECRET: {
    minLength: 32,
    message: 'Must be at least 32 characters for security',
  },
};

function validateEnvVar(key, value) {
  const rule = validationRules[key];
  if (!rule) return { valid: true };

  // Check pattern
  if (rule.pattern && !rule.pattern.test(value)) {
    return { valid: false, reason: rule.message };
  }

  // Check minimum length
  if (rule.minLength && value.length < rule.minLength) {
    return { valid: false, reason: rule.message };
  }

  return { valid: true };
}

function validateSecretStrength(secret, minLength = 32) {
  if (secret.length < minLength) {
    return { valid: false, reason: `Too short (min ${minLength} chars)` };
  }

  // Check entropy (should be random, not predictable)
  const uniqueChars = new Set(secret).size;
  if (uniqueChars < 16) {
    return { valid: false, reason: 'Low entropy (not random enough)' };
  }

  // Check for common patterns
  const patterns = [
    { regex: /^(.)\1+$/, desc: 'All same character' },
    { regex: /^(012|123|234|345|456|567|678|789|890|abc|bcd|cde)+$/i, desc: 'Sequential pattern' },
    { regex: /password|secret|admin|test/i, desc: 'Common words' },
  ];

  for (const { regex, desc } of patterns) {
    if (regex.test(secret)) {
      return { valid: false, reason: `Contains ${desc}` };
    }
  }

  return { valid: true };
}

function main() {
  const env = process.env.VERCEL_ENV || process.env.NODE_ENV || 'development';
  const required = requiredEnv[env] || requiredEnv.development;

  console.log('\n🔐 Environment Variable Validation');
  console.log('=====================================');
  console.log(`Environment: ${env}`);
  console.log(`Checking ${required.length} required variables\n`);

  let missing = [];
  let invalid = [];
  let warnings = [];

  // Check required variables
  for (const key of required) {
    const value = process.env[key];

    if (!value) {
      missing.push(key);
      console.error(`❌ MISSING: ${key}`);
    } else {
      // Validate format
      const validation = validateEnvVar(key, value);

      if (!validation.valid) {
        invalid.push({ key, reason: validation.reason });
        console.error(`❌ INVALID: ${key} - ${validation.reason}`);
      } else {
        // Additional strength check for secrets
        if (key.includes('SECRET') || key.includes('KEY')) {
          const strength = validateSecretStrength(value);
          if (!strength.valid) {
            warnings.push({ key, reason: strength.reason });
            console.warn(`⚠️  WEAK: ${key} - ${strength.reason}`);
          } else {
            console.log(`✅ VALID: ${key}`);
          }
        } else {
          console.log(`✅ VALID: ${key}`);
        }
      }
    }
  }

  // Check optional variables
  console.log(`\n📝 Optional Variables (${optionalEnv.length})`);
  for (const key of optionalEnv) {
    if (process.env[key]) {
      console.log(`✅ SET: ${key}`);
    } else {
      console.log(`ℹ️  NOT SET: ${key} (optional)`);
    }
  }

  // Summary
  console.log('\n=====================================');
  console.log('📊 Validation Summary');
  console.log('=====================================');

  if (missing.length === 0 && invalid.length === 0 && warnings.length === 0) {
    console.log('✅ All required variables are valid');
    console.log(`✅ ${required.length} required variables checked`);
    process.exit(0);
  }

  if (missing.length > 0) {
    console.error(`\n❌ ${missing.length} required variable(s) missing:`);
    missing.forEach((key) => console.error(`   - ${key}`));
  }

  if (invalid.length > 0) {
    console.error(`\n❌ ${invalid.length} variable(s) have invalid format:`);
    invalid.forEach(({ key, reason }) => console.error(`   - ${key}: ${reason}`));
  }

  if (warnings.length > 0) {
    console.warn(`\n⚠️  ${warnings.length} variable(s) have weak security:`);
    warnings.forEach(({ key, reason }) => console.warn(`   - ${key}: ${reason}`));
  }

  // Recommendations
  console.log('\n📚 Recommendations:');
  console.log('=====================================');

  if (missing.length > 0) {
    console.log('\n1. Set missing variables:');
    console.log('   For local development: Add to .env.local');
    console.log('   For production: Use Vercel Dashboard → Environment Variables');
  }

  if (invalid.length > 0) {
    console.log('\n2. Fix invalid variables:');
    console.log('   Check format requirements in .env.example');
    console.log('   Verify URLs include protocol (https://)');
    console.log('   Ensure email addresses are valid');
  }

  if (warnings.length > 0) {
    console.log('\n3. Strengthen weak secrets:');
    console.log('   Generate strong secrets with:');
    console.log('   node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  }

  console.log('\n📖 Documentation:');
  console.log('   Setup guide: README.md');
  console.log('   Rotation policy: .vercel/SECRETS-ROTATION-POLICY.md');
  console.log('   Environment examples: .env.example\n');

  // Exit with error if critical issues found
  if (missing.length > 0 || invalid.length > 0) {
    process.exit(1);
  }

  // Exit with warning code if only warnings
  if (warnings.length > 0) {
    console.warn('⚠️  Validation passed with warnings\n');
    process.exit(0); // Don't fail build for warnings
  }

  process.exit(0);
}

// Run validation
try {
  main();
} catch (error) {
  console.error('\n❌ Validation script error:', error.message);
  process.exit(1);
}
