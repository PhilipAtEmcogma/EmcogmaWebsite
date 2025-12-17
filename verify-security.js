#!/usr/bin/env node

/**
 * Pre-commit security verification script
 * Checks for common security issues before allowing commits
 */

const fs = require('fs');
const path = require('path');

const errors = [];
const warnings = [];

// 1. Check for hardcoded secrets in code
console.log('[*] Checking for hardcoded secrets...');
const dangerousPatterns = [
  // Original patterns
  { pattern: /SUPABASE_URL\s*=\s*['"]https?:\/\/[a-z0-9-]+\.supabase\.co/i, desc: 'Hardcoded Supabase URL' },
  { pattern: /ANON_KEY\s*=\s*['"]eyJ[A-Za-z0-9_-]{20,}/i, desc: 'Hardcoded Supabase anon key' },
  { pattern: /SECRET_KEY\s*=\s*['"][^'"]{20,}/i, desc: 'Hardcoded secret key' },
  { pattern: /api[_-]?key\s*=\s*['"][^'"]{20,}/i, desc: 'Hardcoded API key' },
  { pattern: /password\s*=\s*['"][^'"]+/i, desc: 'Hardcoded password' },
  { pattern: /formspree\.io\/f\/[a-z0-9]+/i, desc: 'Hardcoded Formspree endpoint' },

  // AWS credentials
  { pattern: /AKIA[0-9A-Z]{16}/i, desc: 'AWS Access Key ID' },
  { pattern: /aws[_-]?secret[_-]?access[_-]?key\s*=\s*['"][^'"]{20,}/i, desc: 'AWS Secret Access Key' },

  // Private keys
  { pattern: /-----BEGIN (RSA|DSA|EC|OPENSSH|PGP) PRIVATE KEY-----/i, desc: 'Private key' },
  { pattern: /-----BEGIN PRIVATE KEY-----/i, desc: 'Private key' },

  // JWT tokens
  { pattern: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/i, desc: 'JWT token' },

  // Database connection strings
  { pattern: /postgres:\/\/[^:]+:[^@]+@[^\/]+\/[^\s'"]+/i, desc: 'PostgreSQL connection string' },
  { pattern: /mongodb(\+srv)?:\/\/[^:]+:[^@]+@[^\/]+/i, desc: 'MongoDB connection string' },
  { pattern: /mysql:\/\/[^:]+:[^@]+@[^\/]+/i, desc: 'MySQL connection string' },

  // Generic tokens
  { pattern: /token\s*=\s*['"][a-zA-Z0-9_-]{20,}/i, desc: 'Generic token' },
  { pattern: /bearer\s+[a-zA-Z0-9_-]{20,}/i, desc: 'Bearer token' },

  // OAuth secrets
  { pattern: /client[_-]?secret\s*=\s*['"][^'"]{20,}/i, desc: 'OAuth client secret' },

  // Slack tokens
  { pattern: /xox[baprs]-[0-9a-zA-Z-]{10,}/i, desc: 'Slack token' },

  // GitHub tokens
  { pattern: /gh[pousr]_[0-9a-zA-Z]{36}/i, desc: 'GitHub token' },

  // Stripe keys
  { pattern: /(sk|pk)_(test|live)_[0-9a-zA-Z]{24,}/i, desc: 'Stripe API key' },
];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Exclude known safe files
    const safeFiles = [
      '.env.example',
      'verify-security.js', // This file contains patterns for detection
      '.github/workflows/', // Workflow files use test/placeholder keys
    ];

    const isSafeFile = safeFiles.some(safe => filePath.includes(safe));

    dangerousPatterns.forEach((item) => {
      if (item.pattern.test(content)) {
        // Skip if it's a safe file or contains known test values
        if (isSafeFile) {
          return;
        }

        // Check for Google's official test reCAPTCHA keys (used in CI/CD)
        if (content.includes('6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI') ||
            content.includes('6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe')) {
          return; // Skip Google's test keys
        }

        // Check for placeholder/example values
        if (content.includes('example.com') ||
            content.includes('example_') ||
            content.includes('your-') ||
            content.includes('YOUR_') ||
            content.includes('xxx')) {
          return; // Skip obvious placeholders
        }

        errors.push(`${item.desc} found in ${filePath}`);
      }
    });
  } catch (err) {
    // Ignore files that can't be read
  }
}

function scanDirectory(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      let stat;
      try {
        stat = fs.statSync(filePath);
      } catch {
        return; // Skip if stat fails
      }

      if (stat.isDirectory() && !['node_modules', '.next', '.git', 'dist', 'build'].includes(file)) {
        scanDirectory(filePath, extensions);
      } else if (stat.isFile() && extensions.some(ext => file.endsWith(ext))) {
        scanFile(filePath);
      }
    });
  } catch (err) {
    // Ignore directories that can't be read
  }
}

// Scan source files
const srcDirs = ['app', 'components', 'lib'];
srcDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    scanDirectory(dir);
  }
});

// 2. Check .gitignore configuration
console.log('[*] Checking .gitignore...');
try {
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  const requiredPatterns = [
    '.env',
    '.env*.local',
    'secrets.json',
    '*.key',
    '*.pem',
  ];

  requiredPatterns.forEach(pattern => {
    if (!gitignore.includes(pattern)) {
      errors.push(`.gitignore missing pattern: ${pattern}`);
    }
  });
} catch (err) {
  errors.push('.gitignore file not found');
}

// 3. Check for security TODOs in code
console.log('[*] Checking for security TODOs...');
function checkTodos(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const todoPattern = /\/\/\s*TODO.*security|\/\/\s*FIXME.*security|\/\/\s*XXX.*security|WARNING.*production/gi;
    const matches = content.match(todoPattern);
    if (matches) {
      warnings.push(`${filePath} has ${matches.length} security TODO(s)`);
    }
  } catch {
    // Ignore files that can't be read
  }
}

srcDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    function scanForTodos(directory) {
      try {
        const files = fs.readdirSync(directory);
        files.forEach(file => {
          const filePath = path.join(directory, file);
          let stat;
          try {
            stat = fs.statSync(filePath);
          } catch {
            return;
          }

          if (stat.isDirectory() && !['node_modules', '.next', '.git'].includes(file)) {
            scanForTodos(filePath);
          } else if (stat.isFile() && ['.ts', '.tsx', '.js', '.jsx'].some(ext => file.endsWith(ext))) {
            checkTodos(filePath);
          }
        });
      } catch {
        // Ignore
      }
    }
    scanForTodos(dir);
  }
});

// 4. Check security dependencies
console.log('[*] Checking security dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['isomorphic-dompurify'];

  requiredDeps.forEach(dep => {
    if (!packageJson.dependencies[dep]) {
      errors.push(`Missing security dependency: ${dep}`);
    }
  });

  // Check for known vulnerable packages (basic check)
  const vulnerablePackages = ['lodash', 'request', 'moment']; // Example old packages
  vulnerablePackages.forEach(pkg => {
    if (packageJson.dependencies[pkg] || packageJson.devDependencies?.[pkg]) {
      warnings.push(`Potentially outdated package detected: ${pkg} (consider alternatives)`);
    }
  });
} catch (err) {
  errors.push('package.json not found or invalid');
}

// 5. Check for .env files in git
console.log('[*] Checking for committed .env files...');
try {
  const { execSync } = require('child_process');
  const gitFiles = execSync('git ls-files', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] })
    .split('\n');

  // Exclude .env.example, .env.local.example, and other example files
  const envFiles = gitFiles.filter(f => {
    const filename = f.split('/').pop() || f;
    return (
      filename.startsWith('.env') &&
      !filename.endsWith('.example') &&
      filename !== '.env.local.example' &&
      filename !== '.env.example'
    );
  });
  if (envFiles.length > 0) {
    errors.push(`Found .env files in git: ${envFiles.join(', ')}`);
  }
} catch {
  // Git not available or not a git repo, skip this check
  warnings.push('Git check skipped (not a git repository or git not available)');
}

// 6. Report results
console.log('\n' + '='.repeat(60));
if (errors.length > 0) {
  console.log('[X] SECURITY ERRORS:');
  errors.forEach(err => console.log(`  - ${err}`));
  console.log('\n[!] Commit blocked due to security errors!');
  console.log('='.repeat(60) + '\n');
  process.exit(1);
}

if (warnings.length > 0) {
  console.log('[!] SECURITY WARNINGS:');
  warnings.forEach(warn => console.log(`  - ${warn}`));
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('[+] Security checks passed!');
}

console.log('='.repeat(60) + '\n');
process.exit(0);
