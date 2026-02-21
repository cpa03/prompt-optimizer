import type { IPreferenceService } from './types'
import type { IStorageProvider } from '../storage/types'
import { ImportExportError } from '../../interfaces/import-export'
import { IMPORT_EXPORT_ERROR_CODES } from '../../constants/error-codes'
import { VALIDATION_CONSTRAINTS } from '../../constants/constraints'
import { StorageError } from '../storage/errors'
import { isStructuredErrorLike, toErrorWithCode } from '../../utils/error'
import { PREFERENCE_CONFIG } from '../../config/core-config'

// 需要导出的UI配置键 - 白名单验证
const UI_SETTINGS_KEYS = [
  'app:settings:ui:theme-id',
  'app:settings:ui:preferred-language',
  'app:settings:ui:builtin-template-language',

  // 已废弃：模型选择已迁移到各模式的 session store
  // 保留用于导入旧版本数据时的向后兼容，避免导入失败
  // TODO: 确认无旧数据后可安全移除（预计 v3.0）
  'app:selected-optimize-model',
  'app:selected-test-model',

  PREFERENCE_CONFIG.keys.selectedOptimizeTemplate, // 系统优化模板
  PREFERENCE_CONFIG.keys.selectedUserOptimizeTemplate, // 用户优化模板
  PREFERENCE_CONFIG.keys.selectedIterateTemplate, // 迭代模板
] as const

// 旧版本键名映射表 - 用于兼容性处理
const LEGACY_KEY_MAPPING: Record<string, string> = {
  // 旧版本的简短键名 -> 新版本的完整键名
  'theme-id': 'app:settings:ui:theme-id',
  'preferred-language': 'app:settings:ui:preferred-language',
  'builtin-template-language': 'app:settings:ui:builtin-template-language',
  // 其他键名保持不变，因为它们已经有正确的前缀
}

/**
 * 将旧版本键名转换为新版本键名
 * @param key 原始键名
 * @returns 标准化后的键名
 */
const normalizeSettingKey = (key: string): string => {
  return LEGACY_KEY_MAPPING[key] || key
}

/**
 * 验证UI配置键是否安全
 */
const isValidSettingKey = (key: string): boolean => {
  // 先标准化键名，再验证
  const normalizedKey = normalizeSettingKey(key)
  return (
    UI_SETTINGS_KEYS.includes(normalizedKey as any) &&
    normalizedKey.length <= VALIDATION_CONSTRAINTS.KEY_MAX_LENGTH &&
    normalizedKey.length >= VALIDATION_CONSTRAINTS.KEY_MIN_LENGTH &&
    !/[<>"\\'&\x00-\x1f\x7f-\x9f]/.test(normalizedKey)
  ) // 排除危险字符和控制字符
}

/**
 * 验证UI配置值是否安全
 */
const isValidSettingValue = (value: any): value is string => {
  return (
    typeof value === 'string' &&
    value.length <= VALIDATION_CONSTRAINTS.VALUE_MAX_LENGTH && // 限制值的长度
    !/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]/.test(value)
  ) // 排除控制字符
}

/**
 * 基于IStorageProvider的偏好设置服务实现
 */
export class PreferenceService implements IPreferenceService {
  private readonly PREFIX = PREFERENCE_CONFIG.prefix
  private keyCache: Set<string> = new Set()
  private storageProvider: IStorageProvider

  constructor(storageProvider: IStorageProvider) {
    this.storageProvider = storageProvider
  }

  /**
   * 获取偏好设置
   * @param key 键名
   * @param defaultValue 默认值
   * @returns 设置值，如果不存在则返回默认值
   */
  async get<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const prefKey = this.getPrefKey(key)
      const storedValue = await this.storageProvider.getItem(prefKey)

