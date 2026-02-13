import { AbstractImageProviderAdapter } from './abstract-adapter'
import type {
  ImageProvider,
  ImageModel,
  ImageRequest,
  ImageResult,
  ImageModelConfig,
  ImageParameterDefinition
} from '../types'
import { ImageError } from '../errors'
import { IMAGE_ERROR_CODES } from '../../../constants/error-codes'
import {
  PROVIDER_URLS,
  PROVIDER_API_KEY_URLS,
  MIME_TYPES,
  getTestPrompt,
  getDashScopeParameterDefinitions,
  getDashScopeEditParameterDefinitions,
  getDashScopeDefaultParameterValues
} from '../../../config'

/**
 * 阿里百炼图像适配器
 * 支持通义千问图像模型（Qwen-Image 文生图和 Qwen-Image-Edit 图生图）
 *
 * API 端点: https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation
 * 文档:
 *   - 文生图: https://help.aliyun.com/zh/model-studio/qwen-image-api
 *   - 图生图: https://help.aliyun.com/zh/model-studio/qwen-image-edit-guide
 */
export class DashScopeImageAdapter extends AbstractImageProviderAdapter {
  protected normalizeBaseUrl(base: string): string {
    // 阿里百炼图像 API 使用不同的端点结构
    const trimmed = base.replace(/\/$/, '')
    // 如果已经包含完整路径则直接返回
    if (trimmed.includes('/api/v1/services')) {
      return trimmed
    }
    // 默认返回基础 URL
    return trimmed
  }

