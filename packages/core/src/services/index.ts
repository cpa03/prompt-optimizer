/**
 * Core Services 导出
 * 所有服务的统一导出入口
 */

// 核心LLM服务
export * from './llm'

// 模型管理服务
export * from './model'

// 提示词服务
export * from './prompt'

// 模板服务
export * from './template'

// 历史记录服务
export * from './history'

// 存储服务
export * from './storage'

// 偏好设置服务
export * from './preference'

// 评估服务
export * from './evaluation'

// 变量提取服务
export * from './variable-extraction'

// 变量值生成服务
export * from './variable-value-generation'

// 对比服务
export * from './compare'

// 收藏服务
export * from './favorite'

// 图像服务
export * from './image'

// 上下文服务
export * from './context/types'
export { createContextRepo } from './context/repo'
export * from './context/constants'

// 数据管理服务
export { DataManager, createDataManager } from './data/manager'
export type { IDataManager } from './data/manager'
export { ElectronDataManagerProxy } from './data/electron-proxy'
export * from './data/types'
export * from './data/errors'

// 图像模型管理服务
export { ImageModelManager, createImageModelManager } from './image-model/manager'

// 共享类型
export * from './shared'

// 适配器基类
export { AbstractAdapterRegistry } from './adapters/abstract-registry'