      if (storedValue === null) {
        return defaultValue
      }
      // 将键添加到缓存中
      this.keyCache.add(key)
      return JSON.parse(storedValue) as T
    } catch (error) {
      console.error(`[PreferenceService] Error getting preference for key "${key}":`, error)
      if (isStructuredErrorLike(error)) {
        throw toErrorWithCode(error)
      }
      const details = error instanceof Error ? error.message : String(error)
      throw new StorageError(`Failed to get preference: ${details}`, 'read')
    }
  }

  /**
   * 设置偏好设置
   * @param key 键名
   * @param value 值
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      const prefKey = this.getPrefKey(key)
      const stringValue = JSON.stringify(value)

      await this.storageProvider.setItem(prefKey, stringValue)
      // 将键添加到缓存中
      this.keyCache.add(key)
    } catch (error) {
      console.error(`[PreferenceService] Error setting preference for key "${key}":`, error)
      if (isStructuredErrorLike(error)) {
        throw toErrorWithCode(error)
      }
      const details = error instanceof Error ? error.message : String(error)
      throw new StorageError(`Failed to set preference: ${details}`, 'write')
    }
  }

  /**
   * 删除偏好设置
   * @param key 键名
   */
  async delete(key: string): Promise<void> {
    try {
      const prefKey = this.getPrefKey(key)
      await this.storageProvider.removeItem(prefKey)
      // 从缓存中移除键
      this.keyCache.delete(key)
    } catch (error) {
      console.error(`[PreferenceService] Error deleting preference for key "${key}":`, error)
      if (isStructuredErrorLike(error)) {
        throw toErrorWithCode(error)
      }
      const details = error instanceof Error ? error.message : String(error)
      throw new StorageError(`Failed to delete preference: ${details}`, 'delete')
    }
  }

  /**
   * 获取所有偏好设置的键名
   * 从存储中查询所有以prefix开头的键，并去除前缀后返回
   * @returns 键名列表
   */
  async keys(): Promise<string[]> {
    try {
      const allKeys = await this.storageProvider.keys()
      const prefKeys = allKeys
        .filter((key) => key.startsWith(this.PREFIX))
        .map((key) => key.slice(this.PREFIX.length))

      // 更新缓存以保持同步
      this.keyCache = new Set(prefKeys)

      return prefKeys
    } catch (error) {
      console.error('[PreferenceService] Error getting preference keys:', error)
      // 如果存储查询失败，返回缓存作为降级
      return Array.from(this.keyCache)
    }
  }

  /**
   * 清除所有偏好设置
   */
  async clear(): Promise<void> {
    try {
      const prefKeys = await this.keys()
      await Promise.all(prefKeys.map((key) => this.delete(key)))
      this.keyCache.clear()
    } catch (error) {
      console.error('[PreferenceService] Error clearing preferences:', error)
      if (isStructuredErrorLike(error)) {
        throw toErrorWithCode(error)
      }
      const details = error instanceof Error ? error.message : String(error)
      throw new StorageError(`Failed to clear preferences: ${details}`, 'clear')
    }
  }

  /**
   * 获取所有偏好设置
   * 使用批量读取优化性能（单次存储调用替代N次单独调用）
   * @returns 包含所有偏好设置的键值对对象（使用原始键名，不带前缀）
   */
  async getAll(): Promise<Record<string, string>> {
    try {
      const allKeys = await this.keys()

      if (allKeys.length === 0) {
        return {}
      }

      const prefKeys = allKeys.map((key) => this.getPrefKey(key))

      if ('getItems' in this.storageProvider && typeof this.storageProvider.getItems === 'function') {
        const batchResult = await this.storageProvider.getItems(prefKeys)

        const result: Record<string, string> = {}
        for (const key of allKeys) {
          const prefKey = this.getPrefKey(key)
          const storedValue = batchResult[prefKey]
          if (storedValue !== null && storedValue !== undefined) {
            try {
              const parsed = JSON.parse(storedValue)
              result[key] = String(parsed)
            } catch {
              console.warn(`[PreferenceService] Failed to parse preference for key "${key}": invalid JSON`)
            }
          }
        }

        return result
      }

      const entries = await Promise.all(
        allKeys.map(async (key) => {
          try {
            const value = await this.get<string | null>(key, null)
            return value !== null ? ([key, String(value)] as const) : null
          } catch (error) {
            console.warn(`[PreferenceService] Failed to get preference for key "${key}":`, error)
            return null
          }
        })
      )

      const result: Record<string, string> = {}
      for (const entry of entries) {
        if (entry !== null) {
          result[entry[0]] = entry[1]
        }
      }

      return result
    } catch (error) {
      console.error('[PreferenceService] Error getting all preferences:', error)
      if (isStructuredErrorLike(error)) {
        throw toErrorWithCode(error)
      }
      const details = error instanceof Error ? error.message : String(error)
      throw new StorageError(`Failed to get all preferences: ${details}`, 'read')
    }
  }

  // 实现 IImportExportable 接口

  /**
   * 导出所有偏好设置
   */
  async exportData(): Promise<Record<string, string>> {
    try {
      return await this.getAll()
    } catch (error) {
      throw new ImportExportError(
        'Failed to export preference data',
        await this.getDataType(),
        error as Error,
        IMPORT_EXPORT_ERROR_CODES.EXPORT_FAILED
      )
    }
  }

  /**
   * 导入偏好设置
   */
  async importData(data: any): Promise<void> {
    if (!(await this.validateData(data))) {
      throw new ImportExportError(
        'Invalid preference data format: data must be an object with string key-value pairs',
        await this.getDataType(),
        undefined,
        IMPORT_EXPORT_ERROR_CODES.VALIDATION_ERROR
      )
    }

    const preferences = data as Record<string, string>
    const failedSettings: { key: string; error: Error }[] = []

    for (const [key, value] of Object.entries(preferences)) {
      try {
        // 验证键名是否安全且在白名单中
        if (!isValidSettingKey(key)) {
          console.warn(`Skipping invalid UI configuration key: ${key}`)
          continue
        }

        // 验证值是否安全
        if (!isValidSettingValue(value)) {
          console.warn(`Skipping invalid UI configuration value ${key}: type=${typeof value}`)
          continue
        }

        // 标准化键名（处理旧版本兼容性）
        const normalizedKey = normalizeSettingKey(key)

        await this.set(normalizedKey, value)

        // 如果键名被转换了，显示转换信息
        if (normalizedKey !== key) {
          console.log(
            `Imported UI configuration (legacy key converted): ${key} -> ${normalizedKey} = ${value}`
          )
        } else {
          console.log(`Imported UI configuration: ${normalizedKey} = ${value}`)
        }
      } catch (error) {
        console.warn(`Failed to import UI setting ${key}:`, error)
        failedSettings.push({ key, error: error as Error })
      }
    }

    if (failedSettings.length > 0) {
      console.warn(`Failed to import ${failedSettings.length} UI settings`)
      // 不抛出错误，允许部分成功的导入
    }
  }

  /**
   * 获取数据类型标识
   */
  async getDataType(): Promise<string> {
    return 'userSettings'
  }

  /**
   * 验证偏好设置数据格式
   */
  async validateData(data: any): Promise<boolean> {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      return false
    }

    return Object.entries(data).every(
      ([key, value]) =>
        typeof key === 'string' &&
        (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
    )
  }

  /**
   * 获取带前缀的键名
   * @param key 原始键名
   * @returns 带前缀的键名
   * @private
   */
  private getPrefKey(key: string): string {
    return `${this.PREFIX}${key}`
  }
}

/**
 * 创建偏好设置服务
 * @param storageProvider 存储提供器
 * @returns 偏好设置服务实例
 */
export function createPreferenceService(storageProvider: IStorageProvider): IPreferenceService {
  return new PreferenceService(storageProvider)
}
