import { IStorageProvider, type DatabaseHealthStatus, type SetItemOptions } from './types'
import { StorageError, validateStorageKey, validateStorageValue } from './errors'
import { STORAGE_CONSTRAINTS } from '../../constants/constraints'

class AsyncLock {
  private locks: Map<string, Promise<void>> = new Map()

  async acquire(key: string): Promise<() => void> {
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
        console.warn(
          `[AsyncLock] Lock operation failed for key "${key}" (attempt ${attempts}):`,
          lockError
        )
        await new Promise((resolve) => setTimeout(resolve, STORAGE_CONSTRAINTS.LOCK_RETRY_DELAY_MS))
      }
    }

    let releaseLock: () => void
    const lockPromise = new Promise<void>((resolve) => {
      releaseLock = () => {
        this.locks.delete(key)
        resolve()
      }
    })

    this.locks.set(key, lockPromise)

    return releaseLock!
  }
}

export class LocalStorageProvider implements IStorageProvider {
  private lock = new AsyncLock()

  public async getItem(key: string): Promise<string | null> {
    const release = await this.lock.acquire(key)
    try {
      validateStorageKey(key)
      const item = localStorage.getItem(key)
      if (!item) {
        return null
      }
      
      try {
        const parsed = JSON.parse(item)
        if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
          localStorage.removeItem(key)
          console.log(`[LocalStorage] Item expired and removed: ${key}`)
          return null
        }
        return parsed.value
      } catch {
        return item
      }
    } catch (error) {
      if (error instanceof StorageError) {
        throw error
      }
      throw new StorageError(`Failed to get storage item: ${key}`, 'read')
    } finally {
      release()
    }
  }

  public async getItems(keys: string[]): Promise<Record<string, string | null>> {
    if (!Array.isArray(keys)) {
      throw new StorageError('Keys must be an array', 'validation')
    }

    if (keys.length === 0) {
      return {}
    }

    const releases = await Promise.all(keys.map((key) => this.lock.acquire(key)))

    try {
      keys.forEach((key) => validateStorageKey(key))

      const result: Record<string, string | null> = {}
      const now = Date.now()
      for (const key of keys) {
        const item = localStorage.getItem(key)
        if (!item) {
          result[key] = null
          continue
        }
        
        try {
          const parsed = JSON.parse(item)
          if (parsed.expiresAt && parsed.expiresAt < now) {
            localStorage.removeItem(key)
            result[key] = null
          } else {
            result[key] = parsed.value
          }
        } catch {
          result[key] = item
        }
      }

      return result
    } catch (error) {
      if (error instanceof StorageError) {
        throw error
      }
      throw new StorageError('Failed to get items batch', 'read')
    } finally {
      releases.forEach((release) => release())
    }
  }

  public async setItem(key: string, value: string, options?: SetItemOptions): Promise<void> {
    const release = await this.lock.acquire(key)
    try {
      validateStorageKey(key)
      validateStorageValue(value)
      
      const now = Date.now()
      let expiresAt: number | undefined
      if (options?.ttl !== undefined && options.ttl > 0) {
        expiresAt = now + options.ttl
      }
      
      const record = JSON.stringify({ value, expiresAt, timestamp: now })
      localStorage.setItem(key, record)
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

  public getCapabilities() {
    return {
      supportsAtomic: true,
      supportsBatch: true,
      supportsTTL: true,
      maxStorageSize: STORAGE_CONSTRAINTS.MAX_STORAGE_SIZE_BYTES,
    }
  }

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

  public async batchUpdate(
    operations: Array<{
      key: string
      operation: 'set' | 'remove'
      value?: string
      options?: SetItemOptions
    }>
  ): Promise<void> {
    const keys = operations.map((op) => op.key)
    const releases = await Promise.all(keys.map((key) => this.lock.acquire(key)))

    try {
      const now = Date.now()
      for (const op of operations) {
        if (op.operation === 'set' && op.value !== undefined) {
          let expiresAt: number | undefined
          if (op.options?.ttl !== undefined && op.options.ttl > 0) {
            expiresAt = now + op.options.ttl
          }
          const record = JSON.stringify({ value: op.value, expiresAt, timestamp: now })
          localStorage.setItem(op.key, record)
        } else if (op.operation === 'remove') {
          localStorage.removeItem(op.key)
        }
      }
    } catch (error) {
      throw new StorageError('Failed to perform batch update', 'write')
    } finally {
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

  public async getExpiredKeys(): Promise<string[]> {
    const release = await this.lock.acquire('__expired_keys__')
    try {
      const expiredKeys: string[] = []
      const now = Date.now()
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key === null) continue
        
        try {
          const item = localStorage.getItem(key)
          if (!item) continue
          
          const parsed = JSON.parse(item)
          if (parsed.expiresAt && parsed.expiresAt < now) {
            expiredKeys.push(key)
          }
        } catch {
          continue
        }
      }
      
      return expiredKeys
    } finally {
      release()
    }
  }

  public async cleanupExpired(): Promise<{
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
      try {
        localStorage.removeItem(key)
        result.cleaned++
        result.details.push({ key, reason: 'expired' })
      } catch {
        result.failed++
      }
    }

    if (result.cleaned > 0) {
      console.log(`[LocalStorage] TTL cleanup: ${result.cleaned} expired items removed`)
    }

    return result
  }
}
