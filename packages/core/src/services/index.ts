/**
 * Core Services 导出
 */

// 首先导出共享类型（避免重复导出）
export * from './shared'

// 导出所有服务类型和实现（排除已导出的共享类型）
export type {
  ILLMService,
  Message,
  StreamHandlers,
  LLMResponse,
  ModelInfo,
  ModelOption,
  ITextAdapterRegistry,
  ITextProviderAdapter,
} from './llm'

export {
  LLMService,
  createLLMService,
  TextAdapterRegistry,
  createTextAdapterRegistry,
  ElectronLLMProxy,
} from './llm'

export * from './llm/errors'

// Model 服务（排除与 shared 重复的 ConnectionSchema）
export type {
  TextProvider,
  TextModel,
  TextModelConfig,
  ParameterDefinition,
  StoredTextModelConfig,
  ModelConfig,
  IModelManager,
} from './model'

export {
  ModelManager,
  createModelManager,
  ElectronModelManagerProxy,
  ElectronConfigManager,
  isElectronRenderer,
} from './model'

export * from './model/errors'
export * from './model/defaults'
export * from './model/parameter-schema'
export * from './model/parameter-utils'
export * from './model/advancedParameterDefinitions'
export {
  validateLLMParams,
  getSupportedParameters,
  type LLMValidationResult,
  type ValidationWarning,
} from './model/validation'
export * from './model/converter'
export * from './model/model-utils'

// 其他服务
export * from './prompt'
export * from './template'
export * from './history'
export * from './storage'
export * from './preference'
export * from './evaluation'
export * from './variable-extraction'
export * from './variable-value-generation'

// Image 服务（排除与 shared 重复的 ConnectionSchema）
export type {
  ImageParameterDefinition,
  ImageProvider,
  ImageModel,
  ImageModelConfig,
  ImageInputRef,
  ImageRequest,
  Text2ImageRequest,
  Image2ImageRequest,
  ImageResultItem,
  ImageResult,
  ImageProgressHandlers,
  IImageModelManager,
  IImageProviderAdapter,
  IImageAdapterRegistry,
  IImageService,
  ImageMetadata,
  ImageRef,
  FullImageData,
  ImageStorageConfig,
  IImageStorageService,
} from './image'

export { isImageRef, createImageRef, AbstractImageProviderAdapter } from './image'

export * from './image-model'
export * from './adapters'
export * from './compare'
export * from './favorite'
export * from './data'
export * from './context'
