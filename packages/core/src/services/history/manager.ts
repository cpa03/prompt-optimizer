import { IHistoryManager, PromptRecord, PromptRecordChain } from './types'
import { IStorageProvider } from '../storage/types'
import { StorageAdapter } from '../storage/adapter'
import {
  RecordNotFoundError,
  RecordValidationError,
  HistoryStorageError,
  HistoryError,
} from './errors'
import { v4 as uuidv4 } from 'uuid'
import { IModelManager } from '../model/types'
import { CORE_SERVICE_KEYS } from '../../constants/storage-keys'
import { HISTORY_ERROR_CODES, IMPORT_EXPORT_ERROR_CODES } from '../../constants/error-codes'
import { ImportExportError } from '../../interfaces/import-export'
import { HISTORY_CONSTRAINTS } from '../../constants/constraints'

/**
 * History Manager implementation
 */
export class HistoryManager implements IHistoryManager {
  private readonly storageKey = CORE_SERVICE_KEYS.PROMPT_HISTORY
  private readonly maxRecords = HISTORY_CONSTRAINTS.MAX_RECORDS
  private readonly storage: StorageAdapter
  private readonly modelManager: IModelManager

  constructor(storageProvider: IStorageProvider, modelManager: IModelManager) {
    this.storage = new StorageAdapter(storageProvider)
    this.modelManager = modelManager
  }

  /**
   * Helper function to get model name
   * @param modelKey model key
   * @returns model name or undefined
   */
  private async getModelNameByKey(modelKey: string): Promise<string | undefined> {
    if (!modelKey) return undefined

    try {
      const model = await this.modelManager.getModel(modelKey)
      return model?.name
    } catch (err) {
      // If model not found or other error, simply return undefined
      return undefined
    }
  }

  /**
   * Add a new record using atomic operation
   * @param record The record to add
   */
  async addRecord(record: PromptRecord): Promise<void> {
    try {
      this.validateRecord(record)

      // Create a shallow copy to avoid mutating the input object
      const recordToAdd = { ...record }

      // If modelName is not provided but modelKey exists, try to get model name
      if (!recordToAdd.modelName && recordToAdd.modelKey) {
        recordToAdd.modelName = await this.getModelNameByKey(recordToAdd.modelKey)
      }

      // Use updateData to handle concurrent modifications
      await this.storage.updateData<PromptRecord[]>(
        this.storageKey,
        (existingRecords: PromptRecord[] | null) => {
          const records = existingRecords || []

          // Ensure record ID is unique
          if (records.some((r: PromptRecord) => r.id === recordToAdd.id)) {
            throw new HistoryError(
              HISTORY_ERROR_CODES.VALIDATION_ERROR,
              { details: `Record with ID ${recordToAdd.id} already exists` },
              `Record with ID ${recordToAdd.id} already exists`
            )
          }

          // Add record to existing records (at the beginning)
          const updatedRecords = [recordToAdd, ...records]

          // Ensure we don't exceed maxRecords
          return updatedRecords.slice(0, this.maxRecords)
        }
      )
    } catch (err: any) {
      if (err instanceof HistoryError) {
        throw err
      }
      if (err.message?.includes('Get')) {
        throw new HistoryStorageError('Failed to get history records', 'read')
      } else {
        throw new HistoryStorageError('Failed to save history records', 'write')
      }
    }
  }

  /**
   * Get all records
   * @returns Array of prompt records
   */
  async getRecords(): Promise<PromptRecord[]> {
    try {
      const data = await this.storage.getItem(this.storageKey)
      if (!data) return []

      const records: PromptRecord[] = JSON.parse(data)

      // 直接返回记录，排序逻辑由调用者根据需求处理
      return records
    } catch (err) {
      throw new HistoryStorageError('Failed to get history records', 'read')
    }
  }

  /**
   * Get a specific record by ID
   * @param id Record ID
   * @returns The record or null if not found
   */
  async getRecord(id: string): Promise<PromptRecord> {
    const records = await this.getRecords()
    const record = records.find((r) => r.id === id)

    if (!record) {
      throw new RecordNotFoundError(`Record with ID ${id} not found`, id)
    }

    return record
  }

  /**
   * Delete a record by ID
   * @param id Record ID
   */
  async deleteRecord(id: string): Promise<void> {
    try {
      const records = await this.getRecords()
      const recordIndex = records.findIndex((r) => r.id === id)

      if (recordIndex === -1) {
        throw new RecordNotFoundError(`Record with ID ${id} not found`, id)
      }

      records.splice(recordIndex, 1)
      await this.saveToStorage(records)
    } catch (err) {
      if (err instanceof RecordNotFoundError) {
        throw err
      }
      throw new HistoryStorageError('Failed to delete record', 'delete')
    }
  }

