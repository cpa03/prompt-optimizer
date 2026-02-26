import { vi, describe, beforeEach, it, expect, afterEach } from 'vitest'
import { VariableValueGenerationService } from '../../../src/services/variable-value-generation/service'
import {
  VariableValueGenerationValidationError,
  VariableValueGenerationModelError,
  VariableValueGenerationParseError,
  VariableValueGenerationExecutionError,
} from '../../../src/services/variable-value-generation/errors'
import type { VariableValueGenerationRequest } from '../../../src/services/variable-value-generation/types'

describe('VariableValueGenerationService', () => {
  let service: VariableValueGenerationService
  let mockLLMService: any
  let mockModelManager: any
  let mockTemplateManager: any

  const mockGenerationResponse = JSON.stringify({
    values: [
      {
        name: 'topic',
        value: 'artificial intelligence',
        reason: 'Based on the prompt content about AI',
        confidence: 0.95,
      },
      {
        name: 'tone',
        value: 'professional',
        reason: 'Appropriate for technical content',
        confidence: 0.88,
      },
    ],
    summary: 'Generated 2 variable values based on prompt context',
  })

  beforeEach(() => {
    mockLLMService = {
      sendMessage: vi.fn().mockResolvedValue(mockGenerationResponse),
    }

    mockModelManager = {
      getModel: vi.fn().mockResolvedValue({ id: 'test-model', enabled: true }),
    }

    mockTemplateManager = {
      getTemplate: vi.fn().mockResolvedValue({
        id: 'variable-value-generation',
        content: [
          { role: 'system', content: 'You are a variable value generation assistant.' },
          { role: 'user', content: 'Generate values for: {{variablesText}}\n\nPrompt: {{promptContent}}' },
        ],
      }),
    }

    service = new VariableValueGenerationService(mockLLMService, mockModelManager, mockTemplateManager)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('generate() - successful generation', () => {
    it('should generate variable values from prompt', async () => {
      const request: VariableValueGenerationRequest = {
        promptContent: 'Write a professional article about artificial intelligence',
        generationModelKey: 'test-model',
        variables: [
          { name: 'topic', source: 'predefined' },
          { name: 'tone', source: 'predefined' },
        ],
      }

      const result = await service.generate(request)

      expect(result.values).toHaveLength(2)
      expect(result.values[0].name).toBe('topic')
      expect(result.values[0].value).toBe('artificial intelligence')
      expect(result.values[1].name).toBe('tone')
      expect(result.values[1].value).toBe('professional')
      expect(result.summary).toContain('Generated 2 variable values')
    })

    it('should include confidence scores in response', async () => {
      mockLLMService.sendMessage = vi.fn().mockResolvedValue(
        JSON.stringify({
          values: [
            { name: 'test', value: 'test-value', reason: 'test reason', confidence: 0.95 },
          ],
          summary: 'Generated 1 variable value',
        })
      )

      const request: VariableValueGenerationRequest = {
        promptContent: 'Test prompt',
        generationModelKey: 'test-model',
        variables: [{ name: 'test' }],
      }

      const result = await service.generate(request)

      expect(result.values[0].confidence).toBe(0.95)
    })

    it('should include reasons in response', async () => {
      mockLLMService.sendMessage = vi.fn().mockResolvedValue(
        JSON.stringify({
          values: [
            { name: 'test', value: 'test-value', reason: 'test reason' },
          ],
          summary: 'Generated 1 variable value',
        })
      )

      const request: VariableValueGenerationRequest = {
        promptContent: 'Test prompt',
        generationModelKey: 'test-model',
        variables: [{ name: 'test' }],
      }

      const result = await service.generate(request)

      expect(result.values[0].reason).toBeDefined()
      expect(typeof result.values[0].reason).toBe('string')
    })
  })

  describe('generate() - validation errors', () => {
    it('should throw error for empty prompt content', async () => {
      const request: VariableValueGenerationRequest = {
        promptContent: '',
        generationModelKey: 'test-model',
        variables: [{ name: 'test' }],
      }

      await expect(service.generate(request)).rejects.toThrow(VariableValueGenerationValidationError)
      await expect(service.generate(request)).rejects.toThrow('Prompt content must not be empty')
    })

    it('should throw error for whitespace-only prompt content', async () => {
      const request: VariableValueGenerationRequest = {
        promptContent: '   ',
        generationModelKey: 'test-model',
        variables: [{ name: 'test' }],
      }

      await expect(service.generate(request)).rejects.toThrow(VariableValueGenerationValidationError)
    })

    it('should throw error for empty model key', async () => {
      const request: VariableValueGenerationRequest = {
        promptContent: 'Test prompt',
        generationModelKey: '',
        variables: [{ name: 'test' }],
      }

      await expect(service.generate(request)).rejects.toThrow(VariableValueGenerationValidationError)
      await expect(service.generate(request)).rejects.toThrow('Generation model key must not be empty')
    })

    it('should throw error for empty variables list', async () => {
      const request: VariableValueGenerationRequest = {
        promptContent: 'Test prompt',
        generationModelKey: 'test-model',
        variables: [],
      }

      await expect(service.generate(request)).rejects.toThrow(VariableValueGenerationValidationError)
      await expect(service.generate(request)).rejects.toThrow('Variables list must not be empty')
    })

    it('should throw error for variable with empty name', async () => {
      const request: VariableValueGenerationRequest = {
        promptContent: 'Test prompt',
        generationModelKey: 'test-model',
        variables: [{ name: '' }],
      }

      await expect(service.generate(request)).rejects.toThrow(VariableValueGenerationValidationError)
      await expect(service.generate(request)).rejects.toThrow('has empty name')
    })

    it('should throw error for variable with whitespace-only name', async () => {
      const request: VariableValueGenerationRequest = {
        promptContent: 'Test prompt',
        generationModelKey: 'test-model',
        variables: [{ name: '   ' }],
      }

      await expect(service.generate(request)).rejects.toThrow(VariableValueGenerationValidationError)
    })
  })

  describe('generate() - model validation', () => {
    it('should throw error when model not found', async () => {
      mockModelManager.getModel = vi.fn().mockResolvedValue(null)

      const request: VariableValueGenerationRequest = {
        promptContent: 'Test prompt',
        generationModelKey: 'non-existent-model',
        variables: [{ name: 'test' }],
      }

      await expect(service.generate(request)).rejects.toThrow(VariableValueGenerationModelError)
    })
  })

  describe('generate() - template handling', () => {
    it('should throw error when template not found', async () => {
      mockTemplateManager.getTemplate = vi.fn().mockResolvedValue(null)

      const request: VariableValueGenerationRequest = {
        promptContent: 'Test prompt',
        generationModelKey: 'test-model',
        variables: [{ name: 'test' }],
      }

      await expect(service.generate(request)).rejects.toThrow(VariableValueGenerationExecutionError)
    })

    it('should throw error when template has no content property', async () => {
      mockTemplateManager.getTemplate = vi.fn().mockResolvedValue({ id: 'test' })

      const request: VariableValueGenerationRequest = {
        promptContent: 'Test prompt',
        generationModelKey: 'test-model',
        variables: [{ name: 'test' }],
      }

      await expect(service.generate(request)).rejects.toThrow(VariableValueGenerationExecutionError)
    })
  })

  describe('generate() - LLM execution errors', () => {
    it('should throw execution error when LLM fails', async () => {
      mockLLMService.sendMessage = vi.fn().mockRejectedValue(new Error('Network error'))

      const request: VariableValueGenerationRequest = {
        promptContent: 'Test prompt',
        generationModelKey: 'test-model',
        variables: [{ name: 'test' }],
      }

      await expect(service.generate(request)).rejects.toThrow(VariableValueGenerationExecutionError)
    })

    it('should preserve VariableValueGenerationError from LLM', async () => {
      const originalError = new VariableValueGenerationParseError('Original parse error')
      mockLLMService.sendMessage = vi.fn().mockRejectedValue(originalError)

      const request: VariableValueGenerationRequest = {
        promptContent: 'Test prompt',
        generationModelKey: 'test-model',
        variables: [{ name: 'test' }],
      }

      await expect(service.generate(request)).rejects.toThrow(VariableValueGenerationParseError)
      await expect(service.generate(request)).rejects.toThrow('Original parse error')
    })
  })

  describe('generate() - JSON parsing', () => {
    it('should parse JSON from code block', async () => {
      mockLLMService.sendMessage = vi.fn().mockResolvedValue(
        '```json\n' +
        JSON.stringify({
          values: [
            { name: 'test', value: 'test-value', reason: 'test reason' },
          ],
          summary: 'Generated 1 variable value',
        }) +
        '\n```'
      )

      const request: VariableValueGenerationRequest = {
        promptContent: 'Test prompt',
        generationModelKey: 'test-model',
        variables: [{ name: 'test' }],
      }

      const result = await service.generate(request)

      expect(result.values).toHaveLength(1)
      expect(result.values[0].name).toBe('test')
    })

    it('should throw parse error for invalid JSON', async () => {
      mockLLMService.sendMessage = vi.fn().mockResolvedValue('not valid json {{{')

      const request: VariableValueGenerationRequest = {
        promptContent: 'Test prompt',
        generationModelKey: 'test-model',
        variables: [{ name: 'test' }],
      }

      await expect(service.generate(request)).rejects.toThrow(VariableValueGenerationParseError)
    })

    it('should throw parse error when response is not an object', async () => {
      mockLLMService.sendMessage = vi.fn().mockResolvedValue('"just a string"')

      const request: VariableValueGenerationRequest = {
        promptContent: 'Test prompt',
        generationModelKey: 'test-model',
        variables: [{ name: 'test' }],
      }

      await expect(service.generate(request)).rejects.toThrow(VariableValueGenerationParseError)
      await expect(service.generate(request)).rejects.toThrow('not a valid object')
    })

    it('should throw parse error when values is not an array', async () => {
      mockLLMService.sendMessage = vi.fn().mockResolvedValue(JSON.stringify({ values: 'not array', summary: 'test' }))

      const request: VariableValueGenerationRequest = {
        promptContent: 'Test prompt',
        generationModelKey: 'test-model',
        variables: [{ name: 'test' }],
      }

      await expect(service.generate(request)).rejects.toThrow(VariableValueGenerationParseError)
      await expect(service.generate(request)).rejects.toThrow('"values" array')
    })

    it('should throw parse error when summary is not a string', async () => {
      mockLLMService.sendMessage = vi.fn().mockResolvedValue(JSON.stringify({ values: [], summary: 123 }))

      const request: VariableValueGenerationRequest = {
        promptContent: 'Test prompt',
        generationModelKey: 'test-model',
        variables: [{ name: 'test' }],
      }

      await expect(service.generate(request)).rejects.toThrow(VariableValueGenerationParseError)
      await expect(service.generate(request)).rejects.toThrow('"summary" string')
    })

    it('should throw parse error for invalid value item', async () => {
      mockLLMService.sendMessage = vi.fn().mockResolvedValue(
        JSON.stringify({
          values: [{ name: 'test' }],
          summary: 'test summary',
        })
      )

      const request: VariableValueGenerationRequest = {
        promptContent: 'Test prompt',
        generationModelKey: 'test-model',
        variables: [{ name: 'test' }],
      }

      await expect(service.generate(request)).rejects.toThrow(VariableValueGenerationParseError)
      await expect(service.generate(request)).rejects.toThrow('missing a valid "value" field')
    })
  })

  describe('generate() - response normalization', () => {
    it('should trim variable names', async () => {
      mockLLMService.sendMessage = vi.fn().mockResolvedValue(
        JSON.stringify({
          values: [
            { name: '  topic  ', value: 'AI', reason: 'test' },
          ],
          summary: 'test',
        })
      )

      const request: VariableValueGenerationRequest = {
        promptContent: 'Test prompt',
        generationModelKey: 'test-model',
        variables: [{ name: 'topic' }],
      }

      const result = await service.generate(request)

      expect(result.values[0].name).toBe('topic')
    })
  })
})
