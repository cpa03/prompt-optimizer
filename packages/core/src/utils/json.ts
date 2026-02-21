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

/**
 * Pattern for sensitive field names that should be redacted.
 * Matches common naming conventions for sensitive data fields.
 */
const SENSITIVE_FIELD_PATTERN =
  /^(?:api[-_]?key|apikey|secret[-_]?key|secret|password|passwd|token|access[-_]?token|refresh[-_]?token|auth[-_]?token|bearer|authorization|credential|private[-_]?key|api[-_]?secret|client[-_]?secret)$/i

const REDACTED_PLACEHOLDER = '[REDACTED]'

function isSensitiveField(key: string): boolean {
  return SENSITIVE_FIELD_PATTERN.test(key)
}

/**
 * Redacts sensitive fields from an object for safe logging or error messages.
 * This prevents accidental exposure of API keys, tokens, passwords, and other
 * sensitive data in logs and error messages.
 *
 * @param obj - The object to redact
 * @param maxDepth - Maximum recursion depth (default: 5, prevents stack overflow)
 * @returns A new object with sensitive values replaced by [REDACTED]
 *
 * @example
 * ```typescript
 * const config = { apiKey: 'sk-secret-123', model: 'gpt-4' }
 * const safe = redactSensitiveFields(config)
 * // { apiKey: '[REDACTED]', model: 'gpt-4' }
 *
 * // Use for safe error messages
 * throw new APIError(`API error: ${JSON.stringify(redactSensitiveFields(error.response.data))}`)
 * ```
 */
export function redactSensitiveFields<T>(obj: T, maxDepth: number = 5): T {
  if (maxDepth <= 0) {
    return obj
  }

  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactSensitiveFields(item, maxDepth - 1)) as T
  }

  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (isSensitiveField(key)) {
      result[key] = REDACTED_PLACEHOLDER
    } else if (typeof value === 'object' && value !== null) {
      result[key] = redactSensitiveFields(value, maxDepth - 1)
    } else {
      result[key] = value
    }
  }

  return result as T
}

/**
 * Options for safe JSON stringification
 */
export interface SafeStringifyOptions {
  /**
   * Maximum size in bytes for the resulting JSON string.
   * If exceeded, null is returned. Default: 50MB (50 * 1024 * 1024)
   */
  maxSize?: number
  /**
   * Placeholder for circular references. Default: '[Circular]'
   */
  circularPlaceholder?: string
  /**
   * Whether to redact sensitive fields before stringification.
   * Default: false
   */
  redactSensitive?: boolean
}

const DEFAULT_MAX_SIZE = 50 * 1024 * 1024

/**
 * Safely stringifies a value to JSON, handling circular references and size limits.
 *
 * This function provides protection against:
 * 1. Circular reference errors that crash JSON.stringify
 * 2. Memory exhaustion from serializing extremely large objects
 * 3. Accidental exposure of sensitive data in logs
 *
 * @param obj - The value to stringify
 * @param options - Configuration options
 * @returns The JSON string, or null if size limit exceeded or unrecoverable error
 *
 * @example
 * ```typescript
 * // Handle circular references
 * const obj = { a: 1 }
 * obj.self = obj
 * const safe = safeStringify(obj)
 * // '{"a":1,"self":"[Circular]"}'
 *
 * // With size limit
 * const largeData = { items: new Array(1000000).fill('x') }
 * const result = safeStringify(largeData, { maxSize: 1024 })
 * // null (size limit exceeded)
 *
 * // With sensitive field redaction
 * const config = { apiKey: 'secret', model: 'gpt-4' }
 * const safe = safeStringify(config, { redactSensitive: true })
 * // '{"apiKey":"[REDACTED]","model":"gpt-4"}'
 * ```
 */
export function safeStringify<T>(obj: T, options?: SafeStringifyOptions): string | null {
  const maxSize = options?.maxSize ?? DEFAULT_MAX_SIZE
  const circularPlaceholder = options?.circularPlaceholder ?? '[Circular]'

  const processedObj = options?.redactSensitive ? redactSensitiveFields(obj) : obj

  const seen = new WeakSet<object>()

  try {
    const result = JSON.stringify(processedObj, (_key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return circularPlaceholder
        }
        seen.add(value)
      }
      return value
    })

    if (result !== null && result.length > maxSize) {
      console.warn(
        `[safeStringify] Result size ${result.length} exceeds limit ${maxSize}, returning null`
      )
      return null
    }

    return result
  } catch (error) {
    console.error('[safeStringify] Failed to stringify:', error)
    return null
  }
}

/**
 * Safely stringifies a value to JSON with a fallback for errors.
 * Returns the fallback string instead of null on failure.
 *
 * @param obj - The value to stringify
 * @param fallback - The fallback string to return on error (default: '{}')
 * @param options - Configuration options
 * @returns The JSON string or fallback
 *
 * @example
 * ```typescript
 * const result = safeStringifyOrFallback(circularObj, '{"error":"circular"}')
 * // '{"error":"circular"}' if serialization fails
 * ```
 */
export function safeStringifyOrFallback<T>(
  obj: T,
  fallback: string = '{}',
  options?: SafeStringifyOptions
): string {
  return safeStringify(obj, options) ?? fallback
}
