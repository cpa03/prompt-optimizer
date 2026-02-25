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
 * Retry Utility Module
 * Provides centralized retry logic with exponential backoff and timeout handling
 * for improved reliability across API calls and network operations.
 */

import { TIMEOUTS } from '../config/timeouts'

/**
 * Error with additional properties that may be present from various sources
 * (Node.js errors, fetch errors, HTTP errors, etc.)
 */
interface ErrorWithStatus {
  code?: string
  status?: number
  statusCode?: number
}

/**
 * Type guard to check if an error has status properties
 * @param error - The error to check
 * @returns True if the error has status-related properties
 */
function hasStatusProperties(error: unknown): error is ErrorWithStatus {
  if (typeof error !== 'object' || error === null) {
    return false
  }
  const err = error as Record<string, unknown>
  return (
    typeof err.code === 'string' ||
    typeof err.status === 'number' ||
    typeof err.statusCode === 'number'
  )
}

export interface RetryOptions {
  maxAttempts?: number
  baseDelayMs?: number
  maxDelayMs?: number
  timeoutMs?: number
  retryableErrors?: string[]
  onRetry?: (attempt: number, error: Error, delayMs: number) => void
}

const DEFAULT_RETRYABLE_ERRORS = [
  'ECONNRESET',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'ENOTFOUND',
  'EAI_AGAIN',
  'EHOSTUNREACH',
  'ENETUNREACH',
  'ENETDOWN',
  'EPIPE',
  'UND_ERR_SOCKET',
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_HEADERS_TIMEOUT',
  'UND_ERR_BODY_TIMEOUT',
  'UND_ERR_RESPONSE_TIMEOUT',
  'UND_ERR_RESPONSE_STATE_TIMEOUT',
  'UND_ERR_SOCKET_TIMEOUT',
  'fetch failed',
]

const DEFAULT_RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504]

/**
 * LLM-specific retryable errors
 * Includes rate limiting, overload, and timeout patterns common in LLM APIs
 */
export const LLM_RETRYABLE_ERRORS = [
  'rate_limit',
  'rate limit',
  'overloaded',
  'overload',
  'timeout',
  'timed out',
  'ECONNRESET',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'ENOTFOUND',
  'EAI_AGAIN',
  'fetch failed',
  'network error',
]

/**
 * Image API-specific retryable errors
 * Extends LLM errors with server-side errors common in image generation APIs
 */
export const IMAGE_RETRYABLE_ERRORS = [
  ...LLM_RETRYABLE_ERRORS,
  'internal error',
  'server error',
  'service unavailable',
]

function isRetryableError(error: unknown, customRetryableErrors: string[]): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  const errorCode = hasStatusProperties(error) ? error.code : undefined
  const errorName = error.name
  const errorMessage = error.message.toLowerCase()
  const status = hasStatusProperties(error) ? (error.status ?? error.statusCode) : undefined

  if (DEFAULT_RETRYABLE_STATUS_CODES.includes(status)) {
    return true
  }

  const allRetryableErrors = [...DEFAULT_RETRYABLE_ERRORS, ...customRetryableErrors]
  for (const retryable of allRetryableErrors) {
    if (
      errorCode === retryable ||
      errorName === retryable ||
      errorMessage.includes(retryable.toLowerCase())
    ) {
      return true
    }
  }

  return false
}

function calculateDelay(attempt: number, baseDelayMs: number, maxDelayMs: number): number {
  const exponentialDelay = baseDelayMs * Math.pow(2, attempt - 1)
  const jitter = Math.random() * 0.3 * exponentialDelay
  return Math.min(exponentialDelay + jitter, maxDelayMs)
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function createTimeoutSignal(timeoutMs: number): {
  signal: AbortSignal
  cleanup: () => void
} {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort(new Error(`Operation timed out after ${timeoutMs}ms`))
  }, timeoutMs)

  return {
    signal: controller.signal,
    cleanup: () => clearTimeout(timeoutId),
  }
}

export class TimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Operation timed out after ${timeoutMs}ms`)
    this.name = 'TimeoutError'
  }
}

export async function withRetry<T>(
  operation: (signal?: AbortSignal) => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = TIMEOUTS.retry.maxAttempts,
    baseDelayMs = TIMEOUTS.retry.defaultDelay,
    maxDelayMs = TIMEOUTS.retry.maxDelay,
    timeoutMs,
    retryableErrors = [],
    onRetry,
  } = options

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const timeoutController = timeoutMs ? createTimeoutSignal(timeoutMs) : null

    try {
      const result = await operation(timeoutController?.signal)
      timeoutController?.cleanup()
      return result
    } catch (error) {
      timeoutController?.cleanup()
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt === maxAttempts) {
        break
      }

      const isRetryable = isRetryableError(error, retryableErrors)
      if (!isRetryable) {
        throw error
      }

      const delay = calculateDelay(attempt, baseDelayMs, maxDelayMs)

      if (onRetry) {
        onRetry(attempt, lastError, delay)
      }

      console.warn(
        `[Retry] Attempt ${attempt}/${maxAttempts} failed: ${lastError.message}. Retrying in ${Math.round(delay)}ms...`
      )

      await sleep(delay)
    }
  }

  throw lastError || new Error('Operation failed after all retry attempts')
}

export async function withTimeout<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number
): Promise<T> {
  const { signal, cleanup } = createTimeoutSignal(timeoutMs)

  try {
    const result = await operation(signal)
    if (signal.aborted) {
      throw new TimeoutError(timeoutMs)
    }
    return result
  } finally {
    cleanup()
  }
}

export const RETRY_PRESETS = {
  aggressive: {
    maxAttempts: TIMEOUTS.retry.maxAttempts,
    baseDelayMs: Math.floor(TIMEOUTS.retry.defaultDelay / 2),
    maxDelayMs: TIMEOUTS.retry.maxDelay / 2,
  },
  standard: {
    maxAttempts: Math.ceil(TIMEOUTS.retry.maxAttempts / 2),
    baseDelayMs: TIMEOUTS.retry.defaultDelay,
    maxDelayMs: TIMEOUTS.retry.maxDelay,
  },
  conservative: {
    maxAttempts: Math.ceil(TIMEOUTS.retry.maxAttempts / 3),
    baseDelayMs: TIMEOUTS.retry.defaultDelay * 2,
    maxDelayMs: TIMEOUTS.retry.maxDelay * 2,
  },
} as const
