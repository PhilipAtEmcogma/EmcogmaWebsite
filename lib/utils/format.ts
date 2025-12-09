/**
 * Formatting Utilities
 *
 * Common formatting functions for dates, numbers, strings, etc.
 */

/**
 * Format a date string or Date object
 *
 * @param date - Date to format
 * @param format - Format type ('short', 'long', 'relative')
 * @returns Formatted date string
 *
 * @example
 * formatDate('2024-01-15') // => 'Jan 15, 2024'
 * formatDate(new Date(), 'long') // => 'Monday, January 15, 2024'
 * formatDate('2024-01-15', 'relative') // => '2 days ago'
 */
export function formatDate(
  date: string | Date,
  format: 'short' | 'long' | 'relative' = 'short'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (format === 'relative') {
    return formatRelativeTime(d);
  }

  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 *
 * @param date - Date to format
 * @returns Relative time string
 *
 * @example
 * formatRelativeTime(new Date(Date.now() - 3600000)) // => '1 hour ago'
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }

  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }

  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }

  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }

  const years = Math.floor(diffInSeconds / 31536000);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}

/**
 * Format a number as currency
 *
 * @param amount - Amount to format
 * @param currency - Currency code (default: 'USD')
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(1999) // => '$1,999.00'
 * formatCurrency(99.5, 'EUR') // => '€99.50'
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format a number with commas
 *
 * @param num - Number to format
 * @returns Formatted number string
 *
 * @example
 * formatNumber(1000) // => '1,000'
 * formatNumber(1234567) // => '1,234,567'
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Truncate text to a specified length
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param ellipsis - String to append (default: '...')
 * @returns Truncated text
 *
 * @example
 * truncate('Hello World', 8) // => 'Hello...'
 */
export function truncate(
  text: string,
  maxLength: number,
  ellipsis: string = '...'
): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Capitalize first letter of a string
 *
 * @param str - String to capitalize
 * @returns Capitalized string
 *
 * @example
 * capitalize('hello world') // => 'Hello world'
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert string to title case
 *
 * @param str - String to convert
 * @returns Title cased string
 *
 * @example
 * toTitleCase('hello world') // => 'Hello World'
 */
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Generate a slug from a string
 *
 * @param str - String to slugify
 * @returns URL-safe slug
 *
 * @example
 * slugify('Hello World!') // => 'hello-world'
 * slugify('TypeScript & React') // => 'typescript-react'
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Calculate reading time based on word count
 *
 * @param text - Text to analyze
 * @param wordsPerMinute - Reading speed (default: 200)
 * @returns Reading time string
 *
 * @example
 * calculateReadingTime('Lorem ipsum...', 200) // => '5 min read'
 */
export function calculateReadingTime(
  text: string,
  wordsPerMinute: number = 200
): string {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}
