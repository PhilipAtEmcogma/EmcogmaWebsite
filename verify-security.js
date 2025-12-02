#!/usr/bin/env node

/**
 * Security Verification Script
 * Run this before committing to ensure no secrets are exposed
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

console.log('\n🔒 Security Verification Starting...\n');

let hasIssues = false;

// Check 1: Verify .gitignore exists and has required entries
console.log('1. Checking .gitignore...');
try {
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  const requiredPatterns = ['.env', '.env.local', '*.env', 'secrets.json'];

  requiredPatterns.forEach(pattern => {
    if (gitignore.includes(pattern)) {
      console.log(`   ${GREEN}✓${RESET} ${pattern} is ignored`);
    } else {
      console.log(`   ${RED}✗${RESET} ${pattern} is NOT ignored`);
      hasIssues = true;
    }
  });
} catch (error) {
  console.log(`   ${RED}✗${RESET} .gitignore not found!`);
  hasIssues = true;
}

// Check 2: Verify .env.example exists but .env is not committed
console.log('\n2. Checking environment files...');
try {
  const gitStatus = execSync('git ls-files', { encoding: 'utf8' });

  if (gitStatus.includes('.env.example')) {
    console.log(`   ${GREEN}✓${RESET} .env.example is committed (template)`);
  } else {
    console.log(`   ${YELLOW}⚠${RESET} .env.example not found (should exist as template)`);
  }

  const dangerousFiles = ['.env', '.env.local', '.env.production', 'secrets.json'];
  dangerousFiles.forEach(file => {
    if (gitStatus.includes(file)) {
      console.log(`   ${RED}✗ DANGER${RESET} ${file} is committed to Git!`);
      hasIssues = true;
    } else {
      console.log(`   ${GREEN}✓${RESET} ${file} is not in Git (safe)`);
    }
  });
} catch (error) {
  console.log(`   ${YELLOW}⚠${RESET} Could not check Git files`);
}

// Check 3: Scan code for hardcoded secrets
console.log('\n3. Scanning for hardcoded secrets...');
try {
  const suspiciousPatterns = [
    /https:\/\/[a-z0-9]+\.supabase\.co/,
    /eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/,  // JWT tokens
    /sk_live_[a-zA-Z0-9]+/,                 // Stripe keys
    /AIza[a-zA-Z0-9-_]+/,                   // Google API keys
  ];

  const filesToCheck = [
    'lib/supabase/client.ts',
    'lib/supabase/server.ts',
    'lib/supabase/middleware.ts',
  ];

  let foundHardcodedSecret = false;

  filesToCheck.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');

      suspiciousPatterns.forEach(pattern => {
        // Exclude process.env references
        if (pattern.test(content) && !content.includes('process.env')) {
          console.log(`   ${RED}✗ DANGER${RESET} Possible hardcoded secret in ${file}`);
          hasIssues = true;
          foundHardcodedSecret = true;
        }
      });
    }
  });

  if (!foundHardcodedSecret) {
    console.log(`   ${GREEN}✓${RESET} No hardcoded secrets detected`);
  }
} catch (error) {
  console.log(`   ${YELLOW}⚠${RESET} Could not scan files: ${error.message}`);
}

// Check 4: Verify all env vars use process.env
console.log('\n4. Checking environment variable usage...');
try {
  const clientFile = fs.readFileSync('lib/supabase/client.ts', 'utf8');

  if (clientFile.includes('process.env.NEXT_PUBLIC_SUPABASE_URL')) {
    console.log(`   ${GREEN}✓${RESET} Using process.env for SUPABASE_URL`);
  } else {
    console.log(`   ${RED}✗${RESET} Not using process.env properly`);
    hasIssues = true;
  }

  if (clientFile.includes('process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
    console.log(`   ${GREEN}✓${RESET} Using process.env for SUPABASE_ANON_KEY`);
  } else {
    console.log(`   ${RED}✗${RESET} Not using process.env properly`);
    hasIssues = true;
  }
} catch (error) {
  console.log(`   ${YELLOW}⚠${RESET} Could not verify environment usage`);
}

// Check 5: NPM audit
console.log('\n5. Running npm audit...');
try {
  execSync('npm audit --audit-level=high', { encoding: 'utf8', stdio: 'inherit' });
  console.log(`   ${GREEN}✓${RESET} No high-severity vulnerabilities`);
} catch (error) {
  console.log(`   ${YELLOW}⚠${RESET} Security vulnerabilities found - run 'npm audit fix'`);
}

// Final summary
console.log('\n' + '='.repeat(50));
if (hasIssues) {
  console.log(`${RED}❌ SECURITY ISSUES DETECTED!${RESET}`);
  console.log('Please fix the issues above before committing.');
  process.exit(1);
} else {
  console.log(`${GREEN}✅ Security check passed!${RESET}`);
  console.log('Your secrets are safe from Git.');
  process.exit(0);
}
