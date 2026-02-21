import type {
  IImageModelManager,
  IImageService,
  ImageRequest,
  ImageResult,
  ImageModelConfig,
  ImageModel,
  Text2ImageRequest,
  Image2ImageRequest,
} from './types'
import { BaseError } from '../llm/errors'
import { IMAGE_ERROR_CODES } from '../../constants/error-codes'
import { safeSerializeForIPC } from '../../utils/ipc-serialization'

type ElectronAPI = {
  image: {
    generate: (request: ImageRequest) => Promise<ImageResult>
    generateText2Image: (request: Text2ImageRequest) => Promise<ImageResult>
    generateImage2Image: (request: Image2ImageRequest) => Promise<ImageResult>
    validateRequest: (request: ImageRequest) => Promise<void>
    validateText2ImageRequest: (request: Text2ImageRequest) => Promise<void>
    validateImage2ImageRequest: (request: Image2ImageRequest) => Promise<void>
    testConnection: (config: ImageModelConfig) => Promise<ImageResult>
    getDynamicModels: (
      providerId: string,
      connectionConfig: Record<string, unknown>
    ) => Promise<ImageModel[]>
  }
  imageModel: {
    ensureInitialized: () => Promise<void>
    isInitialized: () => Promise<boolean>
    addConfig: (config: ImageModelConfig) => Promise<void>
    updateConfig: (id: string, updates: Partial<ImageModelConfig>) => Promise<void>
    deleteConfig: (id: string) => Promise<void>
    getConfig: (id: string) => Promise<ImageModelConfig | null>
    getAllConfigs: () => Promise<ImageModelConfig[]>
    getEnabledConfigs: () => Promise<ImageModelConfig[]>
    exportData: () => Promise<unknown>
    importData: (data: unknown) => Promise<void>
    getDataType: () => Promise<string>
    validateData: (data: unknown) => Promise<boolean>
  }
}

export class ElectronImageServiceProxy implements IImageService {
  private electronAPI: ElectronAPI

  constructor() {
    if (typeof window === 'undefined' || !window.electronAPI) {
      throw new BaseError(
        IMAGE_ERROR_CODES.GENERATION_FAILED,
        'ElectronImageServiceProxy can only be used in Electron renderer process'
      )
    }
    this.electronAPI = (window as unknown as { electronAPI: ElectronAPI }).electronAPI
  }

  async generate(request: ImageRequest): Promise<ImageResult> {
    return await this.electronAPI.image.generate(safeSerializeForIPC(request))
  }

  async generateText2Image(request: Text2ImageRequest): Promise<ImageResult> {
    return await this.electronAPI.image.generateText2Image(safeSerializeForIPC(request))
  }

  async generateImage2Image(request: Image2ImageRequest): Promise<ImageResult> {
    return await this.electronAPI.image.generateImage2Image(safeSerializeForIPC(request))
  }

  async validateRequest(request: ImageRequest): Promise<void> {
    await this.electronAPI.image.validateRequest(safeSerializeForIPC(request))
  }

  async validateText2ImageRequest(request: Text2ImageRequest): Promise<void> {
    await this.electronAPI.image.validateText2ImageRequest(safeSerializeForIPC(request))
  }

  async validateImage2ImageRequest(request: Image2ImageRequest): Promise<void> {
    await this.electronAPI.image.validateImage2ImageRequest(safeSerializeForIPC(request))
  }

  async testConnection(config: ImageModelConfig): Promise<ImageResult> {
    return await this.electronAPI.image.testConnection(safeSerializeForIPC(config))
  }

  async getDynamicModels(providerId: string, connectionConfig: Record<string, unknown>) {
    return await this.electronAPI.image.getDynamicModels(
      providerId,
      safeSerializeForIPC(connectionConfig || {})
    )
  }
}

export class ElectronImageModelManagerProxy implements IImageModelManager {
  private electronAPI: ElectronAPI

  constructor() {
    if (typeof window === 'undefined' || !window.electronAPI) {
      throw new BaseError(
        IMAGE_ERROR_CODES.CONFIG_INVALID,
        'ElectronImageModelManagerProxy can only be used in Electron renderer process'
      )
    }
    this.electronAPI = (window as unknown as { electronAPI: ElectronAPI }).electronAPI
  }

  async ensureInitialized(): Promise<void> {
    await this.electronAPI.imageModel.ensureInitialized()
  }

  async isInitialized(): Promise<boolean> {
    return await this.electronAPI.imageModel.isInitialized()
  }

  // 新的配置 CRUD 操作
  async addConfig(config: ImageModelConfig): Promise<void> {
    await this.electronAPI.imageModel.addConfig(safeSerializeForIPC(config))
  }

  async updateConfig(id: string, updates: Partial<ImageModelConfig>): Promise<void> {
    await this.electronAPI.imageModel.updateConfig(id, safeSerializeForIPC(updates))
  }

  async deleteConfig(id: string): Promise<void> {
    await this.electronAPI.imageModel.deleteConfig(id)
  }

  async getConfig(id: string): Promise<ImageModelConfig | null> {
    return await this.electronAPI.imageModel.getConfig(id)
  }

  async getAllConfigs(): Promise<ImageModelConfig[]> {
    return await this.electronAPI.imageModel.getAllConfigs()
  }

  async getEnabledConfigs(): Promise<ImageModelConfig[]> {
    return await this.electronAPI.imageModel.getEnabledConfigs()
  }

  // IImportExportable 接口
  async exportData(): Promise<any> {
    return await this.electronAPI.imageModel.exportData()
  }

  async importData(data: any): Promise<void> {
    await this.electronAPI.imageModel.importData(safeSerializeForIPC(data))
  }

  async getDataType(): Promise<string> {
    return await this.electronAPI.imageModel.getDataType()
  }

  async validateData(data: any): Promise<boolean> {
    return await this.electronAPI.imageModel.validateData(safeSerializeForIPC(data))
  }
}
