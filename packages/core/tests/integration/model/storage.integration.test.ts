import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LocalStorageProvider } from '../../../src/services/storage/localStorageProvider'
import { createModelManager } from '../../../src/services/model/manager'
import { ModelManager } from '../../../src/services/model/manager'
import { TextModelConfig, TextModelMeta, ProviderMeta } from '../../../src/services/model/types'

vi.mock('uuid', () => ({
  v4: vi.fn().mockImplementation(() => `mock-uuid-${Math.random().toString(36).slice(2, 9)}`),
}))

describe('ModelManager + Storage Integration Tests', () => {
  let storage: LocalStorageProvider
  let modelManager: ModelManager

  const createMockProviderMeta = (id: string = 'test-provider'): ProviderMeta => ({
    name: 'Test Provider',
    id,
    apiKeyRequired: true,
    baseUrl: 'https://api.test.com',
  })

  const createMockModelMeta = (id: string = 'test-model'): TextModelMeta => ({
    id,
    name: 'Test Model',
    provider: 'test',
    contextWindow: 4096,
    supportsVision: false,
    supportsToolCalls: false,
  })

  beforeEach(async () => {
    storage = new LocalStorageProvider()
    await storage.clearAll()
    modelManager = createModelManager(storage)
  })

  describe('Model Persistence', () => {
    it('should persist model configurations', async () => {
      const config: TextModelConfig = {
        id: 'test-model-1',
        name: 'Test Model 1',
        enabled: true,
        providerMeta: createMockProviderMeta(),
        modelMeta: createMockModelMeta('test-model-1'),
        connectionConfig: {
          apiKey: 'test-key',
        },
      }

      await modelManager.addModel('test-model-1', config)

      const retrieved = modelManager.getModel('test-model-1')
      expect(retrieved).toBeDefined()
    })

    it('should retrieve model after storage reinitialization', async () => {
      const config: TextModelConfig = {
        id: 'persist-model',
        name: 'Persist Model',
        enabled: true,
        providerMeta: createMockProviderMeta(),
        modelMeta: createMockModelMeta('persist-model'),
        connectionConfig: {
          apiKey: 'test-key',
        },
      }

      await modelManager.addModel('persist-model', config)

      const newManager = createModelManager(storage)

      const retrieved = newManager.getModel('persist-model')
      expect(retrieved).toBeDefined()
    })
  })
})
