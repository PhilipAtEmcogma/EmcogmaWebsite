/**
 * Nonce-based Content Security Policy implementation
 * Provides strong XSS protection for Next.js applications
 */

/**
 * Generate a cryptographically secure nonce using Web Crypto API
 * Compatible with Edge Runtime
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

/**
 * Get nonce-based Content Security Policy
 * @param nonce - Unique nonce for this request
 * @returns CSP header value
 */
export function getNonceCSP(nonce: string): string {
  const policies = [
    // Default source
    "default-src 'self'",

    // Scripts: Allow self, nonce, and trusted CDNs
    // Remove 'unsafe-inline' and 'unsafe-eval' for better security
    `script-src 'self' 'nonce-${nonce}' https://www.google.com https://www.gstatic.com https://www.googletagmanager.com`,

    // Styles: Allow self, nonce, and Google Fonts
    // Remove 'unsafe-inline' for better security
    `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,

    // Images: Allow self, data URIs, and common image CDNs
    "img-src 'self' data: https: http:",

    // Fonts: Allow self and Google Fonts
    "font-src 'self' data: https://fonts.gstatic.com",

    // Connect: Allow self, Supabase, and Formspree
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://formspree.io https://www.google.com",

    // Frame: Allow Google reCAPTCHA
    "frame-src 'self' https://www.google.com",

    // Object: Disallow plugins
    "object-src 'none'",

    // Base URI: Restrict to self
    "base-uri 'self'",

    // Form action: Restrict to self and trusted services
    "form-action 'self' https://formspree.io",

    // Frame ancestors: Prevent clickjacking
    "frame-ancestors 'none'",

    // Upgrade insecure requests
    "upgrade-insecure-requests",
  ];

  return policies.join('; ');
}

/**
 * Get fallback CSP (with unsafe-inline for development/compatibility)
 * Use this during transition period or as fallback
 */
export function getFallbackCSP(): string {
  const policies = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: http:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://formspree.io https://www.google.com",
    "frame-src 'self' https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://formspree.io",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ];

  return policies.join('; ');
}

/**
 * Check if CSP nonces are enabled via environment variable
 * Defaults to true in production for better security
 */
export function isCspNonceEnabled(): boolean {
  // Default to true in production unless explicitly disabled
  if (process.env.NEXT_PUBLIC_CSP_NONCE_ENABLED === 'false') {
    return false;
  }
  // Enable by default in production, or if explicitly enabled
  return process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_CSP_NONCE_ENABLED === 'true';
}

/**
 * Get appropriate CSP based on environment configuration
 * @param nonce - Optional nonce (if nonces are enabled)
 */
export function getCSP(nonce?: string): string {
  // Use nonce-based CSP in production by default for better security
  if (isCspNonceEnabled()) {
    if (!nonce) {
      // Generate a nonce if not provided (shouldn't happen, but fallback)
      console.warn('CSP nonce requested but not provided, using fallback CSP');
      return getFallbackCSP();
    }
    return getNonceCSP(nonce);
  }
  // Development or explicitly disabled: use fallback with unsafe-inline
  return getFallbackCSP();
}
