import { AbstractImageProviderAdapter } from './abstract-adapter'
import type {
  ImageProvider,
  ImageModel,
  ImageRequest,
  ImageResult,
  ImageModelConfig,
  ImageParameterDefinition,
} from '../types'
import { ImageError } from '../errors'
import { IMAGE_ERROR_CODES } from '../../../constants/error-codes'
import {
  PROVIDER_URLS,
  MIME_TYPES,
  PROVIDER_API_KEY_URLS,
  getTestPrompt,
  getOpenAIParameterDefinitions,
  getOpenAIDefaultParameterValues,
} from '../../../config'
import { withRetry, createTimeoutSignal } from '../../../utils/retry'
import { TIMEOUTS } from '../../../config/timeouts'

export class OpenAIImageAdapter extends AbstractImageProviderAdapter {
  protected normalizeBaseUrl(base: string): string {
    const trimmed = base.replace(/\/$/, '')
    return /\/v1$/.test(trimmed) ? trimmed : `${trimmed}/v1`
  }
  getProvider(): ImageProvider {
    return {
      id: 'openai',
      name: 'OpenAI',
      description: 'OpenAI GPT Image 图像生成服务',
      requiresApiKey: true,
      defaultBaseURL: PROVIDER_URLS.openai,
      supportsDynamicModels: false,
      apiKeyUrl: PROVIDER_API_KEY_URLS.openai,
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
    return [
      {
        id: 'gpt-image-1',
        name: 'GPT Image 1',
        description: 'OpenAI GPT Image 1 多功能图像生成模型，支持文生图和图像编辑',
        providerId: 'openai',
        capabilities: {
          text2image: true,
          image2image: true,
          multiImage: false,
        },
        parameterDefinitions: getOpenAIParameterDefinitions(),
        defaultParameterValues: getOpenAIDefaultParameterValues(),
      },
    ]
  }

  protected getTestImageRequest(
    testType: 'text2image' | 'image2image'
  ): Omit<ImageRequest, 'configId'> {
    if (testType === 'text2image') {
      return {
        prompt: getTestPrompt('openai', 'text2image'),
        count: 1,
      }
    }

    if (testType === 'image2image') {
      return {
        prompt: getTestPrompt('openai', 'image2image'),
        inputImage: {
          b64: AbstractImageProviderAdapter.TEST_IMAGE_BASE64.split(',')[1], // 去除data URL前缀
          mimeType: MIME_TYPES.image.png,
        },
        count: 1,
      }
    }

    throw new ImageError(IMAGE_ERROR_CODES.UNSUPPORTED_TEST_TYPE, undefined, { testType })
  }

  protected getParameterDefinitions(_modelId: string): readonly ImageParameterDefinition[] {
    // GPT Image 1 使用统一的参数定义，n参数固定为1不暴露给用户
    return getOpenAIParameterDefinitions()
  }

  protected getDefaultParameterValues(_modelId: string): Record<string, unknown> {
    return getOpenAIDefaultParameterValues()
  }

  protected async doGenerate(
    request: ImageRequest,
    config: ImageModelConfig
  ): Promise<ImageResult> {
    if (!config.connectionConfig?.apiKey) {
      throw new ImageError(
        IMAGE_ERROR_CODES.CONNECTION_FAILED,
        'API key is required. Please configure your OpenAI API key in settings.'
      )
    }

    const hasInputImage = !!request.inputImage

    if (hasInputImage) {
      // 图像编辑模式：使用 /images/edits 端点
      return await this.generateImageEdit(request, config)
    } else {
      // 文生图模式：使用 /images/generations 端点
      return await this.generateImage(request, config)
    }
  }

  private async generateImage(
    request: ImageRequest,
    config: ImageModelConfig
  ): Promise<ImageResult> {
    const merged: Record<string, any> = {
      model: config.modelId,
      prompt: request.prompt,
      response_format: 'b64_json',
      output_format: 'png', // 固定为png
      stream: false,
      // 合并参数覆盖（先合并，后强制覆盖）
      ...config.paramOverrides,
      ...request.paramOverrides,
    }
    // 隐藏并固定多图相关参数
    delete (merged as any).n
    delete (merged as any).batch_size
    const payload = { ...merged, n: 1 }

    const response = await this.apiCall(config, '/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.connectionConfig?.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    return this.parseImageResponse(response, config)
  }

  private async generateImageEdit(
    request: ImageRequest,
    config: ImageModelConfig
  ): Promise<ImageResult> {
    if (!request.inputImage) {
      throw new ImageError(IMAGE_ERROR_CODES.IMAGE2IMAGE_INPUT_IMAGE_REQUIRED)
    }

    // 创建FormData
    const formData = new FormData()
    formData.append('model', config.modelId)
    formData.append('prompt', request.prompt)
    formData.append('response_format', 'b64_json')
    formData.append('output_format', 'png') // 固定为png

    // 添加参数覆盖（隐藏多图相关参数）
    const allParams: Record<string, any> = { ...config.paramOverrides, ...request.paramOverrides }
    delete allParams.n
    delete allParams.batch_size
    for (const [key, value] of Object.entries(allParams)) {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value))
      }
    }

