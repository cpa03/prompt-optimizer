import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  getEnvValue,
  getEnvString,
  getEnvInt,
  getEnvFloat,
  getEnvBoolean,
  getEnvArray,
  getEnvJSON,
} from '../../../src/config/env'

describe('env helpers', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('getEnvValue', () => {
    it('should return undefined for non-existent key', () => {
      expect(getEnvValue('NON_EXISTENT_KEY')).toBeUndefined()
    })

    it('should return value for existing key', () => {
      process.env.TEST_KEY = 'test_value'
      expect(getEnvValue('TEST_KEY')).toBe('test_value')
    })
  })

  describe('getEnvString', () => {
    it('should return default value for non-existent key', () => {
      expect(getEnvString('NON_EXISTENT_KEY', 'default')).toBe('default')
    })

    it('should return env value for existing key', () => {
      process.env.TEST_STRING = 'my_value'
      expect(getEnvString('TEST_STRING', 'default')).toBe('my_value')
    })
  })

  describe('getEnvInt', () => {
    it('should return default value for non-existent key', () => {
      expect(getEnvInt('NON_EXISTENT_KEY', 42)).toBe(42)
    })

    it('should return parsed integer for valid value', () => {
      process.env.TEST_INT = '123'
      expect(getEnvInt('TEST_INT', 0)).toBe(123)
    })

    it('should return default for invalid integer', () => {
      process.env.TEST_INVALID_INT = 'not_a_number'
      expect(getEnvInt('TEST_INVALID_INT', 42)).toBe(42)
    })

    it('should return default for empty string', () => {
      process.env.TEST_EMPTY_INT = ''
      expect(getEnvInt('TEST_EMPTY_INT', 99)).toBe(99)
    })
  })

  describe('getEnvFloat', () => {
    it('should return default value for non-existent key', () => {
      expect(getEnvFloat('NON_EXISTENT_KEY', 3.14)).toBe(3.14)
    })

    it('should return parsed float for valid value', () => {
      process.env.TEST_FLOAT = '2.718'
      expect(getEnvFloat('TEST_FLOAT', 0)).toBe(2.718)
    })

    it('should return default for invalid float', () => {
      process.env.TEST_INVALID_FLOAT = 'not_a_float'
      expect(getEnvFloat('TEST_INVALID_FLOAT', 1.5)).toBe(1.5)
    })
  })

  describe('getEnvBoolean', () => {
    it('should return default value for non-existent key', () => {
      expect(getEnvBoolean('NON_EXISTENT_KEY', true)).toBe(true)
    })

    it('should return true for "true" string', () => {
      process.env.TEST_BOOL = 'true'
      expect(getEnvBoolean('TEST_BOOL', false)).toBe(true)
    })

    it('should return true for "TRUE" string (case insensitive)', () => {
      process.env.TEST_BOOL = 'TRUE'
      expect(getEnvBoolean('TEST_BOOL', false)).toBe(true)
    })

    it('should return true for "1"', () => {
      process.env.TEST_BOOL = '1'
      expect(getEnvBoolean('TEST_BOOL', false)).toBe(true)
    })

    it('should return false for other values', () => {
      process.env.TEST_BOOL = 'false'
      expect(getEnvBoolean('TEST_BOOL', true)).toBe(false)
    })
  })

  describe('getEnvArray', () => {
    it('should return default value for non-existent key', () => {
      expect(getEnvArray('NON_EXISTENT_KEY', ['a', 'b'])).toEqual(['a', 'b'])
    })

    it('should parse comma-separated values', () => {
      process.env.TEST_ARRAY = 'a,b,c'
      expect(getEnvArray('TEST_ARRAY', [])).toEqual(['a', 'b', 'c'])
    })

    it('should trim whitespace from values', () => {
      process.env.TEST_ARRAY = 'a , b , c'
      expect(getEnvArray('TEST_ARRAY', [])).toEqual(['a', 'b', 'c'])
    })

    it('should filter empty strings', () => {
      process.env.TEST_ARRAY = 'a,,b,,c'
      expect(getEnvArray('TEST_ARRAY', [])).toEqual(['a', 'b', 'c'])
    })

    it('should use custom separator', () => {
      process.env.TEST_ARRAY = 'a|b|c'
      expect(getEnvArray('TEST_ARRAY', [], '|')).toEqual(['a', 'b', 'c'])
    })

    it('should return default for empty string', () => {
      process.env.TEST_ARRAY = ''
      expect(getEnvArray('TEST_ARRAY', ['default'])).toEqual(['default'])
    })
  })

  describe('getEnvJSON', () => {
    it('should return default value for non-existent key', () => {
      expect(getEnvJSON('NON_EXISTENT_KEY', { key: 'value' })).toEqual({ key: 'value' })
    })

    it('should parse valid JSON object', () => {
      process.env.TEST_JSON = '{"key":"value"}'
      expect(getEnvJSON('TEST_JSON', {})).toEqual({ key: 'value' })
    })

    it('should parse valid JSON array', () => {
      process.env.TEST_JSON_ARRAY = '[1,2,3]'
      expect(getEnvJSON<number[]>('TEST_JSON_ARRAY', [])).toEqual([1, 2, 3])
    })

    it('should return default for invalid JSON', () => {
      process.env.TEST_INVALID_JSON = 'not_json'
      expect(getEnvJSON('TEST_INVALID_JSON', { fallback: true })).toEqual({ fallback: true })
    })

    it('should return default for empty string', () => {
      process.env.TEST_EMPTY_JSON = ''
      expect(getEnvJSON('TEST_EMPTY_JSON', { default: true })).toEqual({ default: true })
    })
  })
})
