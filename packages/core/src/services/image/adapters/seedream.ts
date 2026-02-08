import { AbstractImageProviderAdapter } from './abstract-adapter'
import { ImageError } from '../errors'
import type {
  ImageProvider,
  ImageModel,
  ImageRequest,
  ImageResult,
  ImageModelConfig
} from '../types'
import { IMAGE_ERROR_CODES } from '../../../constants/error-codes'
import { PROVIDER_URLS } from '../../../config/providers'
import { IMAGE_SIZE_PRESETS, IMAGE_DEFAULTS } from '../../../config/defaults'

export class SeedreamImageAdapter extends AbstractImageProviderAdapter {
  protected normalizeBaseUrl(base: string): string {
    const trimmed = base.replace(/\/$/, '')
    if (/\/api\/v3$/.test(trimmed)) return trimmed
    if (/\/api$/.test(trimmed)) return `${trimmed}/v3`
    return `${trimmed}/api/v3`
  }
  getProvider(): ImageProvider {
    return {
      id: 'seedream',
      name: 'Seedream (火山方舟)',
      description: '火山方舟 Seedream 图像生成模型',
      corsRestricted: true,
      requiresApiKey: true,
      defaultBaseURL: PROVIDER_URLS.seedream,
      supportsDynamicModels: false,  // 不支持动态获取
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

  getModels(): ImageModel[] {
    const sizes = IMAGE_SIZE_PRESETS.seedream
    const defaults = IMAGE_DEFAULTS.seedream
    
    // 返回静态的模型列表（只保留4.0版本）
    return [
      {
        id: 'doubao-seedream-4-0-250828',
        name: 'Doubao Seedream 4.0',
        description: '火山方舟 Doubao Seedream 4.0 高质量图像生成模型',
        providerId: 'seedream',
        capabilities: {
          text2image: true,
          image2image: true,
          multiImage: false
        },
        parameterDefinitions: [
          {
            name: 'size',
            labelKey: 'params.size.label',
            descriptionKey: 'params.size.description',
            type: 'string',
            defaultValue: sizes.default,
            allowedValues: sizes.available
          },
          {
            name: 'sequential_image_generation',
            labelKey: 'params.sequentialGeneration.label',
            descriptionKey: 'params.sequentialGeneration.description',
            type: 'string',
            defaultValue: 'disabled',
            allowedValues: ['disabled']
          },
          {
            name: 'response_format',
            labelKey: 'params.responseFormat.label',
            descriptionKey: 'params.responseFormat.description',
            type: 'string',
            defaultValue: defaults.sampleMethod,
            allowedValues: ['b64_json', 'url']
          },
          {
            name: 'watermark',
            labelKey: 'params.watermark.label',
            descriptionKey: 'params.watermark.description',
            type: 'boolean',
            defaultValue: false
          }
        ],
        defaultParameterValues: {
          size: sizes.default,
          sequential_image_generation: 'disabled',
          response_format: defaults.sampleMethod,
          watermark: false
        }
      }
    ]
  }

  protected getParameterDefinitions(_modelId: string): readonly any[] {
    const sizes = IMAGE_SIZE_PRESETS.seedream
    const defaults = IMAGE_DEFAULTS.seedream
    
    // 所有模型使用统一的参数定义（只保留4.0版本）
    return [
      {
        name: 'size',
        labelKey: 'params.size.label',
        descriptionKey: 'params.size.description',
        type: 'string',
        defaultValue: sizes.default,
        allowedValues: sizes.available
      },
      {
        name: 'sequential_image_generation',
        labelKey: 'params.sequentialGeneration.label',
        descriptionKey: 'params.sequentialGeneration.description',
        type: 'string',
        defaultValue: 'disabled',
        allowedValues: ['disabled']
      },
      {
        name: 'response_format',
        labelKey: 'params.responseFormat.label',
        descriptionKey: 'params.responseFormat.description',
        type: 'string',
        defaultValue: defaults.sampleMethod,
        allowedValues: ['b64_json', 'url']
      },
      {
        name: 'watermark',
        labelKey: 'params.watermark.label',
        descriptionKey: 'params.watermark.description',
        type: 'boolean',
        defaultValue: false
      }
    ]
  }

  protected getDefaultParameterValues(_modelId: string): Record<string, unknown> {
    const sizes = IMAGE_SIZE_PRESETS.seedream
    const defaults = IMAGE_DEFAULTS.seedream
    
    // 所有模型使用统一的默认值
    return {
      size: sizes.default,
      sequential_image_generation: 'disabled',
      response_format: defaults.sampleMethod,
      watermark: false
    }
  }

  protected getTestImageRequest(testType: 'text2image' | 'image2image'): Omit<ImageRequest, 'configId'> {
    if (testType === 'text2image') {
      return {
        prompt: '一朵花',
        count: 1
      }
    }

    if (testType === 'image2image') {
      return {
        prompt: '把它变成红色',
        count: 1,
        inputImage: {
          b64: AbstractImageProviderAdapter.TEST_IMAGE_BASE64.split(',')[1], // 去掉data:前缀
          mimeType: 'image/png'
        }
      }
    }

    throw new ImageError(IMAGE_ERROR_CODES.UNSUPPORTED_TEST_TYPE, undefined, { testType })
  }

  protected async doGenerate(request: ImageRequest, config: ImageModelConfig): Promise<ImageResult> {
    // 构建请求体（隐藏多图相关参数，强制单图）
    const overrides: Record<string, any> = { ...config.paramOverrides, ...request.paramOverrides }
    delete overrides.n
    delete overrides.batch_size
    const payload: any = {
      model: config.modelId,
      prompt: request.prompt,
      sequential_image_generation: 'disabled', // 固定禁用组图
      ...overrides,
      n: 1
    }

    // 图生图支持：添加图像输入
    if (request.inputImage?.b64) {
      const mime = request.inputImage.mimeType || 'image/png'
      payload.image = `data:${mime};base64,${request.inputImage.b64}`
    }

    const response = await this.apiCall(config, '/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.connectionConfig?.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = response

    // 解析响应
    const images = data.data?.map((item: any) => ({
      url: item.url,
      b64: item.b64_json,
      mimeType: 'image/png'
    })) || []

    if (images.length === 0) {
      throw new ImageError(IMAGE_ERROR_CODES.INVALID_RESPONSE_FORMAT)
    }

      return {
      images,
      metadata: {
        providerId: 'seedream',
        modelId: config.modelId,
        configId: config.id,
        usage: data.usage
      }
    }
  }

  private async apiCall(config: ImageModelConfig, endpoint: string, options: any) {
    const url = this.resolveEndpointUrl(config, endpoint)
    const response = await fetch(url, options)
    if (!response.ok) {
      let errorMessage: string
      try {
        const errorData = await response.json()
        errorMessage = errorData?.error?.message || errorData?.message || response.statusText
      } catch {
        errorMessage = response.statusText
      }
      throw new ImageError(IMAGE_ERROR_CODES.GENERATION_FAILED, `Seedream API error: ${response.status} ${errorMessage}`)
    }
    return await response.json()
  }
}