  getProvider(): ImageProvider {
    return {
      id: 'dashscope',
      name: '阿里百炼',
      description: '阿里云百炼图像生成服务，支持通义千问图像模型（文生图/图生图）',
      corsRestricted: true,
      requiresApiKey: true,
      defaultBaseURL: PROVIDER_URLS.dashscope,
      supportsDynamicModels: false,
      apiKeyUrl: PROVIDER_API_KEY_URLS.dashscope,
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
    return [
      // Qwen-Image 文生图模型
      {
        id: 'qwen-image',
        name: '通义千问图像',
        description: '通义千问文生图模型，擅长复杂文本渲染，支持多行布局和段落级文本生成',
        providerId: 'dashscope',
        capabilities: {
          text2image: true,
          image2image: false,
          multiImage: false
        },
        parameterDefinitions: getDashScopeParameterDefinitions(),
        defaultParameterValues: getDashScopeDefaultParameterValues(false)
      },
      // Qwen-Image-Edit 图生图模型
      {
        id: 'qwen-image-edit',
        name: '通义千问图像编辑',
        description: '通义千问图像编辑模型，支持多图输入，可修改文字、增删物体、改变动作、迁移风格',
        providerId: 'dashscope',
        capabilities: {
          text2image: false,
          image2image: true,
          multiImage: true
        },
        parameterDefinitions: getDashScopeEditParameterDefinitions(),
        defaultParameterValues: getDashScopeDefaultParameterValues(true)
      }
    ]
  }

  protected getTestImageRequest(testType: 'text2image' | 'image2image'): Omit<ImageRequest, 'configId'> {
    if (testType === 'text2image') {
      return {
        prompt: getTestPrompt('dashscope', 'text2image'),
        count: 1,
        paramOverrides: {}
      }
    }

    throw new ImageError(IMAGE_ERROR_CODES.UNSUPPORTED_TEST_TYPE, undefined, { testType })
  }

  protected getParameterDefinitions(modelId: string): readonly ImageParameterDefinition[] {
    if (this.isQwenImageEditModel(modelId)) {
      return getDashScopeEditParameterDefinitions()
    }
    return getDashScopeParameterDefinitions()
  }

  protected getDefaultParameterValues(modelId: string): Record<string, unknown> {
    return getDashScopeDefaultParameterValues(this.isQwenImageEditModel(modelId))
  }

  private isQwenImageEditModel(modelId: string): boolean {
    return modelId.startsWith('qwen-image-edit')
  }

  protected async doGenerate(request: ImageRequest, config: ImageModelConfig): Promise<ImageResult> {
    if (this.isQwenImageEditModel(config.modelId)) {
      // Qwen-Image-Edit 图生图使用同步 API
      return await this.generateWithQwenImageEdit(request, config)
    }
    // Qwen-Image 文生图使用同步 API
    return await this.generateWithQwenImage(request, config)
  }

  /**
   * 使用 Qwen-Image 模型生成图像（同步接口）
   */
  private async generateWithQwenImage(request: ImageRequest, config: ImageModelConfig): Promise<ImageResult> {
    const baseUrl = config.connectionConfig?.baseURL || this.getProvider().defaultBaseURL
    const url = `${baseUrl}/api/v1/services/aigc/multimodal-generation/generation`

    const merged: Record<string, any> = {
      ...config.paramOverrides,
      ...request.paramOverrides
    }

    const payload = {
      model: config.modelId,
      input: {
        messages: [
          {
            role: 'user',
            content: [
              {
                text: request.prompt
              }
            ]
          }
        ]
      },
      parameters: {
        size: merged.size || '1328*1328',
        ...(merged.negative_prompt ? { negative_prompt: merged.negative_prompt } : {}),
        ...(merged.prompt_extend !== undefined ? { prompt_extend: merged.prompt_extend } : {}),
        ...(merged.watermark !== undefined ? { watermark: merged.watermark } : {}),
        ...(merged.seed !== undefined ? { seed: merged.seed } : {})
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.connectionConfig?.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      let errorMessage = `DashScope API error: ${response.status} ${response.statusText}`
      try {
        const errorData = await response.json()
        if (errorData.message) {
          errorMessage = errorData.message
        }
      } catch {
        // 忽略 JSON 解析错误
      }
      throw new ImageError(IMAGE_ERROR_CODES.GENERATION_FAILED, errorMessage)
    }

    const data = await response.json()

    // 检查是否有错误
    if (data.code) {
      throw new ImageError(IMAGE_ERROR_CODES.GENERATION_FAILED, data.message || `DashScope API error: ${data.code}`)
    }

    // 解析 Qwen-Image 响应
    const choices = data.output?.choices || []
    if (choices.length === 0) {
      throw new ImageError(IMAGE_ERROR_CODES.INVALID_RESPONSE_FORMAT)
    }

    // 只取第一张图像
    const choice = choices[0]
    const content = choice.message?.content || []
    const imageContent = content.find((c: any) => c.image)
    if (!imageContent) {
      throw new ImageError(IMAGE_ERROR_CODES.INVALID_RESPONSE_FORMAT)
    }

    return {
      images: [{
        url: imageContent.image,
        mimeType: MIME_TYPES.PNG
      }],
      metadata: {
        providerId: 'dashscope',
        modelId: config.modelId,
        configId: config.id,
        usage: data.usage
      }
    }
  }

  /**
   * 使用 Qwen-Image-Edit 模型编辑图像（同步接口）
   */
  private async generateWithQwenImageEdit(request: ImageRequest, config: ImageModelConfig): Promise<ImageResult> {
    const baseUrl = config.connectionConfig?.baseURL || this.getProvider().defaultBaseURL
    const url = `${baseUrl}/api/v1/services/aigc/multimodal-generation/generation`

    const merged: Record<string, any> = {
      ...config.paramOverrides,
      ...request.paramOverrides
    }

    // 构建 content 数组，包含输入图像和文本提示词
    const content: Array<{ image?: string; text?: string }> = []

    // 添加输入图像
    if (request.inputImage) {
      // DashScope 的 image 字段要求：公网 URL 或 data:{mime};base64,{data}。
      // 本项目只支持本地 base64，因此这里统一拼成 data URL。
      const mimeType = request.inputImage.mimeType || MIME_TYPES.PNG
      const b64 = request.inputImage.b64 || ''
      const dataUrl = b64.startsWith('data:') ? b64 : `data:${mimeType};base64,${b64}`
      content.push({ image: dataUrl })
    }

    // 添加文本提示词
    content.push({ text: request.prompt })

    const payload = {
      model: config.modelId,
      input: {
        messages: [
          {
            role: 'user',
            content
          }
        ]
      },
      parameters: {
        ...(merged.negative_prompt ? { negative_prompt: merged.negative_prompt } : {}),
        ...(merged.prompt_extend !== undefined ? { prompt_extend: merged.prompt_extend } : {}),
        ...(merged.watermark !== undefined ? { watermark: merged.watermark } : {}),
        ...(merged.seed !== undefined ? { seed: merged.seed } : {})
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.connectionConfig?.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      let errorMessage = `DashScope API error: ${response.status} ${response.statusText}`
      try {
        const errorData = await response.json()
        if (errorData.message) {
          errorMessage = errorData.message
        }
      } catch {
        // 忽略 JSON 解析错误
      }
      throw new ImageError(IMAGE_ERROR_CODES.GENERATION_FAILED, errorMessage)
    }

    const data = await response.json()

    // 检查是否有错误
    if (data.code) {
      throw new ImageError(IMAGE_ERROR_CODES.GENERATION_FAILED, data.message || `DashScope API error: ${data.code}`)
    }

    // 解析响应 - 只取第一张图像
    const choices = data.output?.choices || []
    if (choices.length === 0) {
      throw new ImageError(IMAGE_ERROR_CODES.INVALID_RESPONSE_FORMAT)
    }

    // 查找第一张图像
    for (const choice of choices) {
      const contentArr = choice.message?.content || []
      for (const item of contentArr) {
        if (item.image) {
          return {
            images: [{
              url: item.image,
              mimeType: MIME_TYPES.PNG
            }],
            metadata: {
              providerId: 'dashscope',
              modelId: config.modelId,
              configId: config.id,
              usage: data.usage
            }
          }
        }
      }
    }

    throw new ImageError(IMAGE_ERROR_CODES.INVALID_RESPONSE_FORMAT)
  }
}
