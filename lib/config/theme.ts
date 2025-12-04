/**
 * Theme Configuration
 *
 * Cyberpunk theme colors and design tokens.
 * These values match tailwind.config.ts and provide programmatic access.
 */

/**
 * Color Palette
 */
export const COLORS = {
  cyber: {
    dark: '#0e0e10',
    darker: '#050508',
    primary: '#fce700',
    secondary: '#ff003c',
    accent: '#00ff41',
    purple: '#a855f7',
    blue: '#3b82f6',
  },
  status: {
    success: '#00ff41',
    error: '#ff003c',
    warning: '#fce700',
    info: '#3b82f6',
  },
  text: {
    primary: '#ffffff',
    secondary: '#9ca3af',
    muted: '#6b7280',
    inverse: '#0a0a0f',
  },
  border: {
    default: 'rgba(255, 255, 255, 0.1)',
    focus: '#fce700',
  },
} as const;

/**
 * Typography Scale
 */
export const TYPOGRAPHY = {
  fontFamily: {
    sans: 'var(--font-geist-sans)',
    mono: 'var(--font-geist-mono)',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

/**
 * Spacing Scale
 */
export const SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
} as const;

/**
 * Border Radius
 */
export const RADIUS = {
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  full: '9999px',
} as const;

/**
 * Shadows
 */
export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  neon: {
    cyan: '0 0 20px rgba(0, 240, 255, 0.5)',
    magenta: '0 0 20px rgba(255, 0, 255, 0.5)',
    green: '0 0 20px rgba(0, 255, 65, 0.5)',
    yellow: '0 0 20px rgba(252, 231, 0, 0.5)',
  },
} as const;

/**
 * Animation Durations
 */
export const ANIMATION = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
} as const;

/**
 * Z-Index Layers
 */
export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  modal: 30,
  popover: 40,
  tooltip: 50,
} as const;

/**
 * Breakpoints (matches Tailwind)
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;