    // 固定单图
    formData.append('n', '1')

    // 转换base64图像为Blob
    const imageBlob = this.base64ToBlob(
      request.inputImage.b64 || '',
      request.inputImage.mimeType || MIME_TYPES.PNG
    )
    formData.append('image', imageBlob, 'input.png')

    const response = await this.apiCall(config, '/images/edits', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.connectionConfig?.apiKey}`,
        // 不设置Content-Type，让浏览器自动设置multipart/form-data边界
      },
      body: formData,
    })

    return this.parseImageResponse(response, config)
  }

  private parseImageResponse(response: any, config: ImageModelConfig): ImageResult {
    if (!response.data || !Array.isArray(response.data)) {
      throw new ImageError(IMAGE_ERROR_CODES.INVALID_RESPONSE_FORMAT)
    }

    const images = response.data.map((item: any) => {
      if (!item.b64_json) {
        throw new ImageError(IMAGE_ERROR_CODES.INVALID_RESPONSE_FORMAT)
      }

      // 构建 data URL
      const dataUrl = `data:image/png;base64,${item.b64_json}`

      return {
        b64: item.b64_json,
        mimeType: MIME_TYPES.PNG,
        url: dataUrl,
      }
    })

    return {
      images,
      text: response.data[0]?.revised_prompt, // GPT Image 可能提供修订后的提示词
      metadata: {
        providerId: 'openai',
        modelId: config.modelId,
        configId: config.id,
        usage: response.usage,
      },
    }
  }

  private base64ToBlob(base64: string, mimeType: string): Blob {
    // 移除data URL前缀（如果存在）
    const cleanBase64 = base64.includes(',') ? base64.split(',')[1] : base64
    // 兼容浏览器与 Node/Electron：优先使用 atob；否则使用 Node 的 Buffer
    if (typeof atob === 'function') {
      const bin = atob(cleanBase64)
      const arr = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
      return new Blob([arr], { type: mimeType })
    } else if (typeof (globalThis as any).Buffer !== 'undefined') {
      const buf = (globalThis as any).Buffer.from(cleanBase64, 'base64')
      // 创建新的 Uint8Array 并复制数据，确保使用普通 ArrayBuffer
      const arr = new Uint8Array(buf.length)
      for (let i = 0; i < buf.length; i++) {
        arr[i] = buf[i]
      }
      return new Blob([arr], { type: mimeType })
    } else {
      throw new ImageError(IMAGE_ERROR_CODES.BASE64_DECODING_NOT_SUPPORTED)
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
            let errorMessage = `OpenAI API error: ${response.status} ${response.statusText}`
            try {
              const errorData = await response.json()
              if (errorData.error?.message) {
                errorMessage = errorData.error.message
              }
            } catch {
              // Ignore JSON parse errors, use default message
            }

            const error = new ImageError(IMAGE_ERROR_CODES.GENERATION_FAILED, errorMessage)
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
}
