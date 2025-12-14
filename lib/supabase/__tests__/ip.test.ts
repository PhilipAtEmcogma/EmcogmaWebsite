import { describe, it, expect } from 'vitest';
import { getClientIP } from '../ip';
import type { NextRequest } from 'next/server';

/**
 * Helper to create mock NextRequest with custom headers
 */
function createMockRequest(headers: Record<string, string>): NextRequest {
  const headersMap = new Headers(headers);

  return {
    headers: headersMap,
  } as NextRequest;
}

describe('getClientIP', () => {
  it('should extract IP from x-forwarded-for header', () => {
    const req = createMockRequest({
      'x-forwarded-for': '203.0.113.1',
    });

    expect(getClientIP(req)).toBe('203.0.113.1');
  });

  it('should fallback to x-real-ip if x-forwarded-for is missing', () => {
    const req = createMockRequest({
      'x-real-ip': '203.0.113.1',
    });

    expect(getClientIP(req)).toBe('203.0.113.1');
  });

  it('should return unknown if no IP headers present', () => {
    const req = createMockRequest({});

    expect(getClientIP(req)).toBe('unknown');
  });

  it('should handle empty x-forwarded-for header', () => {
    const req = createMockRequest({
      'x-forwarded-for': '',
    });

    expect(getClientIP(req)).toBe('unknown');
  });

  it('should handle multiple IPs in x-forwarded-for (comma-separated)', () => {
    // Format: "client, proxy1, proxy2"
    // Should return the first IP (original client)
    const req = createMockRequest({
      'x-forwarded-for': '203.0.113.1, 198.51.100.1, 192.0.2.1',
    });

    expect(getClientIP(req)).toBe('203.0.113.1');
  });

  it('should trim whitespace from x-forwarded-for IP', () => {
    const req = createMockRequest({
      'x-forwarded-for': '  203.0.113.1  ',
    });

    expect(getClientIP(req)).toBe('203.0.113.1');
  });

  it('should trim whitespace from x-real-ip', () => {
    const req = createMockRequest({
      'x-real-ip': '  203.0.113.1  ',
    });

    expect(getClientIP(req)).toBe('203.0.113.1');
  });

  it('should handle IPv6 addresses in x-forwarded-for', () => {
    const req = createMockRequest({
      'x-forwarded-for': '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
    });

    expect(getClientIP(req)).toBe('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
  });

  it('should handle IPv6 addresses in x-real-ip', () => {
    const req = createMockRequest({
      'x-real-ip': '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
    });

    expect(getClientIP(req)).toBe('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
  });

  it('should prioritize x-forwarded-for over x-real-ip when both present', () => {
    const req = createMockRequest({
      'x-forwarded-for': '203.0.113.1',
      'x-real-ip': '198.51.100.1',
    });

    // x-forwarded-for should take precedence
    expect(getClientIP(req)).toBe('203.0.113.1');
  });

  it('should handle localhost IPv4 address', () => {
    const req = createMockRequest({
      'x-forwarded-for': '127.0.0.1',
    });

    expect(getClientIP(req)).toBe('127.0.0.1');
  });

  it('should handle localhost IPv6 address', () => {
    const req = createMockRequest({
      'x-forwarded-for': '::1',
    });

    expect(getClientIP(req)).toBe('::1');
  });

  it('should handle private network IPs (10.x.x.x)', () => {
    const req = createMockRequest({
      'x-forwarded-for': '10.0.1.100',
    });

    expect(getClientIP(req)).toBe('10.0.1.100');
  });

  it('should handle private network IPs (192.168.x.x)', () => {
    const req = createMockRequest({
      'x-forwarded-for': '192.168.1.1',
    });

    expect(getClientIP(req)).toBe('192.168.1.1');
  });

  it('should handle multiple IPs with mixed spacing', () => {
    const req = createMockRequest({
      'x-forwarded-for': '203.0.113.1,198.51.100.1, 192.0.2.1',
    });

    // Should correctly extract first IP despite inconsistent spacing
    expect(getClientIP(req)).toBe('203.0.113.1');
  });

  it('should return unknown if x-forwarded-for contains only commas', () => {
    const req = createMockRequest({
      'x-forwarded-for': ', , ,',
    });

    expect(getClientIP(req)).toBe('unknown');
  });

  it('should handle x-forwarded-for with trailing comma', () => {
    const req = createMockRequest({
      'x-forwarded-for': '203.0.113.1,',
    });

    expect(getClientIP(req)).toBe('203.0.113.1');
  });
});
