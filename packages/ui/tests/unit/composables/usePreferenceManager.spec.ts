import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import {
  getPreference,
  setPreference,
  usePreferences,
} from '../../../src/composables/storage/usePreferenceManager'
import type { AppServices } from '../../../src/types/services'

describe('usePreferenceManager', () => {
  let mockPreferenceService: {
    get: ReturnType<typeof vi.fn>
    set: ReturnType<typeof vi.fn>
  }
  let services: ReturnType<typeof ref<AppServices | null>>

  beforeEach(() => {
    mockPreferenceService = {
      get: vi.fn(),
      set: vi.fn(),
    }
    services = ref({
      preferenceService: mockPreferenceService,
    } as unknown as AppServices)
  })

  describe('getPreference', () => {
    it('应该从 preferenceService 获取值', async () => {
      mockPreferenceService.get.mockResolvedValue('test-value')

      const result = await getPreference(services, 'test-key', 'default')

      expect(mockPreferenceService.get).toHaveBeenCalledWith('test-key', 'default')
      expect(result).toBe('test-value')
    })

    it('应该在 preferenceService 不可用时抛出错误', async () => {
      services.value = null

      await expect(getPreference(services, 'test-key', 'default')).rejects.toThrow(
        '[getPreference] preferenceService不可用，无法获取键: test-key'
      )
    })

    it('应该在 preferenceService 属性不存在时抛出错误', async () => {
      services.value = {} as AppServices

      await expect(getPreference(services, 'test-key', 'default')).rejects.toThrow(
        '[getPreference] preferenceService不可用，无法获取键: test-key'
      )
    })

    it('应该传递不同类型的默认值', async () => {
      mockPreferenceService.get.mockResolvedValue(42)

      const result = await getPreference(services, 'number-key', 0)

      expect(mockPreferenceService.get).toHaveBeenCalledWith('number-key', 0)
      expect(result).toBe(42)
    })

    it('应该处理布尔值默认值', async () => {
      mockPreferenceService.get.mockResolvedValue(true)

      const result = await getPreference(services, 'bool-key', false)

      expect(mockPreferenceService.get).toHaveBeenCalledWith('bool-key', false)
      expect(result).toBe(true)
    })

    it('应该处理对象默认值', async () => {
      const defaultObj = { foo: 'bar' }
      const returnedObj = { foo: 'baz' }
      mockPreferenceService.get.mockResolvedValue(returnedObj)

      const result = await getPreference(services, 'obj-key', defaultObj)

      expect(mockPreferenceService.get).toHaveBeenCalledWith('obj-key', defaultObj)
      expect(result).toEqual(returnedObj)
    })
  })

  describe('setPreference', () => {
    it('应该设置值到 preferenceService', async () => {
      mockPreferenceService.set.mockResolvedValue(undefined)

      await setPreference(services, 'test-key', 'test-value')

      expect(mockPreferenceService.set).toHaveBeenCalledWith('test-key', 'test-value')
    })

    it('应该在 preferenceService 不可用时抛出错误', async () => {
      services.value = null

      await expect(setPreference(services, 'test-key', 'value')).rejects.toThrow(
        '[setPreference] preferenceService不可用，无法设置键: test-key'
      )
    })

    it('应该设置不同类型的值', async () => {
      mockPreferenceService.set.mockResolvedValue(undefined)

      await setPreference(services, 'number-key', 42)
      expect(mockPreferenceService.set).toHaveBeenCalledWith('number-key', 42)

      await setPreference(services, 'bool-key', true)
      expect(mockPreferenceService.set).toHaveBeenCalledWith('bool-key', true)

      const obj = { nested: 'value' }
      await setPreference(services, 'obj-key', obj)
      expect(mockPreferenceService.set).toHaveBeenCalledWith('obj-key', obj)
    })
  })

  describe('usePreferences', () => {
    it('应该返回包含 getPreference 和 setPreference 的对象', () => {
      const preferences = usePreferences(services)

      expect(preferences).toHaveProperty('getPreference')
      expect(preferences).toHaveProperty('setPreference')
      expect(typeof preferences.getPreference).toBe('function')
      expect(typeof preferences.setPreference).toBe('function')
    })

    it('应该正确委托 getPreference 调用', async () => {
      mockPreferenceService.get.mockResolvedValue('retrieved-value')
      const preferences = usePreferences(services)

      const result = await preferences.getPreference('my-key', 'default')

      expect(mockPreferenceService.get).toHaveBeenCalledWith('my-key', 'default')
      expect(result).toBe('retrieved-value')
    })

    it('应该正确委托 setPreference 调用', async () => {
      mockPreferenceService.set.mockResolvedValue(undefined)
      const preferences = usePreferences(services)

      await preferences.setPreference('my-key', 'my-value')

      expect(mockPreferenceService.set).toHaveBeenCalledWith('my-key', 'my-value')
    })

    it('应该在多次调用时使用相同的服务实例', async () => {
      mockPreferenceService.get.mockResolvedValue('value')
      mockPreferenceService.set.mockResolvedValue(undefined)
      const preferences = usePreferences(services)

      await preferences.getPreference('key1', 'default1')
      await preferences.setPreference('key2', 'value2')
      await preferences.getPreference('key3', 'default3')

      expect(mockPreferenceService.get).toHaveBeenCalledTimes(2)
      expect(mockPreferenceService.set).toHaveBeenCalledTimes(1)
    })
  })
})
