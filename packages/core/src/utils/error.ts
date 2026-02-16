import type { ErrorParams } from '../constants/error-codes'

/**
 * Represents a record-like object with string keys and unknown values.
 * Used for type-safe property access on unknown values.
 */
type RecordLike = Record<string, unknown>

/**
 * Interface for structured errors that include error codes and parameters.
 * Used for consistent error handling across the application.
 */
export interface StructuredErrorLike {
  /** Error code for programmatic handling */
  code: string
  /** Optional parameters for error message formatting */
  params?: ErrorParams
  /** Human-readable error message */
  message?: string
  /** Error name/type */
  name?: string
  /** Stack trace for debugging */
  stack?: string
}

/**
 * Type guard to check if a value is a record-like object.
 * @param value - The value to check
 * @returns True if the value is a non-null object
 */
function isRecord(value: unknown): value is RecordLike {
  return typeof value === 'object' && value !== null
}

/**
 * Type guard to check if a value matches the StructuredErrorLike interface.
 * Used to identify errors that already have structured error information.
 *
 * @param value - The value to check
 * @returns True if the value has a string `code` property
 *
 * @example
 * ```typescript
 * try {
 *   await someOperation()
 * } catch (err) {
 *   if (isStructuredErrorLike(err)) {
 *     console.error(`Error ${err.code}:`, err.message)
 *   }
 * }
 * ```
 */
export function isStructuredErrorLike(value: unknown): value is StructuredErrorLike {
  return isRecord(value) && typeof value.code === 'string'
}

/**
 * Normalizes unknown values into an Error instance while preserving structured error
 * information (code, params) when available. This is particularly useful for errors
 * crossing IPC boundaries or coming from external sources.
 *
 * @param value - The unknown value to convert to an Error
 * @param fallbackMessage - Message to use if value cannot be converted meaningfully
 * @returns An Error instance with optional code and params properties
 *
 * @example
 * ```typescript
 * try {
 *   await riskyOperation()
 * } catch (err) {
 *   const error = toErrorWithCode(err, 'Operation failed')
 *   console.error(error.code || 'UNKNOWN', error.message)
 * }
 * ```
 */
export function toErrorWithCode(
  value: unknown,
  fallbackMessage = 'Unknown error'
): Error & Partial<StructuredErrorLike> {
  if (value instanceof Error) {
    return value as Error & Partial<StructuredErrorLike>
  }

  if (isStructuredErrorLike(value)) {
    const code = value.code
    const message =
      typeof value.message === 'string' && value.message.trim() ? value.message : `[${code}]`

    const err = new Error(message) as Error & Partial<StructuredErrorLike>
    err.name = typeof value.name === 'string' ? value.name : 'Error'
    err.code = code
    if (isRecord(value.params)) {
      err.params = value.params as ErrorParams
    }
    if (typeof value.stack === 'string') {
      err.stack = value.stack
    }
    return err
  }

  if (typeof value === 'string') {
    return new Error(value)
  }

  if (value === null || value === undefined) {
    return new Error(fallbackMessage)
  }

  return new Error(String(value))
}
