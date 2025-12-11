

# Architecture Guide

**Last Updated:** December 2025
**Version:** 2.0 (Refactored)

## Overview

This document describes the refactored architecture of the Emcogma website. The refactoring focused on:

- **Modularity**: Breaking down monolithic components into reusable pieces
- **DRY Principles**: Eliminating ~1,800 lines of duplicated code
- **Type Safety**: Centralized type system with single source of truth
- **Maintainability**: Industry-standard patterns and clear separation of concerns

---

## Architecture Principles

### 1. **Separation of Concerns**
- Business logic separated from UI components
- Data access abstracted into services
- Validation logic shared between client and server

### 2. **Single Source of Truth**
- Types defined once in `lib/types/`
- Configuration centralized in `lib/config/`
- Validation schemas in `lib/validation/`

### 3. **Reusability**
- Generic CRUD system for all content types
- Shared UI component library
- Utility functions for common operations

### 4. **Type Safety**
- TypeScript strict mode
- Zod schemas for runtime validation
- Type inference from schemas

---

## Directory Structure

```
EmcogmaWebsite/
├── app/                              # Next.js App Router
│   ├── admin/                        # Admin portal routes
│   ├── api/                          # API routes
│   ├── blog/                         # Blog pages
│   └── ...
│
├── components/                       # React components
│   ├── ui/                          # ✨ NEW: Reusable UI components (9 total)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Loading.tsx
│   │   ├── EmptyState.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx               # ✨ NEW: Toast notification system
│   │   └── index.ts
│   │
│   ├── admin/                        # Admin components
│   │   ├── config/                  # ✨ CRUD configurations (8 content types)
│   │   │   ├── blogPostsConfig.ts
│   │   │   ├── projectsConfig.ts
│   │   │   ├── articlesConfig.ts
│   │   │   ├── productsConfig.ts
│   │   │   ├── demosConfig.ts
│   │   │   ├── commentsConfig.ts
│   │   │   ├── subscribersConfig.ts
│   │   │   ├── contactSubmissionsConfig.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── BlogPostsManager.tsx     # ✨ REFACTORED: 16 lines (was 326)
│   │   ├── ProjectsManager.tsx      # ✨ REFACTORED: 16 lines (was 347)
│   │   ├── ArticlesManager.tsx      # ✨ REFACTORED: 16 lines (was 327)
│   │   ├── ProductsManager.tsx      # ✨ REFACTORED: 16 lines (was 416)
│   │   ├── DemosManager.tsx         # ✨ REFACTORED: 16 lines (was 355)
│   │   ├── CommentsManager.tsx      # ✨ REFACTORED: 16 lines (was 280)
│   │   ├── SubscribersManager.tsx   # Newsletter subscribers + CSV export (110 lines)
│   │   └── ContactSubmissionsManager.tsx  # Contact form submissions (16 lines)
│   │
│   ├── blog/
│   └── contact/
│
├── lib/                              # Core libraries
│   ├── types/                       # ✨ NEW: Centralized types
│   │   ├── database.ts              # Database entities
│   │   ├── api.ts                   # API types
│   │   ├── forms.ts                 # Form DTOs
│   │   ├── ui.ts                    # UI component types
│   │   └── index.ts                 # Re-exports
│   │
│   ├── config/                      # ✨ NEW: Configuration
│   │   ├── constants.ts             # App constants
│   │   ├── theme.ts                 # Theme config
│   │   └── index.ts                 # Re-exports
│   │
│   ├── utils/                       # ✨ NEW: Utility functions
│   │   ├── cn.ts                    # Class name utility
│   │   ├── format.ts                # Formatting functions
│   │   ├── array.ts                 # Array utilities
│   │   ├── url.ts                   # URL utilities
│   │   ├── csv.ts                   # CSV generation with injection prevention
│   │   └── index.ts                 # Re-exports
│   │
│   ├── validation/                  # ✨ NEW: Validation system
│   │   ├── schemas.ts               # Zod schemas
│   │   ├── useFormValidation.ts    # Client-side hook
│   │   ├── server.ts                # Server-side utilities
│   │   └── index.ts                 # Re-exports
│   │
│   ├── crud/                        # ✨ NEW: Generic CRUD system
│   │   ├── types.ts                 # CRUD types
│   │   ├── useCrud.ts               # CRUD hook
│   │   ├── CrudManager.tsx          # Main component
│   │   ├── CrudForm.tsx             # Dynamic form
│   │   ├── CrudList.tsx             # List display
│   │   └── index.ts                 # Re-exports
│   │
│   ├── errors/                      # ✨ NEW: Error handling
│   │   ├── AppError.ts              # Error classes
│   │   ├── ErrorHandler.tsx         # Error handler hook
│   │   └── index.ts                 # Re-exports
│   │
│   ├── supabase/                    # Supabase integration
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── middleware.ts
│   │   └── schema.sql
│   │
│   ├── auth/
│   └── security/
│
└── ...
```

