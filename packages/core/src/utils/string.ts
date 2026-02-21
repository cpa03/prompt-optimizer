/*
 * Prompt Optimizer - AI提示词优化工具
 * Copyright (C) 2025 linshenkx
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * String Utilities Module
 * Centralized string manipulation functions to reduce code duplication
 * Flexy loves clean, modular code!
 */

/**
 * Regular expression patterns for common string operations
 */
export const STRING_PATTERNS = {
  TRAILING_SLASH: /\/$/,
  MULTIPLE_WHITESPACE: /\s+/g,
  JSON_CODE_BLOCK: /```json\s*([\s\S]*?)\s*```/i,
  ANY_CODE_BLOCK: /```\w*\s*([\s\S]*?)\s*```/g,
  HTML_ENTITY_DEC_HEX: /&#x([0-9a-fA-F]+);/g,
  HTML_ENTITY_DEC_DECIMAL: /&#(\d+);/g,
} as const

/**
 * HTML entity escape mappings
 */
const HTML_ENTITIES = {
  '&lt;': '<',
  '&gt;': '>',
  '&amp;': '&',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
  '&sol;': '/',
} as const

/**
 * Removes trailing slash from a URL or path string.
 * Useful for normalizing base URLs before appending paths.
 *
 * @param url - The URL or path to normalize
 * @returns The URL without trailing slash, or empty string if input is empty
 *
 * @example
 * ```typescript
 * normalizeBaseUrl('https://api.example.com/') // 'https://api.example.com'
 * normalizeBaseUrl('https://api.example.com') // 'https://api.example.com'
 * normalizeBaseUrl('') // ''
 * ```
 */
export function normalizeBaseUrl(url: string): string {
  if (!url) return ''
  return url.replace(STRING_PATTERNS.TRAILING_SLASH, '')
}

/**
 * Normalizes whitespace in a string by collapsing multiple spaces into single space.
 * Useful for text comparison and processing.
 *
 * @param text - The text to normalize
 * @returns Normalized text with single spaces
 *
 * @example
 * ```typescript
 * normalizeWhitespace('hello   world') // 'hello world'
 * ```
 */
export function normalizeWhitespace(text: string): string {
  return text.replace(STRING_PATTERNS.MULTIPLE_WHITESPACE, ' ').trim()
}

/**
 * Extracts JSON content from a fenced code block (```json ... ```).
 * Returns the first JSON code block found, or null if none exists.
 *
 * @param content - The content to search for JSON code block
 * @returns Extracted JSON string or null if not found
 *
 * @example
 * ```typescript
 * const text = 'Here is some JSON:\n```json\n{"key": "value"}\n```\nEnd'
 * extractJsonFromCodeBlock(text) // '{"key": "value"}'
 * ```
 */
export function extractJsonFromCodeBlock(content: string): string | null {
  const match = content.match(STRING_PATTERNS.JSON_CODE_BLOCK)
  return match ? match[1].trim() : null
}

/**
 * Unescapes HTML entities in a string.
 * Handles both named entities (&lt;, &gt;, etc.) and numeric entities (&#123;, &#x7B;).
 *
 * @param html - The HTML string with entities to unescape
 * @returns The unescaped string
 *
 * @example
 * ```typescript
 * unescapeHtmlEntities('&lt;div&gt;Hello &amp; World&lt;/div&gt;')
 * // '<div>Hello & World</div>'
 * ```
 */
export function unescapeHtmlEntities(html: string): string {
  let result = html
  
  // Replace named entities
  for (const [entity, char] of Object.entries(HTML_ENTITIES)) {
    result = result.split(entity).join(char)
  }
  
  // Replace hex decimal entities (&#x7B;)
  result = result.replace(
    STRING_PATTERNS.HTML_ENTITY_DEC_HEX,
    (_, hex) => String.fromCharCode(parseInt(hex, 16))
  )
  
  // Replace decimal entities (&#123;)
  result = result.replace(
    STRING_PATTERNS.HTML_ENTITY_DEC_DECIMAL,
    (_, dec) => String.fromCharCode(parseInt(dec, 10))
  )
  
  return result
}

/**
 * Safely converts unknown values to Error instances.
 * Reduces code duplication in error handling.
 *
 * @param error - The unknown value to convert
 * @returns An Error instance
 *
 * @example
 * ```typescript
 * try {
 *   await riskyOperation()
 * } catch (err) {
 *   const error = toError(err)
 *   console.error(error.message)
 * }
 * ```
 */
export function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}

/**
 * Normalizes a model name by removing common prefixes.
 * Useful for model ID normalization across different providers.
 *
 * @param modelName - The model name to normalize
 * @param prefix - The prefix to remove (e.g., 'models/')
 * @returns The normalized model name
 *
 * @example
 * ```typescript
 * normalizeModelName('models/gpt-4', 'models/') // 'gpt-4'
 * normalizeModelName('gpt-4', 'models/') // 'gpt-4'
 * ```
 */
export function normalizeModelName(modelName: string, prefix: string): string {
  if (!modelName) return ''
  return modelName.startsWith(prefix) ? modelName.slice(prefix.length) : modelName
}

/**
 * Checks if a string is empty or contains only whitespace.
 *
 * @param value - The string to check
 * @returns True if the string is empty or whitespace-only
 *
 * @example
 * ```typescript
 * isEmptyOrWhitespace('') // true
 * isEmptyOrWhitespace('   ') // true
 * isEmptyOrWhitespace('hello') // false
 * ```
 */
export function isEmptyOrWhitespace(value: string): boolean {
  return !value || value.trim().length === 0
}
