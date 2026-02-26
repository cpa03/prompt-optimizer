import { vi } from 'vitest'

export interface MockServices {
  promptService?: any
  historyManager?: any
  modelManager?: any
  templateManager?: any
  storage?: any
  llmService?: any
}

export function createMockPromptService(overrides?: MockServices['promptService']) {
  return {
    optimizePrompt: vi.fn().mockResolvedValue('Optimized prompt'),
    optimizePromptStream: vi.fn(),
    iteratePrompt: vi.fn().mockResolvedValue('Iterated prompt'),
    iteratePromptStream: vi.fn(),
    analyzePrompt: vi.fn().mockResolvedValue({ score: 85, feedback: 'Good prompt' }),
    comparePrompts: vi.fn().mockResolvedValue({
      original: 'Original prompt',
      optimized: 'Optimized prompt',
      evaluation: { score: 90 },
    }),
    ...overrides,
  }
}

export function createMockHistoryManager(overrides?: MockServices['historyManager']) {
  return {
    createNewChain: vi.fn().mockResolvedValue({
      chainId: 'chain-1',
      versions: [],
      currentRecord: null,
    }),
    addIteration: vi.fn().mockResolvedValue({
      iterationId: 'iter-1',
    }),
    getChain: vi.fn().mockResolvedValue(null),
    getRecords: vi.fn().mockResolvedValue([]),
    deleteChain: vi.fn().mockResolvedValue(true),
    clearAll: vi.fn().mockResolvedValue(true),
    ...overrides,
  }
}

export function createMockModelManager(overrides?: MockServices['modelManager']) {
  return {
    getModels: vi.fn().mockReturnValue([]),
    getModel: vi.fn().mockReturnValue(null),
    addModel: vi.fn().mockResolvedValue(true),
    updateModel: vi.fn().mockResolvedValue(true),
    deleteModel: vi.fn().mockResolvedValue(true),
    setDefaultModel: vi.fn().mockResolvedValue(true),
    getDefaultModel: vi.fn().mockReturnValue(null),
    ...overrides,
  }
}

export function createMockTemplateManager(overrides?: MockServices['templateManager']) {
  return {
    getTemplate: vi.fn().mockReturnValue(null),
    saveTemplate: vi.fn().mockResolvedValue(true),
    deleteTemplate: vi.fn().mockResolvedValue(true),
    getAllTemplates: vi.fn().mockReturnValue([]),
    listTemplates: vi.fn().mockReturnValue([]),
    ...overrides,
  }
}

export function createMockStorage(overrides?: MockServices['storage']) {
  return {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(true),
    delete: vi.fn().mockResolvedValue(true),
    clearAll: vi.fn().mockResolvedValue(true),
    ...overrides,
  }
}

export function createMockLLMService(overrides?: MockServices['llmService']) {
  return {
    chat: vi.fn().mockResolvedValue({
      content: 'Mock response',
      usage: { inputTokens: 10, outputTokens: 20 },
    }),
    chatStream: vi.fn(),
    ...overrides,
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function createMockAppServices(): MockServices {
  return {
    promptService: createMockPromptService(),
    historyManager: createMockHistoryManager(),
    modelManager: createMockModelManager(),
    templateManager: createMockTemplateManager(),
    storage: createMockStorage(),
    llmService: createMockLLMService(),
  }
}