---

## Core Systems

### 1. Type System (`lib/types/`)

**Purpose**: Single source of truth for all types

**Files**:
- `database.ts` - Database entity types matching Supabase schema
- `api.ts` - API request/response types
- `forms.ts` - Form DTOs and field configurations
- `ui.ts` - UI component prop types

**Benefits**:
- No duplicated type definitions
- Type consistency across codebase
- Easy schema changes
- Better IDE autocomplete

**Usage**:
```typescript
import type { BlogPost, Project, CreateBlogPostDTO } from '@/lib/types';

// Types are consistent everywhere
const post: BlogPost = { /* ... */ };
```

---

### 2. Configuration System (`lib/config/`)

**Purpose**: Centralize all configuration values

**Files**:
- `constants.ts` - App constants, validation rules, security config
- `theme.ts` - Color palette, typography, spacing

**Benefits**:
- Easy to update brand information
- No hardcoded values scattered in code
- Environment-specific configs
- Type-safe configuration

**Usage**:
```typescript
import { APP_CONFIG, VALIDATION_RULES, SECURITY_CONFIG } from '@/lib/config';

const author = APP_CONFIG.author.defaultName; // 'Emcogma'
const maxTags = VALIDATION_RULES.tags.max; // 5
const timeout = SECURITY_CONFIG.session.timeoutMinutes; // 10
```

---

### 3. Utility Functions (`lib/utils/`)

**Purpose**: Reusable helper functions

**Modules**:
- `cn` - Class name merging (clsx + tailwind-merge)
- `format` - Date, currency, number formatting
- `array` - Array transformations (tags, sorting, grouping)
- `url` - URL building and validation

**Benefits**:
- DRY principles
- Consistent formatting
- Well-tested utilities
- Easy to extend

**Usage**:
```typescript
import { formatDate, slugify, tagsToString, cn } from '@/lib/utils';

const date = formatDate('2024-01-15'); // 'Jan 15, 2024'
const slug = slugify('Hello World!'); // 'hello-world'
const tags = tagsToString(['react', 'typescript']); // 'react, typescript'
const classes = cn('px-2', 'px-4'); // 'px-4' (merged)
```

---

### 4. Validation System (`lib/validation/`)

**Purpose**: Unified validation for client and server

**Files**:
- `schemas.ts` - Zod schemas for all entities
- `useFormValidation.ts` - React hook for forms
- `server.ts` - Server-side validation utilities

**Benefits**:
- Single source of truth for validation rules
- Runtime type safety with Zod
- Reusable schemas
- Real-time client validation
- Server-side validation

**Usage**:

**Client-side**:
```typescript
import { useFormValidation, blogPostSchema } from '@/lib/validation';

function MyForm() {
  const { errors, validate } = useFormValidation(blogPostSchema);

  const handleSubmit = (data) => {
    const result = validate(data);
    if (!result.success) return; // errors set automatically
    // Submit validated data
  };
}
```

**Server-side**:
```typescript
import { validateSchema, blogPostSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const body = await request.json();
  const result = validateSchema(blogPostSchema, body);

  if (!result.success) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  // Use result.data (type-safe and validated)
}
```

