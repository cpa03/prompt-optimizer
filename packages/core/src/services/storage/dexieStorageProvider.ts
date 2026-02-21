import Dexie, { type Table } from 'dexie'
import { IStorageProvider, type DatabaseHealthStatus } from './types'
import {
  StorageError,
  STORAGE_VALIDATION,
  validateStorageKey,
  validateStorageValue,
} from './errors'
import { STORAGE_CONFIG } from '../../config/core-config'
import { STORAGE_CONSTRAINTS } from '../../constants/constraints'

/**
 * 数据表接口定义
 */
interface StorageRecord {
  key: string
  value: string
  timestamp?: number
  size?: number
  checksum?: string
}

/**
 * 数据库元数据接口
 */
interface DatabaseMetadata {
  version: number
  createdAt: number
  lastMigrationAt?: number
  migrationHistory: Array<{
    version: number
    timestamp: number
    description: string
  }>
}

/**
 * 数据库配置常量
 */
const DB_CONFIG = {
  currentVersion: 2,
  metadataKey: STORAGE_VALIDATION.RESERVED_KEYS[0],
  maxKeyLength: STORAGE_VALIDATION.MAX_KEY_LENGTH,
  maxValueSize: STORAGE_VALIDATION.MAX_VALUE_SIZE,
} as const

/**
 * 获取数据库名称
 *
 * 优先级：
 * 1. 测试环境：使用注入的唯一数据库名称 (window.__TEST_DB_NAME__)
 * 2. 生产环境：使用固定名称 'PromptOptimizerDB'
 */
function getDatabaseName(): string {
  // 测试环境：从 window 对象读取测试数据库名称
  if (typeof window !== 'undefined') {
    const testDbName = (window as any).__TEST_DB_NAME__
    if (testDbName) {
      return testDbName
    }
  }

  // 生产环境：使用固定名称
  return 'PromptOptimizerDB'
}

/**
 * Dexie 数据库类
 */
class PromptOptimizerDB extends Dexie {
  storage!: Table<StorageRecord, string>

  constructor() {
    super(getDatabaseName())

    // 定义数据库结构 - 版本2新增字段
    this.version(2)
      .stores({
        storage: 'key, value, timestamp, size, checksum',
      })
      .upgrade((tx) => {
        // 数据库迁移：从版本1升级到版本2
        console.log('[Database] Upgrading from version 1 to version 2')
        // 添加新字段的默认值
        tx.table('storage')
          .toCollection()
          .modify((record) => {
            if (!record.size) {
              record.size = record.value ? record.value.length : 0
            }
          })
      })
  }
}

/**
 * 基于 Dexie 的存储提供器实现
 *
 * 相比 LocalStorageProvider 的优势：
 * - 更大的存储容量（几GB vs 5MB）
 * - 原生事务支持，更好的并发安全
 * - 异步操作，不阻塞UI
 * - 更好的查询性能
 */
export class DexieStorageProvider implements IStorageProvider {
  private db: PromptOptimizerDB
  private dbOpened: Promise<void>

  // 用于原子操作的锁机制
  private keyLocks = new Map<string, Promise<void>>()

  constructor() {
    this.db = new PromptOptimizerDB()
    this.dbOpened = this.db
      .open()
      .then(async () => {
        // 初始化数据库元数据
        await this.initializeMetadata()
        return undefined
      })
      .catch((error) => {
        console.error('Failed to open Dexie database:', error)
        // 抛出错误以使所有后续操作失败
        throw error
      })
  }

  /**
   * 初始化数据库元数据
   */
  private async initializeMetadata(): Promise<void> {
    try {
      const metadata = await this.db.storage.get(DB_CONFIG.metadataKey)
      if (!metadata) {
        const now = Date.now()
        await this.db.storage.put({
          key: DB_CONFIG.metadataKey,
          value: JSON.stringify({
            version: DB_CONFIG.currentVersion,
            createdAt: now,
            migrationHistory: [
              {
                version: DB_CONFIG.currentVersion,
                timestamp: now,
                description: 'Database initialized with version 2 schema',
              },
            ],
          } as DatabaseMetadata),
          timestamp: now,
          size: 0,
        })
      }
    } catch (error) {
      console.warn('[Database] Failed to initialize metadata:', error)
      // 不抛出错误，允许数据库继续工作
    }
  }

