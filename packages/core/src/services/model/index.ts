/**
 * 模型管理服务模块导出
 */

// 导出类型（排除与 llm 模块冲突的类型）
export type { StoredTextModelConfig, ModelConfig, IModelManager } from './types'

// 导出错误类
export * from './errors'

// 导出管理器
export { ModelManager, createModelManager } from './manager'

// 导出默认配置
export * from './defaults'

// 导出参数相关
export * from './parameter-schema'
export * from './parameter-utils'
export * from './advancedParameterDefinitions'

// 导出验证（排除与 llm 模块冲突的 ValidationError）
export type { LLMValidationResult, ValidationWarning } from './validation'
export { validateLLMParams, getSupportedParameters } from './validation'

// 导出转换器
export * from './converter'

// 导出模型工具
export * from './model-utils'

// 导出Electron相关
export { ElectronModelManagerProxy } from './electron-proxy'
export { ElectronConfigManager, isElectronRenderer } from './electron-config'
