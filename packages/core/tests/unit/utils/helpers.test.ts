import { describe, it, expect } from 'vitest'
import {
  isDefined,
  isString,
  isNumber,
  isInteger,
  isPositiveNumber,
  isNonNegativeNumber,
  isNonEmptyString,
  isPlainObject,
  isArray,
  isFunction,
  assert,
  pick,
  omit,
  objectKeys,
  objectEntries,
  fromEntries,
  isFiniteNumber,
  isNaNValue,
} from '../../../src/types/helpers'

describe('Type Guards', () => {
  describe('isDefined', () => {
    it('should return false for null', () => {
      expect(isDefined(null)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isDefined(undefined)).toBe(false)
    })

    it('should return true for any other value', () => {
      expect(isDefined(0)).toBe(true)
      expect(isDefined('')).toBe(true)
      expect(isDefined(false)).toBe(true)
      expect(isDefined({})).toBe(true)
    })
  })

  describe('isString', () => {
    it('should return true for strings', () => {
      expect(isString('hello')).toBe(true)
      expect(isString('')).toBe(true)
    })

    it('should return false for non-strings', () => {
      expect(isString(123)).toBe(false)
      expect(isString(null)).toBe(false)
      expect(isString(undefined)).toBe(false)
      expect(isString({})).toBe(false)
    })
  })

  describe('isNumber', () => {
    it('should return true for finite numbers', () => {
      expect(isNumber(0)).toBe(true)
      expect(isNumber(42)).toBe(true)
      expect(isNumber(-3.14)).toBe(true)
    })

    it('should return false for NaN', () => {
      expect(isNumber(NaN)).toBe(false)
    })

    it('should return false for Infinity', () => {
      expect(isNumber(Infinity)).toBe(false)
      expect(isNumber(-Infinity)).toBe(false)
    })

    it('should return false for non-numbers', () => {
      expect(isNumber('42')).toBe(false)
      expect(isNumber(null)).toBe(false)
    })
  })

  describe('isFiniteNumber', () => {
    it('should return true for finite numbers', () => {
      expect(isFiniteNumber(0)).toBe(true)
      expect(isFiniteNumber(42)).toBe(true)
      expect(isFiniteNumber(-3.14)).toBe(true)
    })

    it('should return false for Infinity', () => {
      expect(isFiniteNumber(Infinity)).toBe(false)
      expect(isFiniteNumber(-Infinity)).toBe(false)
    })

    it('should return false for NaN', () => {
      expect(isFiniteNumber(NaN)).toBe(false)
    })

    it('should return false for non-numbers', () => {
      expect(isFiniteNumber('42')).toBe(false)
      expect(isFiniteNumber(null)).toBe(false)
    })
  })

  describe('isNaNValue', () => {
    it('should return true for NaN', () => {
      expect(isNaNValue(NaN)).toBe(true)
    })

    it('should return false for numbers', () => {
      expect(isNaNValue(0)).toBe(false)
      expect(isNaNValue(42)).toBe(false)
      expect(isNaNValue(-3.14)).toBe(false)
      expect(isNaNValue(Infinity)).toBe(false)
    })

    it('should return false for non-numbers', () => {
      expect(isNaNValue('NaN')).toBe(false)
      expect(isNaNValue(null)).toBe(false)
      expect(isNaNValue(undefined)).toBe(false)
    })
  })

  describe('isInteger', () => {
    it('should return true for integers', () => {
      expect(isInteger(0)).toBe(true)
      expect(isInteger(42)).toBe(true)
      expect(isInteger(-10)).toBe(true)
    })

    it('should return false for floats', () => {
      expect(isInteger(3.14)).toBe(false)
      expect(isInteger(-2.5)).toBe(false)
    })
  })

  describe('isPositiveNumber', () => {
    it('should return true for positive numbers', () => {
      expect(isPositiveNumber(1)).toBe(true)
      expect(isPositiveNumber(0.5)).toBe(true)
    })

    it('should return false for zero', () => {
      expect(isPositiveNumber(0)).toBe(false)
    })

    it('should return false for negative numbers', () => {
      expect(isPositiveNumber(-1)).toBe(false)
    })
  })

  describe('isNonNegativeNumber', () => {
    it('should return true for zero and positive numbers', () => {
      expect(isNonNegativeNumber(0)).toBe(true)
      expect(isNonNegativeNumber(1)).toBe(true)
    })

    it('should return false for negative numbers', () => {
      expect(isNonNegativeNumber(-1)).toBe(false)
    })
  })

  describe('isNonEmptyString', () => {
    it('should return true for non-empty strings', () => {
      expect(isNonEmptyString('hello')).toBe(true)
      expect(isNonEmptyString('  trimmed  ')).toBe(true)
    })

    it('should return false for empty strings', () => {
      expect(isNonEmptyString('')).toBe(false)
    })

    it('should return false for whitespace-only strings', () => {
      expect(isNonEmptyString('   ')).toBe(false)
    })
  })

  describe('isPlainObject', () => {
    it('should return true for plain objects', () => {
      expect(isPlainObject({})).toBe(true)
      expect(isPlainObject({ a: 1 })).toBe(true)
    })

    it('should return false for arrays', () => {
      expect(isPlainObject([])).toBe(false)
    })

    it('should return false for null', () => {
      expect(isPlainObject(null)).toBe(false)
    })

    it('should return false for primitives', () => {
      expect(isPlainObject('string')).toBe(false)
      expect(isPlainObject(42)).toBe(false)
    })
  })

  describe('isArray', () => {
    it('should return true for arrays', () => {
      expect(isArray([])).toBe(true)
      expect(isArray([1, 2, 3])).toBe(true)
    })

    it('should return false for non-arrays', () => {
      expect(isArray({})).toBe(false)
      expect(isArray('string')).toBe(false)
      expect(isArray(null)).toBe(false)
    })

    it('should narrow the type', () => {
      const value: unknown = [1, 2, 3]
      if (isArray<number>(value)) {
        expect(value.length).toBe(3)
      }
    })
  })

  describe('isFunction', () => {
    it('should return true for functions', () => {
      expect(isFunction(() => {})).toBe(true)
      expect(isFunction(function () {})).toBe(true)
      expect(isFunction(Array.prototype.map)).toBe(true)
    })

    it('should return false for non-functions', () => {
      expect(isFunction({})).toBe(false)
      expect(isFunction('string')).toBe(false)
      expect(isFunction(42)).toBe(false)
      expect(isFunction(null)).toBe(false)
      expect(isFunction(undefined)).toBe(false)
    })

    it('should narrow the type', () => {
      const value: unknown = () => 'test'
      if (isFunction(value)) {
        expect(value()).toBe('test')
      }
    })
  })
})