  private validateKeyLocal(key: string): void {
    validateStorageKey(key, [DB_CONFIG.metadataKey])
  }

  private validateValueLocal(value: string): void {
    validateStorageValue(value)
  }

  /**
   * 计算校验和 - 使用改进的 FNV-1a 算法
   * FNV-1a 比 simple hash 有更好的分布性和更少的冲突
   * 性能: O(n) 时间复杂度，适合大多数场景
   */
  private calculateChecksum(value: string): string {
    // FNV-1a hash parameters
    const FNV_PRIME = 0x01000193 // 16777619
    const FNV_OFFSET_BASIS = 0x811c9dc5 // 2166136261

    let hash = FNV_OFFSET_BASIS

    for (let i = 0; i < value.length; i++) {
      hash ^= value.charCodeAt(i)
      hash = Math.imul(hash, FNV_PRIME) // 使用 imul 确保 32 位整数乘法
    }

    // 转换为无符号 32 位整数，然后转为 16 进制
    return (hash >>> 0).toString(16).padStart(8, '0')
  }

  /**
   * 确保数据库已打开
   */
  private async initialize(): Promise<void> {
    await this.dbOpened
  }

  /**
   * 重置迁移状态（主要用于测试）
   */
  static resetMigrationState(): void {
    // 因为迁移逻辑已移除，此函数不再需要
    // 保留为空函数以避免破坏测试的API
  }

  /**
   * 获取存储项
   */
  async getItem(key: string): Promise<string | null> {
    await this.initialize()

    try {
      this.validateKeyLocal(key)
      const record = await this.db.storage.get(key)
      return record?.value ?? null
    } catch (error) {
      if (error instanceof StorageError) {
        throw error
      }
      console.error(`获取存储项失败 (${key}):`, error)
      throw new StorageError(`Failed to get item: ${key}`, 'read')
    }
  }

  /**
   * 批量获取存储项
   * 性能优化：使用 Dexie 的 bulkGet 一次性获取多个键值，减少数据库访问次数
   * @param keys 要获取的键数组
   * @returns 键值映射对象，不存在的键对应 null
   */
  async getItems(keys: string[]): Promise<Record<string, string | null>> {
    await this.initialize()

    if (!Array.isArray(keys)) {
      throw new StorageError('Keys must be an array', 'validation')
    }

    if (keys.length === 0) {
      return {}
    }

    try {
      keys.forEach((key) => this.validateKeyLocal(key))

      const records = await this.db.storage.bulkGet(keys)

      const result: Record<string, string | null> = {}
      keys.forEach((key, index) => {
        const record = records[index]
        result[key] = record?.value ?? null
      })

      return result
    } catch (error) {
      if (error instanceof StorageError) {
        throw error
      }
      console.error(`批量获取存储项失败:`, error)
      throw new StorageError(`Failed to get items batch`, 'read')
    }
  }

  /**
   * 获取所有存储键
   * 优化：使用 primaryKeys() 代替 toArray()，避免加载所有值到内存
   * 注意：不返回内部元数据键
   */
  async keys(): Promise<string[]> {
    await this.initialize()

    try {
      const allKeys = await this.db.storage.toCollection().primaryKeys()
      // 过滤掉内部元数据键
      return allKeys.filter((key) => !this.isMetadataKey(key))
    } catch (error) {
      console.error('获取所有键失败:', error)
      throw new StorageError('Failed to get all keys', 'read')
    }
  }

  /**
   * 设置存储项
   */
  async setItem(key: string, value: string): Promise<void> {
    await this.initialize()

    try {
      this.validateKeyLocal(key)
      this.validateValueLocal(value)

      const checksum = this.calculateChecksum(value)
      const size = value.length

      await this.db.storage.put({
        key,
        value,
        timestamp: Date.now(),
        size,
        checksum,
      })
    } catch (error) {
      if (error instanceof StorageError) {
        throw error
      }
      console.error(`设置存储项失败 (${key}):`, error)
      throw new StorageError(`Failed to set item: ${key}`, 'write')
    }
  }

