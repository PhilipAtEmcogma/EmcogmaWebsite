/**
 * URL Utilities
 *
 * Helper functions for URL manipulation and validation.
 */

/**
 * Build a URL with query parameters
 *
 * @param base - Base URL
 * @param params - Query parameters
 * @returns URL with query string
 *
 * @example
 * buildUrl('/api/posts', { page: 1, limit: 10 }) // => '/api/posts?page=1&limit=10'
 */
export function buildUrl(
  base: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  if (!params) return base;

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${base}?${queryString}` : base;
}

/**
 * Parse query parameters from URL
 *
 * @param url - URL to parse
 * @returns Object with query parameters
 *
 * @example
 * parseQueryParams('?page=1&limit=10') // => { page: '1', limit: '10' }
 */
export function parseQueryParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(url);

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}

/**
 * Validate URL format
 *
 * @param url - URL to validate
 * @returns True if valid URL
 *
 * @example
 * isValidUrl('https://example.com') // => true
 * isValidUrl('not a url') // => false
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get domain from URL
 *
 * @param url - URL to parse
 * @returns Domain or null if invalid
 *
 * @example
 * getDomain('https://example.com/path') // => 'example.com'
 */
export function getDomain(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return null;
  }
}

/**
 * Add protocol to URL if missing
 *
 * @param url - URL to normalize
 * @param protocol - Protocol to add (default: 'https')
 * @returns URL with protocol
 *
 * @example
 * ensureProtocol('example.com') // => 'https://example.com'
 * ensureProtocol('http://example.com') // => 'http://example.com'
 */
export function ensureProtocol(
  url: string,
  protocol: 'http' | 'https' = 'https'
): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${protocol}://${url}`;
}

/**
 * Check if URL is external
 *
 * @param url - URL to check
 * @param currentDomain - Current site domain (optional)
 * @returns True if external URL
 *
 * @example
 * isExternalUrl('https://google.com', 'example.com') // => true
 * isExternalUrl('/about', 'example.com') // => false
 */
export function isExternalUrl(url: string, currentDomain?: string): boolean {
  if (url.startsWith('/') || url.startsWith('#')) {
    return false;
  }

  if (!currentDomain) {
    return isValidUrl(url);
  }

  const domain = getDomain(url);
  return domain !== null && domain !== currentDomain;
}
