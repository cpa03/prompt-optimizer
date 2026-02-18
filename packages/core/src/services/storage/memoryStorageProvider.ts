import type { IStorageProvider } from './types'
import { StorageError } from './errors'
import { isStructuredErrorLike } from '../../utils/error'

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
      const value = this.storage.get(key)
      return value !== undefined ? value : null
    } catch (error) {
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
      this.storage.set(key, value)
    } catch (error) {
      throw new StorageError(`Failed to set storage item: ${key}`, 'write')
    }
  }

  /**
   * 删除存储项
   * @param key 存储键
   */
  async removeItem(key: string): Promise<void> {
    try {
      this.storage.delete(key)
    } catch (error) {
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
}
