export interface IStorageProvider {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
  clearAll(): Promise<void>

  keys(): Promise<string[]>

  updateData<T>(key: string, modifier: (currentValue: T | null) => T): Promise<void>
  batchUpdate(
    operations: Array<{
      key: string
      operation: 'set' | 'remove'
      value?: string
    }>
  ): Promise<void>

  getCapabilities?(): {
    supportsAtomic: boolean
    supportsBatch: boolean
    maxStorageSize?: number
  }

  verifyIntegrity?(key: string): Promise<boolean>
  repairCorruptedData?(): Promise<{
    repaired: number
    failed: number
    details: Array<{ key: string; action: string; error?: string }>
  }>
  getDatabaseStats?(): Promise<{
    itemCount: number
    totalSize: number
    oldestRecord: number | null
    newestRecord: number | null
    averageRecordSize: number
  }>
  healthCheck?(): Promise<DatabaseHealthStatus>
  close?(): Promise<void>
}

export interface DatabaseHealthStatus {
  healthy: boolean
  canRead: boolean
  canWrite: boolean
  canDelete: boolean
  latency: number
  errors: string[]
  timestamp: number
}
