import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  formatDate,
  formatRelativeTime,
  formatCurrency,
  formatNumber,
  truncate,
  capitalize,
  toTitleCase,
  slugify,
  calculateReadingTime,
} from '../format'

describe('formatDate', () => {
  it('should format date in short format', () => {
    const date = new Date('2024-01-15')
    const formatted = formatDate(date, 'short')
    expect(formatted).toMatch(/Jan 15, 2024/)
  })

  it('should format date in long format', () => {
    const date = new Date('2024-01-15')
    const formatted = formatDate(date, 'long')
    expect(formatted).toMatch(/January 15, 2024/)
  })

  it('should format date from string', () => {
    const formatted = formatDate('2024-01-15')
    expect(formatted).toMatch(/Jan 15, 2024/)
  })

  it('should handle relative format', () => {
    const now = new Date()
    const result = formatDate(now, 'relative')
    expect(result).toBe('just now')
  })
})

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return "just now" for recent dates', () => {
    const now = new Date('2024-01-15T12:00:00')
    vi.setSystemTime(now)

    const date = new Date('2024-01-15T11:59:30')
    expect(formatRelativeTime(date)).toBe('just now')
  })

  it('should format minutes ago', () => {
    const now = new Date('2024-01-15T12:00:00')
    vi.setSystemTime(now)

    const date = new Date('2024-01-15T11:55:00')
    expect(formatRelativeTime(date)).toBe('5 minutes ago')
  })

  it('should format hours ago', () => {
    const now = new Date('2024-01-15T12:00:00')
    vi.setSystemTime(now)

    const date = new Date('2024-01-15T10:00:00')
    expect(formatRelativeTime(date)).toBe('2 hours ago')
  })

  it('should format days ago', () => {
    const now = new Date('2024-01-15T12:00:00')
    vi.setSystemTime(now)

    const date = new Date('2024-01-10T12:00:00')
    expect(formatRelativeTime(date)).toBe('5 days ago')
  })

  it('should format weeks ago', () => {
    const now = new Date('2024-01-15T12:00:00')
    vi.setSystemTime(now)

    const date = new Date('2024-01-01T12:00:00')
    expect(formatRelativeTime(date)).toBe('2 weeks ago')
  })

  it('should format singular units correctly', () => {
    const now = new Date('2024-01-15T12:00:00')
    vi.setSystemTime(now)

    expect(formatRelativeTime(new Date('2024-01-15T11:59:00'))).toBe(
      '1 minute ago'
    )
    expect(formatRelativeTime(new Date('2024-01-15T11:00:00'))).toBe(
      '1 hour ago'
    )
    expect(formatRelativeTime(new Date('2024-01-14T12:00:00'))).toBe(
      '1 day ago'
    )
  })
})

describe('formatCurrency', () => {
  it('should format USD by default', () => {
    expect(formatCurrency(1999)).toBe('$1,999.00')
    expect(formatCurrency(99.5)).toBe('$99.50')
  })

  it('should format other currencies', () => {
    expect(formatCurrency(1999, 'EUR')).toMatch(/1,999\.00/)
    expect(formatCurrency(1999, 'GBP')).toMatch(/1,999\.00/)
  })

  it('should handle zero and negative amounts', () => {
    expect(formatCurrency(0)).toBe('$0.00')
    expect(formatCurrency(-50)).toBe('-$50.00')
  })
})

describe('formatNumber', () => {
  it('should format numbers with commas', () => {
    expect(formatNumber(1000)).toBe('1,000')
    expect(formatNumber(1234567)).toBe('1,234,567')
  })

  it('should handle small numbers', () => {
    expect(formatNumber(10)).toBe('10')
    expect(formatNumber(999)).toBe('999')
  })

  it('should handle zero', () => {
    expect(formatNumber(0)).toBe('0')
  })
})

describe('truncate', () => {
  it('should truncate long text', () => {
    expect(truncate('Hello World', 8)).toBe('Hello...')
    expect(truncate('Hello World', 5)).toBe('He...')
  })

  it('should not truncate short text', () => {
    expect(truncate('Hello', 10)).toBe('Hello')
    expect(truncate('Hello', 5)).toBe('Hello')
  })

  it('should use custom ellipsis', () => {
    expect(truncate('Hello World', 8, '…')).toBe('Hello W…')
  })

  it('should handle empty string', () => {
    expect(truncate('', 10)).toBe('')
  })
})

describe('capitalize', () => {
  it('should capitalize first letter', () => {
    expect(capitalize('hello')).toBe('Hello')
    expect(capitalize('world')).toBe('World')
  })

  it('should handle already capitalized strings', () => {
    expect(capitalize('Hello')).toBe('Hello')
  })

  it('should handle empty string', () => {
    expect(capitalize('')).toBe('')
  })

  it('should not change rest of string', () => {
    expect(capitalize('hELLO')).toBe('HELLO')
  })
})

describe('toTitleCase', () => {
  it('should convert to title case', () => {
    expect(toTitleCase('hello world')).toBe('Hello World')
    expect(toTitleCase('the quick brown fox')).toBe('The Quick Brown Fox')
  })

  it('should handle already title cased strings', () => {
    expect(toTitleCase('Hello World')).toBe('Hello World')
  })

  it('should handle single word', () => {
    expect(toTitleCase('hello')).toBe('Hello')
  })
})

describe('slugify', () => {
  it('should create URL-safe slugs', () => {
    expect(slugify('Hello World')).toBe('hello-world')
    expect(slugify('TypeScript & React')).toBe('typescript-react')
  })

  it('should remove special characters', () => {
    expect(slugify('Hello, World!')).toBe('hello-world')
    expect(slugify('Test@#$%Test')).toBe('testtest')
  })

  it('should handle multiple spaces', () => {
    expect(slugify('Hello    World')).toBe('hello-world')
  })

  it('should trim leading/trailing hyphens', () => {
    expect(slugify('-Hello World-')).toBe('hello-world')
    expect(slugify('  Hello World  ')).toBe('hello-world')
  })

  it('should handle underscores', () => {
    expect(slugify('hello_world')).toBe('hello-world')
  })
})

describe('calculateReadingTime', () => {
  it('should calculate reading time', () => {
    const text = Array(200).fill('word').join(' ')
    expect(calculateReadingTime(text)).toBe('1 min read')
  })

  it('should round up to nearest minute', () => {
    const text = Array(250).fill('word').join(' ')
    expect(calculateReadingTime(text)).toBe('2 min read')
  })

  it('should handle custom words per minute', () => {
    const text = Array(300).fill('word').join(' ')
    expect(calculateReadingTime(text, 300)).toBe('1 min read')
  })

  it('should handle empty text', () => {
    expect(calculateReadingTime('')).toBe('1 min read')
  })

  it('should handle single word', () => {
    expect(calculateReadingTime('word')).toBe('1 min read')
  })
})