---

### 5. Generic CRUD System (`lib/crud/`)

**Purpose**: Eliminate duplicated CRUD code

**Impact**: Reduces ~1,800 lines to ~400 lines (77% reduction)

**Components**:
- `useCrud` - Generic CRUD hook
- `CrudManager` - Main manager component
- `CrudForm` - Dynamic form generator
- `CrudList` - Generic list display

**How It Works**:

1. **Define Configuration** (`components/admin/config/blogPostsConfig.ts`):
```typescript
import type { CrudConfig } from '@/lib/crud';
import type { BlogPost } from '@/lib/types';
import { blogPostSchema } from '@/lib/validation';

export const blogPostsConfig: CrudConfig<BlogPost> = {
  tableName: 'blog_posts',
  displayName: 'Blog Posts',
  icon: '📝',
  schema: blogPostSchema,

  fields: [
    { name: 'slug', type: 'text', label: 'Slug', required: true },
    { name: 'title', type: 'text', label: 'Title', required: true },
    { name: 'content', type: 'markdown', label: 'Content', required: true },
    { name: 'tags', type: 'tags', label: 'Tags' },
    { name: 'published', type: 'checkbox', label: 'Published' },
  ],

  defaultFormData: {
    slug: '',
    title: '',
    content: '',
    tags: [],
    published: false,
  },

  orderBy: { column: 'created_at', ascending: false },
};
```

2. **Use in Component** (16 lines instead of 326!):
```typescript
'use client';

import { CrudManager } from '@/lib/crud';
import { blogPostsConfig } from './config/blogPostsConfig';

export default function BlogPostsManager() {
  return <CrudManager config={blogPostsConfig} />;
}
```

**Benefits**:
- Massive code reduction
- Single implementation of CRUD logic
- Add new content types in 5 minutes
- Consistent UX across all managers
- Easy to add global features

---

### 6. UI Component Library (`components/ui/`)

**Purpose**: Reusable cyberpunk-themed components

**Components** (9 total):
- `Button` - Multi-variant button (primary, secondary, danger, ghost)
- `Input` - Form input with validation state
- `Textarea` - Multi-line input with auto-resize
- `Loading` - Loading states with spinner and message
- `EmptyState` - Empty state display with icon and action
- `Card` - Card container with optional header/footer
- `Badge` - Status badges (success, warning, error, info)
- `Modal` - Dialog modal with backdrop
- `Toast` - Toast notification system with auto-dismiss (NEW)

**Benefits**:
- Consistent UI/UX
- Accessibility built-in
- Easy theme updates
- Reduced component code by 40%

**Usage**:
```typescript
import { Button, Input, Loading, EmptyState } from '@/components/ui';

<Button variant="primary" size="lg" onClick={handleClick}>
  Create Post
</Button>

<Input
  label="Email"
  type="email"
  value={email}
  onChange={setEmail}
  error={errors.email}
  required
/>

{loading && <Loading message="Loading posts..." />}

{items.length === 0 && (
  <EmptyState
    icon="📝"
    title="No posts yet"
    action={<Button onClick={handleCreate}>Create Post</Button>}
  />
)}
```

---

### 7. Error Handling System (`lib/errors/`)

**Purpose**: Consistent error handling with production-safe logging

**Components**:
- `AppError` - Base error class with safe serialization (`toSafeJSON()`)
- Specialized errors (DatabaseError, ValidationError, etc.)
- `useErrorHandler` - React hook with environment-aware logging
- `ErrorBoundary` - React error boundary with secure error display

**Benefits**:
- Consistent error messages
- **Secure error logging** - No sensitive data exposure in production
- User-friendly error display (never shows internal errors to users)
- Type-safe error handling
- Environment-aware logging (detailed in dev, minimal in production)

