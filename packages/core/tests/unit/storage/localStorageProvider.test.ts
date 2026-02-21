import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { LocalStorageProvider } from '../../../src/services/storage/localStorageProvider'
import { StorageError } from '../../../src/services/storage/errors'

describe('LocalStorageProvider', () => {
  let provider: LocalStorageProvider
  let mockStorage: Record<string, string>

  beforeEach(() => {
    mockStorage = {}
    global.localStorage = {
      getItem: vi.fn((key: string): string | null => mockStorage[key] || null),
      setItem: vi.fn((key: string, value: string): void => {
        mockStorage[key] = value.toString()
      }),
      removeItem: vi.fn((key: string): void => {
        delete mockStorage[key]
      }),
      clear: vi.fn((): void => {
        mockStorage = {}
      }),
      key: vi.fn((index: number): string | null => Object.keys(mockStorage)[index] || null),
      get length(): number {
        return Object.keys(mockStorage).length
      },
    } as any

    provider = new LocalStorageProvider()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('setItem and getItem', () => {
    it('should set and get an item', async () => {
      await provider.setItem('testKey', 'testValue')
      expect(global.localStorage.setItem).toHaveBeenCalledWith(
        'testKey',
        expect.stringContaining('"value":"testValue"')
      )

      const value = await provider.getItem('testKey')
      expect(global.localStorage.getItem).toHaveBeenCalledWith('testKey')
      expect(value).toBe('testValue')
    })

    it('should return null for a non-existent key', async () => {
      const value = await provider.getItem('nonExistentKey')
      expect(global.localStorage.getItem).toHaveBeenCalledWith('nonExistentKey')
      expect(value).toBeNull()
    })

    it('should overwrite an existing value', async () => {
      await provider.setItem('testKey', 'initialValue')
      await provider.setItem('testKey', 'newValue')
      expect(global.localStorage.setItem).toHaveBeenCalledWith(
        'testKey',
        expect.stringContaining('"value":"newValue"')
      )

      const value = await provider.getItem('testKey')
      expect(value).toBe('newValue')
    })
  })

  describe('removeItem', () => {
    it('should remove an item', async () => {
      await provider.setItem('keyToRemove', 'value')
      expect(await provider.getItem('keyToRemove')).toBe('value')

      await provider.removeItem('keyToRemove')
      expect(global.localStorage.removeItem).toHaveBeenCalledWith('keyToRemove')

      const value = await provider.getItem('keyToRemove')
      expect(value).toBeNull()
    })

    it('should not throw when removing a non-existent key', async () => {
      await expect(provider.removeItem('nonExistentKeyForRemove')).resolves.not.toThrow()
      expect(global.localStorage.removeItem).toHaveBeenCalledWith('nonExistentKeyForRemove')
    })

    it('should do nothing if removeItem is called on a non-existent key', async () => {
      await provider.setItem('existingKey', 'existingValue')
      await provider.removeItem('anotherNonExistentKey')
      expect(global.localStorage.removeItem).toHaveBeenCalledWith('anotherNonExistentKey')
      const value = await provider.getItem('existingKey')
      expect(value).toBe('existingValue')
    })
  })

  describe('clearAll', () => {
    it('should clear all items', async () => {
      await provider.setItem('key1', 'value1')
      await provider.setItem('key2', 'value2')

      await provider.clearAll()
      expect(global.localStorage.clear).toHaveBeenCalled()

      const value1 = await provider.getItem('key1')
      const value2 = await provider.getItem('key2')
      expect(value1).toBeNull()
      expect(value2).toBeNull()
    })

    it('should do nothing if clearAll is called when storage is already empty', async () => {
      await expect(provider.clearAll()).resolves.not.toThrow()
      expect(global.localStorage.clear).toHaveBeenCalled()
      const value = await provider.getItem('anyKey')
      expect(value).toBeNull()
    })
  })

  describe('Error Handling', () => {
    it('should reject with StorageError if localStorage.getItem throws', async () => {
      ;(global.localStorage.getItem as any).mockImplementationOnce(() => {
        throw new Error('Simulated getItem error')
      })
      await expect(provider.getItem('errorKey')).rejects.toThrow(StorageError)
    })

    it('should reject with StorageError if localStorage.setItem throws', async () => {
      ;(global.localStorage.setItem as any).mockImplementationOnce(() => {
        throw new Error('Simulated setItem error')
      })
      await expect(provider.setItem('errorKey', 'errorValue')).rejects.toThrow(StorageError)
    })

    it('should reject with StorageError if localStorage.removeItem throws', async () => {
      ;(global.localStorage.removeItem as any).mockImplementationOnce(() => {
        throw new Error('Simulated removeItem error')
      })
      await expect(provider.removeItem('errorKey')).rejects.toThrow(StorageError)
    })

    it('should reject with StorageError if localStorage.clear throws', async () => {
      ;(global.localStorage.clear as any).mockImplementationOnce(() => {
        throw new Error('Simulated clear error')
      })
      await expect(provider.clearAll()).rejects.toThrow(StorageError)
    })
  })

  describe('getItems', () => {
    it('should get multiple items at once', async () => {
      await provider.setItem('key1', 'value1')
      await provider.setItem('key2', 'value2')
      await provider.setItem('key3', 'value3')

      const result = await provider.getItems(['key1', 'key2', 'key3'])

      expect(result).toEqual({
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      })
    })

    it('should return null for non-existent keys', async () => {
      await provider.setItem('existing', 'value')

      const result = await provider.getItems(['existing', 'nonexistent'])

      expect(result).toEqual({
        existing: 'value',
        nonexistent: null,
      })
    })

    it('should return empty object for empty array', async () => {
      const result = await provider.getItems([])
      expect(result).toEqual({})
    })

    it('should validate input is an array', async () => {
      await expect(provider.getItems(null as any)).rejects.toThrow('Keys must be an array')
    })

    it('should validate keys are valid', async () => {
      await expect(provider.getItems([''])).rejects.toThrow('Key must be a non-empty string')
    })
  })

  describe('TTL support', () => {
    it('should support TTL option', async () => {
      await provider.setItem('ttlKey', 'ttlValue', { ttl: 3600000 })
      const value = await provider.getItem('ttlKey')
      expect(value).toBe('ttlValue')
    })

    it('should return capabilities with TTL support', () => {
      const capabilities = provider.getCapabilities()
      expect(capabilities.supportsTTL).toBe(true)
    })

    it('should return expired keys', async () => {
      const shortTTL = 1
      await provider.setItem('expiringKey', 'value', { ttl: shortTTL })
      
      await new Promise(resolve => setTimeout(resolve, 10))
      
      const expiredKeys = await provider.getExpiredKeys()
      expect(expiredKeys).toContain('expiringKey')
    })

    it('should cleanup expired items', async () => {
      const shortTTL = 1
      await provider.setItem('expiringKey', 'value', { ttl: shortTTL })
      
      await new Promise(resolve => setTimeout(resolve, 10))
      
      const result = await provider.cleanupExpired()
      expect(result.cleaned).toBe(1)
      expect(result.details).toContainEqual({ key: 'expiringKey', reason: 'expired' })
    })
  })
})
