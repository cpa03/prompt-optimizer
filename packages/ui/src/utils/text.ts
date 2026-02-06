/**
 * Text utility functions
 * Centralizes text formatting and manipulation across the application
 */

/**
 * Truncate text to a maximum length with ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation (default: 60)
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number = 60): string {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Truncate text from the middle (useful for preserving file extensions or end markers)
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @param suffixLength - Number of characters to keep at the end (default: 10)
 * @returns Truncated text with middle ellipsis
 */
export function truncateMiddle(text: string, maxLength: number, suffixLength: number = 10): string {
  if (!text || text.length <= maxLength) return text
  const prefixLength = maxLength - suffixLength - 3 // 3 for "..."
  return text.slice(0, prefixLength) + '...' + text.slice(-suffixLength)
}

/**
 * Capitalize the first letter of a string
 * @param text - The text to capitalize
 * @returns Capitalized text
 */
export function capitalize(text: string): string {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Convert camelCase to Title Case with spaces
 * @param camelCase - camelCase string
 * @returns Title Case string
 */
export function camelToTitle(camelCase: string): string {
  if (!camelCase) return camelCase
  return camelCase
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

/**
 * Remove extra whitespace and normalize line breaks
 * @param text - The text to normalize
 * @returns Normalized text
 */
export function normalizeWhitespace(text: string): string {
  if (!text) return text
  return text.replace(/\s+/g, ' ').trim()
}
