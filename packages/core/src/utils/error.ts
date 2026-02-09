import type { ErrorParams } from '../constants/error-codes'

type RecordLike = Record<string, unknown>

export type StructuredErrorLike = {
  code: string
  params?: ErrorParams
  message?: string
  name?: string
  stack?: string
}

function isRecord(value: unknown): value is RecordLike {
  return typeof value === 'object' && value !== null
}

export function isStructuredErrorLike(value: unknown): value is StructuredErrorLike {
  return isRecord(value) && typeof value.code === 'string'
}

/**
 * Normalize unknown values into an Error instance while preserving `{ code, params }`
 * when available (e.g., errors crossing IPC boundaries).
 */
export function toErrorWithCode(value: unknown, fallbackMessage = 'Unknown error'): Error & Partial<StructuredErrorLike> {
  if (value instanceof Error) {
    return value as Error & Partial<StructuredErrorLike>
  }

  if (isStructuredErrorLike(value)) {
    const code = value.code
    const message =
      typeof value.message === 'string' && value.message.trim()
        ? value.message
        : `[${code}]`

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
 * Safely extract error message from unknown error type
 * Eliminates repetitive: error instanceof Error ? error.message : String(error)
 * Flexy loves modularity! One utility to rule them all.
 * 
 * @param error - The error to extract message from
 * @param fallback - Fallback message if extraction fails (default: 'Unknown error')
 * @returns The error message string
 * 
 * @example
 * ```typescript
 * try {
 *   await someOperation();
 * } catch (error) {
 *   // OLD: const message = error instanceof Error ? error.message : String(error);
 *   // NEW: 
 *   const message = extractErrorMessage(error, 'Operation failed');
 *   console.error(message);
 * }
 * ```
 */
export function extractErrorMessage(error: unknown, fallback = 'Unknown error'): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return fallback;
}

/**
 * Extract error stack trace safely
 * @param error - The error to extract stack from
 * @returns The stack trace string or undefined
 */
export function extractErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack;
  }
  return undefined;
}

/**
 * Check if error is a specific type
 * @param error - The error to check
 * @param errorClass - The error class to check against
 * @returns Boolean indicating if error is of the specified type
 */
export function isErrorOfType<T extends Error>(
  error: unknown,
  errorClass: new (...args: unknown[]) => T
): error is T {
  return error instanceof errorClass;
}

/**
 * Create error with consistent formatting
 * @param message - Error message
 * @param code - Optional error code
 * @param cause - Optional cause error
 * @returns Formatted Error object
 */
export function createError(message: string, code?: string, cause?: unknown): Error {
  const error = new Error(message);
  if (code) {
    (error as Error & { code: string }).code = code;
  }
  if (cause) {
    (error as Error & { cause: unknown }).cause = cause;
  }
  return error;
}

// Export error utilities namespace for convenient access
export const ERROR_UTILS = {
  extractMessage: extractErrorMessage,
  extractStack: extractErrorStack,
  isType: isErrorOfType,
  create: createError,
} as const;

