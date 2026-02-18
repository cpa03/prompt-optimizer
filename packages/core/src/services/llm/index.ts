/**
 * LLM服务模块导出
 */

// 导出类型
export type {
  ILLMService,
  Message,
  StreamHandlers,
  LLMResponse,
  ModelInfo,
  ModelOption,
  ITextAdapterRegistry,
  ITextProviderAdapter,
  TextProvider,
  TextModel,
  TextModelConfig,
  ConnectionSchema,
  ParameterDefinition,
} from './types'

// 导出错误类
export * from './errors'

// 导出服务类和工厂函数
export { LLMService, createLLMService } from './service'

// 导出适配器注册表
export { TextAdapterRegistry, createTextAdapterRegistry } from './adapters/registry'

// 导出Electron代理
export { ElectronLLMProxy } from './electron-proxy'