  /**
   * Get iteration chain for a record
   * @param recordId The ID of the record to start the chain from
   * @returns Array of records forming the iteration chain
   */
  async getIterationChain(recordId: string): Promise<PromptRecord[]> {
    const allRecords = await this.getRecords()

    const recordMap = new Map<string, PromptRecord>()
    for (const record of allRecords) {
      recordMap.set(record.id, record)
    }

    const chain: PromptRecord[] = []
    let currentId: string | undefined = recordId

    while (currentId) {
      const record = recordMap.get(currentId)
      if (!record) break

      chain.unshift(record)
      currentId = record.previousId
    }

    return chain
  }

  /**
   * Clear all history
   */
  async clearHistory(): Promise<void> {
    try {
      await this.storage.removeItem(this.storageKey)
    } catch (err) {
      throw new HistoryStorageError('Failed to clear history', 'delete')
    }
  }

  /**
   * Save records to storage
   * @param records Records to save
   */
  private async saveToStorage(records: PromptRecord[]): Promise<void> {
    await this.storage.setItem(this.storageKey, JSON.stringify(records))
  }

  /**
   * Validate a record
   * @param record Record to validate
   */
  private validateRecord(record: PromptRecord): void {
    const errors: string[] = []

    if (!record.id) errors.push('ID is required')
    if (!record.originalPrompt) errors.push('Original prompt is required')
    if (!record.optimizedPrompt) errors.push('Optimized prompt is required')
    if (!record.type) errors.push('Type is required')
    if (!record.chainId) errors.push('Chain ID is required')
    if (record.version === undefined) errors.push('Version is required')

    if (errors.length > 0) {
      throw new RecordValidationError('Record validation failed', errors)
    }
  }

  /**
   * Create a new chain with initial record
   * @param params Initial record params
   * @returns The new chain
   */
  async createNewChain(
    params: Omit<PromptRecord, 'chainId' | 'version' | 'previousId'>
  ): Promise<PromptRecordChain> {
    // Generate chain ID
    const chainId = uuidv4()

    // Create record with chainId and initial version
    const record: PromptRecord = {
      ...params,
      chainId,
      version: 1,
      previousId: undefined,
      timestamp: params.timestamp || Date.now(),
    }

    // Add record
    await this.addRecord(record)

    // Return the new chain
    return this.getChain(chainId)
  }

  /**
   * Add an iteration to an existing chain
   * @param params Parameters for the iteration
   * @returns The updated chain
   */
  async addIteration(params: {
    chainId: string
    originalPrompt: string
    optimizedPrompt: string
    modelKey: string
    templateId: string
    iterationNote?: string
    metadata?: Record<string, any>
  }): Promise<PromptRecordChain> {
    // Get the chain to ensure it exists and get current version
    const chain = await this.getChain(params.chainId)

    // Generate new record ID
    const newId = uuidv4()

    // Create new record with chainId and incremented version
    const record: PromptRecord = {
      id: newId,
      chainId: params.chainId,
      originalPrompt: params.originalPrompt,
      optimizedPrompt: params.optimizedPrompt,
      type: 'iterate',
      version: chain.currentRecord.version + 1,
      previousId: chain.currentRecord.id,
      timestamp: Date.now(),
      modelKey: params.modelKey,
      templateId: params.templateId,
      iterationNote: params.iterationNote,
      metadata: params.metadata,
    }

    // Add record
    await this.addRecord(record)

    // Return the updated chain
    return this.getChain(params.chainId)
  }

  /**
   * Get a chain by ID
   * @param chainId Chain ID
   * @returns The chain
   */
  async getChain(chainId: string): Promise<PromptRecordChain> {
    try {
      const allRecords = await this.getRecords()

      // Filter records for this chain
      const chainRecords = allRecords.filter((r) => r.chainId === chainId)

      if (chainRecords.length === 0) {
        throw new RecordNotFoundError(`Chain with ID ${chainId} not found`, chainId)
      }

      // Sort by version (ascending)
      const sortedRecords = chainRecords.sort((a, b) => a.version - b.version)

      // Get root record (version 1)
      const rootRecord = sortedRecords.find((r) => r.version === 1)
      if (!rootRecord) {
        throw new HistoryError(
          HISTORY_ERROR_CODES.CHAIN_ERROR,
          { details: `Chain ${chainId} has no root record (version 1)` },
          `Chain ${chainId} has no root record (version 1)`
        )
      }

      // Get current record (highest version)
      const currentRecord = sortedRecords[sortedRecords.length - 1]

      return {
        chainId,
        rootRecord,
        currentRecord,
        versions: sortedRecords,
      }
    } catch (err) {
      if (err instanceof RecordNotFoundError || err instanceof HistoryError) {
        throw err
      }
      throw new HistoryStorageError('Failed to get chain', 'read')
    }
  }

