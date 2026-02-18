import { describe, it, expect } from 'vitest'
import {
  safeJsonParse,
  safeJsonParseNullish,
  isDangerousKey,
  sanitizeObject,
} from '../../../src/utils/json'

describe('safeJsonParse', () => {
  describe('basic parsing', () => {
    it('should parse valid JSON correctly', () => {
      const input = '{"name": "test", "value": 123}'
      const result = safeJsonParse(input)
      expect(result).toEqual({ name: 'test', value: 123 })
    })

    it('should parse arrays', () => {
      const input = '[1, 2, 3]'
      const result = safeJsonParse<number[]>(input)
      expect(result).toEqual([1, 2, 3])
    })

    it('should parse nested objects', () => {
      const input = '{"outer": {"inner": {"deep": "value"}}}'
      const result = safeJsonParse(input)
      expect(result).toEqual({ outer: { inner: { deep: 'value' } } })
    })

    it('should parse primitive values', () => {
      expect(safeJsonParse('null')).toBe(null)
      expect(safeJsonParse('true')).toBe(true)
      expect(safeJsonParse('false')).toBe(false)
      expect(safeJsonParse('42')).toBe(42)
      expect(safeJsonParse('"string"')).toBe('string')
    })

    it('should throw SyntaxError for invalid JSON', () => {
      expect(() => safeJsonParse('not json')).toThrow(SyntaxError)
      expect(() => safeJsonParse('{invalid}')).toThrow(SyntaxError)
    })
  })

  describe('prototype pollution protection', () => {
    it('should block __proto__ assignment', () => {
      const input = '{"__proto__": {"polluted": true}, "name": "test"}'
      const result = safeJsonParse(input) as any

      expect(result.name).toBe('test')
      expect(Object.hasOwn(result, '__proto__')).toBe(false)
      expect(({} as any).polluted).toBeUndefined()
    })

    it('should block constructor assignment', () => {
      const input = '{"constructor": {"prototype": {"polluted": true}}}'
      const result = safeJsonParse(input) as any

      expect(Object.hasOwn(result, 'constructor')).toBe(false)
    })

    it('should block prototype assignment', () => {
      const input = '{"prototype": {"polluted": true}}'
      const result = safeJsonParse(input) as any

      expect(Object.hasOwn(result, 'prototype')).toBe(false)
    })

    it('should block nested prototype pollution', () => {
      const input = '{"data": {"__proto__": {"polluted": true}}}'
      const result = safeJsonParse(input) as any

      expect(Object.hasOwn(result.data, '__proto__')).toBe(false)
      expect(({} as any).polluted).toBeUndefined()
    })

    it('should block __proto__ in arrays', () => {
      const input = '[{"__proto__": {"polluted": true}}, {"name": "test"}]'
      const result = safeJsonParse(input) as any[]

      expect(Object.hasOwn(result[0], '__proto__')).toBe(false)
      expect(result[1].name).toBe('test')
      expect(({} as any).polluted).toBeUndefined()
    })

    it('should not affect normal properties with similar names', () => {
      const input = '{"proto": "ok", "constructorMethod": "ok", "myPrototype": "ok"}'
      const result = safeJsonParse(input) as any

      expect(result.proto).toBe('ok')
      expect(result.constructorMethod).toBe('ok')
      expect(result.myPrototype).toBe('ok')
    })
  })

  describe('with custom reviver', () => {
    it('should apply custom reviver after safe reviver', () => {
      const input = '{"date": "2024-01-01", "__proto__": {"bad": true}}'
      const result = safeJsonParse(input, {
        reviver: (key, value) => {
          if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return new Date(value)
          }
          return value
        },
      }) as any

      expect(result.date instanceof Date).toBe(true)
      expect(Object.hasOwn(result, '__proto__')).toBe(false)
    })
  })

  describe('type safety', () => {
    it('should support generic type parameter', () => {
      interface TestData {
        id: number
        name: string
      }
      const input = '{"id": 1, "name": "test"}'
      const result = safeJsonParse<TestData>(input)

      expect(result.id).toBe(1)
      expect(result.name).toBe('test')
    })
  })
})

describe('safeJsonParseNullish', () => {
  it('should return parsed value for valid JSON', () => {
    const input = '{"valid": true}'
    const result = safeJsonParseNullish(input)
    expect(result).toEqual({ valid: true })
  })

  it('should return null for invalid JSON', () => {
    const input = 'not json'
    const result = safeJsonParseNullish(input)
    expect(result).toBeNull()
  })

  it('should block prototype pollution', () => {
    const input = '{"__proto__": {"polluted": true}}'
    const result = safeJsonParseNullish(input) as any

    expect(Object.hasOwn(result, '__proto__')).toBe(false)
    expect(({} as any).polluted).toBeUndefined()
  })
})

describe('isDangerousKey', () => {
  it('should identify __proto__ as dangerous', () => {
    expect(isDangerousKey('__proto__')).toBe(true)
  })

  it('should identify prototype as dangerous', () => {
    expect(isDangerousKey('prototype')).toBe(true)
  })

  it('should identify constructor as dangerous', () => {
    expect(isDangerousKey('constructor')).toBe(true)
  })

  it('should identify safe keys as not dangerous', () => {
    expect(isDangerousKey('name')).toBe(false)
    expect(isDangerousKey('id')).toBe(false)
    expect(isDangerousKey('proto')).toBe(false)
    expect(isDangerousKey('myConstructor')).toBe(false)
  })
})

describe('sanitizeObject', () => {
  it('should remove dangerous keys from object', () => {
    const input = {
      __proto__: { bad: true },
      prototype: { bad: true },
      constructor: { bad: true },
      safe: 'ok',
    }
    const result = sanitizeObject(input) as any

    expect(Object.hasOwn(result, '__proto__')).toBe(false)
    expect(Object.hasOwn(result, 'prototype')).toBe(false)
    expect(Object.hasOwn(result, 'constructor')).toBe(false)
    expect(result.safe).toBe('ok')
  })

  it('should sanitize nested objects', () => {
    const input = {
      nested: {
        __proto__: { bad: true },
        deep: {
          constructor: { bad: true },
        },
      },
    }
    const result = sanitizeObject(input) as any

    expect(Object.hasOwn(result.nested, '__proto__')).toBe(false)
    expect(Object.hasOwn(result.nested.deep, 'constructor')).toBe(false)
  })

  it('should sanitize arrays', () => {
    const input = [
      { __proto__: { bad: true }, name: 'item1' },
      { constructor: { bad: true }, name: 'item2' },
    ]
    const result = sanitizeObject(input) as any[]

    expect(Object.hasOwn(result[0], '__proto__')).toBe(false)
    expect(result[0].name).toBe('item1')
    expect(Object.hasOwn(result[1], 'constructor')).toBe(false)
    expect(result[1].name).toBe('item2')
  })

  it('should return primitives unchanged', () => {
    expect(sanitizeObject(null)).toBe(null)
    expect(sanitizeObject(undefined)).toBe(undefined)
    expect(sanitizeObject('string')).toBe('string')
    expect(sanitizeObject(42)).toBe(42)
    expect(sanitizeObject(true)).toBe(true)
  })
})
