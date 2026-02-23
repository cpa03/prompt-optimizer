import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { safeSerializeForIPC, safeSerializeArgs, debugIPCSerializability } from '../../../src/utils/ipc-serialization'
import { enableGlobalDebug, disableGlobalDebug } from '../../../src/utils/debug'

describe('safeSerializeForIPC', () => {
  describe('null and undefined', () => {
    it('should return null unchanged', () => {
      expect(safeSerializeForIPC(null)).toBe(null)
    })

    it('should return undefined unchanged', () => {
      expect(safeSerializeForIPC(undefined)).toBe(undefined)
    })
  })

  describe('primitives', () => {
    it('should return string unchanged', () => {
      expect(safeSerializeForIPC('test')).toBe('test')
    })

    it('should return number unchanged', () => {
      expect(safeSerializeForIPC(42)).toBe(42)
    })

    it('should return boolean unchanged', () => {
      expect(safeSerializeForIPC(true)).toBe(true)
      expect(safeSerializeForIPC(false)).toBe(false)
    })
  })

  describe('plain objects', () => {
    it('should serialize simple objects', () => {
      const input = { name: 'test', value: 123 }
      const result = safeSerializeForIPC(input)

      expect(result).toEqual({ name: 'test', value: 123 })
      expect(result).not.toBe(input)
    })

    it('should serialize nested objects', () => {
      const input = { outer: { inner: { deep: 'value' } } }
      const result = safeSerializeForIPC(input)

      expect(result).toEqual({ outer: { inner: { deep: 'value' } } })
      expect(result).not.toBe(input)
      expect((result as any).outer).not.toBe(input.outer)
    })

    it('should serialize arrays', () => {
      const input = [1, 2, 3]
      const result = safeSerializeForIPC(input)

      expect(result).toEqual([1, 2, 3])
      expect(result).not.toBe(input)
    })

    it('should serialize objects with arrays', () => {
      const input = { items: [1, 2, 3], name: 'test' }
      const result = safeSerializeForIPC(input)

      expect(result).toEqual({ items: [1, 2, 3], name: 'test' })
    })

    it('should serialize Date objects', () => {
      const date = new Date('2024-01-01T00:00:00.000Z')
      const result = safeSerializeForIPC(date)

      expect(result).toBeInstanceOf(Date)
      expect((result as Date).toISOString()).toBe('2024-01-01T00:00:00.000Z')
    })

    it('should serialize Map objects', () => {
      const map = new Map([['key', 'value']])
      const result = safeSerializeForIPC(map)

      expect(result).toBeInstanceOf(Map)
      expect((result as Map<string, string>).get('key')).toBe('value')
    })

    it('should serialize Set objects', () => {
      const set = new Set([1, 2, 3])
      const result = safeSerializeForIPC(set)

      expect(result).toBeInstanceOf(Set)
      expect((result as Set<number>).has(1)).toBe(true)
    })
  })

  describe('non-serializable objects', () => {
    it('should remove functions from objects', () => {
      const input = { fn: () => 'test', name: 'value' }
      const result = safeSerializeForIPC(input) as any

      expect(result.fn).toBeUndefined()
      expect(result.name).toBe('value')
    })

    it('should remove symbols from objects', () => {
      const sym = Symbol('test')
      const input = { [sym]: 'symbol value', name: 'value' }
      const result = safeSerializeForIPC(input) as any

      expect(result[sym]).toBeUndefined()
      expect(result.name).toBe('value')
    })

    it('should handle objects with undefined values', () => {
      const input = { a: undefined, b: 1 }
      const result = safeSerializeForIPC(input) as any

      expect(result.a).toBeUndefined()
      expect(result.b).toBe(1)
    })
  })

  describe('deep cloning', () => {
    it('should create a deep copy', () => {
      const input = { nested: { value: 1 } }
      const result = safeSerializeForIPC(input) as any

      result.nested.value = 2
      expect(input.nested.value).toBe(1)
    })

    it('should not affect original object', () => {
      const input = { items: [1, 2, 3] }
      const result = safeSerializeForIPC(input) as any

      result.items.push(4)
      expect(input.items).toEqual([1, 2, 3])
    })
  })
})

describe('safeSerializeArgs', () => {
  it('should serialize multiple arguments', () => {
    const result = safeSerializeArgs({ name: 'test' }, 123, 'string')

    expect(result).toEqual([{ name: 'test' }, 123, 'string'])
  })

  it('should handle no arguments', () => {
    const result = safeSerializeArgs()

    expect(result).toEqual([])
  })

  it('should handle null and undefined arguments', () => {
    const result = safeSerializeArgs(null, undefined, { value: 1 })

    expect(result).toEqual([null, undefined, { value: 1 }])
  })

  it('should serialize each argument independently', () => {
    const obj1 = { a: 1 }
    const obj2 = { b: 2 }
    const result = safeSerializeArgs(obj1, obj2)

    expect(result[0]).not.toBe(obj1)
    expect(result[1]).not.toBe(obj2)
  })
})

describe('debugIPCSerializability', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    enableGlobalDebug()
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    disableGlobalDebug()
    vi.restoreAllMocks()
  })

  it('should log serializable objects as serializable', () => {
    const obj = { name: 'test' }
    debugIPCSerializability(obj, 'testObject')

    expect(consoleSpy).toHaveBeenCalled()
  })

  it('should use default label when not provided', () => {
    const obj = { name: 'test' }
    debugIPCSerializability(obj)

    expect(consoleSpy).toHaveBeenCalled()
  })

  it('should detect non-serializable objects', () => {
    const obj: any = { name: 'test' }
    obj.self = obj

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    debugIPCSerializability(obj, 'circularObject')

    expect(errorSpy).toHaveBeenCalled()
  })
})