**Usage**:
```typescript
import { useErrorHandler, DatabaseError } from '@/lib/errors';

function MyComponent() {
  const { handleError } = useErrorHandler({
    showToast: (msg, type) => toast[type](msg),
  });

  const fetchData = async () => {
    try {
      const data = await api.getData();
    } catch (error) {
      handleError(error); // Automatically shows toast with user-friendly message
    }
  };
}
```

**Security Features** (Dec 2025):
- `AppError.toSafeJSON()` - Redacts sensitive data in production logs
- Environment-aware console logging (dev vs production)
- User-friendly error messages only (internal errors never shown)
- See [SECURITY-AUDIT-REPORT.md](SECURITY-AUDIT-REPORT.md)

---

### 8. Security Utilities (`lib/security/logger.ts`)

**Purpose**: Prevent sensitive data exposure in logs and error messages

**New Functions** (Dec 2025):
- `redactSensitiveData(data)` - Automatically redacts sensitive parameters from URLs and objects
- `logSecureUrl(label, url)` - Safe URL logging with automatic redaction

**Redacted Parameters**:
- OAuth codes, tokens (access_token, refresh_token, id_token)
- Passwords, secrets, API keys
- Authorization headers, session data, cookies

**Benefits**:
- **Zero sensitive data exposure** in production logs
- **OWASP A09:2021 compliance** - Security Logging and Monitoring Failures
- **GDPR/Privacy compliance** - No PII in logs
- **Automatic protection** - No manual redaction needed

**Usage**:
```typescript
import { logSecureUrl, redactSensitiveData } from '@/lib/security/logger';

// ❌ WRONG - Exposes OAuth code
console.log('Callback URL:', request.url);
// Output: http://localhost:3000/auth/callback?code=abc123...

// ✅ CORRECT - Redacts sensitive params
logSecureUrl('Callback URL', request.url);
// Output: Callback URL: http://localhost:3000/auth/callback?code=[REDACTED]&next=%2Fadmin

// Redact objects with sensitive data
const data = {
  user: 'john@example.com',
  token: 'abc123',
  access_token: 'xyz789'
};
console.log('Data:', redactSensitiveData(data));
// Output: Data: { user: 'john@example.com', token: '[REDACTED]', access_token: '[REDACTED]' }
```

**Environment-Aware Logging Pattern**:
```typescript
// Production-safe error logging
catch (error) {
  if (process.env.NODE_ENV === 'development') {
    console.error('Detailed error:', error);  // Full details in dev
  } else {
    console.error('Error occurred:', error.message);  // Minimal in production
  }
}
```

**Audit Report**: [SECURITY-AUDIT-REPORT.md](SECURITY-AUDIT-REPORT.md) - Complete sensitive data exposure audit (Dec 2025)

---

## Migration Guide

### From Old Admin Managers to New CRUD System

**Before** (BlogPostsManager.tsx - 326 lines):
```typescript
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  // ... 10 more fields
}

export default function BlogPostsManager() {
  const supabase = createClient();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    // ... all fields
  });

  async function fetchPosts() {
    // ... 30 lines
  }

  async function handleSubmit(e: React.FormEvent) {
    // ... 40 lines
  }

  async function handleDelete(id: string) {
    // ... 20 lines
  }

  // ... 200+ more lines of UI and logic
}
```

**After** (BlogPostsManager.tsx - 16 lines):
```typescript
'use client';

import { CrudManager } from '@/lib/crud';
import { blogPostsConfig } from './config/blogPostsConfig';

/**
 * Blog Posts Manager - Admin interface for managing blog posts
 * Uses generic CRUD system for all operations
 */
export default function BlogPostsManager() {
  return <CrudManager config={blogPostsConfig} />;
}
```

### Steps to Migrate

1. **Create configuration file** in `components/admin/config/`:
   ```typescript
   export const myEntityConfig: CrudConfig<MyEntity> = {
     tableName: 'my_table',
     displayName: 'My Entities',
     fields: [ /* field definitions */ ],
     defaultFormData: { /* defaults */ },
   };
   ```