describe('Utility Functions', () => {
  describe('pick', () => {
    it('should pick specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 }
      const result = pick(obj, ['a', 'c'] as const)
      expect(result).toEqual({ a: 1, c: 3 })
    })

    it('should ignore keys that do not exist', () => {
      const obj = { a: 1 }
      const result = pick(obj, ['a', 'b'] as const)
      expect(result).toEqual({ a: 1 })
    })
  })

  describe('omit', () => {
    it('should omit specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 }
      const result = omit(obj, ['b'] as const)
      expect(result).toEqual({ a: 1, c: 3 })
    })
  })

  describe('objectKeys', () => {
    it('should return typed keys', () => {
      const obj = { a: 1, b: 2 } as const
      const keys = objectKeys(obj)
      expect(keys).toContain('a')
      expect(keys).toContain('b')
    })
  })

  describe('objectEntries', () => {
    it('should return typed entries', () => {
      const obj = { a: 1, b: 2 } as const
      const entries = objectEntries(obj)
      expect(entries).toContainEqual(['a', 1])
      expect(entries).toContainEqual(['b', 2])
    })
  })

  describe('fromEntries', () => {
    it('should create object from entries', () => {
      const entries = [['a', 1], ['b', 2]] as const
      const obj = fromEntries(entries)
      expect(obj).toEqual({ a: 1, b: 2 })
    })
  })
})

describe('assert', () => {
  it('should not throw when condition is true', () => {
    expect(() => assert(true, 'message')).not.toThrow()
  })

  it('should throw when condition is false', () => {
    expect(() => assert(false, 'test error')).toThrow('Assertion failed: test error')
  })
})
