import type { ErrorParams } from '../constants/error-codes'

/**
 * Represents a record-like object with string keys and unknown values.
 * Used for type-safe property access on unknown values.
 */
type RecordLike = Record<string, unknown>

/**
 * Error options for error chaining support
 * Compatible with ES2022+ ErrorOptions for forward compatibility
 */
export interface ErrorOptionsWithCause {
  cause?: unknown
}

/**
 * Sets the cause property on an error for error chaining
 * @param error - The error to set the cause on
 * @param cause - The underlying cause of the error
 */
export function setErrorCause(error: Error, cause: unknown): void {
  if (cause !== undefined) {
    ;(error as any).cause = cause
  }
}

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
export function isRecord(value: unknown): value is RecordLike {
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

/**
 * Base error class for all application errors.
 * Provides structured error handling with error codes, parameters, and cause chaining.
 *
 * @example
 * ```typescript
 * class MyCustomError extends BaseError {
 *   constructor(message: string, cause?: Error) {
 *     super('ERROR_CODE', message, undefined, { cause })
 *   }
 * }
 * ```
 */
export class BaseError extends Error {
  public readonly code: string
  public readonly params?: ErrorParams

  constructor(
    code: string,
    message?: string,
    params?: ErrorParams,
    options?: ErrorOptionsWithCause
  ) {
    super(message ? `[${code}] ${message}` : `[${code}]`)
    this.name = this.constructor.name
    this.code = code
    this.params = params ?? (message ? { details: message } : undefined)
    Object.setPrototypeOf(this, new.target.prototype)
    setErrorCause(this, options?.cause)
  }
}

export const RETRYABLE_ERROR_CODES = new Set([
  'ECONNRESET',
  'ECONNREFUSED',
  'ENOTFOUND',
  'ENETDOWN',
  'ENETUNREACH',
  'ETIMEDOUT',
  'EHOSTUNREACH',
  'EAI_AGAIN',
  'UND_ERR_SOCKET',
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_HEADERS_TIMEOUT',
  'UND_ERR_BODY_TIMEOUT',
  'UND_ERR_RESPONSE_STATE_TIMEOUT',
  'UND_ERR_SOCKET_TIMEOUT',
])

export const RETRYABLE_STATUS_RANGES: Array<{ start: number; end: number }> = [
  { start: 408, end: 408 },
  { start: 429, end: 429 },
  { start: 500, end: 599 },
]

export interface ErrorClassification {
  category: 'network' | 'timeout' | 'rate_limit' | 'server' | 'client' | 'unknown'
  isRetryable: boolean
  isNetworkError: boolean
  isTimeout: boolean
  isRateLimited: boolean
  isServerError: boolean
  statusCode?: number
  errorCode?: string
}

export function classifyError(error: unknown): ErrorClassification {
  const result: ErrorClassification = {
    category: 'unknown',
    isRetryable: false,
    isNetworkError: false,
    isTimeout: false,
    isRateLimited: false,
    isServerError: false,
  }

  if (!error) {
    return result
  }

  const err = error instanceof Error ? error : new Error(String(error))
  const errorCode = (err as any).code
  const statusCode = (err as any).status ?? (err as any).statusCode
  const message = err.message.toLowerCase()

  result.errorCode = errorCode
  result.statusCode = statusCode

  if (errorCode && RETRYABLE_ERROR_CODES.has(errorCode)) {
    result.isNetworkError = true
    result.isRetryable = true
    if (errorCode === 'ETIMEDOUT' || errorCode.includes('TIMEOUT')) {
      result.category = 'timeout'
      result.isTimeout = true
    } else {
      result.category = 'network'
    }
    return result
  }

  if (typeof statusCode === 'number' && statusCode >= 100 && statusCode < 600) {
    if (statusCode === 429) {
      result.category = 'rate_limit'
      result.isRateLimited = true
      result.isRetryable = true
      return result
    }

    if (statusCode === 408) {
      result.category = 'timeout'
      result.isTimeout = true
      result.isRetryable = true
      return result
    }

    if (statusCode >= 500 && statusCode < 600) {
      result.category = 'server'
      result.isServerError = true
      result.isRetryable = true
      return result
    }

    if (statusCode >= 400 && statusCode < 500) {
      result.category = 'client'
      return result
    }
  }

  const timeoutPatterns = ['timeout', 'timed out', 'etimedout']

  for (const pattern of timeoutPatterns) {
    if (message.includes(pattern)) {
      result.isTimeout = true
      result.isRetryable = true
      result.category = 'timeout'
      return result
    }
  }

  const networkPatterns = [
    'network',
    'econnreset',
    'econnrefused',
    'enotfound',
    'enetdown',
    'enetunreach',
    'socket hang up',
    'socket error',
    'connection reset',
    'connection refused',
    'getaddrinfo',
    'dns',
  ]

  for (const pattern of networkPatterns) {
    if (message.includes(pattern)) {
      result.isNetworkError = true
      result.isRetryable = true
      result.category = 'network'
      return result
    }
  }

  const rateLimitPatterns = ['rate limit', 'too many requests', '429', 'throttl']

  for (const pattern of rateLimitPatterns) {
    if (message.includes(pattern)) {
      result.isRateLimited = true
      result.isRetryable = true
      result.category = 'rate_limit'
      return result
    }
  }

  return result
}

export function isRetryableError(error: unknown): boolean {
  if (!error) {
    return false
  }

  const classification = classifyError(error)
  return classification.isRetryable
}
