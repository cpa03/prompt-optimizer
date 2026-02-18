/**
 * Safe JSON Utilities
 *
 * Provides secure JSON parsing with protection against prototype pollution attacks.
 * Prototype pollution is a security vulnerability that allows attackers to modify
 * the prototype of base JavaScript objects, potentially leading to:
 * - Authentication bypass
 * - Remote code execution
 * - Denial of service
 *
 * @see https://owasp.org/www-community/vulnerabilities/Prototype_Pollution
 */

/**
 * Dangerous prototype property keys that should never be assigned to.
 * These keys can modify JavaScript's built-in prototypes.
 */
const DANGEROUS_KEYS = new Set(['__proto__', 'prototype', 'constructor'])

/**
 * Reviver function that prevents prototype pollution by blocking dangerous keys.
 * This is used as the second argument to JSON.parse() to sanitize the parsed object.
 *
 * @param key - The current property key being parsed
 * @param value - The value associated with the key
 * @returns The value if safe, or undefined if the key is dangerous
 *
 * @example
 * ```typescript
 * const safe = JSON.parse(userInput, safeJsonReviver)
 * ```
 */
function safeJsonReviver(key: string, value: unknown): unknown {
  if (DANGEROUS_KEYS.has(key)) {
    return undefined
  }
  return value
}

/**
 * Options for safe JSON parsing
 */
export interface SafeJsonParseOptions {
  /**
   * Custom reviver function to apply in addition to prototype pollution protection.
   * The safe reviver will be applied first, then the custom reviver.
   */
  reviver?: (key: string, value: unknown) => unknown
}

/**
 * Safely parses a JSON string with protection against prototype pollution attacks.
 *
 * This function wraps JSON.parse() with a reviver that blocks assignment to
 * dangerous prototype keys (__proto__, prototype, constructor). This prevents
 * attackers from injecting malicious code through specially crafted JSON payloads.
 *
 * @param text - The JSON string to parse
 * @param options - Optional configuration including custom reviver
 * @returns The parsed and sanitized JavaScript value
 * @throws SyntaxError if the string is not valid JSON
 *
 * @example
 * ```typescript
 * // Safe parsing - prototype pollution is blocked
 * const result = safeJsonParse('{"__proto__": {"admin": true}, "name": "user"}')
 * // result.__proto__ will be undefined, not the polluted prototype
 *
 * // With custom reviver
 * const withDates = safeJsonParse(jsonString, {
 *   reviver: (key, value) => {
 *     if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
 *       return new Date(value)
 *     }
 *     return value
 *   }
 * })
 * ```
 */
export function safeJsonParse<T = unknown>(text: string, options?: SafeJsonParseOptions): T {
  let result: unknown

  if (options?.reviver) {
    // Combine safe reviver with custom reviver
    // Safe reviver runs first to block dangerous keys
    result = JSON.parse(text, (key, value) => {
      const safeValue = safeJsonReviver(key, value)
      if (safeValue === undefined) {
        return undefined
      }
      return options.reviver!(key, safeValue)
    })
  } else {
    result = JSON.parse(text, safeJsonReviver)
  }

  return result as T
}

/**
 * Safely parses a JSON string, returning null instead of throwing on error.
 * Also includes prototype pollution protection.
 *
 * @param text - The JSON string to parse
 * @param options - Optional configuration including custom reviver
 * @returns The parsed value or null if parsing failed
 *
 * @example
 * ```typescript
 * const result = safeJsonParseNullish('{"valid": true}')
 * // result: { valid: true }
 *
 * const invalid = safeJsonParseNullish('not json')
 * // invalid: null
 * ```
 */
export function safeJsonParseNullish<T = unknown>(
  text: string,
  options?: SafeJsonParseOptions
): T | null {
  try {
    return safeJsonParse<T>(text, options)
  } catch {
    return null
  }
}

/**
 * Checks if a key is considered dangerous for prototype pollution.
 * Useful for validating object keys before assignment.
 *
 * @param key - The key to check
 * @returns true if the key is potentially dangerous
 */
export function isDangerousKey(key: string): boolean {
  return DANGEROUS_KEYS.has(key)
}

/**
 * Recursively removes dangerous keys from an object.
 * Use this to sanitize objects that may have been parsed without protection.
 *
 * @param obj - The object to sanitize
 * @returns A new object with dangerous keys removed
 *
 * @example
 * ```typescript
 * const unsafe = JSON.parse(userInput)
 * const safe = sanitizeObject(unsafe)
 * ```
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as T
  }

  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (!DANGEROUS_KEYS.has(key)) {
      result[key] = sanitizeObject(value)
    }
  }

  return result as T
}
