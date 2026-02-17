/**
 * Formatting utility functions
 */

/**
 * Format lines of code from bytes
 */
export function formatLinesOfCode(bytes: number): string {
  // Estimate lines of code: average ~70 characters per line
  // Most code characters are 1 byte in UTF-8
  const estimatedLines = Math.round(bytes / 70);

  if (estimatedLines >= 1000000) {
    return `${(estimatedLines / 1000000).toFixed(1)}M`;
  } else if (estimatedLines >= 1000) {
    return `${(estimatedLines / 1000).toFixed(0)}k`;
  } else {
    return estimatedLines.toLocaleString();
  }
}

/**
 * Format number with locale string
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Format date
 */
export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions,
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', options);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals = 1): string {
  return value.toFixed(decimals);
}

/**
 * Escape XML/SVG special characters
 */
export function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
