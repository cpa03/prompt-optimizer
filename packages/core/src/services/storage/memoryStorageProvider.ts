import type { IStorageProvider, DatabaseHealthStatus } from './types'
import { StorageError, validateStorageKey, validateStorageValue } from './errors'
import { isStructuredErrorLike } from '../../utils/error'
import { STORAGE_CONSTRAINTS } from '../../constants/constraints'

/**
 * 内存存储提供者
 * 用于 Node.js 环境（如 Electron 主进程）和测试环境
 * 数据仅存储在内存中，应用重启后会丢失
 */
export class MemoryStorageProvider implements IStorageProvider {
  private storage = new Map<string, string>()

  /**
   * 获取存储项
   * @param key 存储键
   * @returns 存储值或null
   */
  async getItem(key: string): Promise<string | null> {
    try {
      validateStorageKey(key)
      const value = this.storage.get(key)
      return value !== undefined ? value : null
    } catch (error) {
      if (error instanceof StorageError) {
        throw error
      }
      throw new StorageError(`Failed to get storage item: ${key}`, 'read')
    }
  }

  /**
   * 设置存储项
   * @param key 存储键
   * @param value 存储值
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      validateStorageKey(key)
      validateStorageValue(value)
      this.storage.set(key, value)
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

  /**
   * 批量更新
   * @param operations 操作数组
   */
  async batchUpdate(
    operations: Array<{
      key: string
      operation: 'set' | 'remove'
      value?: string
    }>
  ): Promise<void> {
    try {
      for (const op of operations) {
        if (op.operation === 'set' && op.value !== undefined) {
          await this.setItem(op.key, op.value)
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

  /**
   * 获取存储能力
   * @returns 存储能力信息
   */
  getCapabilities() {
    return {
      supportsAtomic: true,
      supportsBatch: true,
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

  /**
   * 存储健康检查
   * 检查存储的读写删能力，返回详细的健康状态
   */
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
      // 检查写入能力
      try {
        this.storage.set(testKey, testValue)
        result.canWrite = true
      } catch (writeError) {
        result.healthy = false
        result.errors.push(
          `Write failed: ${writeError instanceof Error ? writeError.message : 'Unknown error'}`
        )
      }

      // 检查读取能力
      if (result.canWrite) {
        try {
          const readValue = this.storage.get(testKey)
          if (readValue === testValue) {
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

      // 检查删除能力
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

      // 检查超时
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
}
