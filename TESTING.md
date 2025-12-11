# Testing Guide

Complete unit testing setup for the EMCOGMA Website using Vitest and React Testing Library.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Coverage](#test-coverage)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

This project uses:

- **Vitest** - Fast unit test framework built on Vite
- **React Testing Library** - Testing utilities for React components
- **@testing-library/user-event** - User interaction simulation
- **@testing-library/jest-dom** - Custom Jest matchers for DOM assertions
- **happy-dom** - Lightweight DOM implementation for tests

## Quick Start

### Install Dependencies

```bash
npm install
```

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (default)
npm test

# Run tests once (CI mode)
npm test -- --run

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Test Structure

Tests are co-located with source files using the `__tests__` directory pattern:

```
lib/
├── utils/
│   ├── cn.ts
│   ├── format.ts
│   ├── array.ts
│   ├── csv.ts
│   └── __tests__/
│       ├── cn.test.ts
│       ├── format.test.ts
│       ├── array.test.ts
│       └── csv.test.ts
├── validation/
│   ├── schemas.ts
│   └── __tests__/
│       └── schemas.test.ts
├── errors/
│   ├── AppError.ts
│   └── __tests__/
│       └── AppError.test.ts
components/
├── ui/
│   ├── Button.tsx
│   ├── Badge.tsx
│   └── __tests__/
│       ├── Button.test.tsx
│       └── Badge.test.tsx
```

## Running Tests

### Basic Commands

```bash
# Run all tests (watch mode)
npm test

# Run tests once
npm test -- --run

# Run specific test file
npm test -- lib/utils/__tests__/format.test.ts

# Run tests matching pattern
npm test -- --grep "formatDate"

# Run tests in specific directory
npm test -- lib/utils

# Run with coverage
npm run test:coverage
```

### UI Mode

Vitest UI provides a visual interface for running tests:

```bash
npm run test:ui
```

This opens a browser interface at `http://localhost:51204` where you can:
- View test results in real-time
- Filter and search tests
- See detailed error messages
- View code coverage

### Watch Mode Options

When running `npm test`, Vitest watches for file changes and automatically re-runs affected tests.

Press `h` in the terminal to see all watch mode options:
- `a` - Run all tests
- `f` - Run only failed tests
- `p` - Filter by filename
- `t` - Filter by test name
- `q` - Quit watch mode

## Writing Tests

### Utility Function Tests

Example from `lib/utils/__tests__/format.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { formatDate, formatCurrency } from '../format'

describe('formatDate', () => {
  it('should format date in short format', () => {
    const date = new Date('2024-01-15')
    expect(formatDate(date, 'short')).toMatch(/Jan 15, 2024/)
  })

  it('should handle relative format', () => {
    const now = new Date()
    expect(formatDate(now, 'relative')).toBe('just now')
  })
})
```

### React Component Tests

Example from `components/ui/__tests__/Button.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../Button'

describe('Button', () => {
  it('should render children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('should handle click events', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Validation Schema Tests

Example from `lib/validation/__tests__/schemas.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { blogPostSchema } from '../schemas'

describe('blogPostSchema', () => {
  it('should validate a correct blog post', () => {
    const validPost = {
      slug: 'my-post',
      title: 'My Post',
      excerpt: 'This is an excerpt',
      content: 'Full content here',
      author: 'John Doe',
      tags: ['typescript'],
    }

    const result = blogPostSchema.safeParse(validPost)
    expect(result.success).toBe(true)
  })

  it('should reject invalid slug format', () => {
    const invalidPost = { /* ... */ slug: 'Invalid Slug!' }
    const result = blogPostSchema.safeParse(invalidPost)
    expect(result.success).toBe(false)
  })
})
```

### Error Handling Tests

Example from `lib/errors/__tests__/AppError.test.ts`:

```typescript
import { describe, it, expect, afterEach } from 'vitest'
import { AppError, ValidationError } from '../AppError'

describe('AppError', () => {
  it('should create error with all properties', () => {
    const error = new AppError('Error', 'TEST_ERROR', 500)
    expect(error.code).toBe('TEST_ERROR')
    expect(error.statusCode).toBe(500)
  })

  it('should redact details in production', () => {
    process.env.NODE_ENV = 'production'
    const error = new AppError('Error', 'TEST', 500, 'User message', { secret: 'data' })
    const safe = error.toSafeJSON()
    expect(safe.details).toBe('[REDACTED]')
  })
})
```

## Test Coverage

### Viewing Coverage

Generate HTML coverage report:

```bash
npm run test:coverage
```

Coverage reports are saved to:
- `coverage/index.html` - Open in browser for visual report
- `coverage/coverage-final.json` - Raw coverage data

### Coverage Configuration

Coverage is configured in `vitest.config.ts`:

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  exclude: [
    'node_modules/',
    '.next/',
    'coverage/',
    '**/*.config.*',
    '**/types.ts',
    '**/index.ts',
  ],
}
```

### Coverage Thresholds

Aim for:
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

## Best Practices

### 1. Test Naming

Use descriptive test names that explain what is being tested:

```typescript
// ✅ Good
it('should format date in short format')
it('should reject invalid email formats')

// ❌ Bad
it('works')
it('test1')
```

### 2. AAA Pattern

Structure tests using Arrange-Act-Assert:

```typescript
it('should calculate total price', () => {
  // Arrange
  const items = [{ price: 10 }, { price: 20 }]

  // Act
  const total = calculateTotal(items)

  // Assert
  expect(total).toBe(30)
})
```

### 3. Test One Thing

Each test should verify a single behavior:

```typescript
// ✅ Good - One assertion per test
it('should validate email format', () => {
  expect(isValidEmail('test@example.com')).toBe(true)
})

it('should reject invalid email', () => {
  expect(isValidEmail('invalid')).toBe(false)
})

// ❌ Bad - Multiple unrelated assertions
it('should validate inputs', () => {
  expect(isValidEmail('test@example.com')).toBe(true)
  expect(isValidUrl('https://example.com')).toBe(true)
  expect(formatDate(new Date())).toBeTruthy()
})
```

### 4. Use Mocks Sparingly

Only mock external dependencies and APIs:

```typescript
// ✅ Good - Mock external API
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => mockClient)
}))

// ❌ Bad - Don't mock internal utilities
// Just import and use them directly
```

### 5. Avoid Implementation Details

Test behavior, not implementation:

```typescript
// ✅ Good - Test user behavior
it('should show error message on submit', async () => {
  render(<ContactForm />)
  await user.click(screen.getByRole('button', { name: /submit/i }))
  expect(screen.getByText(/required/i)).toBeInTheDocument()
})

// ❌ Bad - Test implementation
it('should set error state', () => {
  const { container } = render(<ContactForm />)
  const component = container.querySelector('.form')
  expect(component.state.error).toBe(true)
})
```

### 6. Use Fake Timers for Time-Based Logic

```typescript
import { describe, it, beforeEach, afterEach, vi } from 'vitest'

describe('Time-based function', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should format relative time', () => {
    vi.setSystemTime(new Date('2024-01-15T12:00:00'))
    const date = new Date('2024-01-15T11:00:00')
    expect(formatRelativeTime(date)).toBe('1 hour ago')
  })
})
```

## Troubleshooting

### Tests Not Running

1. Check Node.js version (requires 18+):
   ```bash
   node --version
   ```

2. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Module Resolution Errors

If you see errors like `Cannot find module '@/lib/utils'`:

1. Check `vitest.config.ts` has correct path aliases
2. Ensure `tsconfig.json` paths match Vitest config

### React Testing Issues

If React components don't render:

1. Verify `@vitejs/plugin-react` is installed
2. Check `vitest.setup.ts` imports `@testing-library/react`
3. Ensure `happy-dom` is set as the test environment

### Coverage Not Generated

Run with verbose output to see errors:

```bash
npm run test:coverage -- --reporter=verbose
```

### Watch Mode Not Working

Force exit and restart:

```bash
# Press Ctrl+C twice to force quit
npm test
```

## CI/CD Integration

Add to GitHub Actions workflow:

```yaml
- name: Run tests
  run: npm test -- --run

- name: Generate coverage
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
```

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Vitest UI](https://vitest.dev/guide/ui.html)

## Test Statistics

Current test coverage:

- **Utility Functions**: 100% (cn, format, array, csv)
- **Validation Schemas**: 100% (all Zod schemas)
- **Error Classes**: 100% (AppError and subclasses)
- **UI Components**: Partial (Button, Badge)

**Total Tests**: 100+
**Test Files**: 7
**Assertions**: 200+

---

For questions or issues with testing, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md) or open an issue on GitHub.
