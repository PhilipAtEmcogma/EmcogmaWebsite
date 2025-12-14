import { describe, it, expect } from 'vitest'
import { cn } from '../cn'

describe('cn utility', () => {
  it('should merge class names', () => {
    expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500')
  })

  it('should handle conditional classes', () => {
    expect(cn('base-class', true && 'active', false && 'inactive')).toBe(
      'base-class active'
    )
  })

  it('should handle Tailwind conflicts correctly', () => {
    // Later class should override earlier one
    expect(cn('px-2', 'px-4')).toBe('px-4')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('should handle arrays of classes', () => {
    expect(cn(['text-red-500', 'bg-blue-500'])).toBe('text-red-500 bg-blue-500')
  })

  it('should handle objects with boolean values', () => {
    expect(
      cn({
        'text-red-500': true,
        'bg-blue-500': false,
        'p-4': true,
      })
    ).toBe('text-red-500 p-4')
  })

  it('should handle mixed inputs', () => {
    expect(
      cn('base', ['array-1', 'array-2'], { conditional: true }, 'final')
    ).toBe('base array-1 array-2 conditional final')
  })

  it('should handle empty inputs', () => {
    expect(cn()).toBe('')
    expect(cn('')).toBe('')
    expect(cn(undefined, null, false)).toBe('')
  })

  it('should deduplicate identical classes', () => {
    expect(cn('text-red-500', 'text-red-500')).toBe('text-red-500')
  })

  it('should handle complex Tailwind merging', () => {
    // Test responsive variants
    expect(cn('px-2 md:px-4', 'px-3')).toBe('md:px-4 px-3')

    // Test hover states
    expect(cn('text-red-500 hover:text-blue-500', 'text-green-500')).toBe(
      'hover:text-blue-500 text-green-500'
    )
  })
})
