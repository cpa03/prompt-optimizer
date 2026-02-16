import type {
  ITextAdapterRegistry,
  ITextProviderAdapter,
  TextProvider,
  TextModel,
  TextModelConfig,
} from '../types'
import { AbstractAdapterRegistry } from '../../adapters/abstract-registry'
import { OpenAIAdapter } from './openai-adapter'
import { AnthropicAdapter } from './anthropic-adapter'
import { GeminiAdapter } from './gemini-adapter'
import { DeepseekAdapter } from './deepseek-adapter'
import { SiliconflowAdapter } from './siliconflow-adapter'
import { ZhipuAdapter } from './zhipu-adapter'
import { DashScopeAdapter } from './dashscope-adapter'
import { OpenRouterAdapter } from './openrouter-adapter'
import { ModelScopeAdapter } from './modelscope-adapter'
import { OllamaAdapter } from './ollama-adapter'
import { RequestConfigError } from '../errors'
import {
  PROVIDER_OPENAI,
  PROVIDER_ANTHROPIC,
  PROVIDER_GEMINI,
  PROVIDER_DEEPSEEK,
  PROVIDER_SILICONFLOW,
  PROVIDER_ZHIPU,
  PROVIDER_DASHSCOPE,
  PROVIDER_OPENROUTER,
  PROVIDER_MODELSCOPE,
  PROVIDER_OLLAMA,
} from '../../../constants'

/**
 * 文本模型适配器注册表实现
 * 继承抽象基类，提供文本模型特定的实现
 */
export class TextAdapterRegistry
  extends AbstractAdapterRegistry<ITextProviderAdapter, TextProvider, TextModel, TextModelConfig>
  implements ITextAdapterRegistry
{
  protected createUnknownProviderError(providerId: string): Error {
    return new RequestConfigError(`Unknown ${this.getProviderTypeDescription()}: ${providerId}`)
  }

  protected createDynamicModelUnsupportedError(provider: TextProvider): Error {
    return new RequestConfigError(`${provider.name} does not support dynamic model fetching`)
  }

  /**
   * 初始化并注册所有适配器
   */
  protected initializeAdapters(): void {
    // 注册适配器
    const openaiAdapter = new OpenAIAdapter()
    const deepseekAdapter = new DeepseekAdapter()
    const siliconflowAdapter = new SiliconflowAdapter()
    const zhipuAdapter = new ZhipuAdapter()
    const anthropicAdapter = new AnthropicAdapter()
    const geminiAdapter = new GeminiAdapter()
    const dashscopeAdapter = new DashScopeAdapter()
    const openrouterAdapter = new OpenRouterAdapter()
    const modelscopeAdapter = new ModelScopeAdapter()
    const ollamaAdapter = new OllamaAdapter()

    this.adapters.set(PROVIDER_OPENAI, openaiAdapter)
    this.adapters.set(PROVIDER_DEEPSEEK, deepseekAdapter)
    this.adapters.set(PROVIDER_SILICONFLOW, siliconflowAdapter)
    this.adapters.set(PROVIDER_ZHIPU, zhipuAdapter)
    this.adapters.set(PROVIDER_ANTHROPIC, anthropicAdapter)
    this.adapters.set(PROVIDER_GEMINI, geminiAdapter)
    this.adapters.set(PROVIDER_DASHSCOPE, dashscopeAdapter)
    this.adapters.set(PROVIDER_OPENROUTER, openrouterAdapter)
    this.adapters.set(PROVIDER_MODELSCOPE, modelscopeAdapter)
    this.adapters.set(PROVIDER_OLLAMA, ollamaAdapter)

    // 预加载静态模型缓存
    this.preloadStaticModels()
  }

  /**
   * 从适配器获取 Provider 元数据
   */
  protected getProviderFromAdapter(adapter: ITextProviderAdapter): TextProvider {
    return adapter.getProvider()
  }

  /**
   * 从适配器获取静态模型列表
   */
  protected getModelsFromAdapter(adapter: ITextProviderAdapter): TextModel[] {
    return adapter.getModels()
  }

  /**
   * 调用适配器的异步模型获取方法
   */
  protected async getModelsAsyncFromAdapter(
    adapter: ITextProviderAdapter,
    config: TextModelConfig
  ): Promise<TextModel[]> {
    if (!adapter.getModelsAsync) {
      const provider = adapter.getProvider()
      throw new RequestConfigError(
        `Adapter ${provider.name} does not implement getModelsAsync method`
      )
    }
    return await adapter.getModelsAsync(config)
  }

  /**
   * 获取错误消息的提供商类型描述
   */
  protected getProviderTypeDescription(): string {
    return '文本模型提供商'
  }
}

/**
 * 工厂函数：创建 TextAdapterRegistry 实例
 */
export const createTextAdapterRegistry = () => new TextAdapterRegistry()
