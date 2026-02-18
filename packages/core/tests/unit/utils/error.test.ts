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
})
