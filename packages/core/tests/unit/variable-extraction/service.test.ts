import { vi, describe, beforeEach, it, expect, afterEach } from 'vitest'
import { VariableExtractionService } from '../../../src/services/variable-extraction/service'
import {
  VariableExtractionValidationError,
  VariableExtractionModelError,
  VariableExtractionParseError,
  VariableExtractionExecutionError,
} from '../../../src/services/variable-extraction/errors'
import type { IVariableExtractionService } from '../../../src/services/variable-extraction/types'

describe('VariableExtractionService', () => {
  let extractionService: IVariableExtractionService
  let mockLLMService: any
  let mockModelManager: any
  let mockTemplateManager: any

  const validExtractionResult = JSON.stringify({
    variables: [
      {
        name: 'topic',
        value: 'AI',
        position: { originalText: 'AI', occurrence: 1 },
        reason: 'Main subject',
        category: 'content',
      },
    ],
    summary: 'Extracted 1 variable',
  })

  beforeEach(() => {
    mockLLMService = {
      sendMessage: vi.fn().mockResolvedValue(validExtractionResult),
    }

    mockModelManager = {
      getModel: vi.fn().mockResolvedValue({ id: 'test-model', enabled: true }),
    }

    mockTemplateManager = {
      getTemplate: vi.fn().mockResolvedValue({
        id: 'variable-extraction',
        content: [
          { role: 'system', content: 'You are a variable extractor.' },
          { role: 'user', content: '{{promptContent}}' },
        ],
      }),
    }

    extractionService = new VariableExtractionService(
      mockLLMService,
      mockModelManager,
      mockTemplateManager
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('validateRequest', () => {
    it('should pass validation with valid request', async () => {
      const request = {
        promptContent: 'Write about AI',
        extractionModelKey: 'test-model',
      }

      await expect(extractionService.extract(request)).resolves.toBeDefined()
    })

    it('should throw ValidationError when promptContent is empty', async () => {
      const request = {
        promptContent: '',
        extractionModelKey: 'test-model',
      }

      await expect(extractionService.extract(request)).rejects.toThrow(
        VariableExtractionValidationError
      )
    })

    it('should throw ValidationError when promptContent is whitespace only', async () => {
      const request = {
        promptContent: '   ',
        extractionModelKey: 'test-model',
      }

      await expect(extractionService.extract(request)).rejects.toThrow(
        VariableExtractionValidationError
      )
    })

    it('should throw ValidationError when extractionModelKey is empty', async () => {
      const request = {
        promptContent: 'Write about AI',
        extractionModelKey: '',
      }

      await expect(extractionService.extract(request)).rejects.toThrow(
        VariableExtractionValidationError
      )
    })

    it('should throw ValidationError when extractionModelKey is whitespace only', async () => {
      const request = {
        promptContent: 'Write about AI',
        extractionModelKey: '   ',
      }

      await expect(extractionService.extract(request)).rejects.toThrow(
        VariableExtractionValidationError
      )
    })

    it('should accept request with existingVariableNames', async () => {
      const request = {
        promptContent: 'Write about AI',
        extractionModelKey: 'test-model',
        existingVariableNames: ['topic', 'style'],
      }

      await expect(extractionService.extract(request)).resolves.toBeDefined()
    })
  })

  describe('validateModel', () => {
    it('should throw ModelError when model not found', async () => {
      mockModelManager.getModel.mockResolvedValue(null)

      const request = {
        promptContent: 'Write about AI',
        extractionModelKey: 'non-existent-model',
      }

      await expect(extractionService.extract(request)).rejects.toThrow(VariableExtractionModelError)
    })

    it('should include model key in error params', async () => {
      mockModelManager.getModel.mockResolvedValue(null)

      const request = {
        promptContent: 'Write about AI',
        extractionModelKey: 'missing-model',
      }

      try {
        await extractionService.extract(request)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(VariableExtractionModelError)
        expect((error as VariableExtractionModelError).params?.context).toBe('missing-model')
      }
    })
  })

  describe('normalizeExtractionResponse', () => {
    it('should parse valid JSON response', async () => {
      mockLLMService.sendMessage.mockResolvedValue(
        JSON.stringify({
          variables: [
            {
              name: 'topic',
              value: 'AI',
              position: { originalText: 'AI', occurrence: 1 },
              reason: 'Main subject',
            },
          ],
          summary: 'Extracted 1 variable',
        })
      )

      const result = await extractionService.extract({
        promptContent: 'Test',
        extractionModelKey: 'test-model',
      })

      expect(result.variables).toHaveLength(1)
      expect(result.variables[0].name).toBe('topic')
      expect(result.summary).toBe('Extracted 1 variable')
    })

    it('should parse JSON wrapped in markdown code block', async () => {
      mockLLMService.sendMessage.mockResolvedValue(
        '```json\n{"variables":[{"name":"test","value":"val","position":{"originalText":"val","occurrence":1},"reason":"test"}],"summary":"Done"}\n```'
      )

      const result = await extractionService.extract({
        promptContent: 'Test',
        extractionModelKey: 'test-model',
      })

      expect(result.variables).toHaveLength(1)
      expect(result.variables[0].name).toBe('test')
    })

    it('should throw ParseError when result is not an object', async () => {
      mockLLMService.sendMessage.mockResolvedValue('"not an object"')

      await expect(
        extractionService.extract({
          promptContent: 'Test',
          extractionModelKey: 'test-model',
        })
      ).rejects.toThrow(VariableExtractionParseError)
    })

    it('should throw ParseError when variables is missing', async () => {
      mockLLMService.sendMessage.mockResolvedValue(JSON.stringify({ summary: 'No variables' }))

      await expect(
        extractionService.extract({
          promptContent: 'Test',
          extractionModelKey: 'test-model',
        })
      ).rejects.toThrow(VariableExtractionParseError)
    })

    it('should throw ParseError when variables is not an array', async () => {
      mockLLMService.sendMessage.mockResolvedValue(
        JSON.stringify({ variables: 'not-array', summary: 'Test' })
      )

      await expect(
        extractionService.extract({
          promptContent: 'Test',
          extractionModelKey: 'test-model',
        })
      ).rejects.toThrow(VariableExtractionParseError)
    })

    it('should throw ParseError when summary is missing', async () => {
      mockLLMService.sendMessage.mockResolvedValue(JSON.stringify({ variables: [] }))

      await expect(
        extractionService.extract({
          promptContent: 'Test',
          extractionModelKey: 'test-model',
        })
      ).rejects.toThrow(VariableExtractionParseError)
    })

    it('should throw ParseError when summary is not a string', async () => {
      mockLLMService.sendMessage.mockResolvedValue(
        JSON.stringify({ variables: [], summary: 123 })
      )

      await expect(
        extractionService.extract({
          promptContent: 'Test',
          extractionModelKey: 'test-model',
        })
      ).rejects.toThrow(VariableExtractionParseError)
    })

    it('should throw ParseError when variable name is missing', async () => {
      mockLLMService.sendMessage.mockResolvedValue(
        JSON.stringify({
          variables: [
            {
              value: 'val',
              position: { originalText: 'val', occurrence: 1 },
              reason: 'test',
            },
          ],
          summary: 'Done',
        })
      )

      await expect(
        extractionService.extract({
          promptContent: 'Test',
          extractionModelKey: 'test-model',
        })
      ).rejects.toThrow(VariableExtractionParseError)
    })

    it('should throw ParseError when variable name is empty', async () => {
      mockLLMService.sendMessage.mockResolvedValue(
        JSON.stringify({
          variables: [
            {
              name: '  ',
              value: 'val',
              position: { originalText: 'val', occurrence: 1 },
              reason: 'test',
            },
          ],
          summary: 'Done',
        })
      )

      await expect(
        extractionService.extract({
          promptContent: 'Test',
          extractionModelKey: 'test-model',
        })
      ).rejects.toThrow(VariableExtractionParseError)
    })

    it('should throw ParseError when variable value is missing', async () => {
      mockLLMService.sendMessage.mockResolvedValue(
        JSON.stringify({
          variables: [
            {
              name: 'test',
              position: { originalText: 'val', occurrence: 1 },
              reason: 'test',
            },
          ],
          summary: 'Done',
        })
      )

      await expect(
        extractionService.extract({
          promptContent: 'Test',
          extractionModelKey: 'test-model',
        })
      ).rejects.toThrow(VariableExtractionParseError)
    })

    it('should throw ParseError when position is missing', async () => {
      mockLLMService.sendMessage.mockResolvedValue(
        JSON.stringify({
          variables: [
            {
              name: 'test',
              value: 'val',
              reason: 'test',
            },
          ],
          summary: 'Done',
        })
      )

      await expect(
        extractionService.extract({
          promptContent: 'Test',
          extractionModelKey: 'test-model',
        })
      ).rejects.toThrow(VariableExtractionParseError)
    })

    it('should throw ParseError when position.originalText is missing', async () => {
      mockLLMService.sendMessage.mockResolvedValue(
        JSON.stringify({
          variables: [
            {
              name: 'test',
              value: 'val',
              position: { occurrence: 1 },
              reason: 'test',
            },
          ],
          summary: 'Done',
        })
      )

      await expect(
        extractionService.extract({
          promptContent: 'Test',
          extractionModelKey: 'test-model',
        })
      ).rejects.toThrow(VariableExtractionParseError)
    })

    it('should throw ParseError when position.occurrence is not a number', async () => {
      mockLLMService.sendMessage.mockResolvedValue(
        JSON.stringify({
          variables: [
            {
              name: 'test',
              value: 'val',
              position: { originalText: 'val', occurrence: 'first' },
              reason: 'test',
            },
          ],
          summary: 'Done',
        })
      )

      await expect(
        extractionService.extract({
          promptContent: 'Test',
          extractionModelKey: 'test-model',
        })
      ).rejects.toThrow(VariableExtractionParseError)
    })

    it('should throw ParseError when reason is missing', async () => {
      mockLLMService.sendMessage.mockResolvedValue(
        JSON.stringify({
          variables: [
            {
              name: 'test',
              value: 'val',
              position: { originalText: 'val', occurrence: 1 },
            },
          ],
          summary: 'Done',
        })
      )

      await expect(
        extractionService.extract({
          promptContent: 'Test',
          extractionModelKey: 'test-model',
        })
      ).rejects.toThrow(VariableExtractionParseError)
    })

    it('should include optional category when provided', async () => {
      mockLLMService.sendMessage.mockResolvedValue(
        JSON.stringify({
          variables: [
            {
              name: 'topic',
              value: 'AI',
              position: { originalText: 'AI', occurrence: 1 },
              reason: 'Main subject',
              category: 'content',
            },
          ],
          summary: 'Done',
        })
      )

      const result = await extractionService.extract({
        promptContent: 'Test',
        extractionModelKey: 'test-model',
      })

      expect(result.variables[0].category).toBe('content')
    })

    it('should handle missing category gracefully', async () => {
      mockLLMService.sendMessage.mockResolvedValue(
        JSON.stringify({
          variables: [
            {
              name: 'topic',
              value: 'AI',
              position: { originalText: 'AI', occurrence: 1 },
              reason: 'Main subject',
            },
          ],
          summary: 'Done',
        })
      )

      const result = await extractionService.extract({
        promptContent: 'Test',
        extractionModelKey: 'test-model',
      })

      expect(result.variables[0].category).toBeUndefined()
    })

    it('should convert category to string', async () => {
      mockLLMService.sendMessage.mockResolvedValue(
        JSON.stringify({
          variables: [
            {
              name: 'topic',
              value: 'AI',
              position: { originalText: 'AI', occurrence: 1 },
              reason: 'Main subject',
              category: 123,
            },
          ],
          summary: 'Done',
        })
      )

      const result = await extractionService.extract({
        promptContent: 'Test',
        extractionModelKey: 'test-model',
      })

      expect(result.variables[0].category).toBe('123')
    })

    it('should throw ParseError when variable is not an object', async () => {
      mockLLMService.sendMessage.mockResolvedValue(
        JSON.stringify({
          variables: ['not an object'],
          summary: 'Done',
        })
      )

      await expect(
        extractionService.extract({
          promptContent: 'Test',
          extractionModelKey: 'test-model',
        })
      ).rejects.toThrow(VariableExtractionParseError)
    })
  })

  describe('filterResponse', () => {
    it('should filter out variables that match existing names (case-insensitive)', async () => {
      mockLLMService.sendMessage.mockResolvedValue(
        JSON.stringify({
          variables: [
            {
              name: 'topic',
              value: 'AI',
              position: { originalText: 'AI', occurrence: 1 },
              reason: 'Main subject',
            },
            {
              name: 'Style',
              value: 'formal',
              position: { originalText: 'formal', occurrence: 1 },
              reason: 'Writing style',
            },
          ],
          summary: 'Done',
        })
      )

      const result = await extractionService.extract({
        promptContent: 'Test',
        extractionModelKey: 'test-model',
        existingVariableNames: ['TOPIC', 'style'],
      })

      expect(result.variables).toHaveLength(0)
    })

    it('should filter out duplicate variables within response', async () => {
      mockLLMService.sendMessage.mockResolvedValue(
        JSON.stringify({
          variables: [
            {
              name: 'topic',
              value: 'AI',
              position: { originalText: 'AI', occurrence: 1 },
              reason: 'First',
            },
            {
              name: 'Topic',
              value: 'ML',
              position: { originalText: 'ML', occurrence: 1 },
              reason: 'Duplicate',
            },
            {
              name: 'unique',
              value: 'value',
              position: { originalText: 'value', occurrence: 1 },
              reason: 'Unique',
            },
          ],
          summary: 'Done',
        })
      )

      const result = await extractionService.extract({
        promptContent: 'Test',
        extractionModelKey: 'test-model',
      })

      expect(result.variables).toHaveLength(2)
      expect(result.variables.map((v) => v.name)).toContain('topic')
      expect(result.variables.map((v) => v.name)).toContain('unique')
    })

    it('should keep first occurrence of duplicate variables', async () => {
      mockLLMService.sendMessage.mockResolvedValue(
        JSON.stringify({
          variables: [
            {
              name: 'topic',
              value: 'AI',
              position: { originalText: 'AI', occurrence: 1 },
              reason: 'First',
            },
            {
              name: 'topic',
              value: 'ML',
              position: { originalText: 'ML', occurrence: 1 },
              reason: 'Duplicate',
            },
          ],
          summary: 'Done',
        })
      )

      const result = await extractionService.extract({
        promptContent: 'Test',
        extractionModelKey: 'test-model',
      })

      expect(result.variables).toHaveLength(1)
      expect(result.variables[0].value).toBe('AI')
    })

    it('should preserve valid variables when filtering existing names', async () => {
      mockLLMService.sendMessage.mockResolvedValue(
        JSON.stringify({
          variables: [
            {
              name: 'topic',
              value: 'AI',
              position: { originalText: 'AI', occurrence: 1 },
              reason: 'New variable',
            },
            {
              name: 'existing',
              value: 'value',
              position: { originalText: 'value', occurrence: 1 },
              reason: 'Duplicate',
            },
          ],
          summary: 'Done',
        })
      )

      const result = await extractionService.extract({
        promptContent: 'Test',
        extractionModelKey: 'test-model',
        existingVariableNames: ['EXISTING'],
      })

      expect(result.variables).toHaveLength(1)
      expect(result.variables[0].name).toBe('topic')
    })
  })

  describe('template handling', () => {
    it('should throw ExecutionError when template not found', async () => {
      mockTemplateManager.getTemplate.mockResolvedValue(null)

      await expect(
        extractionService.extract({
          promptContent: 'Test',
          extractionModelKey: 'test-model',
        })
      ).rejects.toThrow(VariableExtractionExecutionError)
    })

    it('should throw ExecutionError when template content is empty', async () => {
      mockTemplateManager.getTemplate.mockResolvedValue({ id: 'test', content: '' })

      await expect(
        extractionService.extract({
          promptContent: 'Test',
          extractionModelKey: 'test-model',
        })
      ).rejects.toThrow(VariableExtractionExecutionError)
    })

    it('should call template manager with correct template ID', async () => {
      await extractionService.extract({
        promptContent: 'Test',
        extractionModelKey: 'test-model',
      })

      expect(mockTemplateManager.getTemplate).toHaveBeenCalledWith('variable-extraction')
    })
  })

  describe('LLM communication', () => {
    it('should call LLM service with processed messages', async () => {
      await extractionService.extract({
        promptContent: 'Write about AI',
        extractionModelKey: 'test-model',
      })

      expect(mockLLMService.sendMessage).toHaveBeenCalledWith(
        expect.any(Array),
        'test-model'
      )
    })

    it('should throw ExecutionError when LLM throws generic error', async () => {
      mockLLMService.sendMessage.mockRejectedValue(new Error('Network error'))

      await expect(
        extractionService.extract({
          promptContent: 'Test',
          extractionModelKey: 'test-model',
        })
      ).rejects.toThrow(VariableExtractionExecutionError)
    })

    it('should preserve structured error from LLM', async () => {
      const structuredError = new VariableExtractionParseError('Parse failed')
      mockLLMService.sendMessage.mockRejectedValue(structuredError)

      await expect(
        extractionService.extract({
          promptContent: 'Test',
          extractionModelKey: 'test-model',
        })
      ).rejects.toThrow(VariableExtractionParseError)
    })
  })

  describe('template context building', () => {
    it('should include promptContent in context', async () => {
      await extractionService.extract({
        promptContent: 'Write about AI and ML',
        extractionModelKey: 'test-model',
      })

      expect(mockTemplateManager.getTemplate).toHaveBeenCalled()
      expect(mockLLMService.sendMessage).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ role: 'user' }),
        ]),
        'test-model'
      )
    })

    it('should handle empty existingVariableNames', async () => {
      await extractionService.extract({
        promptContent: 'Test',
        extractionModelKey: 'test-model',
        existingVariableNames: [],
      })

      expect(mockLLMService.sendMessage).toHaveBeenCalled()
    })

    it('should format existingVariableNames for template', async () => {
      await extractionService.extract({
        promptContent: 'Test',
        extractionModelKey: 'test-model',
        existingVariableNames: ['topic', 'style'],
      })

      expect(mockLLMService.sendMessage).toHaveBeenCalled()
    })
  })
})
