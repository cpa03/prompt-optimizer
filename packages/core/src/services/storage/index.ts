/**
 * 存储服务模块导出
 */

// 导出类型
export type { IStorageProvider, SetItemOptions, StorageRecordMetadata, DatabaseHealthStatus } from './types'

// 导出错误类
export * from './errors'

// 导出存储工厂
export { StorageFactory } from './factory'

// 导出存储提供者
export { DexieStorageProvider } from './dexieStorageProvider'
export { LocalStorageProvider } from './localStorageProvider'
export { MemoryStorageProvider } from './memoryStorageProvider'
// Note: FileStorageProvider is available via '@prompt-optimizer/core/electron' entry point
