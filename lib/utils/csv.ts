/**
 * CSV Generation Utilities
 *
 * Secure CSV generation with proper escaping and sanitization.
 * Prevents CSV injection attacks.
 */

/**
 * Escape CSV field value to prevent injection attacks
 *
 * CSV Injection Prevention:
 * - Prefix dangerous characters with single quote
 * - Wrap in quotes if contains comma, quote, or newline
 * - Escape existing quotes
 */
export function escapeCsvField(field: unknown): string {
  if (field === null || field === undefined) {
    return '';
  }

  let value = String(field);

  // CSV Injection Prevention: Escape leading dangerous characters
  // =, +, -, @ can trigger formula execution in Excel
  const dangerousChars = ['=', '+', '-', '@', '\t', '\r'];
  if (dangerousChars.some((char) => value.startsWith(char))) {
    value = "'" + value; // Single quote prefix prevents formula execution
  }

  // Escape double quotes by doubling them
  value = value.replace(/"/g, '""');

  // Wrap in quotes if contains comma, quote, newline, or carriage return
  if (
    value.includes(',') ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r')
  ) {
    value = `"${value}"`;
  }

  return value;
}

/**
 * Generate CSV content from array of objects
 *
 * @param data - Array of objects to convert to CSV
 * @param fields - Array of field names to include (in order)
 * @param headers - Optional custom headers (defaults to field names)
 * @returns CSV string
 */
export function generateCsv<T extends Record<string, unknown>>(
  data: T[],
  fields: (keyof T)[],
  headers?: string[]
): string {
  if (data.length === 0) {
    return '';
  }

  const csvHeaders = headers || fields.map((f) => String(f));
  const rows: string[] = [];

  // Add header row
  rows.push(csvHeaders.map(escapeCsvField).join(','));

  // Add data rows
  for (const record of data) {
    const row = fields.map((field) => escapeCsvField(record[field]));
    rows.push(row.join(','));
  }

  // Join with CRLF (standard CSV line ending)
  return rows.join('\r\n');
}

/**
 * Format date for CSV export
 */
export function formatDateForCsv(date: string | Date | null): string {
  if (!date) return '';

  const d = typeof date === 'string' ? new Date(date) : date;

  // ISO format is safest for CSV (no locale issues)
  return d.toISOString();
}

/**
 * Format boolean for CSV export
 */
export function formatBooleanForCsv(value: boolean | null): string {
  if (value === null || value === undefined) return '';
  return value ? 'Yes' : 'No';
}

/**
 * Create secure filename for CSV download
 *
 * @param baseName - Base name for the file
 * @param timestamp - Include timestamp (default: true)
 * @returns Safe filename
 */
export function createCsvFilename(
  baseName: string,
  timestamp: boolean = true
): string {
  // Sanitize base name (remove special characters)
  const safeName = baseName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (timestamp) {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    return `${safeName}-${dateStr}-${timeStr}.csv`;
  }

  return `${safeName}.csv`;
}
