import { describe, it, expect, vi } from 'vitest'
import {
  stringToTags,
  tagsToString,
  stringToArray,
  arrayToString,
  unique,
  chunk,
  shuffle,
  groupBy,
  sortBy,
  randomItem,
  arraysEqual,
} from '../array'

describe('stringToTags', () => {
  it('should convert comma-separated string to array', () => {
    expect(stringToTags('react, typescript, nextjs')).toEqual([
      'react',
      'typescript',
      'nextjs',
    ])
  })

  it('should trim whitespace', () => {
    expect(stringToTags('  foo  ,  bar  ')).toEqual(['foo', 'bar'])
  })

  it('should filter empty strings', () => {
    expect(stringToTags('foo, , bar')).toEqual(['foo', 'bar'])
  })

  it('should handle empty string', () => {
    expect(stringToTags('')).toEqual([''])
  })
})

describe('tagsToString', () => {
  it('should convert array to comma-separated string', () => {
    expect(tagsToString(['react', 'typescript'])).toBe('react, typescript')
  })

  it('should handle empty array', () => {
    expect(tagsToString([])).toBe('')
  })

  it('should handle single item', () => {
    expect(tagsToString(['react'])).toBe('react')
  })
})

describe('stringToArray and arrayToString', () => {
  it('should be aliases for tag functions', () => {
    const str = 'one, two, three'
    const arr = ['one', 'two', 'three']

    expect(stringToArray(str)).toEqual(['one', 'two', 'three'])
    expect(arrayToString(arr)).toBe('one, two, three')
  })
})

describe('unique', () => {
  it('should remove duplicates', () => {
    expect(unique([1, 2, 2, 3, 3, 4])).toEqual([1, 2, 3, 4])
  })

  it('should handle strings', () => {
    expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c'])
  })

  it('should handle empty array', () => {
    expect(unique([])).toEqual([])
  })

  it('should preserve order of first occurrence', () => {
    expect(unique([3, 1, 2, 1, 3])).toEqual([3, 1, 2])
  })
})

describe('chunk', () => {
  it('should split array into chunks', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
  })

  it('should handle even splits', () => {
    expect(chunk([1, 2, 3, 4], 2)).toEqual([
      [1, 2],
      [3, 4],
    ])
  })

  it('should handle chunk size larger than array', () => {
    expect(chunk([1, 2], 5)).toEqual([[1, 2]])
  })

  it('should handle empty array', () => {
    expect(chunk([], 2)).toEqual([])
  })

  it('should handle chunk size of 1', () => {
    expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]])
  })
})

describe('shuffle', () => {
  it('should return array with same length', () => {
    const arr = [1, 2, 3, 4, 5]
    const shuffled = shuffle(arr)
    expect(shuffled).toHaveLength(arr.length)
  })

  it('should contain same elements', () => {
    const arr = [1, 2, 3, 4, 5]
    const shuffled = shuffle(arr)
    expect(shuffled.sort()).toEqual(arr.sort())
  })

  it('should not modify original array', () => {
    const arr = [1, 2, 3, 4, 5]
    const original = [...arr]
    shuffle(arr)
    expect(arr).toEqual(original)
  })

  it('should handle empty array', () => {
    expect(shuffle([])).toEqual([])
  })

  it('should produce different results (probabilistic)', () => {
    // Mock Math.random for deterministic testing
    const mockRandom = vi.spyOn(Math, 'random')
    mockRandom.mockReturnValueOnce(0.5).mockReturnValueOnce(0.3)

    const arr = [1, 2, 3, 4, 5]
    const shuffled = shuffle(arr)

    // With controlled random, should produce different order
    expect(shuffled).not.toEqual(arr)

    mockRandom.mockRestore()
  })
})

describe('groupBy', () => {
  it('should group objects by key', () => {
    const items = [
      { type: 'a', val: 1 },
      { type: 'b', val: 2 },
      { type: 'a', val: 3 },
    ]

    expect(groupBy(items, 'type')).toEqual({
      a: [
        { type: 'a', val: 1 },
        { type: 'a', val: 3 },
      ],
      b: [{ type: 'b', val: 2 }],
    })
  })

  it('should handle empty array', () => {
    expect(groupBy([], 'key' as never)).toEqual({})
  })

  it('should handle single group', () => {
    const items = [{ cat: 'x' }, { cat: 'x' }]
    expect(groupBy(items, 'cat')).toEqual({
      x: [{ cat: 'x' }, { cat: 'x' }],
    })
  })
})

describe('sortBy', () => {
  it('should sort by key ascending', () => {
    const items = [
      { name: 'Bob', age: 30 },
      { name: 'Alice', age: 25 },
      { name: 'Charlie', age: 35 },
    ]

    expect(sortBy(items, 'age')).toEqual([
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 30 },
      { name: 'Charlie', age: 35 },
    ])
  })

  it('should sort by key descending', () => {
    const items = [
      { name: 'Bob', age: 30 },
      { name: 'Alice', age: 25 },
    ]

    expect(sortBy(items, 'age', 'desc')).toEqual([
      { name: 'Bob', age: 30 },
      { name: 'Alice', age: 25 },
    ])
  })

  it('should sort strings alphabetically', () => {
    const items = [{ name: 'Charlie' }, { name: 'Alice' }, { name: 'Bob' }]

    expect(sortBy(items, 'name')).toEqual([
      { name: 'Alice' },
      { name: 'Bob' },
      { name: 'Charlie' },
    ])
  })

  it('should not modify original array', () => {
    const items = [{ val: 2 }, { val: 1 }]
    const original = [...items]
    sortBy(items, 'val')
    expect(items).toEqual(original)
  })

  it('should handle empty array', () => {
    expect(sortBy([], 'key' as never)).toEqual([])
  })
})

describe('randomItem', () => {
  it('should return an item from array', () => {
    const arr = [1, 2, 3, 4, 5]
    const item = randomItem(arr)
    expect(arr).toContain(item)
  })

  it('should return undefined for empty array', () => {
    expect(randomItem([])).toBeUndefined()
  })

  it('should return only item for single-item array', () => {
    expect(randomItem([42])).toBe(42)
  })

  it('should use Math.random', () => {
    const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const arr = [1, 2, 3, 4]

    randomItem(arr)
    expect(mockRandom).toHaveBeenCalled()

    mockRandom.mockRestore()
  })
})

describe('arraysEqual', () => {
  it('should return true for equal arrays', () => {
    expect(arraysEqual([1, 2, 3], [1, 2, 3])).toBe(true)
    expect(arraysEqual(['a', 'b'], ['a', 'b'])).toBe(true)
  })

  it('should return false for different arrays', () => {
    expect(arraysEqual([1, 2, 3], [1, 2, 4])).toBe(false)
    expect(arraysEqual([1, 2], [2, 1])).toBe(false)
  })

  it('should return false for different lengths', () => {
    expect(arraysEqual([1, 2], [1, 2, 3])).toBe(false)
  })

  it('should return true for empty arrays', () => {
    expect(arraysEqual([], [])).toBe(true)
  })

  it('should handle single-element arrays', () => {
    expect(arraysEqual([1], [1])).toBe(true)
    expect(arraysEqual([1], [2])).toBe(false)
  })
})
