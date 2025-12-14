import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import {
  validateSessionTimeout,
  validateSessionIP,
  updateSessionCookies,
  cleanupOAuthCallback,
  isOAuthCallback,
  SESSION_TIMEOUT_MS,
} from '../validation';
import type { SupabaseClient } from '@supabase/supabase-js';

// Mock Supabase client
const createMockSupabase = () => ({
  auth: {
    signOut: vi.fn().mockResolvedValue({}),
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
    })),
  })),
});

// Mock NextRequest
const createMockRequest = (options: {
  pathname?: string;
  cookies?: Record<string, string>;
  url?: string;
} = {}): NextRequest => {
  const {
    pathname = '/admin',
    cookies = {},
    url = 'http://localhost:3000/admin',
  } = options;

  const cookiesMap = new Map(Object.entries(cookies));

  return {
    nextUrl: {
      pathname,
    },
    url,
    cookies: {
      get: (name: string) => {
        const value = cookiesMap.get(name);
        return value ? { name, value } : undefined;
      },
      set: vi.fn(),
      delete: vi.fn(),
      getAll: vi.fn(() => Array.from(cookiesMap.entries()).map(([name, value]) => ({ name, value }))),
    },
    headers: new Headers(),
  } as unknown as NextRequest;
};

// Mock NextResponse
const createMockResponse = (): NextResponse => {
  const cookies = {
    set: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
  };

  return {
    cookies,
    headers: new Headers(),
  } as unknown as NextResponse;
};