  async removeItem(key: string): Promise<void> {
    await this.initialize()

    try {
      this.validateKeyLocal(key)
      await this.db.storage.delete(key)
    } catch (error) {
      if (error instanceof StorageError) {
        throw error
      }
      console.error(`删除存储项失败 (${key}):`, error)
      throw new StorageError(`Failed to remove item: ${key}`, 'delete')
    }
  }

  async verifyIntegrity(key: string): Promise<boolean> {
    await this.initialize()

    try {
      this.validateKeyLocal(key)
      const record = await this.db.storage.get(key)
      if (!record || !record.checksum) {
        return true
      }

      const calculatedChecksum = this.calculateChecksum(record.value)
      return calculatedChecksum === record.checksum
    } catch (error) {
      console.error(`验证数据完整性失败 (${key}):`, error)
      return false
    }
  }

  /**
   * 检查键是否为内部元数据键
   */
  private isMetadataKey(key: string): boolean {
    return key === DB_CONFIG.metadataKey
  }

  /**
   * 获取数据库统计信息
   * 优化：使用流式处理减少内存占用，添加性能追踪
   * 注意：统计信息不包含内部元数据键
   */
  async getDatabaseStats(): Promise<{
    itemCount: number
    totalSize: number
    oldestRecord: number | null
    newestRecord: number | null
    averageRecordSize: number
  }> {
    await this.initialize()

    const startTime = Date.now()
    try {
      // 使用流式处理避免一次性加载所有数据到内存
      // 排除内部元数据键，只统计用户数据
      let itemCount = 0
      let totalSize = 0
      let oldestTimestamp: number | null = null
      let newestTimestamp: number | null = null

      await this.db.storage.each((record) => {
        // 跳过内部元数据键
        if (this.isMetadataKey(record.key)) {
          return
        }

        itemCount++
        totalSize += record.size || record.value?.length || 0

        if (record.timestamp) {
          if (oldestTimestamp === null || record.timestamp < oldestTimestamp) {
            oldestTimestamp = record.timestamp
          }
          if (newestTimestamp === null || record.timestamp > newestTimestamp) {
            newestTimestamp = record.timestamp
          }
        }
      })

      const averageRecordSize = itemCount > 0 ? totalSize / itemCount : 0

      const duration = Date.now() - startTime
      if (duration > 500) {
        console.warn(`[Database] getDatabaseStats took ${duration}ms for ${itemCount} items`)
      }

      return {
        itemCount,
        totalSize,
        oldestRecord: oldestTimestamp,
        newestRecord: newestTimestamp,
        averageRecordSize,
      }
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`获取数据库统计信息失败 (${duration}ms):`, error)

      // 返回默认值而不是抛出错误，允许系统继续运行
      return {
        itemCount: 0,
        totalSize: 0,
        oldestRecord: null,
        newestRecord: null,
        averageRecordSize: 0,
      }
    }
  }

  /**
   * 清空所有存储
   */
  async clearAll(): Promise<void> {
    await this.initialize()

    try {
      await this.db.storage.clear()
    } catch (error) {
      console.error('清空存储失败:', error)
      throw new StorageError('Failed to clear storage', 'clear')
    }
  }

  /**
   * 原子更新操作
   * 使用 Dexie 的事务机制确保原子性，带重试和降级机制
   */
  async atomicUpdate<T>(key: string, updateFn: (currentValue: T | null) => T): Promise<void> {
    await this.initialize()

    // 获取键级别的锁
    const lockKey = `atomic_${key}`
    if (this.keyLocks.has(lockKey)) {
      await this.keyLocks.get(lockKey)
    }

    const lockPromise = this._performAtomicUpdateWithRetry(key, updateFn)
    this.keyLocks.set(lockKey, lockPromise)

    try {
      await lockPromise
    } finally {
      this.keyLocks.delete(lockKey)
    }
  }

  /**
   * 隐藏式数据更新 - 内部使用原子更新实现
   * 实现 IStorageProvider 接口要求
   */
  async updateData<T>(key: string, modifier: (currentValue: T | null) => T): Promise<void> {
    // 直接使用内部的原子更新实现
    await this.atomicUpdate(key, modifier)
  }

  /**
   * 类型守卫：检查是否为Error对象
   */
  private isError(error: unknown): error is Error {
    return (
      error instanceof Error ||
      (typeof error === 'object' && error !== null && 'name' in error && 'message' in error)
    )
  }

  /**
   * 带重试机制的原子更新
   */
  private async _performAtomicUpdateWithRetry<T>(
    key: string,
    updateFn: (currentValue: T | null) => T,
    maxRetries: number = STORAGE_CONFIG.retry.maxAttempts
  ): Promise<void> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this._performAtomicUpdate(key, updateFn)
        return // 成功，直接返回
      } catch (error) {
        lastError = error as Error
        console.warn(`原子更新尝试 ${attempt}/${maxRetries} 失败 (${key}):`, error)

        // 如果是事务错误且还有重试机会，等待一段时间后重试
        if (this.isError(error) && error.name === 'PrematureCommitError' && attempt < maxRetries) {
          const delay = Math.min(
            STORAGE_CONFIG.retry.baseDelayMs * Math.pow(2, attempt - 1),
            STORAGE_CONFIG.retry.maxDelayMs
          )
          await new Promise((resolve) => setTimeout(resolve, delay))
          continue
        }

        // 如果是最后一次尝试或非事务错误，尝试降级到简单更新
        if (attempt === maxRetries) {
          console.warn(`所有重试失败，尝试降级到简单更新 (${key})`)
          try {
            await this._performSimpleUpdate(key, updateFn)
            console.log(`降级更新成功 (${key})`)
            return
          } catch (fallbackError) {
            console.error(`降级更新也失败 (${key}):`, fallbackError)
            throw lastError // 抛出原始错误
          }
        }
      }
    }

    if (lastError) {
      throw lastError
    }
    throw new StorageError(`Failed to perform atomic update after ${maxRetries} attempts`, 'write')
  }

  /**
   * 简单更新（降级方案）
   * 确保写入的数据包含完整的数据完整性字段
   */
  private async _performSimpleUpdate<T>(
    key: string,
    updateFn: (currentValue: T | null) => T
  ): Promise<void> {
    try {
      // 读取当前值
      const currentRecord = await this.db.storage.get(key)
      const currentValue = currentRecord?.value ? (JSON.parse(currentRecord.value) as T) : null

      // 应用更新函数
      const newValue = updateFn(currentValue)
      const valueString = JSON.stringify(newValue)

      // 直接写入新值（不使用事务），但包含完整的数据完整性字段
      const checksum = this.calculateChecksum(valueString)
      const size = valueString.length

      await this.db.storage.put({
        key,
        value: valueString,
        timestamp: Date.now(),
        size,
        checksum,
      })
    } catch (error) {
      console.error(`简单更新失败 (${key}):`, error)
      throw new StorageError(`Failed to perform simple update: ${key}`, 'write')
    }
  }

  /**
   * 执行原子更新
   */
  private async _performAtomicUpdate<T>(
    key: string,
    updateFn: (currentValue: T | null) => T
  ): Promise<void> {
    try {
      // 使用更安全的事务处理方式
      await this.db.transaction('rw', this.db.storage, async (tx) => {
        try {
          // 读取当前值
          const currentRecord = await tx.table('storage').get(key)
          const currentValue = currentRecord?.value ? (JSON.parse(currentRecord.value) as T) : null

          // 应用更新函数 - 确保同步执行
          const newValue = updateFn(currentValue)

          // 写入新值
          await tx.table('storage').put({
            key,
            value: JSON.stringify(newValue),
            timestamp: Date.now(),
          })
        } catch (innerError) {
          // 事务内部错误，让事务回滚
          console.error(`事务内部操作失败 (${key}):`, innerError)
          throw innerError
        }
      })
    } catch (error) {
      console.error(`原子更新失败 (${key}):`, error)

      // 如果是Dexie事务错误，提供更详细的错误信息
      if (this.isError(error) && error.name === 'PrematureCommitError') {
        throw new StorageError(
          `Database transaction error for key ${key}: ${error.message}. Please try again.`,
          'write'
        )
      }

      throw new StorageError(`Failed to perform atomic update: ${key}`, 'write')
    }
  }

  async batchUpdate(
    operations: Array<{
      key: string
      operation: 'set' | 'remove'
      value?: string
    }>
  ): Promise<void> {
    await this.initialize()

    for (const { key, operation, value } of operations) {
      this.validateKeyLocal(key)
      if (operation === 'set') {
        if (value === undefined) {
          throw new StorageError(
            `Value is required for 'set' operation on key: ${key}`,
            'validation'
          )
        }
        this.validateValueLocal(value)
      }
    }

    const startTime = Date.now()
    const chunkSize = STORAGE_CONSTRAINTS.BATCH_CHUNK_SIZE
    const batchDelay = STORAGE_CONSTRAINTS.BATCH_DELAY_MS

    try {
      // 如果操作数量小于等于分块大小，直接执行
      if (operations.length <= chunkSize) {
        await this._executeBatchChunk(operations)
      } else {
        // 分块执行大规模批量操作
        for (let i = 0; i < operations.length; i += chunkSize) {
          const chunk = operations.slice(i, i + chunkSize)
          await this._executeBatchChunk(chunk)

          // 在块之间添加延迟，防止阻塞主线程
          if (batchDelay > 0 && i + chunkSize < operations.length) {
            await new Promise((resolve) => setTimeout(resolve, batchDelay))
          }
        }
      }

      const duration = Date.now() - startTime
      if (duration > 1000) {
        const opsPerSec = (operations.length / (duration / 1000)).toFixed(0)
        console.warn(
          `[Database] Batch update took ${duration}ms for ${operations.length} operations (${opsPerSec} ops/sec)`
        )
      }
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`批量更新失败 (${operations.length} operations, ${duration}ms):`, error)

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error during batch update'
      throw new StorageError(
        `Failed to perform batch update on ${operations.length} items: ${errorMessage}`,
        'write',
        { operationCount: operations.length, duration }
      )
    }
  }

  /**
   * 执行单个批处理块
   */
  private async _executeBatchChunk(
    operations: Array<{
      key: string
      operation: 'set' | 'remove'
      value?: string
    }>
  ): Promise<void> {
    await this.db.transaction('rw', this.db.storage, async () => {
      const updates: Array<StorageRecord> = []
      const deletions: string[] = []

      for (const { key, operation, value } of operations) {
        if (operation === 'set' && value !== undefined) {
          updates.push({
            key,
            value,
            timestamp: Date.now(),
            size: value.length,
            checksum: this.calculateChecksum(value),
          })
        } else if (operation === 'remove') {
          deletions.push(key)
        }
      }

      if (updates.length > 0) {
        await this.db.storage.bulkPut(updates)
      }

      if (deletions.length > 0) {
        await this.db.storage.bulkDelete(deletions)
      }
    })
  }

  /**
   * 修复损坏的数据
   * 优化：使用流式处理避免一次性加载所有数据到内存
   */
  async repairCorruptedData(): Promise<{
    repaired: number
    failed: number
    details: Array<{ key: string; action: string; error?: string }>
  }> {
    await this.initialize()

    const result = {
      repaired: 0,
      failed: 0,
      details: [] as Array<{ key: string; action: string; error?: string }>,
    }

    const startTime = Date.now()

    try {
      await this.db.storage.each(async (record) => {
        if (this.isMetadataKey(record.key)) {
          return
        }

        if (record.checksum) {
          const calculatedChecksum = this.calculateChecksum(record.value)
          if (calculatedChecksum !== record.checksum) {
            try {
              const newChecksum = this.calculateChecksum(record.value)
              await this.db.storage.update(record.key, {
                checksum: newChecksum,
                size: record.value.length,
              })
              result.repaired++
              result.details.push({
                key: record.key,
                action: 'checksum_repaired',
              })
            } catch (error) {
              result.failed++
              result.details.push({
                key: record.key,
                action: 'repair_failed',
                error: error instanceof Error ? error.message : 'Unknown error',
              })
            }
          }
        } else {
          try {
            const checksum = this.calculateChecksum(record.value)
            await this.db.storage.update(record.key, {
              checksum,
              size: record.value.length,
            })
            result.repaired++
            result.details.push({
              key: record.key,
              action: 'checksum_added',
            })
          } catch (error) {
            result.failed++
            result.details.push({
              key: record.key,
              action: 'checksum_add_failed',
              error: error instanceof Error ? error.message : 'Unknown error',
            })
          }
        }
      })

      const duration = Date.now() - startTime
      if (duration > 1000) {
        console.warn(
          `[Database] Repair took ${duration}ms for ${result.repaired + result.failed} items`
        )
      }

      console.log(
        `[Database] Repair completed: ${result.repaired} repaired, ${result.failed} failed`
      )
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`数据修复失败 (${duration}ms):`, error)
      throw new StorageError('Failed to repair corrupted data', 'repair')
    }

    return result
  }

  /**
   * 获取存储统计信息
   * 优化：避免加载所有记录到内存，使用流式处理计算大小
   * 注意：统计信息不包含内部元数据键
   */
  async getStorageInfo(): Promise<{
    itemCount: number
    estimatedSize: number
    lastUpdated: number | null
  }> {
    await this.initialize()

    try {
      let itemCount = 0
      let estimatedSize = 0
      let lastUpdated: number | null = null

      await this.db.storage.each((record) => {
        // 跳过内部元数据键
        if (this.isMetadataKey(record.key)) {
          return
        }

        itemCount++
        estimatedSize += record.value.length

        if (record.timestamp && (lastUpdated === null || record.timestamp > lastUpdated)) {
          lastUpdated = record.timestamp
        }
      })

      return {
        itemCount,
        estimatedSize,
        lastUpdated,
      }
    } catch (error) {
      console.error('获取存储信息失败:', error)
      return {
        itemCount: 0,
        estimatedSize: 0,
        lastUpdated: null,
      }
    }
  }

  /**
   * 导出所有数据（用于备份）
   * 注意：不导出内部元数据键，只导出用户数据
   */
  async exportAll(): Promise<Record<string, string>> {
    await this.initialize()

    try {
      const allRecords = await this.db.storage.toArray()
      const result: Record<string, string> = {}

      allRecords.forEach((record) => {
        // 跳过内部元数据键
        if (this.isMetadataKey(record.key)) {
          return
        }
        result[record.key] = record.value
      })

      return result
    } catch (error) {
      console.error('导出数据失败:', error)
      throw new StorageError('Failed to export data', 'read')
    }
  }

  /**
   * 导入数据（用于恢复）
   * 确保导入的数据包含完整的数据完整性字段
   */
  async importAll(data: Record<string, string>): Promise<void> {
    await this.initialize()

    try {
      const now = Date.now()
      const records: StorageRecord[] = Object.entries(data).map(([key, value]) => ({
        key,
        value,
        timestamp: now,
        size: value.length,
        checksum: this.calculateChecksum(value),
      }))

      await this.db.storage.bulkPut(records)
    } catch (error) {
      console.error('导入数据失败:', error)
      throw new StorageError('Failed to import data', 'write')
    }
  }

  /**
   * 关闭数据库连接
   */
  async close(): Promise<void> {
    try {
      await this.db.close()
    } catch (error) {
      console.error('关闭数据库失败:', error)
    }
  }

  /**
   * 数据库健康检查
   * 检查数据库的读写删能力，返回详细的健康状态
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
      await this.initialize()

      // 检查写入能力
      try {
        await this.db.storage.put({
          key: testKey,
          value: testValue,
          timestamp: Date.now(),
          size: testValue.length,
          checksum: this.calculateChecksum(testValue),
        })
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
          const readValue = await this.db.storage.get(testKey)
          if (readValue?.value === testValue) {
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
          await this.db.storage.delete(testKey)
          const verifyDeleted = await this.db.storage.get(testKey)
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
        `Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }

    return result
  }
}
