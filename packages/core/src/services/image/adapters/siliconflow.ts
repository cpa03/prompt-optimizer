import { AbstractImageProviderAdapter } from './abstract-adapter'
import { ImageError } from '../errors'
import type {
  ImageProvider,
  ImageModel,
  ImageRequest,
  ImageResult,
  ImageModelConfig,
  ImageParameterDefinition,
} from '../types'
import { IMAGE_ERROR_CODES } from '../../../constants/error-codes'
import {
  PROVIDER_URLS,
  PROVIDER_API_KEY_URLS,
  MIME_TYPES,
  getTestPrompt,
  getSiliconFlowKolorsParameterDefinitions,
  getSiliconFlowQwenParameterDefinitions,
  getSiliconFlowDefaultParameterValues,
} from '../../../config'
import { withRetry, createTimeoutSignal } from '../../../utils/retry'
import { TIMEOUTS } from '../../../config/timeouts'

export class SiliconFlowImageAdapter extends AbstractImageProviderAdapter {
  protected normalizeBaseUrl(base: string): string {
    const trimmed = base.replace(/\/$/, '')
    return /\/v1$/.test(trimmed) ? trimmed : `${trimmed}/v1`
  }
  getProvider(): ImageProvider {
    return {
      id: 'siliconflow',
      name: 'SiliconFlow',
      description: 'SiliconFlow 多模型图像生成平台',
      requiresApiKey: true,
      defaultBaseURL: PROVIDER_URLS.siliconflow,
      supportsDynamicModels: false,
      apiKeyUrl: PROVIDER_API_KEY_URLS.siliconflow,
      connectionSchema: {
        required: ['apiKey'],
        optional: ['baseURL'],
        fieldTypes: {
          apiKey: 'string',
          baseURL: 'string',
        },
      },
    }
  }

  getModels(): ImageModel[] {
    // 返回静态的基础模型列表（离线可用）
    return [
      {
        id: 'Kwai-Kolors/Kolors',
        name: 'Kolors',
        description: 'Kwai-Kolors 高质量图像生成模型',
        providerId: 'siliconflow',
        capabilities: {
          text2image: true,
          image2image: true,
          multiImage: false,
        },
        parameterDefinitions: getSiliconFlowKolorsParameterDefinitions(),
        defaultParameterValues: getSiliconFlowDefaultParameterValues('Kwai-Kolors/Kolors'),
      },
      {
        id: 'Qwen/Qwen-Image',
        name: 'Qwen Image',
        description: 'Qwen 多模态图像生成模型，支持文本生成和CFG控制',
        providerId: 'siliconflow',
        capabilities: {
          text2image: true,
          image2image: false,
          multiImage: false,
        },
        parameterDefinitions: getSiliconFlowQwenParameterDefinitions(),
        defaultParameterValues: getSiliconFlowDefaultParameterValues('Qwen/Qwen-Image'),
      },
    ]
  }

  async getModelsAsync(connectionConfig: Record<string, any>): Promise<ImageModel[]> {
    // 验证连接配置
    this.validateConnectionConfig(connectionConfig)

    const headers = {
      Authorization: `Bearer ${connectionConfig.apiKey}`,
    }
    const baseURL = connectionConfig.baseURL || this.getProvider().defaultBaseURL

    try {
      // 规范化临时配置，供 apiCall 解析 baseURL 与认证
      const tmpConfig: ImageModelConfig = {
        id: 'siliconflow_dynamic',
        name: 'siliconflow_dynamic',
        providerId: 'siliconflow',
        modelId: '',
        enabled: true,
        connectionConfig: { apiKey: connectionConfig.apiKey, baseURL },
        provider: this.getProvider(),
        model: this.buildDefaultModel(''),
      } as any

      // 分别获取不同能力的模型
      const [text2imageResponse, image2imageResponse] = await Promise.all([
        this.apiCall(tmpConfig, '/models?type=image&sub_type=text-to-image', {
          method: 'GET',
          headers,
        }),
        this.apiCall(tmpConfig, '/models?type=image&sub_type=image-to-image', {
          method: 'GET',
          headers,
        }),
      ])

      // 组装模型能力
      return this.assembleModelCapabilities(
        text2imageResponse.data || [],
        image2imageResponse.data || []
      )
    } catch (error) {
      console.warn('Failed to load dynamic models, using static list:', error)
      return this.getModels()
    }
  }

  private assembleModelCapabilities(
    text2imageModels: any[],
    image2imageModels: any[]
  ): ImageModel[] {
    const image2imageSet = new Set(image2imageModels.map((m: any) => m.id))
    const allModelsMap = new Map()

    // 处理文生图模型
    text2imageModels.forEach((model: any) => {
      allModelsMap.set(model.id, {
        id: model.id,
        name: model.id,
        description: `SiliconFlow ${model.id} model`,
        providerId: 'siliconflow',
        capabilities: {
          text2image: true,
          image2image: image2imageSet.has(model.id), // 检查是否也支持图生图
          multiImage: false,
        },
        parameterDefinitions: this.getParameterDefinitions(model.id),
        defaultParameterValues: this.getDefaultParameterValues(model.id),
      })
    })

    // 处理纯图生图模型（不在文生图列表中的）
    image2imageModels.forEach((model: any) => {
      if (!allModelsMap.has(model.id)) {
        allModelsMap.set(model.id, {
          id: model.id,
          name: model.id,
          description: `SiliconFlow ${model.id} model (Image-to-Image only)`,
          providerId: 'siliconflow',
          capabilities: {
            text2image: false, // 纯图生图模型
            image2image: true,
            multiImage: false,
          },
          parameterDefinitions: this.getParameterDefinitions(model.id),
          defaultParameterValues: this.getDefaultParameterValues(model.id),
        })
      }
    })

    return Array.from(allModelsMap.values())
  }