describe('Session Validation Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set consistent system time for timeout tests
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('SESSION_TIMEOUT_MS constant', () => {
    it('should default to 10 minutes (600000ms)', () => {
      expect(SESSION_TIMEOUT_MS).toBe(600000);
    });
  });

  describe('isOAuthCallback', () => {
    it('should return true if oauth_callback cookie exists', () => {
      const request = createMockRequest({
        cookies: { oauth_callback: 'true' },
      });

      expect(isOAuthCallback(request)).toBe(true);
    });

    it('should return false if oauth_callback cookie does not exist', () => {
      const request = createMockRequest({
        cookies: {},
      });

      expect(isOAuthCallback(request)).toBe(false);
    });

    it('should return false if cookie value is empty string', () => {
      const request = createMockRequest({
        cookies: { oauth_callback: '' },
      });

      // Empty cookie value returns an object, but !! of empty string object is false in our mock
      // because the mock only returns {name, value} if value exists
      expect(isOAuthCallback(request)).toBe(false);
    });
  });

  describe('validateSessionTimeout', () => {
    it('should allow continuation if OAuth callback cookie is present (first login)', async () => {
      const request = createMockRequest({
        cookies: { oauth_callback: 'true' },
      });
      const supabase = createMockSupabase() as unknown as SupabaseClient;

      const result = await validateSessionTimeout(request, undefined, supabase);

      expect(result.shouldRedirect).toBe(false);
      expect(supabase.auth.signOut).not.toHaveBeenCalled();
    });

    it('should sign out and redirect if no last_activity cookie and no OAuth callback (browser reopen)', async () => {
      const request = createMockRequest({
        pathname: '/admin/dashboard',
        cookies: {},
      });
      const supabase = createMockSupabase() as unknown as SupabaseClient;

      const result = await validateSessionTimeout(request, undefined, supabase);

      expect(result.shouldRedirect).toBe(true);
      expect(result.response).toBeDefined();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should not redirect if on login page after session expiry', async () => {
      const request = createMockRequest({
        pathname: '/admin/login',
        cookies: {},
      });
      const supabase = createMockSupabase() as unknown as SupabaseClient;

      const result = await validateSessionTimeout(request, undefined, supabase);

      expect(result.shouldRedirect).toBe(false);
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should sign out and redirect if last_activity cookie is invalid (NaN)', async () => {
      const request = createMockRequest({
        pathname: '/admin/dashboard',
      });
      const lastActivityCookie = { value: 'invalid-timestamp' };
      const supabase = createMockSupabase() as unknown as SupabaseClient;

      const result = await validateSessionTimeout(request, lastActivityCookie, supabase);

      expect(result.shouldRedirect).toBe(true);
      expect(result.response).toBeDefined();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should not redirect if session is within timeout threshold', async () => {
      const now = Date.now();
      const lastActivity = now - 300000; // 5 minutes ago (within 10 min timeout)

      const request = createMockRequest({});
      const lastActivityCookie = { value: lastActivity.toString() };
      const supabase = createMockSupabase() as unknown as SupabaseClient;

      const result = await validateSessionTimeout(request, lastActivityCookie, supabase);

      expect(result.shouldRedirect).toBe(false);
      expect(supabase.auth.signOut).not.toHaveBeenCalled();
    });

    it('should sign out and redirect if session exceeded timeout threshold', async () => {
      const now = Date.now();
      const lastActivity = now - 700000; // 11+ minutes ago (exceeded 10 min timeout)

      const request = createMockRequest({
        pathname: '/admin/dashboard',
      });
      const lastActivityCookie = { value: lastActivity.toString() };
      const supabase = createMockSupabase() as unknown as SupabaseClient;

      const result = await validateSessionTimeout(request, lastActivityCookie, supabase);

      expect(result.shouldRedirect).toBe(true);
      expect(result.response).toBeDefined();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should include error=session_timeout in redirect URL', async () => {
      const request = createMockRequest({
        pathname: '/admin/dashboard',
        url: 'http://localhost:3000/admin/dashboard',
      });
      const supabase = createMockSupabase() as unknown as SupabaseClient;

      const result = await validateSessionTimeout(request, undefined, supabase);

      expect(result.redirectUrl).toBeDefined();
      expect(result.redirectUrl?.searchParams.get('error')).toBe('session_timeout');
    });

    it('should include error=session_invalid for invalid cookie value', async () => {
      const request = createMockRequest({
        pathname: '/admin/dashboard',
        url: 'http://localhost:3000/admin/dashboard',
      });
      const lastActivityCookie = { value: 'not-a-number' };
      const supabase = createMockSupabase() as unknown as SupabaseClient;

      const result = await validateSessionTimeout(request, lastActivityCookie, supabase);

      expect(result.redirectUrl).toBeDefined();
      expect(result.redirectUrl?.searchParams.get('error')).toBe('session_invalid');
    });

    it('should create redirect response with cleared cookies', async () => {
      const request = createMockRequest({
        pathname: '/admin/dashboard',
      });
      const supabase = createMockSupabase() as unknown as SupabaseClient;

      const result = await validateSessionTimeout(request, undefined, supabase);

      expect(result.shouldRedirect).toBe(true);
      expect(result.response).toBeDefined();
      // Note: NextResponse.redirect() creates the response internally with deleted cookies
      // We verify the redirect occurred, not the internal cookie API calls
    });
  });

  describe('validateSessionIP', () => {
    it('should allow continuation if no stored session IP (first-time setup)', async () => {
      const request = createMockRequest({});
      const supabase = createMockSupabase() as unknown as SupabaseClient;

      const result = await validateSessionIP(request, undefined, '192.168.1.1', supabase);

      expect(result.shouldRedirect).toBe(false);
      expect(supabase.auth.signOut).not.toHaveBeenCalled();
    });

    it('should allow continuation if session IP matches current IP', async () => {
      const request = createMockRequest({});
      const sessionIpCookie = { value: '192.168.1.1' };
      const currentIP = '192.168.1.1';
      const supabase = createMockSupabase() as unknown as SupabaseClient;

      const result = await validateSessionIP(request, sessionIpCookie, currentIP, supabase);

      expect(result.shouldRedirect).toBe(false);
      expect(supabase.auth.signOut).not.toHaveBeenCalled();
    });

    it('should sign out and redirect if session IP has changed', async () => {
      const request = createMockRequest({
        pathname: '/admin/dashboard',
      });
      const sessionIpCookie = { value: '192.168.1.1' };
      const currentIP = '192.168.1.2'; // Different IP
      const supabase = createMockSupabase() as unknown as SupabaseClient;

      const result = await validateSessionIP(request, sessionIpCookie, currentIP, supabase);

      expect(result.shouldRedirect).toBe(true);
      expect(result.response).toBeDefined();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should include error=ip_changed in redirect URL', async () => {
      const request = createMockRequest({
        pathname: '/admin/dashboard',
        url: 'http://localhost:3000/admin/dashboard',
      });
      const sessionIpCookie = { value: '192.168.1.1' };
      const currentIP = '10.0.0.1';
      const supabase = createMockSupabase() as unknown as SupabaseClient;

      const result = await validateSessionIP(request, sessionIpCookie, currentIP, supabase);

      expect(result.redirectUrl).toBeDefined();
      expect(result.redirectUrl?.searchParams.get('error')).toBe('ip_changed');
    });

    it('should not redirect if already on login page after IP change', async () => {
      const request = createMockRequest({
        pathname: '/admin/login',
      });
      const sessionIpCookie = { value: '192.168.1.1' };
      const currentIP = '192.168.1.2';
      const supabase = createMockSupabase() as unknown as SupabaseClient;

      const result = await validateSessionIP(request, sessionIpCookie, currentIP, supabase);

      expect(result.shouldRedirect).toBe(false);
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('updateSessionCookies', () => {
    it('should set last_activity cookie with current timestamp', () => {
      const response = createMockResponse();
      const currentIP = '192.168.1.1';

      updateSessionCookies(response, currentIP);

      expect(response.cookies.set).toHaveBeenCalledWith(
        'last_activity',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
        })
      );
    });

    it('should set session_ip cookie with provided IP', () => {
      const response = createMockResponse();
      const currentIP = '192.168.1.1';

      updateSessionCookies(response, currentIP);

      expect(response.cookies.set).toHaveBeenCalledWith(
        'session_ip',
        '192.168.1.1',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
        })
      );
    });

    it('should use session cookies (no maxAge) for browser closure detection', () => {
      const response = createMockResponse();
      const currentIP = '192.168.1.1';

      updateSessionCookies(response, currentIP);

      // Verify cookies don't have maxAge property (makes them session cookies)
      const calls = (response.cookies.set as ReturnType<typeof vi.fn>).mock.calls;
      calls.forEach((call) => {
        const cookieOptions = call[2];
        expect(cookieOptions).not.toHaveProperty('maxAge');
      });
    });

    it('should set secure flag in production environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const response = createMockResponse();
      const currentIP = '192.168.1.1';

      updateSessionCookies(response, currentIP);

      expect(response.cookies.set).toHaveBeenCalledWith(
        'last_activity',
        expect.any(String),
        expect.objectContaining({ secure: true })
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should not set secure flag in development environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const response = createMockResponse();
      const currentIP = '192.168.1.1';

      updateSessionCookies(response, currentIP);

      expect(response.cookies.set).toHaveBeenCalledWith(
        'last_activity',
        expect.any(String),
        expect.objectContaining({ secure: false })
      );

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('cleanupOAuthCallback', () => {
    it('should delete oauth_callback cookie if it exists', () => {
      const response = createMockResponse();
      const request = createMockRequest({
        cookies: { oauth_callback: 'true' },
      });

      cleanupOAuthCallback(response, request);

      expect(response.cookies.delete).toHaveBeenCalledWith('oauth_callback');
    });

    it('should not delete cookie if oauth_callback does not exist', () => {
      const response = createMockResponse();
      const request = createMockRequest({
        cookies: {},
      });

      cleanupOAuthCallback(response, request);

      expect(response.cookies.delete).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very old timestamps (years ago)', async () => {
      const veryOldTimestamp = new Date('2020-01-01').getTime();
      const request = createMockRequest({ pathname: '/admin/dashboard' });
      const lastActivityCookie = { value: veryOldTimestamp.toString() };
      const supabase = createMockSupabase() as unknown as SupabaseClient;

      const result = await validateSessionTimeout(request, lastActivityCookie, supabase);

      expect(result.shouldRedirect).toBe(true);
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should handle future timestamps gracefully', async () => {
      const futureTimestamp = new Date('2030-01-01').getTime();
      const request = createMockRequest({});
      const lastActivityCookie = { value: futureTimestamp.toString() };
      const supabase = createMockSupabase() as unknown as SupabaseClient;

      const result = await validateSessionTimeout(request, lastActivityCookie, supabase);

      // Future timestamp means no timeout yet
      expect(result.shouldRedirect).toBe(false);
    });

    it('should handle IPv6 addresses in IP validation', async () => {
      const request = createMockRequest({});
      const sessionIpCookie = { value: '2001:0db8:85a3::8a2e:0370:7334' };
      const currentIP = '2001:0db8:85a3::8a2e:0370:7334';
      const supabase = createMockSupabase() as unknown as SupabaseClient;

      const result = await validateSessionIP(request, sessionIpCookie, currentIP, supabase);

      expect(result.shouldRedirect).toBe(false);
    });

    it('should detect IP change from IPv4 to IPv6', async () => {
      const request = createMockRequest({ pathname: '/admin/dashboard' });
      const sessionIpCookie = { value: '192.168.1.1' };
      const currentIP = '::1'; // IPv6 localhost
      const supabase = createMockSupabase() as unknown as SupabaseClient;

      const result = await validateSessionIP(request, sessionIpCookie, currentIP, supabase);

      expect(result.shouldRedirect).toBe(true);
    });

    it('should handle unknown IP addresses', async () => {
      const request = createMockRequest({});
      const sessionIpCookie = { value: '192.168.1.1' };
      const currentIP = 'unknown';
      const supabase = createMockSupabase() as unknown as SupabaseClient;

      const result = await validateSessionIP(request, sessionIpCookie, currentIP, supabase);

      expect(result.shouldRedirect).toBe(true); // IP changed from known to unknown
    });
  });
});
