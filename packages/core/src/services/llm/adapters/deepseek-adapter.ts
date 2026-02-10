import type { TextModel, TextProvider } from '../types'
import { OpenAIAdapter } from './openai-adapter'
import { PROVIDER_URLS } from '../../../config/providers'
import { CONTEXT_LENGTHS, getTextProviderApiKeyUrl } from '../../../config/llm-models'

interface ModelOverride {
  id: string
  name: string
  description: string
  capabilities?: Partial<TextModel['capabilities']>
  defaultParameterValues?: Record<string, unknown>
}

const DEEPSEEK_STATIC_MODELS: ModelOverride[] = [
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    description: 'DeepSeek chat model via OpenAI-compatible API',
    capabilities: {
      supportsTools: true,
      supportsReasoning: false,
      maxContextLength: CONTEXT_LENGTHS.STANDARD_128K
    }
  },
  {
    id: 'deepseek-reasoner',
    name: 'DeepSeek Reasoner',
    description: 'DeepSeek reasoning model with step-by-step thinking outputs',
    capabilities: {
      supportsReasoning: true,
      maxContextLength: CONTEXT_LENGTHS.STANDARD_128K
    }
  }
]

export class DeepseekAdapter extends OpenAIAdapter {
  public getProvider(): TextProvider {
    return {
      id: 'deepseek',
      name: 'DeepSeek',
      description: 'DeepSeek OpenAI-compatible models',
      requiresApiKey: true,
      defaultBaseURL: PROVIDER_URLS.deepseek,
      supportsDynamicModels: true,
      apiKeyUrl: getTextProviderApiKeyUrl('deepseek')!,
      connectionSchema: {
        required: ['apiKey'],
        optional: ['baseURL'],
        fieldTypes: {
          apiKey: 'string',
          baseURL: 'string'
        }
      }
    }
  }

  public getModels(): TextModel[] {
    return DEEPSEEK_STATIC_MODELS.map((definition) => {
      const baseModel = this.buildDefaultModel(definition.id)

      return {
        ...baseModel,
        name: definition.name,
        description: definition.description,
        capabilities: {
          ...baseModel.capabilities,
          ...(definition.capabilities ?? {})
        },
        defaultParameterValues: definition.defaultParameterValues
          ? {
              ...(baseModel.defaultParameterValues ?? {}),
              ...definition.defaultParameterValues
            }
          : baseModel.defaultParameterValues
      }
    })
  }
}
