import type { IStorageProvider, DatabaseHealthStatus, SetItemOptions } from './types'
import { StorageError, validateStorageKey, validateStorageValue } from './errors'
import { isStructuredErrorLike } from '../../utils/error'
import { STORAGE_CONSTRAINTS } from '../../constants/constraints'

export class MemoryStorageProvider implements IStorageProvider {
  private storage = new Map<string, { value: string; expiresAt?: number }>()

  async getItem(key: string): Promise<string | null> {
    try {
      validateStorageKey(key)
      const record = this.storage.get(key)
      if (!record) {
        return null
      }
      if (record.expiresAt && record.expiresAt < Date.now()) {
        this.storage.delete(key)
        return null
      }
      return record.value
    } catch (error) {
      if (error instanceof StorageError) {
        throw error
      }
      throw new StorageError(`Failed to get storage item: ${key}`, 'read')
    }
  }

  async getItems(keys: string[]): Promise<Record<string, string | null>> {
    if (!Array.isArray(keys)) {
      throw new StorageError('Keys must be an array', 'validation')
    }

    if (keys.length === 0) {
      return {}
    }

    try {
      keys.forEach((key) => validateStorageKey(key))

      const result: Record<string, string | null> = {}
      const now = Date.now()
      for (const key of keys) {
        const record = this.storage.get(key)
        if (!record) {
          result[key] = null
        } else if (record.expiresAt && record.expiresAt < now) {
          this.storage.delete(key)
          result[key] = null
        } else {
          result[key] = record.value
        }
      }

      return result
    } catch (error) {
      if (error instanceof StorageError) {
        throw error
      }
      throw new StorageError('Failed to get items batch', 'read')
    }
  }

  async setItem(key: string, value: string, options?: SetItemOptions): Promise<void> {
    try {
      validateStorageKey(key)
      validateStorageValue(value)
      const now = Date.now()
      let expiresAt: number | undefined
      if (options?.ttl !== undefined && options.ttl > 0) {
        expiresAt = now + options.ttl
      }
      this.storage.set(key, { value, expiresAt })
    } catch (error) {
      if (error instanceof StorageError) {
        throw error
      }
      throw new StorageError(`Failed to set storage item: ${key}`, 'write')
    }
  }

  /**
   * 删除存储项
   * @param key 存储键
   */
  async removeItem(key: string): Promise<void> {
    try {
      validateStorageKey(key)
      this.storage.delete(key)
    } catch (error) {
      if (error instanceof StorageError) {
        throw error
      }
      throw new StorageError(`Failed to remove storage item: ${key}`, 'delete')
    }
  }

  /**
   * 清空所有存储项
   */
  async clearAll(): Promise<void> {
    try {
      this.storage.clear()
    } catch (error) {
      throw new StorageError('Failed to clear all storage items', 'clear')
    }
  }

  /**
   * 更新数据
   * @param key 存储键
   * @param modifier 修改函数
   */
  async updateData<T>(key: string, modifier: (currentValue: T | null) => T): Promise<void> {
    try {
      const currentValue = await this.getItem(key)
      let parsedValue: T | null = null

      if (currentValue) {
        try {
          parsedValue = JSON.parse(currentValue) as T
        } catch (parseError) {
          throw new StorageError(
            `Failed to parse stored data for key "${key}": ${parseError instanceof Error ? parseError.message : 'Invalid JSON'}`,
            'read'
          )
        }
      }

      const newValue = modifier(parsedValue)
      await this.setItem(key, JSON.stringify(newValue))
    } catch (error) {
      if (error instanceof StorageError) {
        throw error
      }

      if (isStructuredErrorLike(error)) {
        throw error
      }

      if (
        error instanceof Error &&
        (error.name.includes('Error') ||
          error.constructor.name !== 'Error' ||
          error.message.includes('Model') ||
          error.message.includes('not found') ||
          error.message.includes('not exist'))
      ) {
        throw error
      }
      throw new StorageError(`Failed to update data: ${key}`, 'write')
    }
  }

  async batchUpdate(
    operations: Array<{
      key: string
      operation: 'set' | 'remove'
      value?: string
      options?: SetItemOptions
    }>
  ): Promise<void> {
    try {
      for (const op of operations) {
        if (op.operation === 'set' && op.value !== undefined) {
          await this.setItem(op.key, op.value, op.options)
        } else if (op.operation === 'remove') {
          await this.removeItem(op.key)
        }
      }
    } catch (error) {
      if (error instanceof StorageError) {
        throw error
      }
      throw new StorageError('Failed to perform batch update', 'write')
    }
  }

