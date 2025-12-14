import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { isActiveAdmin, authorizeAdminRoute } from '../authorization';
import type { User } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Mock Supabase client factory
const createMockSupabase = (options: {
  adminData?: { active: boolean } | null;
  adminError?: unknown;
} = {}) => {
  const { adminData = { active: true }, adminError = null } = options;

  return {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: adminData, error: adminError }),
      })),
    })),
  } as unknown as SupabaseClient;
};

// Mock NextRequest
const createMockRequest = (pathname: string = '/admin'): NextRequest => {
  return {
    nextUrl: {
      pathname,
    },
    url: `http://localhost:3000${pathname}`,
  } as NextRequest;
};

// Mock User
const createMockUser = (email: string = 'admin@example.com'): User => {
  return {
    id: '123',
    email,
    aud: 'authenticated',
    role: 'authenticated',
    created_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {},
  } as User;
};

describe('Session Authorization Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isActiveAdmin', () => {
    it('should return true for active admin user', async () => {
      const supabase = createMockSupabase({
        adminData: { active: true },
      });

      const result = await isActiveAdmin(supabase, 'admin@example.com');

      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('admin_users');
    });

    it('should return false for inactive admin user', async () => {
      // Note: The function queries with .eq('active', true), so inactive users return no data
      const supabase = createMockSupabase({
        adminData: null, // Database returns no match for inactive users
      });

      const result = await isActiveAdmin(supabase, 'admin@example.com');

      expect(result).toBe(false);
    });

    it('should return false if user is not in admin_users table', async () => {
      const supabase = createMockSupabase({
        adminData: null,
      });

      const result = await isActiveAdmin(supabase, 'user@example.com');

      expect(result).toBe(false);
    });

    it('should return false if database query returns error', async () => {
      const supabase = createMockSupabase({
        adminError: new Error('Database connection failed'),
      });

      const result = await isActiveAdmin(supabase, 'admin@example.com');

      expect(result).toBe(false);
    });

    it('should return false if email is undefined', async () => {
      const supabase = createMockSupabase();

      const result = await isActiveAdmin(supabase, undefined);

      expect(result).toBe(false);
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('should return false if email is null', async () => {
      const supabase = createMockSupabase();

      const result = await isActiveAdmin(supabase, null as unknown as string);

      expect(result).toBe(false);
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('should return false if email is empty string', async () => {
      const supabase = createMockSupabase();

      const result = await isActiveAdmin(supabase, '');

      expect(result).toBe(false);
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('should query admin_users table when checking admin status', async () => {
      const supabase = createMockSupabase();
      const email = 'admin@example.com';

      await isActiveAdmin(supabase, email);

      expect(supabase.from).toHaveBeenCalledWith('admin_users');
    });
  });

  describe('authorizeAdminRoute', () => {
    describe('Login Page Handling', () => {
      it('should allow unauthenticated users to access login page', async () => {
        const request = createMockRequest('/admin/login');
        const supabase = createMockSupabase();

        const result = await authorizeAdminRoute(request, null, supabase);

        expect(result).toBeNull();
      });

      it('should redirect authenticated admin from login page to dashboard', async () => {
        const request = createMockRequest('/admin/login');
        const user = createMockUser('admin@example.com');
        const supabase = createMockSupabase({ adminData: { active: true } });

        const result = await authorizeAdminRoute(request, user, supabase);

        expect(result).toBeInstanceOf(NextResponse);
        expect(result?.headers.get('location')).toContain('/admin');
      });

      it('should not redirect non-admin authenticated user from login page', async () => {
        const request = createMockRequest('/admin/login');
        const user = createMockUser('user@example.com');
        const supabase = createMockSupabase({ adminData: null });

        const result = await authorizeAdminRoute(request, user, supabase);

        expect(result).toBeNull();
      });
    });

    describe('Protected Admin Routes', () => {
      it('should redirect unauthenticated users to login page', async () => {
        const request = createMockRequest('/admin/dashboard');
        const supabase = createMockSupabase();

        const result = await authorizeAdminRoute(request, null, supabase);

        expect(result).toBeInstanceOf(NextResponse);
        expect(result?.headers.get('location')).toContain('/admin/login');
      });

      it('should allow authenticated admin to access admin routes', async () => {
        const request = createMockRequest('/admin/dashboard');
        const user = createMockUser('admin@example.com');
        const supabase = createMockSupabase({ adminData: { active: true } });

        const result = await authorizeAdminRoute(request, user, supabase);

        expect(result).toBeNull(); // null = allow access
      });

      it('should redirect authenticated non-admin with unauthorized error', async () => {
        const request = createMockRequest('/admin/dashboard');
        const user = createMockUser('user@example.com');
        const supabase = createMockSupabase({ adminData: null });

        const result = await authorizeAdminRoute(request, user, supabase);

        expect(result).toBeInstanceOf(NextResponse);
        expect(result?.headers.get('location')).toContain('/admin/login');
        expect(result?.headers.get('location')).toContain('error=unauthorized');
      });

      it('should redirect inactive admin with unauthorized error', async () => {
        const request = createMockRequest('/admin/dashboard');
        const user = createMockUser('admin@example.com');
        // Database returns no match for inactive users (due to .eq('active', true))
        const supabase = createMockSupabase({ adminData: null });

        const result = await authorizeAdminRoute(request, user, supabase);

        expect(result).toBeInstanceOf(NextResponse);
        expect(result?.headers.get('location')).toContain('error=unauthorized');
      });
    });

    describe('Non-Admin Routes', () => {
      it('should allow access to non-admin routes without checking admin status', async () => {
        const request = createMockRequest('/blog');
        const user = createMockUser('user@example.com');
        const supabase = createMockSupabase();

        const result = await authorizeAdminRoute(request, user, supabase);

        expect(result).toBeNull();
        expect(supabase.from).not.toHaveBeenCalled();
      });

      it('should allow unauthenticated access to public routes', async () => {
        const request = createMockRequest('/');
        const supabase = createMockSupabase();

        const result = await authorizeAdminRoute(request, null, supabase);

        expect(result).toBeNull();
      });
    });

    describe('Admin Route Variations', () => {
      it('should protect /admin root path', async () => {
        const request = createMockRequest('/admin');
        const supabase = createMockSupabase();

        const result = await authorizeAdminRoute(request, null, supabase);

        expect(result).toBeInstanceOf(NextResponse);
      });

      it('should protect nested admin routes', async () => {
        const request = createMockRequest('/admin/posts/edit/123');
        const supabase = createMockSupabase();

        const result = await authorizeAdminRoute(request, null, supabase);

        expect(result).toBeInstanceOf(NextResponse);
      });

      it('should protect admin routes with query parameters', async () => {
        const request = {
          nextUrl: { pathname: '/admin/dashboard' },
          url: 'http://localhost:3000/admin/dashboard?tab=posts',
        } as NextRequest;
        const supabase = createMockSupabase();

        const result = await authorizeAdminRoute(request, null, supabase);

        expect(result).toBeInstanceOf(NextResponse);
      });
    });

    describe('Error Handling', () => {
      it('should redirect to login on database error during admin check', async () => {
        const request = createMockRequest('/admin/dashboard');
        const user = createMockUser('admin@example.com');
        const supabase = createMockSupabase({
          adminError: new Error('Database connection failed'),
        });

        const result = await authorizeAdminRoute(request, user, supabase);

        expect(result).toBeInstanceOf(NextResponse);
        expect(result?.headers.get('location')).toContain('error=unauthorized');
      });

      it('should handle missing user email gracefully', async () => {
        const request = createMockRequest('/admin/dashboard');
        const user = { ...createMockUser(), email: undefined } as User;
        const supabase = createMockSupabase();

        const result = await authorizeAdminRoute(request, user, supabase);

        expect(result).toBeInstanceOf(NextResponse);
        expect(result?.headers.get('location')).toContain('error=unauthorized');
      });
    });

    describe('Edge Cases', () => {
      it('should handle case-sensitive route matching', async () => {
        const request = createMockRequest('/Admin'); // Uppercase A
        const supabase = createMockSupabase();

        const result = await authorizeAdminRoute(request, null, supabase);

        // /Admin is not /admin, should not redirect
        expect(result).toBeNull();
      });

      it('should protect /administrator as it starts with /admin', async () => {
        // Note: JavaScript's startsWith('/admin') matches '/administrator'
        const request = createMockRequest('/administrator');
        const supabase = createMockSupabase();

        const result = await authorizeAdminRoute(request, null, supabase);

        // This IS treated as an admin route due to startsWith check
        expect(result).toBeInstanceOf(NextResponse);
      });

      it('should protect /admin/ with trailing slash', async () => {
        const request = createMockRequest('/admin/');
        const supabase = createMockSupabase();

        const result = await authorizeAdminRoute(request, null, supabase);

        expect(result).toBeInstanceOf(NextResponse);
      });

      it('should redirect from /admin/login/ with trailing slash (starts with /admin)', async () => {
        // Note: startsWith('/admin') matches both '/admin' and '/admin/login/'
        // The exact check is pathname === '/admin/login', which doesn't match '/admin/login/'
        const request = createMockRequest('/admin/login/');
        const supabase = createMockSupabase();

        const result = await authorizeAdminRoute(request, null, supabase);

        // This redirects because pathname !== '/admin/login' (has trailing slash)
        expect(result).toBeInstanceOf(NextResponse);
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete admin login flow', async () => {
      const user = createMockUser('admin@example.com');
      const supabase = createMockSupabase({ adminData: { active: true } });

      // Step 1: User lands on login page (unauthenticated)
      const loginRequest1 = createMockRequest('/admin/login');
      const result1 = await authorizeAdminRoute(loginRequest1, null, supabase);
      expect(result1).toBeNull(); // Allowed

      // Step 2: After login, redirect from login page to dashboard
      const loginRequest2 = createMockRequest('/admin/login');
      const result2 = await authorizeAdminRoute(loginRequest2, user, supabase);
      expect(result2).toBeInstanceOf(NextResponse); // Redirect to /admin

      // Step 3: Access admin dashboard
      const dashboardRequest = createMockRequest('/admin/dashboard');
      const result3 = await authorizeAdminRoute(dashboardRequest, user, supabase);
      expect(result3).toBeNull(); // Allowed
    });

    it('should handle non-admin user attempting admin access', async () => {
      const user = createMockUser('user@example.com');
      const supabase = createMockSupabase({ adminData: null });

      // Step 1: Try to access admin route
      const adminRequest = createMockRequest('/admin/posts');
      const result = await authorizeAdminRoute(adminRequest, user, supabase);

      expect(result).toBeInstanceOf(NextResponse);
      expect(result?.headers.get('location')).toContain('/admin/login');
      expect(result?.headers.get('location')).toContain('error=unauthorized');
    });
  });
});
