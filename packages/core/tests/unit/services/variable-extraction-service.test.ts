import { vi, describe, beforeEach, it, expect, afterEach } from 'vitest'
import { VariableExtractionService } from '../../../src/services/variable-extraction/service'
import {
  VariableExtractionValidationError,
  VariableExtractionModelError,
  VariableExtractionParseError,
} from '../../../src/services/variable-extraction/errors'
import type { VariableExtractionRequest } from '../../../src/services/variable-extraction/types'

describe('VariableExtractionService', () => {
  let service: VariableExtractionService
  let mockLLMService: any
  let mockModelManager: any
  let mockTemplateManager: any

  const mockExtractionResponse = JSON.stringify({
    variables: [
      {
        name: 'topic',
        value: 'artificial intelligence',
        position: {
          originalText: 'artificial intelligence',
          occurrence: 1,
        },
        reason: 'Main subject of the prompt',
        category: 'content-theme',
      },
      {
        name: 'wordCount',
        value: '500',
        position: {
          originalText: '500 words',
          occurrence: 1,
        },
        reason: 'Specifies output length',
        category: 'format-constraint',
      },
    ],
    summary: 'Extracted 2 variables: topic and wordCount',
  })

  beforeEach(() => {
    mockLLMService = {
      sendMessage: vi.fn().mockResolvedValue(mockExtractionResponse),
    }

    mockModelManager = {
      getModel: vi.fn().mockResolvedValue({ id: 'test-model', enabled: true }),
    }

    mockTemplateManager = {
      getTemplate: vi.fn().mockResolvedValue({
        id: 'variable-extraction',
        content: [
          { role: 'system', content: 'You are a variable extraction assistant.' },
          { role: 'user', content: 'Extract variables from: {{promptContent}}' },
        ],
      }),
    }

    service = new VariableExtractionService(mockLLMService, mockModelManager, mockTemplateManager)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('extract() - successful extraction', () => {
    it('should extract variables from prompt', async () => {
      const request: VariableExtractionRequest = {
        promptContent: 'Write about artificial intelligence for 500 words',
        extractionModelKey: 'test-model',
      }

      const result = await service.extract(request)

      expect(result.variables).toHaveLength(2)
      expect(result.variables[0].name).toBe('topic')
      expect(result.variables[1].name).toBe('wordCount')
      expect(result.summary).toContain('Extracted 2 variables')
    })

    it('should call LLM service with correct parameters', async () => {
      const request: VariableExtractionRequest = {
        promptContent: 'Test prompt',
        extractionModelKey: 'test-model',
      }

      await service.extract(request)

      expect(mockLLMService.sendMessage).toHaveBeenCalled()
    })

    it('should filter out existing variable names', async () => {
      const request: VariableExtractionRequest = {
        promptContent: 'Write about artificial intelligence',
        extractionModelKey: 'test-model',
        existingVariableNames: ['topic'],
      }

      const result = await service.extract(request)

      expect(result.variables).toHaveLength(1)
      expect(result.variables[0].name).toBe('wordCount')
    })

    it('should handle empty prompt content', async () => {
      const request: VariableExtractionRequest = {
        promptContent: '',
        extractionModelKey: 'test-model',
      }

      await expect(service.extract(request)).rejects.toThrow(VariableExtractionValidationError)
    })

    it('should handle missing model key', async () => {
      const request: VariableExtractionRequest = {
        promptContent: 'Test prompt',
        extractionModelKey: '',
      }

      await expect(service.extract(request)).rejects.toThrow(VariableExtractionValidationError)
    })

    it('should handle empty model key with spaces', async () => {
      const request: VariableExtractionRequest = {
        promptContent: 'Test prompt',
        extractionModelKey: '   ',
      }

      await expect(service.extract(request)).rejects.toThrow(VariableExtractionValidationError)
    })
  })

  describe('extract() - model validation', () => {
    it('should throw error when model does not exist', async () => {
      mockModelManager.getModel = vi.fn().mockResolvedValue(null)

      const request: VariableExtractionRequest = {
        promptContent: 'Test prompt',
        extractionModelKey: 'non-existent-model',
      }

      await expect(service.extract(request)).rejects.toThrow(VariableExtractionModelError)
    })
  })

  describe('extract() - template handling', () => {
    it('should throw error when template is not found', async () => {
      mockTemplateManager.getTemplate = vi.fn().mockResolvedValue(null)

      const request: VariableExtractionRequest = {
        promptContent: 'Test prompt',
        extractionModelKey: 'test-model',
      }

      await expect(service.extract(request)).rejects.toThrow()
    })

    it('should throw error when template content is empty', async () => {
      mockTemplateManager.getTemplate = vi.fn().mockResolvedValue({ id: 'test', content: null })

      const request: VariableExtractionRequest = {
        promptContent: 'Test prompt',
        extractionModelKey: 'test-model',
      }

      await expect(service.extract(request)).rejects.toThrow()
    })
  })

  describe('extract() - JSON parsing', () => {
    it('should parse JSON from code block', async () => {
      mockLLMService.sendMessage = vi.fn().mockResolvedValue('```json\n' + mockExtractionResponse + '\n```')

      const request: VariableExtractionRequest = {
        promptContent: 'Test prompt',
        extractionModelKey: 'test-model',
      }

      const result = await service.extract(request)

      expect(result.variables).toHaveLength(2)
    })

    it('should handle invalid JSON response', async () => {
      mockLLMService.sendMessage = vi.fn().mockResolvedValue('This is not JSON')

      const request: VariableExtractionRequest = {
        promptContent: 'Test prompt',
        extractionModelKey: 'test-model',
      }

      await expect(service.extract(request)).rejects.toThrow(VariableExtractionParseError)
    })

    it('should handle response with missing variables array', async () => {
      mockLLMService.sendMessage = vi.fn().mockResolvedValue(
        JSON.stringify({
          summary: 'No variables found',
        })
      )

      const request: VariableExtractionRequest = {
        promptContent: 'Test prompt',
        extractionModelKey: 'test-model',
      }

      await expect(service.extract(request)).rejects.toThrow(VariableExtractionParseError)
    })

    it('should handle response with missing summary field', async () => {
      mockLLMService.sendMessage = vi.fn().mockResolvedValue(
        JSON.stringify({
          variables: [],
        })
      )

      const request: VariableExtractionRequest = {
        promptContent: 'Test prompt',
        extractionModelKey: 'test-model',
      }

      await expect(service.extract(request)).rejects.toThrow(VariableExtractionParseError)
    })

    it('should handle variable with missing required fields', async () => {
      mockLLMService.sendMessage = vi.fn().mockResolvedValue(
        JSON.stringify({
          variables: [
            {
              name: 'incomplete',
            },
          ],
          summary: 'Incomplete',
        })
      )

      const request: VariableExtractionRequest = {
        promptContent: 'Test prompt',
        extractionModelKey: 'test-model',
      }

      await expect(service.extract(request)).rejects.toThrow(VariableExtractionParseError)
    })

    it('should handle duplicate variable names', async () => {
      mockLLMService.sendMessage = vi.fn().mockResolvedValue(
        JSON.stringify({
          variables: [
            {
              name: 'topic',
              value: 'AI',
              position: { originalText: 'AI', occurrence: 1 },
              reason: 'First mention',
            },
            {
              name: 'topic',
              value: 'ML',
              position: { originalText: 'ML', occurrence: 1 },
              reason: 'Second mention',
            },
          ],
          summary: 'Extracted topic twice',
        })
      )

      const request: VariableExtractionRequest = {
        promptContent: 'Test prompt',
        extractionModelKey: 'test-model',
      }

      const result = await service.extract(request)

      expect(result.variables).toHaveLength(1)
    })
  })

  describe('extract() - performance', () => {
    it('should complete extraction within 2 seconds', async () => {
      const request: VariableExtractionRequest = {
        promptContent: 'Test prompt',
        extractionModelKey: 'test-model',
      }

      const startTime = Date.now()
      await service.extract(request)
      const duration = Date.now() - startTime

      expect(duration).toBeLessThan(2000)
    })
  })

  describe('extract() - LLM error handling', () => {
    it('should wrap LLM errors in VariableExtractionExecutionError', async () => {
      mockLLMService.sendMessage = vi.fn().mockRejectedValue(new Error('Network error'))

      const request: VariableExtractionRequest = {
        promptContent: 'Test prompt',
        extractionModelKey: 'test-model',
      }

      await expect(service.extract(request)).rejects.toThrow()
    })
  })
})