  /**
   * Get all chains
   * Performance optimized: Single pass grouping with metadata tracking
   * @returns Array of chains
   */
  async getAllChains(): Promise<PromptRecordChain[]> {
    const records = await this.getRecords()

    if (records.length === 0) {
      return []
    }

    // Single pass: group records and track root/current in one iteration
    const chainData = new Map<
      string,
      {
        records: PromptRecord[]
        rootRecord: PromptRecord | null
        currentRecord: PromptRecord | null
        maxVersion: number
      }
    >()

    for (const record of records) {
      let data = chainData.get(record.chainId)
      if (!data) {
        data = {
          records: [],
          rootRecord: null,
          currentRecord: null,
          maxVersion: -1,
        }
        chainData.set(record.chainId, data)
      }

      data.records.push(record)

      // Track root record (version 1)
      if (record.version === 1) {
        data.rootRecord = record
      }

      // Track current record (highest version with latest timestamp)
      if (record.version > data.maxVersion) {
        data.maxVersion = record.version
        data.currentRecord = record
      } else if (
        record.version === data.maxVersion &&
        data.currentRecord &&
        record.timestamp > data.currentRecord.timestamp
      ) {
        data.currentRecord = record
      }
    }

    // Build results, filtering invalid chains
    const results: PromptRecordChain[] = []

    for (const [chainId, data] of chainData) {
      // Skip chains without root record
      if (!data.rootRecord || !data.currentRecord) {
        continue
      }

      // Sort versions once (smaller arrays are faster to sort)
      const sortedRecords = data.records.sort((a, b) => a.version - b.version)

      results.push({
        chainId,
        rootRecord: data.rootRecord,
        currentRecord: data.currentRecord,
        versions: sortedRecords,
      })
    }

    // Sort by timestamp (newest first)
    results.sort((a, b) => b.currentRecord.timestamp - a.currentRecord.timestamp)

    return results
  }

  /**
   * Delete a chain by its ID
   * @param chainId The ID of the chain to delete
   */
  async deleteChain(chainId: string): Promise<void> {
    const allRecords = await this.getRecords()
    const recordsToKeep = allRecords.filter((record) => record.chainId !== chainId)

    if (recordsToKeep.length === allRecords.length) {
      throw new RecordNotFoundError(`Chain with ID ${chainId} not found`, chainId)
    }

    await this.saveToStorage(recordsToKeep)
  }

  // 实现 IImportExportable 接口

  /**
   * 导出所有历史记录
   */
  async exportData(): Promise<PromptRecord[]> {
    try {
      return await this.getRecords()
    } catch (error) {
      throw new ImportExportError(
        'Failed to export history data',
        await this.getDataType(),
        error as Error,
        IMPORT_EXPORT_ERROR_CODES.EXPORT_FAILED
      )
    }
  }

  /**
   * 导入历史记录
   * 性能优化：使用批量导入替代逐条添加，将存储操作从 O(n) 降低到 O(1)
   */
  async importData(data: any): Promise<void> {
    if (!(await this.validateData(data))) {
      throw new RecordValidationError(
        'Invalid history data format: data must be an array of prompt records',
        []
      )
    }

    const records = data as PromptRecord[]

    const validRecords: PromptRecord[] = []
    const failedRecords: { record: PromptRecord; error: Error }[] = []

    for (const record of records) {
      try {
        this.validateRecord(record)
        validRecords.push(record)
      } catch (error) {
        console.warn('Invalid history record:', error)
        failedRecords.push({ record, error: error as Error })
      }
    }

    if (validRecords.length > 0) {
      try {
        await this.storage.setItem(this.storageKey, JSON.stringify(validRecords))
      } catch (error) {
        throw new HistoryStorageError('Failed to import history records', 'write')
      }
    }

    if (failedRecords.length > 0) {
      console.warn(`Failed to import ${failedRecords.length} history records`)
    }
  }

  /**
   * 获取数据类型标识
   */
  async getDataType(): Promise<string> {
    return 'history'
  }

  /**
   * 验证历史记录数据格式
   */
  async validateData(data: any): Promise<boolean> {
    if (!Array.isArray(data)) {
      return false
    }

    return data.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'string' &&
        typeof item.originalPrompt === 'string' &&
        typeof item.optimizedPrompt === 'string' &&
        typeof item.type === 'string' &&
        typeof item.chainId === 'string' &&
        typeof item.version === 'number' &&
        typeof item.timestamp === 'number' &&
        typeof item.modelKey === 'string' &&
        typeof item.templateId === 'string'
    )
  }
}

/**
 * 创建聊天历史管理器的工厂函数
 * @param storageProvider 存储提供器实例
 * @param modelManager 模型管理器实例
 * @returns 聊天历史管理器实例
 */
export function createHistoryManager(
  storageProvider: IStorageProvider,
  modelManager: IModelManager
): HistoryManager {
  return new HistoryManager(storageProvider, modelManager)
}
