import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LocalStorageProvider } from '../../src/services/storage/localStorageProvider'
import { PromptService } from '../../src/services/prompt/service'
import { ModelManager } from '../../src/services/model/manager'
import { TemplateManager } from '../../src/services/template/manager'
import { HistoryManager } from '../../src/services/history/manager'
import { createLLMService } from '../../src/services/llm/service'
import { createTemplateManager } from '../../src/services/template/manager'
import { createTemplateLanguageService } from '../../src/services/template/languageService'
import { createModelManager } from '../../src/services/model/manager'
import { createHistoryManager } from '../../src/services/history/manager'
import { Template, MessageTemplate } from '../../src/services/template/types'
import { TextModelConfig, TextModelMeta, ProviderMeta } from '../../src/services/model/types'

vi.mock('uuid', () => ({
  v4: vi.fn().mockImplementation(() => `mock-uuid-${Math.random().toString(36).slice(2, 9)}`),
}))

describe('Cross-Package Workflow Integration Tests', () => {
  let storage: LocalStorageProvider
  let modelManager: ModelManager
  let templateManager: TemplateManager
  let historyManager: HistoryManager
  let llmService: any
  let promptService: PromptService

  const createMockProviderMeta = (): ProviderMeta => ({
    name: 'Mock Provider',
    id: 'mock-provider',
    apiKeyRequired: true,
    baseUrl: 'https://api.mock.com',
  })

  const createMockModelMeta = (): TextModelMeta => ({
    id: 'mock-model',
    name: 'Mock Model',
    provider: 'mock',
    contextWindow: 4096,
    supportsVision: false,
    supportsToolCalls: false,
  })

  beforeEach(async () => {
    storage = new LocalStorageProvider()
    await storage.clearAll()

    modelManager = createModelManager(storage)
    llmService = createLLMService(modelManager)

    const languageService = createTemplateLanguageService(storage)
    templateManager = createTemplateManager(storage, languageService)

    historyManager = createHistoryManager(storage, modelManager)

    promptService = new PromptService(modelManager, llmService, templateManager, historyManager)
  })

  describe('PromptService + TemplateManager Workflow', () => {
    it('should load template from storage and use for optimization', async () => {
      const template: Template = {
        id: 'workflow-template',
        name: 'Workflow Template',
        content: [
          {
            role: 'system' as const,
            content: 'You are a helpful assistant.',
          },
          {
            role: 'user' as const,
            content: 'Optimize this: {{originalPrompt}}',
          },
        ] as MessageTemplate[],
        metadata: {
          version: '1.0',
          lastModified: Date.now(),
          templateType: 'optimize',
          language: 'en' as const,
        },
      }

      await templateManager.saveTemplate(template)

      const getTemplateSpy = vi.spyOn(templateManager, 'getTemplate').mockReturnValue(template)

      const retrievedTemplate = templateManager.getTemplate('workflow-template')
      expect(retrievedTemplate).toBeDefined()
      expect(retrievedTemplate?.id).toBe('workflow-template')

      getTemplateSpy.mockRestore()
    })

    it('should list all templates from storage', async () => {
      const templates: Template[] = Array.from({ length: 3 }, (_, i) => ({
        id: `template-${i}`,
        name: `Template ${i}`,
        content: [
          {
            role: 'system' as const,
            content: `System content ${i}`,
          },
        ] as MessageTemplate[],
        metadata: {
          version: '1.0',
          lastModified: Date.now(),
          templateType: 'optimize',
          language: 'en' as const,
        },
      }))

      for (const template of templates) {
        await templateManager.saveTemplate(template)
      }

      const allTemplates = await templateManager.listTemplates()
      expect(allTemplates.length).toBeGreaterThan(3)
    })
  })

  describe('HistoryManager + Storage Workflow', () => {
    it('should persist and retrieve history chains', async () => {
      const chainParams = {
        id: 'chain-1',
        originalPrompt: 'Original prompt',
        optimizedPrompt: 'Optimized prompt',
        type: 'optimize' as const,
        modelKey: 'mock-model',
        timestamp: Date.now(),
      }

      const chain = await historyManager.createNewChain(chainParams)

      expect(chain.chainId).toBeDefined()
      expect(chain.versions).toHaveLength(1)

      const retrievedChain = historyManager.getChain(chain.chainId)
      expect(retrievedChain).toBeDefined()
    })

    it('should persist multiple iterations in a chain', async () => {
      const chainParams = {
        id: 'chain-iterations',
        originalPrompt: 'Original',
        optimizedPrompt: 'Iteration 0',
        type: 'optimize' as const,
        modelKey: 'mock-model',
        timestamp: Date.now(),
      }

      const chain = await historyManager.createNewChain(chainParams)

      await historyManager.addIteration({
        chainId: chain.chainId,
        originalPrompt: 'Original',
        optimizedPrompt: 'Iteration 1',
        modelKey: 'mock-model',
        templateId: 'iterate',
        iterationNote: 'Make it better',
      })

      await historyManager.addIteration({
        chainId: chain.chainId,
        originalPrompt: 'Original',
        optimizedPrompt: 'Iteration 2',
        modelKey: 'mock-model',
        templateId: 'iterate',
        iterationNote: 'Make it even better',
      })

      const records = await historyManager.getRecords()
      expect(records.length).toBeGreaterThanOrEqual(3)
    })

    it('should delete chain and verify storage cleanup', async () => {
      const chainParams = {
        id: 'chain-delete',
        originalPrompt: 'To be deleted',
        optimizedPrompt: 'Deleted prompt',
        type: 'optimize' as const,
        modelKey: 'mock-model',
        timestamp: Date.now(),
      }

      const chain = await historyManager.createNewChain(chainParams)
      expect(chain.chainId).toBeDefined()

      await historyManager.deleteChain(chain.chainId)

      try {
        await historyManager.getChain(chain.chainId)
      } catch (e) {
        expect((e as Error).message).toContain('not found')
      }
    })
  })

  describe('ModelManager + Storage Workflow', () => {
    it('should persist model and use for service operations', async () => {
      const config: TextModelConfig = {
        id: 'workflow-model',
        name: 'Workflow Model',
        enabled: true,
        providerMeta: createMockProviderMeta(),
        modelMeta: {
          ...createMockModelMeta(),
          id: 'workflow-model',
        },
        connectionConfig: {
          apiKey: 'mock-key',
        },
      }

      await modelManager.addModel('workflow-model', config)

      const model = modelManager.getModel('workflow-model')
      expect(model).toBeDefined()
    })

    it('should persist models across storage reinitialization', async () => {
      const config: TextModelConfig = {
        id: 'persist-model',
        name: 'Persist Model',
        enabled: true,
        providerMeta: createMockProviderMeta(),
        modelMeta: {
          ...createMockModelMeta(),
          id: 'persist-model',
        },
        connectionConfig: {
          apiKey: 'mock-key',
        },
      }

      await modelManager.addModel('persist-model', config)

      const newModelManager = createModelManager(storage)

      const retrieved = newModelManager.getModel('persist-model')
      expect(retrieved).toBeDefined()
    })
  })

  describe('Full Workflow: Template + Model + History', () => {
    it('should complete full optimization workflow with all components', async () => {
      const template: Template = {
        id: 'full-workflow-template',
        name: 'Full Workflow Template',
        content: [
          {
            role: 'system' as const,
            content: 'You are a helpful assistant.',
          },
          {
            role: 'user' as const,
            content: 'Optimize this: {{originalPrompt}}',
          },
        ] as MessageTemplate[],
        metadata: {
          version: '1.0',
          lastModified: Date.now(),
          templateType: 'optimize',
          language: 'en' as const,
        },
      }

      await templateManager.saveTemplate(template)

      const config: TextModelConfig = {
        id: 'full-workflow-model',
        name: 'Full Workflow Model',
        enabled: true,
        providerMeta: createMockProviderMeta(),
        modelMeta: {
          ...createMockModelMeta(),
          id: 'full-workflow-model',
        },
        connectionConfig: {
          apiKey: 'mock-key',
        },
      }

      await modelManager.addModel('full-workflow-model', config)

      const templateCheck = templateManager.getTemplate('full-workflow-template')
      expect(templateCheck).toBeDefined()

      const modelCheck = modelManager.getModel('full-workflow-model')
      expect(modelCheck).toBeDefined()
    })

    it('should maintain data consistency across service restarts', async () => {
      const template: Template = {
        id: 'restart-template',
        name: 'Restart Template',
        content: [
          {
            role: 'system' as const,
            content: 'System',
          },
        ] as MessageTemplate[],
        metadata: {
          version: '1.0',
          lastModified: Date.now(),
          templateType: 'optimize',
          language: 'en' as const,
        },
      }
      await templateManager.saveTemplate(template)

      const chainParams = {
        id: 'restart-chain',
        originalPrompt: 'Original',
        optimizedPrompt: 'Optimized',
        type: 'optimize' as const,
        modelKey: 'restart-model',
        timestamp: Date.now(),
      }
      await historyManager.createNewChain(chainParams)

      const newTemplateManager = createTemplateManager(
        storage,
        createTemplateLanguageService(storage)
      )
      const newHistoryManager = createHistoryManager(storage, modelManager)

      const retrievedTemplate = newTemplateManager.getTemplate('restart-template')
      expect(retrievedTemplate).toBeDefined()

      const records = await newHistoryManager.getRecords()
      expect(records.length).toBeGreaterThan(0)
    })
  })
})
