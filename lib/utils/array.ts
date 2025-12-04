/**
 * Array Utilities
 *
 * Helper functions for array operations and transformations.
 */

/**
 * Convert comma-separated string to array of trimmed tags
 *
 * @param str - Comma-separated string
 * @returns Array of trimmed, non-empty strings
 *
 * @example
 * stringToTags('react, typescript, nextjs') // => ['react', 'typescript', 'nextjs']
 * stringToTags('  foo,  , bar  ') // => ['foo', 'bar']
 */
export function stringToTags(str: string): string[] {
  return str
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

/**
 * Convert array of tags to comma-separated string
 *
 * @param tags - Array of tags
 * @returns Comma-separated string
 *
 * @example
 * tagsToString(['react', 'typescript']) // => 'react, typescript'
 */
export function tagsToString(tags: string[]): string {
  return tags.join(', ');
}

/**
 * Convert comma-separated string to array (generic)
 *
 * @param str - Comma-separated string
 * @returns Array of trimmed strings
 *
 * @example
 * stringToArray('one, two, three') // => ['one', 'two', 'three']
 */
export function stringToArray(str: string): string[] {
  return stringToTags(str);
}

/**
 * Convert array to comma-separated string (generic)
 *
 * @param arr - Array of strings
 * @returns Comma-separated string
 *
 * @example
 * arrayToString(['one', 'two', 'three']) // => 'one, two, three'
 */
export function arrayToString(arr: string[]): string {
  return tagsToString(arr);
}

/**
 * Remove duplicates from array
 *
 * @param arr - Array with potential duplicates
 * @returns Array with unique values
 *
 * @example
 * unique([1, 2, 2, 3, 3, 4]) // => [1, 2, 3, 4]
 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/**
 * Chunk array into smaller arrays
 *
 * @param arr - Array to chunk
 * @param size - Size of each chunk
 * @returns Array of chunks
 *
 * @example
 * chunk([1, 2, 3, 4, 5], 2) // => [[1, 2], [3, 4], [5]]
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Shuffle array (Fisher-Yates algorithm)
 *
 * @param arr - Array to shuffle
 * @returns New shuffled array
 *
 * @example
 * shuffle([1, 2, 3, 4, 5]) // => [3, 1, 5, 2, 4] (random)
 */
export function shuffle<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Group array by key
 *
 * @param arr - Array to group
 * @param key - Key to group by
 * @returns Object with grouped items
 *
 * @example
 * groupBy([{type: 'a', val: 1}, {type: 'b', val: 2}, {type: 'a', val: 3}], 'type')
 * // => { a: [{type: 'a', val: 1}, {type: 'a', val: 3}], b: [{type: 'b', val: 2}] }
 */
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce(
    (acc, item) => {
      const groupKey = String(item[key]);
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
}

/**
 * Sort array by key
 *
 * @param arr - Array to sort
 * @param key - Key to sort by
 * @param order - Sort order ('asc' or 'desc')
 * @returns Sorted array
 *
 * @example
 * sortBy([{name: 'Bob', age: 30}, {name: 'Alice', age: 25}], 'age')
 * // => [{name: 'Alice', age: 25}, {name: 'Bob', age: 30}]
 */
export function sortBy<T>(
  arr: T[],
  key: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...arr].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Get random item from array
 *
 * @param arr - Array to pick from
 * @returns Random item or undefined if empty
 *
 * @example
 * randomItem([1, 2, 3, 4, 5]) // => 3 (random)
 */
export function randomItem<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Check if arrays are equal
 *
 * @param arr1 - First array
 * @param arr2 - Second array
 * @returns True if arrays contain same values in same order
 *
 * @example
 * arraysEqual([1, 2, 3], [1, 2, 3]) // => true
 * arraysEqual([1, 2], [2, 1]) // => false
 */
export function arraysEqual<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((val, index) => val === arr2[index]);
}
