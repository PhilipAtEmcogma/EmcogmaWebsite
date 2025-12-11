import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  escapeCsvField,
  generateCsv,
  formatDateForCsv,
  formatBooleanForCsv,
  createCsvFilename,
} from '../csv'

describe('escapeCsvField', () => {
  it('should return empty string for null/undefined', () => {
    expect(escapeCsvField(null)).toBe('')
    expect(escapeCsvField(undefined)).toBe('')
  })

  it('should convert non-string values to strings', () => {
    expect(escapeCsvField(123)).toBe('123')
    expect(escapeCsvField(true)).toBe('true')
  })

  it('should escape CSV injection characters', () => {
    expect(escapeCsvField('=cmd')).toBe("'=cmd")
    expect(escapeCsvField('+cmd')).toBe("'+cmd")
    expect(escapeCsvField('-cmd')).toBe("'-cmd")
    expect(escapeCsvField('@cmd')).toBe("'@cmd")
  })

  it('should escape double quotes', () => {
    expect(escapeCsvField('He said "hello"')).toBe('"He said ""hello"""')
  })

  it('should wrap fields with commas in quotes', () => {
    expect(escapeCsvField('Hello, World')).toBe('"Hello, World"')
  })

  it('should wrap fields with newlines in quotes', () => {
    expect(escapeCsvField('Line 1\nLine 2')).toBe('"Line 1\nLine 2"')
  })

  it('should handle combined edge cases', () => {
    // Formula + comma + quotes
    expect(escapeCsvField('=SUM(A1, "total")')).toBe(`"'=SUM(A1, ""total"")"`);
  })

  it('should handle normal text without modification', () => {
    expect(escapeCsvField('Normal text')).toBe('Normal text')
  })
})

describe('generateCsv', () => {
  it('should generate CSV with headers and data', () => {
    const data = [
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 30 },
    ]
    const csv = generateCsv(data, ['name', 'age'])

    expect(csv).toBe('name,age\r\nAlice,25\r\nBob,30')
  })

  it('should use custom headers', () => {
    const data = [{ firstName: 'Alice', lastName: 'Smith' }]
    const csv = generateCsv(data, ['firstName', 'lastName'], [
      'First Name',
      'Last Name',
    ])

    expect(csv).toBe('First Name,Last Name\r\nAlice,Smith')
  })

  it('should return empty string for empty data', () => {
    expect(generateCsv([], ['field'])).toBe('')
  })

  it('should escape fields properly', () => {
    const data = [{ name: 'Alice, Bob', formula: '=SUM(A1)' }]
    const csv = generateCsv(data, ['name', 'formula'])

    expect(csv).toBe('name,formula\r\n"Alice, Bob",\'=SUM(A1)')
  })

  it('should handle null values', () => {
    const data = [{ name: 'Alice', email: null }]
    const csv = generateCsv(data, ['name', 'email'])

    expect(csv).toBe('name,email\r\nAlice,')
  })

  it('should maintain field order', () => {
    const data = [{ c: 3, a: 1, b: 2 }]
    const csv = generateCsv(data, ['a', 'b', 'c'])

    expect(csv).toBe('a,b,c\r\n1,2,3')
  })
})

describe('formatDateForCsv', () => {
  it('should format Date objects as ISO strings', () => {
    const date = new Date('2024-01-15T12:30:00Z')
    expect(formatDateForCsv(date)).toBe('2024-01-15T12:30:00.000Z')
  })

  it('should format date strings as ISO strings', () => {
    const result = formatDateForCsv('2024-01-15T12:30:00Z')
    expect(result).toMatch(/2024-01-15T12:30:00/)
  })

  it('should return empty string for null', () => {
    expect(formatDateForCsv(null)).toBe('')
  })

  it('should handle invalid dates gracefully', () => {
    const result = formatDateForCsv('invalid-date')
    expect(result).toBe('Invalid Date')
  })
})

describe('formatBooleanForCsv', () => {
  it('should format true as "Yes"', () => {
    expect(formatBooleanForCsv(true)).toBe('Yes')
  })

  it('should format false as "No"', () => {
    expect(formatBooleanForCsv(false)).toBe('No')
  })

  it('should return empty string for null', () => {
    expect(formatBooleanForCsv(null)).toBe('')
  })

  it('should return empty string for undefined', () => {
    expect(formatBooleanForCsv(undefined as unknown as null)).toBe('')
  })
})

describe('createCsvFilename', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should create filename with timestamp by default', () => {
    vi.setSystemTime(new Date('2024-01-15T10:30:45Z'))

    const filename = createCsvFilename('subscribers')
    expect(filename).toMatch(/^subscribers-2024-01-15-\d{2}-\d{2}-\d{2}\.csv$/)
  })

  it('should create filename without timestamp when disabled', () => {
    const filename = createCsvFilename('subscribers', false)
    expect(filename).toBe('subscribers.csv')
  })

  it('should sanitize special characters', () => {
    const filename = createCsvFilename('My File! @#$', false)
    expect(filename).toBe('my-file.csv')
  })

  it('should convert to lowercase', () => {
    const filename = createCsvFilename('SubscribersList', false)
    expect(filename).toBe('subscriberslist.csv')
  })

  it('should handle multiple spaces and hyphens', () => {
    const filename = createCsvFilename('my   data---file', false)
    expect(filename).toBe('my-data-file.csv')
  })

  it('should remove leading/trailing hyphens', () => {
    const filename = createCsvFilename('--data--', false)
    expect(filename).toBe('data.csv')
  })
})