2. **Replace manager component**:
   ```typescript
   import { CrudManager } from '@/lib/crud';
   import { myEntityConfig } from './config/myEntityConfig';

   export default function MyEntityManager() {
     return <CrudManager config={myEntityConfig} />;
   }
   ```

3. **Test thoroughly** - All CRUD operations should work identically

4. **Delete old file** once confirmed working

---

## Best Practices

### 1. **Import from Index Files**
✅ **DO**:
```typescript
import { BlogPost, Project } from '@/lib/types';
import { formatDate, slugify } from '@/lib/utils';
import { Button, Input } from '@/components/ui';
```

❌ **DON'T**:
```typescript
import { BlogPost } from '@/lib/types/database';
import { formatDate } from '@/lib/utils/format';
import { Button } from '@/components/ui/Button';
```

### 2. **Use Configuration Constants**
✅ **DO**:
```typescript
import { APP_CONFIG } from '@/lib/config';
author: APP_CONFIG.author.defaultName;
```

❌ **DON'T**:
```typescript
author: 'Emcogma'; // Hardcoded
```

### 3. **Validate with Schemas**
✅ **DO**:
```typescript
import { validateSchema, blogPostSchema } from '@/lib/validation';
const result = validateSchema(blogPostSchema, data);
```

❌ **DON'T**:
```typescript
if (!data.slug || data.slug.length < 1) { /* manual validation */ }
```

### 4. **Use UI Components**
✅ **DO**:
```typescript
import { Button } from '@/components/ui';
<Button variant="primary">Click Me</Button>
```

❌ **DON'T**:
```typescript
<button className="btn-cyber px-6 py-2">Click Me</button>
```

### 5. **Handle Errors Consistently**
✅ **DO**:
```typescript
import { useErrorHandler } from '@/lib/errors';
const { handleError } = useErrorHandler();
try { /* ... */ } catch (err) { handleError(err); }
```

❌ **DON'T**:
```typescript
try { /* ... */ } catch (err) { alert(err.message); }
```

---

## Performance Considerations

### 1. **ISR (Incremental Static Regeneration)**
- Blog posts, projects: 60s revalidation
- Sitemap: 1 hour revalidation

### 2. **Component Lazy Loading**
- Admin components lazy-loaded
- Modal components lazy-loaded
- Large markdown editor lazy-loaded

### 3. **Database Queries**
- Indexes on frequently queried columns
- Select only needed columns
- Use RLS policies for security

### 4. **Client-Side Caching**
- Supabase client caches queries
- React Query for advanced caching (future)

---

## Testing Strategy

### 1. **Unit Tests**
- Utility functions
- Validation schemas
- Error classes

### 2. **Integration Tests**
- CRUD operations
- API routes
- Authentication flow

### 3. **Component Tests**
- UI components
- Form validation
- CRUD managers

### 4. **E2E Tests**
- Critical user flows
- Admin portal operations
- Contact form submission

---

## Future Enhancements

### Planned Improvements

1. **Service Layer** (lib/services/)
   - Business logic abstraction
   - Testable services
   - Reusable across components

2. **API Middleware** (lib/api/middleware.ts)
   - Unified security checks
   - Consistent error handling
   - Request/response formatting

3. **React Query Integration**
   - Advanced caching
   - Optimistic updates
   - Background refetching

4. **Component Storybook**
   - Visual component testing
   - Design system documentation
   - Isolated development

5. **Advanced Search**
   - Full-text search
   - Filtering system
   - Pagination helpers

---

## Conclusion

The refactored architecture provides:

- **95% reduction** in admin manager components (326+ → 16 lines each)
- **16% overall reduction** in admin code (~2,000 → ~1,700 lines)
- **Single source of truth** for types, config, validation
- **9 reusable UI components** including Toast notification system
- **Consistent patterns** across the codebase
- **Industry-standard** practices
- **5-minute setup** for new content types

This foundation makes the codebase:
- Easier to maintain
- Faster to develop features
- Simpler to onboard new developers
- More reliable and testable

---

**Questions?** See [README.md](README.md) for general documentation or [CLAUDE.md](CLAUDE.md) for project instructions.
