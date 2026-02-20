import { IStorageProvider, type DatabaseHealthStatus } from './types'
import { StorageError, validateStorageKey, validateStorageValue } from './errors'
import { STORAGE_CONSTRAINTS } from '../../constants/constraints'

/**
 * 简单的异步锁实现
 */
class AsyncLock {
  private locks: Map<string, Promise<void>> = new Map()

  async acquire(key: string): Promise<() => void> {
    // 等待现有锁完成，带最大重试限制防止无限循环
    let attempts = 0
    const maxAttempts = STORAGE_CONSTRAINTS.LOCK_MAX_ATTEMPTS

    while (this.locks.has(key)) {
      attempts++
      if (attempts > maxAttempts) {
        throw new StorageError(
          `Failed to acquire lock for key "${key}" after ${maxAttempts} attempts`,
          'lock'
        )
      }

      try {
        await this.locks.get(key)
      } catch (lockError) {
        // 锁操作失败，记录但继续尝试
        console.warn(
          `[AsyncLock] Lock operation failed for key "${key}" (attempt ${attempts}):`,
          lockError
        )
        // 短暂延迟后重试，避免CPU忙等
        await new Promise((resolve) => setTimeout(resolve, STORAGE_CONSTRAINTS.LOCK_RETRY_DELAY_MS))
      }
    }

    // 创建新锁
    let releaseLock: () => void
    const lockPromise = new Promise<void>((resolve) => {
      releaseLock = () => {
        this.locks.delete(key)
        resolve()
      }
    })

    this.locks.set(key, lockPromise)

    // 返回释放函数
    return releaseLock!
  }
}

/**
 * 增强的LocalStorageProvider，提供事务性操作
 */
export class LocalStorageProvider implements IStorageProvider {
  private lock = new AsyncLock()

  public async getItem(key: string): Promise<string | null> {
    const release = await this.lock.acquire(key)
    try {
      validateStorageKey(key)
      const item = localStorage.getItem(key)
      return item
    } catch (error) {
      if (error instanceof StorageError) {
        throw error
      }
      throw new StorageError(`Failed to get storage item: ${key}`, 'read')
    } finally {
      release()
    }
  }

  public async setItem(key: string, value: string): Promise<void> {
    const release = await this.lock.acquire(key)
    try {
      validateStorageKey(key)
      validateStorageValue(value)
      localStorage.setItem(key, value)
    } catch (error) {
      if (error instanceof StorageError) {
        throw error
      }
      throw new StorageError(`Failed to set storage item: ${key}`, 'write')
    } finally {
      release()
    }
  }

  public async removeItem(key: string): Promise<void> {
    const release = await this.lock.acquire(key)
    try {
      validateStorageKey(key)
      localStorage.removeItem(key)
    } catch (error) {
      if (error instanceof StorageError) {
        throw error
      }
      throw new StorageError(`Failed to remove storage item: ${key}`, 'delete')
    } finally {
      release()
    }
  }

  public async clearAll(): Promise<void> {
    const release = await this.lock.acquire('__clear_all__')
    try {
      localStorage.clear()
    } catch (error) {
      throw new StorageError('Failed to clear all storage items', 'clear')
    } finally {
      release()
    }
  }

  /**
   * 隐藏式数据更新 - 内部自动选择最优实现
   * 业务层无需关心是否支持原子操作
   * @param key 存储键
   * @param modifier 修改函数，接收当前值，返回新值
   */
  public async updateData<T>(key: string, modifier: (currentValue: T | null) => T): Promise<void> {
    // LocalStorageProvider 内部使用手动原子操作
    const release = await this.lock.acquire(key)
    try {
      // 读取当前值
      const currentData = localStorage.getItem(key)
      let currentValue: T | null = null

      if (currentData) {
        try {
          currentValue = JSON.parse(currentData) as T
        } catch (parseError) {
          throw new StorageError(
            `Failed to parse stored data for key "${key}": ${parseError instanceof Error ? parseError.message : 'Invalid JSON'}`,
            'read'
          )
        }
      }

      // 应用修改 - 允许业务逻辑错误透传
      const newValue = modifier(currentValue)

      // 写入新值
      localStorage.setItem(key, JSON.stringify(newValue))
    } catch (error) {
      // 如果已经是StorageError，直接抛出
      if (error instanceof StorageError) {
        throw error
      }

      // 业务逻辑错误直接透传，保持错误类型
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
      // 只有真正的存储错误才包装为StorageError
      throw new StorageError(`Failed to update data: ${key}`, 'write')
    } finally {
      release()
    }
  }

  /**
   * 获取存储能力信息
   */
  public getCapabilities() {
    return {
      supportsAtomic: true, // 通过手动锁实现
      supportsBatch: true,
      maxStorageSize: STORAGE_CONSTRAINTS.MAX_STORAGE_SIZE_BYTES,
    }
  }

  /**
   * 获取所有存储键
   */
  public async keys(): Promise<string[]> {
    const release = await this.lock.acquire('__keys__')
    try {
      const keys: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key !== null) {
          keys.push(key)
        }
      }
      return keys
    } catch (error) {
      throw new StorageError('Failed to get all keys', 'read')
    } finally {
      release()
    }
  }

  /**
   * 批量操作
   * @param operations 批量操作列表
   */
  public async batchUpdate(
    operations: Array<{
      key: string
      operation: 'set' | 'remove'
      value?: string
    }>
  ): Promise<void> {
    // 获取所有相关键的锁
    const keys = operations.map((op) => op.key)
    const releases = await Promise.all(keys.map((key) => this.lock.acquire(key)))

    try {
      for (const op of operations) {
        if (op.operation === 'set' && op.value !== undefined) {
          localStorage.setItem(op.key, op.value)
        } else if (op.operation === 'remove') {
          localStorage.removeItem(op.key)
        }
      }
    } catch (error) {
      throw new StorageError('Failed to perform batch update', 'write')
    } finally {
      // 释放所有锁
      releases.forEach((release) => release())
    }
  }

  /**
   * 获取存储统计信息
   * 返回存储项数量、总大小等统计信息
   */
  public async getDatabaseStats(): Promise<{
    itemCount: number
    totalSize: number
    oldestRecord: number | null
    newestRecord: number | null
    averageRecordSize: number
  }> {
    const keys = await this.keys()
    let totalSize = 0

    for (const key of keys) {
      const value = localStorage.getItem(key)
      if (value !== null) {
        totalSize += value.length
      }
    }

    return {
      itemCount: keys.length,
      totalSize,
      oldestRecord: null,
      newestRecord: null,
      averageRecordSize: keys.length > 0 ? totalSize / keys.length : 0,
    }
  }

  /**
   * 存储健康检查
   * 检查存储的读写删能力，返回详细的健康状态
   */
  public async healthCheck(): Promise<DatabaseHealthStatus> {
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
        localStorage.setItem(testKey, testValue)
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
          const readValue = localStorage.getItem(testKey)
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
          localStorage.removeItem(testKey)
          const verifyDeleted = localStorage.getItem(testKey)
          if (verifyDeleted === null) {
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
