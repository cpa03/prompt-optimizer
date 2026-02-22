/**
 * Unit tests for error utility functions
 *
 * Tests cover:
 * - isStructuredErrorLike type guard
 * - toErrorWithCode normalization
 * - Edge cases and error boundary conditions
 */

import { describe, it, expect } from 'vitest'
import {
  isStructuredErrorLike,
  toErrorWithCode,
  classifyError,
  isRetryableError,
  getUserFriendlyMessage,
  getSuggestedRetryDelay,
  type StructuredErrorLike,
} from '../../../src/utils/error'

describe('error utilities', () => {
  describe('isStructuredErrorLike', () => {
    it('should return true for objects with string code property', () => {
      expect(isStructuredErrorLike({ code: 'TEST_ERROR' })).toBe(true)
      expect(isStructuredErrorLike({ code: 'ERR_001', message: 'Test' })).toBe(true)
    })

    it('should return false for null', () => {
      expect(isStructuredErrorLike(null)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isStructuredErrorLike(undefined)).toBe(false)
    })

    it('should return false for primitive values', () => {
      expect(isStructuredErrorLike('string')).toBe(false)
      expect(isStructuredErrorLike(123)).toBe(false)
      expect(isStructuredErrorLike(true)).toBe(false)
    })

    it('should return false for objects without code property', () => {
      expect(isStructuredErrorLike({})).toBe(false)
      expect(isStructuredErrorLike({ message: 'error' })).toBe(false)
      expect(isStructuredErrorLike({ name: 'Error' })).toBe(false)
    })

    it('should return false for objects with non-string code', () => {
      expect(isStructuredErrorLike({ code: 123 })).toBe(false)
      expect(isStructuredErrorLike({ code: null })).toBe(false)
      expect(isStructuredErrorLike({ code: undefined })).toBe(false)
      expect(isStructuredErrorLike({ code: {} })).toBe(false)
    })

    it('should return true for Error instances with code property', () => {
      const err = new Error('test')
      ;(err as any).code = 'TEST_ERROR'
      expect(isStructuredErrorLike(err)).toBe(true)
    })
  })

  describe('toErrorWithCode', () => {
    describe('with Error instances', () => {
      it('should return the same Error instance', () => {
        const originalError = new Error('test error')
        const result = toErrorWithCode(originalError)
        expect(result).toBe(originalError)
        expect(result.message).toBe('test error')
      })

      it('should preserve code property on Error instances', () => {
        const originalError = new Error('test error') as Error & { code: string }
        originalError.code = 'TEST_CODE'
        const result = toErrorWithCode(originalError)
        expect(result.code).toBe('TEST_CODE')
      })

      it('should preserve params property on Error instances', () => {
        const originalError = new Error('test error') as Error & { params: { key: string } }
        originalError.params = { key: 'value' }
        const result = toErrorWithCode(originalError)
        expect(result.params).toEqual({ key: 'value' })
      })
    })

    describe('with StructuredErrorLike objects', () => {
      it('should create Error from object with code', () => {
        const structuredError: StructuredErrorLike = {
          code: 'ERR_001',
        }
        const result = toErrorWithCode(structuredError)
        expect(result).toBeInstanceOf(Error)
        expect(result.code).toBe('ERR_001')
        expect(result.message).toBe('[ERR_001]')
      })

      it('should preserve message when provided', () => {
        const structuredError: StructuredErrorLike = {
          code: 'ERR_001',
          message: 'Custom error message',
        }
        const result = toErrorWithCode(structuredError)
        expect(result.message).toBe('Custom error message')
      })

      it('should use code in brackets when message is empty string', () => {
        const structuredError: StructuredErrorLike = {
          code: 'ERR_001',
          message: '',
        }
        const result = toErrorWithCode(structuredError)
        expect(result.message).toBe('[ERR_001]')
      })

      it('should use code in brackets when message is whitespace only', () => {
        const structuredError: StructuredErrorLike = {
          code: 'ERR_001',
          message: '   ',
        }
        const result = toErrorWithCode(structuredError)
        expect(result.message).toBe('[ERR_001]')
      })

      it('should preserve name property', () => {
        const structuredError: StructuredErrorLike = {
          code: 'ERR_001',
          name: 'CustomError',
        }
        const result = toErrorWithCode(structuredError)
        expect(result.name).toBe('CustomError')
      })

      it('should use "Error" as default name', () => {
        const structuredError: StructuredErrorLike = {
          code: 'ERR_001',
        }
        const result = toErrorWithCode(structuredError)
        expect(result.name).toBe('Error')
      })

      it('should preserve params property', () => {
        const structuredError: StructuredErrorLike = {
          code: 'ERR_001',
          params: { userId: '123', action: 'delete' },
        }
        const result = toErrorWithCode(structuredError)
        expect(result.params).toEqual({ userId: '123', action: 'delete' })
      })

      it('should preserve stack property', () => {
        const structuredError: StructuredErrorLike = {
          code: 'ERR_001',
          stack: 'custom stack trace',
        }
        const result = toErrorWithCode(structuredError)
        expect(result.stack).toBe('custom stack trace')
      })

      it('should ignore non-object params', () => {
        const structuredError: StructuredErrorLike = {
          code: 'ERR_001',
          params: 'invalid' as any,
        }
        const result = toErrorWithCode(structuredError)
        expect(result.params).toBeUndefined()
      })
    })

    describe('with string values', () => {
      it('should create Error from string', () => {
        const result = toErrorWithCode('simple error message')
        expect(result).toBeInstanceOf(Error)
        expect(result.message).toBe('simple error message')
        expect(result.code).toBeUndefined()
      })

      it('should create Error from empty string', () => {
        const result = toErrorWithCode('')
        expect(result.message).toBe('')
      })
    })

    describe('with null and undefined', () => {
      it('should create Error with fallback message for null', () => {
        const result = toErrorWithCode(null)
        expect(result).toBeInstanceOf(Error)
        expect(result.message).toBe('Unknown error')
      })

      it('should create Error with fallback message for undefined', () => {
        const result = toErrorWithCode(undefined)
        expect(result).toBeInstanceOf(Error)
        expect(result.message).toBe('Unknown error')
      })

      it('should use custom fallback message', () => {
        const result = toErrorWithCode(null, 'Custom fallback')
        expect(result.message).toBe('Custom fallback')
      })

      it('should use custom fallback message for undefined', () => {
        const result = toErrorWithCode(undefined, 'Another fallback')
        expect(result.message).toBe('Another fallback')
      })
    })

    describe('with other values', () => {
      it('should create Error from number using String()', () => {
        const result = toErrorWithCode(123)
        expect(result.message).toBe('123')
      })

      it('should create Error from boolean using String()', () => {
        const result = toErrorWithCode(true)
        expect(result.message).toBe('true')
      })

      it('should create Error from object using String()', () => {
        const result = toErrorWithCode({ foo: 'bar' })
        expect(result.message).toBe('[object Object]')
      })

      it('should create Error from array using String()', () => {
        const result = toErrorWithCode([1, 2, 3])
        expect(result.message).toBe('1,2,3')
      })
    })

    describe('edge cases', () => {
      it('should handle Symbol values', () => {
        const sym = Symbol('test')
        const result = toErrorWithCode(sym)
        expect(result.message).toBe('Symbol(test)')
      })

      it('should handle BigInt values', () => {
        const bigInt = BigInt(9007199254740991)
        const result = toErrorWithCode(bigInt)
        expect(result.message).toBe('9007199254740991')
      })

      it('should handle function values', () => {
        const fn = () => 'test'
        const result = toErrorWithCode(fn)
        expect(result.message).toContain('()')
      })
    })
  })

  describe('classifyError', () => {
    describe('with null/undefined', () => {
      it('should return unknown for null', () => {
        const result = classifyError(null)
        expect(result.category).toBe('unknown')
        expect(result.isRetryable).toBe(false)
      })

      it('should return unknown for undefined', () => {
        const result = classifyError(undefined)
        expect(result.category).toBe('unknown')
        expect(result.isRetryable).toBe(false)
      })
    })

    describe('with retryable error codes', () => {
      it('should classify ECONNRESET as network error', () => {
        const err = new Error('Connection reset')
        ;(err as any).code = 'ECONNRESET'
        const result = classifyError(err)
        expect(result.category).toBe('network')
        expect(result.isNetworkError).toBe(true)
        expect(result.isRetryable).toBe(true)
      })

      it('should classify ETIMEDOUT as timeout error', () => {
        const err = new Error('Timed out')
        ;(err as any).code = 'ETIMEDOUT'
        const result = classifyError(err)
        expect(result.category).toBe('timeout')
        expect(result.isTimeout).toBe(true)
        expect(result.isRetryable).toBe(true)
      })

      it('should classify ECONNREFUSED as network error', () => {
        const err = new Error('Connection refused')
        ;(err as any).code = 'ECONNREFUSED'
        const result = classifyError(err)
        expect(result.category).toBe('network')
        expect(result.isNetworkError).toBe(true)
        expect(result.isRetryable).toBe(true)
      })
    })

    describe('with HTTP status codes', () => {
      it('should classify 429 as rate_limit', () => {
        const err = new Error('Too many requests')
        ;(err as any).status = 429
        const result = classifyError(err)
        expect(result.category).toBe('rate_limit')
        expect(result.isRateLimited).toBe(true)
        expect(result.isRetryable).toBe(true)
      })

      it('should classify 408 as timeout', () => {
        const err = new Error('Request timeout')
        ;(err as any).status = 408
        const result = classifyError(err)
        expect(result.category).toBe('timeout')
        expect(result.isTimeout).toBe(true)
        expect(result.isRetryable).toBe(true)
      })

      it('should classify 500 as server error', () => {
        const err = new Error('Internal server error')
        ;(err as any).status = 500
        const result = classifyError(err)
        expect(result.category).toBe('server')
        expect(result.isServerError).toBe(true)
        expect(result.isRetryable).toBe(true)
      })

      it('should classify 502 as server error', () => {
        const err = new Error('Bad gateway')
        ;(err as any).status = 502
        const result = classifyError(err)
        expect(result.category).toBe('server')
        expect(result.isServerError).toBe(true)
        expect(result.isRetryable).toBe(true)
      })

      it('should classify 503 as server error', () => {
        const err = new Error('Service unavailable')
        ;(err as any).status = 503
        const result = classifyError(err)
        expect(result.category).toBe('server')
        expect(result.isServerError).toBe(true)
        expect(result.isRetryable).toBe(true)
      })

      it('should classify 400 as client error', () => {
        const err = new Error('Bad request')
        ;(err as any).status = 400
        const result = classifyError(err)
        expect(result.category).toBe('client')
        expect(result.isRetryable).toBe(false)
      })

      it('should classify 401 as client error', () => {
        const err = new Error('Unauthorized')
        ;(err as any).status = 401
        const result = classifyError(err)
        expect(result.category).toBe('client')
        expect(result.isRetryable).toBe(false)
      })

      it('should classify 404 as client error', () => {
        const err = new Error('Not found')
        ;(err as any).status = 404
        const result = classifyError(err)
        expect(result.category).toBe('client')
        expect(result.isRetryable).toBe(false)
      })

      it('should use statusCode property as fallback', () => {
        const err = new Error('Server error')
        ;(err as any).statusCode = 500
        const result = classifyError(err)
        expect(result.category).toBe('server')
        expect(result.isServerError).toBe(true)
      })
    })

    describe('with message patterns', () => {
      it('should classify network error from message', () => {
        const err = new Error('network error occurred')
        const result = classifyError(err)
        expect(result.category).toBe('network')
        expect(result.isNetworkError).toBe(true)
        expect(result.isRetryable).toBe(true)
      })

      it('should classify timeout from message', () => {
        const err = new Error('connection timed out')
        const result = classifyError(err)
        expect(result.category).toBe('timeout')
        expect(result.isTimeout).toBe(true)
        expect(result.isRetryable).toBe(true)
      })

      it('should classify rate limit from message', () => {
        const err = new Error('rate limit exceeded')
        const result = classifyError(err)
        expect(result.category).toBe('rate_limit')
        expect(result.isRateLimited).toBe(true)
        expect(result.isRetryable).toBe(true)
      })

      it('should be case insensitive', () => {
        const err = new Error('NETWORK ERROR')
        const result = classifyError(err)
        expect(result.category).toBe('network')
        expect(result.isNetworkError).toBe(true)
      })
    })

    describe('with non-Error values', () => {
      it('should handle string errors', () => {
        const result = classifyError('network error')
        expect(result.category).toBe('network')
        expect(result.isNetworkError).toBe(true)
      })

      it('should handle unknown string errors', () => {
        const result = classifyError('something went wrong')
        expect(result.category).toBe('unknown')
        expect(result.isRetryable).toBe(false)
      })
    })
  })

  describe('isRetryableError', () => {
    it('should return true for network errors', () => {
      const err = new Error('Connection reset')
      ;(err as any).code = 'ECONNRESET'
      expect(isRetryableError(err)).toBe(true)
    })

    it('should return true for timeout errors', () => {
      const err = new Error('Timed out')
      ;(err as any).code = 'ETIMEDOUT'
      expect(isRetryableError(err)).toBe(true)
    })

    it('should return true for rate limit errors', () => {
      const err = new Error('Too many requests')
      ;(err as any).status = 429
      expect(isRetryableError(err)).toBe(true)
    })

    it('should return true for server errors', () => {
      const err = new Error('Internal server error')
      ;(err as any).status = 500
      expect(isRetryableError(err)).toBe(true)
    })

    it('should return false for client errors', () => {
      const err = new Error('Bad request')
      ;(err as any).status = 400
      expect(isRetryableError(err)).toBe(false)
    })

    it('should return false for unknown errors', () => {
      const err = new Error('Unknown error')
      expect(isRetryableError(err)).toBe(false)
    })

    it('should return false for null', () => {
      expect(isRetryableError(null)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isRetryableError(undefined)).toBe(false)
    })
  })

  describe('getUserFriendlyMessage', () => {
    describe('with classified errors', () => {
      it('should return network message for network errors', () => {
        const err = new Error('Connection reset')
        ;(err as any).code = 'ECONNRESET'
        const result = getUserFriendlyMessage(err)
        expect(result).toBe('Network connection error. Please check your internet connection and try again.')
      })

      it('should return timeout message for timeout errors', () => {
        const err = new Error('Timed out')
        ;(err as any).code = 'ETIMEDOUT'
        const result = getUserFriendlyMessage(err)
        expect(result).toBe('The request timed out. Please try again.')
      })

      it('should return rate limit message for rate limit errors', () => {
        const err = new Error('Too many requests')
        ;(err as any).status = 429
        const result = getUserFriendlyMessage(err)
        expect(result).toBe('Too many requests. Please wait a moment and try again.')
      })

      it('should return server message for server errors', () => {
        const err = new Error('Internal server error')
        ;(err as any).status = 500
        const result = getUserFriendlyMessage(err)
        expect(result).toBe('Server error. The service is temporarily unavailable. Please try again later.')
      })

      it('should return client message for client errors', () => {
        const err = new Error('Bad request')
        ;(err as any).status = 400
        const result = getUserFriendlyMessage(err)
        expect(result).toBe('Invalid request. Please check your input and try again.')
      })
    })

    describe('with unknown errors', () => {
      it('should return fallback message when provided', () => {
        const result = getUserFriendlyMessage(new Error('Unknown'), 'Custom fallback')
        expect(result).toBe('Custom fallback')
      })

      it('should return error message when no fallback', () => {
        const err = new Error('Specific error message')
        const result = getUserFriendlyMessage(err)
        expect(result).toBe('Specific error message')
      })

      it('should return default message for null', () => {
        const result = getUserFriendlyMessage(null)
        expect(result).toBe('An unexpected error occurred. Please try again.')
      })

      it('should return default message for undefined', () => {
        const result = getUserFriendlyMessage(undefined)
        expect(result).toBe('An unexpected error occurred. Please try again.')
      })
    })
  })

  describe('getSuggestedRetryDelay', () => {
    describe('with retryable errors', () => {
      it('should return 60000ms for rate limit errors', () => {
        const err = new Error('Too many requests')
        ;(err as any).status = 429
        expect(getSuggestedRetryDelay(err)).toBe(60000)
      })

      it('should return 5000ms for server errors', () => {
        const err = new Error('Server error')
        ;(err as any).status = 500
        expect(getSuggestedRetryDelay(err)).toBe(5000)
      })

      it('should return 2000ms for timeout errors', () => {
        const err = new Error('Timed out')
        ;(err as any).code = 'ETIMEDOUT'
        expect(getSuggestedRetryDelay(err)).toBe(2000)
      })

      it('should return 3000ms for network errors', () => {
        const err = new Error('Connection reset')
        ;(err as any).code = 'ECONNRESET'
        expect(getSuggestedRetryDelay(err)).toBe(3000)
      })
    })

    describe('with non-retryable errors', () => {
      it('should return 0ms for client errors', () => {
        const err = new Error('Bad request')
        ;(err as any).status = 400
        expect(getSuggestedRetryDelay(err)).toBe(0)
      })

      it('should return 0ms for unknown errors', () => {
        const err = new Error('Unknown error')
        expect(getSuggestedRetryDelay(err)).toBe(0)
      })

      it('should return 0ms for null', () => {
        expect(getSuggestedRetryDelay(null)).toBe(0)
      })
    })
  })
})