  protected validateConnectionConfig(connectionConfig: Record<string, any>): void {
    // 基础验证
    super.validateConnectionConfig(connectionConfig)

    // SiliconFlow 特定验证
    if (!connectionConfig.apiKey) {
      throw new ImageError(IMAGE_ERROR_CODES.API_KEY_REQUIRED, undefined, {
        providerName: 'SiliconFlow',
      })
    }
  }

  protected getTestImageRequest(
    testType: 'text2image' | 'image2image'
  ): Omit<ImageRequest, 'configId'> {
    if (testType === 'text2image') {
      return {
        prompt: getTestPrompt('siliconflow', 'text2image'),
        count: 1,
      }
    }

    if (testType === 'image2image') {
      return {
        prompt: getTestPrompt('siliconflow', 'image2image'),
        count: 1,
        inputImage: {
          b64: AbstractImageProviderAdapter.TEST_IMAGE_BASE64.split(',')[1], // 去掉data:前缀
          mimeType: MIME_TYPES.PNG,
        },
      }
    }

    throw new ImageError(IMAGE_ERROR_CODES.UNSUPPORTED_TEST_TYPE, undefined, { testType })
  }

  protected async doGenerate(
    request: ImageRequest,
    config: ImageModelConfig
  ): Promise<ImageResult> {
    // 构建请求体，隐藏多图相关参数并固定为单图
    const mergedParams: Record<string, any> = {
      // 使用默认参数和覆盖参数
      ...config.paramOverrides,
      ...request.paramOverrides,
    }
    delete mergedParams.n
    delete mergedParams.batch_size

    const response = await this.apiCall(config, '/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.connectionConfig?.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.modelId, // 直接使用配置中的模型ID
        prompt: request.prompt,
        // 固定单图（当前不支持多图）
        ...mergedParams,
        batch_size: 1,
        // 处理输入图像（如果有）
        ...(request.inputImage?.b64 && {
          image: `data:${request.inputImage.mimeType || MIME_TYPES.PNG};base64,${request.inputImage.b64}`,
        }),
      }),
    })

    return {
      images:
        response.images?.map((img: any) => ({
          url: img.url,
          b64: img.b64,
          mimeType: img.mimeType || MIME_TYPES.PNG,
        })) || [],
      metadata: {
        providerId: 'siliconflow',
        modelId: config.modelId,
        configId: config.id,
        seed: response.seed,
        usage: {
          inference_time: response.timings?.inference,
        },
      },
    }
  }

  private async apiCall(config: ImageModelConfig, endpoint: string, options: any) {
    const url = this.resolveEndpointUrl(config, endpoint)
    const timeoutMs = config.timeoutMs || TIMEOUTS.service.image

    return withRetry(
      async (_signal) => {
        const { signal: timeoutSignal, cleanup } = createTimeoutSignal(timeoutMs)

        try {
          const combinedOptions = {
            ...options,
            signal: timeoutSignal,
          }

          const response = await fetch(url, combinedOptions)

          if (!response.ok) {
            let bodyText = ''
            try {
              bodyText = await response.text()
            } catch {
              bodyText = ''
            }

            const headers: any = (response as any)?.headers
            const getHeader = (name: string) => (headers?.get ? headers.get(name) : undefined)
            const requestId =
              getHeader('x-request-id') ||
              getHeader('x-siliconflow-request-id') ||
              getHeader('cf-ray') ||
              getHeader('x-amzn-requestid') ||
              getHeader('x-requestid')

            const error = new ImageError(
              IMAGE_ERROR_CODES.GENERATION_FAILED,
              `SiliconFlow API error: ${response.status} ${response.statusText}` +
                (requestId ? ` (requestId=${requestId})` : '') +
                (bodyText ? `\n\n${bodyText}` : '')
            )
            ;(error as any).status = response.status
            throw error
          }

          return await response.json()
        } finally {
          cleanup()
        }
      },
      {
        maxAttempts: 3,
        baseDelayMs: 1000,
        maxDelayMs: 10000,
        retryableErrors: ['rate_limit', 'overloaded', 'timeout'],
      }
    )
  }

  protected getParameterDefinitions(modelId: string): readonly ImageParameterDefinition[] {
    const modelName = modelId.toLowerCase()

    // Use modular parameter definitions based on model type
    if (modelName.includes('qwen')) {
      return getSiliconFlowQwenParameterDefinitions()
    }

    // Default to Kolors parameters for all other models
    return getSiliconFlowKolorsParameterDefinitions()
  }

  protected getDefaultParameterValues(modelId: string): Record<string, unknown> {
    return getSiliconFlowDefaultParameterValues(modelId)
  }
}