  getCapabilities() {
    return {
      supportsAtomic: true,
      supportsBatch: true,
      supportsTTL: true,
      maxStorageSize: undefined,
    }
  }

  /**
   * 获取存储项数量
   * @returns 存储项数量
   */
  get size(): number {
    return this.storage.size
  }

  /**
   * 获取所有存储键
   * @returns 所有键的数组
   */
  async keys(): Promise<string[]> {
    try {
      return Array.from(this.storage.keys())
    } catch (error) {
      throw new StorageError('Failed to get all keys', 'read')
    }
  }

  /**
   * 检查是否包含指定键
   * @param key 存储键
   * @returns 是否包含该键
   */
  has(key: string): boolean {
    return this.storage.has(key)
  }

  /**
   * 获取所有存储键（同步版本，向后兼容）
   * @returns 所有键的数组
   */
  getAllKeys(): string[] {
    return Array.from(this.storage.keys())
  }

  async getDatabaseStats(): Promise<{
    itemCount: number
    totalSize: number
    oldestRecord: number | null
    newestRecord: number | null
    averageRecordSize: number
  }> {
    const items = Array.from(this.storage.entries())
    const now = Date.now()
    const validItems = items.filter(([, record]) => {
      if (record.expiresAt && record.expiresAt < now) {
        return false
      }
      return true
    })
    const itemCount = validItems.length
    const totalSize = validItems.reduce((sum, [, record]) => sum + record.value.length, 0)

    return {
      itemCount,
      totalSize,
      oldestRecord: null,
      newestRecord: null,
      averageRecordSize: itemCount > 0 ? totalSize / itemCount : 0,
    }
  }

  async healthCheck(): Promise<DatabaseHealthStatus> {
    const result: DatabaseHealthStatus = {
      healthy: true,
      canRead: false,
      canWrite: false,
      canDelete: false,
      latency: 0,
      errors: [],
      timestamp: Date.now(),
    }

    const testKey = STORAGE_CONSTRAINTS.HEALTH_CHECK_TEST_KEY
    const testValue = `health_check_${Date.now()}`
    const startTime = Date.now()

    try {
      try {
        this.storage.set(testKey, { value: testValue })
        result.canWrite = true
      } catch (writeError) {
        result.healthy = false
        result.errors.push(
          `Write failed: ${writeError instanceof Error ? writeError.message : 'Unknown error'}`
        )
      }

      if (result.canWrite) {
        try {
          const record = this.storage.get(testKey)
          if (record?.value === testValue) {
            result.canRead = true
          } else {
            result.healthy = false
            result.errors.push('Read verification failed: value mismatch')
          }
        } catch (readError) {
          result.healthy = false
          result.errors.push(
            `Read failed: ${readError instanceof Error ? readError.message : 'Unknown error'}`
          )
        }
      }

      if (result.canWrite) {
        try {
          this.storage.delete(testKey)
          const verifyDeleted = this.storage.get(testKey)
          if (verifyDeleted === undefined) {
            result.canDelete = true
          } else {
            result.healthy = false
            result.errors.push('Delete verification failed: key still exists')
          }
        } catch (deleteError) {
          result.healthy = false
          result.errors.push(
            `Delete failed: ${deleteError instanceof Error ? deleteError.message : 'Unknown error'}`
          )
        }
      }

      result.latency = Date.now() - startTime

      if (result.latency > STORAGE_CONSTRAINTS.HEALTH_CHECK_TIMEOUT_MS) {
        result.healthy = false
        result.errors.push(
          `Health check timeout: ${result.latency}ms > ${STORAGE_CONSTRAINTS.HEALTH_CHECK_TIMEOUT_MS}ms`
        )
      }
    } catch (error) {
      result.healthy = false
      result.errors.push(
        `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }

    return result
  }

  async getExpiredKeys(): Promise<string[]> {
    const now = Date.now()
    const expiredKeys: string[] = []
    for (const [key, record] of this.storage.entries()) {
      if (record.expiresAt && record.expiresAt < now) {
        expiredKeys.push(key)
      }
    }
    return expiredKeys
  }

  async cleanupExpired(): Promise<{
    cleaned: number
    failed: number
    details: Array<{ key: string; reason: string }>
  }> {
    const expiredKeys = await this.getExpiredKeys()
    const result = {
      cleaned: 0,
      failed: 0,
      details: [] as Array<{ key: string; reason: string }>,
    }

    for (const key of expiredKeys) {
      this.storage.delete(key)
      result.cleaned++
      result.details.push({ key, reason: 'expired' })
    }

    return result
  }
}
