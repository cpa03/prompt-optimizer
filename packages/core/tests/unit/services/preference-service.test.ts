import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryStorageProvider } from '../../../src/services/storage/memoryStorageProvider'
import { PreferenceService } from '../../../src/services/preference/service'
import type { IStorageProvider } from '../../../src/services/storage/types'

describe('PreferenceService', () => {
  let storage: MemoryStorageProvider
  let preferenceService: PreferenceService

  beforeEach(async () => {
    storage = new MemoryStorageProvider()
    preferenceService = new PreferenceService(storage)
  })

  describe('keys() method', () => {
    it('should return empty array when no preferences exist', async () => {
      const keys = await preferenceService.keys()
      expect(keys).toEqual([])
    })

    it('should return keys from storage after setting values', async () => {
      await preferenceService.set('test-key-1', 'value1')
      await preferenceService.set('test-key-2', 'value2')

      const keys = await preferenceService.keys()

      expect(keys).toHaveLength(2)
      expect(keys).toContain('test-key-1')
      expect(keys).toContain('test-key-2')
    })

    it('should reflect storage state not cache after restart', async () => {
      await preferenceService.set('persisted-key', 'value')

      const keysBefore = await preferenceService.keys()
      expect(keysBefore).toContain('persisted-key')

      const newPreferenceService = new PreferenceService(storage)

      const keysAfter = await newPreferenceService.keys()
      expect(keysAfter).toContain('persisted-key')
    })

    it('should only return keys with preference prefix', async () => {
      await storage.setItem('pref:user-key', JSON.stringify('user-value'))
      await storage.setItem('other:key', JSON.stringify('other-value'))

      const keys = await preferenceService.keys()

      expect(keys).toContain('user-key')
      expect(keys).not.toContain('other:key')
      expect(keys).not.toContain('pref:other:key')
    })

    it('should update cache when querying keys', async () => {
      await preferenceService.set('key1', 'value1')

      await preferenceService.keys()

      await preferenceService.delete('key1')
      await storage.setItem('pref:key2', JSON.stringify('value2'))

      const keys = await preferenceService.keys()

      expect(keys).not.toContain('key1')
      expect(keys).toContain('key2')
    })
  })

  describe('clear() method', () => {
    it('should clear all preferences', async () => {
      await preferenceService.set('key1', 'value1')
      await preferenceService.set('key2', 'value2')

      await preferenceService.clear()

      const keys = await preferenceService.keys()
      expect(keys).toEqual([])
    })

    it('should clear preferences that exist in storage', async () => {
      await preferenceService.set('existing-key', 'value')

      const newService = new PreferenceService(storage)
      await newService.clear()

      const keys = await newService.keys()
      expect(keys).toEqual([])
    })
  })

  describe('get and set operations', () => {
    it('should store and retrieve values', async () => {
      await preferenceService.set('test-key', 'test-value')
      const value = await preferenceService.get('test-key', 'default')
      expect(value).toBe('test-value')
    })

    it('should return default value for non-existent key', async () => {
      const value = await preferenceService.get('non-existent', 'default-value')
      expect(value).toBe('default-value')
    })

    it('should store complex objects', async () => {
      const complexValue = { name: 'test', count: 42, nested: { value: true } }
      await preferenceService.set('complex', complexValue)
      const retrieved = await preferenceService.get('complex', null)
      expect(retrieved).toEqual(complexValue)
    })

    it('should delete values', async () => {
      await preferenceService.set('to-delete', 'value')
      await preferenceService.delete('to-delete')
      const value = await preferenceService.get('to-delete', 'default')
      expect(value).toBe('default')
    })
  })

  describe('getAll method', () => {
    it('should return all stored preferences', async () => {
      await preferenceService.set('key1', 'value1')
      await preferenceService.set('key2', 'value2')

      const all = await preferenceService.getAll()

      expect(all['key1']).toBe('value1')
      expect(all['key2']).toBe('value2')
    })

    it('should return empty object when no preferences', async () => {
      const all = await preferenceService.getAll()
      expect(all).toEqual({})
    })
  })

  describe('import/export functionality', () => {
    it('should export all preferences', async () => {
      await preferenceService.set('export-key', 'export-value')
      const exported = await preferenceService.exportData()
      expect(exported['export-key']).toBe('export-value')
    })

    it('should import valid preferences', async () => {
      await preferenceService.importData({
        'app:settings:ui:theme-id': 'dark',
      })

      const value = await preferenceService.get('app:settings:ui:theme-id', 'default')
      expect(value).toBe('dark')
    })

    it('should reject invalid data format', async () => {
      await expect(preferenceService.importData(null)).rejects.toThrow()
      await expect(preferenceService.importData('not-an-object')).rejects.toThrow()
      await expect(preferenceService.importData([])).rejects.toThrow()
    })

    it('should validate data type', async () => {
      const isValid = await preferenceService.validateData({
        key1: 'value1',
        key2: 123,
        key3: true,
      })
      expect(isValid).toBe(true)
    })

    it('should reject invalid data types in values', async () => {
      const isValid = await preferenceService.validateData({
        key1: { nested: 'object' },
      })
      expect(isValid).toBe(false)
    })
  })
})
