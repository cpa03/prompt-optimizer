/**
 * Tool Handler Unit Tests
 *
 * Tests for individual tool handler logic components
 * that can be tested without full MCP server initialization
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('Tool Handler Utilities', () => {
  describe('createErrorResponse', () => {
    it('should create error response with isError flag', () => {
      const createErrorResponse = (message: string) => ({
        isError: true,
        content: [{ type: 'text' as const, text: message }],
      })

      const response = createErrorResponse('Test error message')

      expect(response.isError).toBe(true)
      expect(response.content).toHaveLength(1)
      expect(response.content[0].type).toBe('text')
      expect(response.content[0].text).toBe('Test error message')
    })

    it('should handle empty error message', () => {
      const createErrorResponse = (message: string) => ({
        isError: true,
        content: [{ type: 'text' as const, text: message }],
      })

      const response = createErrorResponse('')

      expect(response.isError).toBe(true)
      expect(response.content[0].text).toBe('')
    })
  })

  describe('validateSessionId', () => {
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    function validateSessionId(id: string | undefined): boolean {
      if (!id) return false
      return UUID_REGEX.test(id)
    }

    it('should validate correct UUID format', () => {
      const validUuid = '12345678-1234-1234-1234-123456789012'
      expect(validateSessionId(validUuid)).toBe(true)
    })

    it('should reject invalid UUID format', () => {
      const invalidUuid = 'not-a-uuid'
      expect(validateSessionId(invalidUuid)).toBe(false)
    })

    it('should reject undefined', () => {
      expect(validateSessionId(undefined)).toBe(false)
    })

    it('should reject null', () => {
      expect(validateSessionId(null as unknown as undefined)).toBe(false)
    })

    it('should reject empty string', () => {
      expect(validateSessionId('')).toBe(false)
    })

    it('should reject partial UUID', () => {
      expect(validateSessionId('12345678-1234')).toBe(false)
    })

    it('should accept uppercase UUID', () => {
      const uppercaseUuid = '12345678-1234-1234-1234-123456789ABC'
      expect(validateSessionId(uppercaseUuid)).toBe(true)
    })
  })

  describe('Request Context Management', () => {
    let requestContexts: Map<string, { requestId: string; startTime: number; toolName?: string }>
    let generateRequestId: () => string

    beforeEach(() => {
      requestContexts = new Map()
      let counter = 0
      generateRequestId = () => {
        counter++
        return `req_${Date.now()}_${counter}`
      }
    })

    function createRequestContext(toolName?: string): string {
      const requestId = generateRequestId()
      requestContexts.set(requestId, {
        requestId,
        startTime: Date.now(),
        toolName,
      })
      return requestId
    }

    function getRequestContext(requestId: string) {
      return requestContexts.get(requestId)
    }

    function cleanupRequestContext(requestId: string): void {
      const context = requestContexts.get(requestId)
      if (context) {
        const duration = Date.now() - context.startTime
        requestContexts.delete(requestId)
      }
    }

    it('should create request context without tool name', () => {
      const requestId = createRequestContext()
      const context = getRequestContext(requestId)

      expect(context).toBeDefined()
      expect(context?.requestId).toBe(requestId)
      expect(context?.toolName).toBeUndefined()
      expect(context?.startTime).toBeDefined()
    })

    it('should create request context with tool name', () => {
      const requestId = createRequestContext('optimize-user-prompt')
      const context = getRequestContext(requestId)

      expect(context).toBeDefined()
      expect(context?.toolName).toBe('optimize-user-prompt')
    })

    it('should cleanup request context', () => {
      const requestId = createRequestContext()
      expect(getRequestContext(requestId)).toBeDefined()

      cleanupRequestContext(requestId)
      expect(getRequestContext(requestId)).toBeUndefined()
    })

    it('should handle cleanup of non-existent context', () => {
      expect(() => cleanupRequestContext('non-existent')).not.toThrow()
    })
  })

  describe('Parameter Validation Integration', () => {
    const MAX_PROMPT_LENGTH = 50000
    const MAX_REQUIREMENTS_LENGTH = 12000
    const MAX_TEMPLATE_ID_LENGTH = 100

    function validatePrompt(prompt: string): void {
      if (!prompt || prompt.trim().length === 0) {
        throw new Error('提示词不能为空字符串或纯空白字符')
      }
      if (prompt.length > MAX_PROMPT_LENGTH) {
        throw new Error('提示词过长')
      }
    }

    function validateRequirements(requirements: string): void {
      if (!requirements || requirements.trim().length === 0) {
        throw new Error('需求描述不能为空字符串或纯空白字符')
      }
      if (requirements.length > MAX_REQUIREMENTS_LENGTH) {
        throw new Error('需求描述过长')
      }
    }

    function validateTemplate(template: string | undefined): void {
      if (template === undefined) {
        return
      }
      if (!template || template.trim().length === 0) {
        throw new Error('模板不能为空字符串或纯空白字符')
      }
      if (template.length > MAX_TEMPLATE_ID_LENGTH) {
        throw new Error('模板标识过长')
      }
    }

    describe('validatePrompt', () => {
      it('should accept valid prompt', () => {
        expect(() => validatePrompt('Valid prompt')).not.toThrow()
      })

      it('should reject empty prompt', () => {
        expect(() => validatePrompt('')).toThrow('提示词不能为空字符串或纯空白字符')
      })

      it('should reject whitespace-only prompt', () => {
        expect(() => validatePrompt('   ')).toThrow('提示词不能为空字符串或纯空白字符')
      })

      it('should reject too long prompt', () => {
        const longPrompt = 'a'.repeat(MAX_PROMPT_LENGTH + 1)
        expect(() => validatePrompt(longPrompt)).toThrow('提示词过长')
      })

      it('should accept prompt at max length', () => {
        const maxPrompt = 'a'.repeat(MAX_PROMPT_LENGTH)
        expect(() => validatePrompt(maxPrompt)).not.toThrow()
      })
    })

    describe('validateRequirements', () => {
      it('should accept valid requirements', () => {
        expect(() => validateRequirements('Valid requirements')).not.toThrow()
      })

      it('should reject empty requirements', () => {
        expect(() => validateRequirements('')).toThrow('需求描述不能为空字符串或纯空白字符')
      })

      it('should reject too long requirements', () => {
        const longRequirements = 'a'.repeat(MAX_REQUIREMENTS_LENGTH + 1)
        expect(() => validateRequirements(longRequirements)).toThrow('需求描述过长')
      })
    })

    describe('validateTemplate', () => {
      it('should accept undefined template', () => {
        expect(() => validateTemplate(undefined)).not.toThrow()
      })

      it('should accept valid template', () => {
        expect(() => validateTemplate('valid-template')).not.toThrow()
      })

      it('should reject empty template', () => {
        expect(() => validateTemplate('')).toThrow('模板不能为空字符串或纯空白字符')
      })

      it('should reject too long template', () => {
        const longTemplate = 'a'.repeat(MAX_TEMPLATE_ID_LENGTH + 1)
        expect(() => validateTemplate(longTemplate)).toThrow('模板标识过长')
      })
    })
  })

  describe('Tool Name Validation', () => {
    const validToolNames = ['optimize-user-prompt', 'optimize-system-prompt', 'iterate-prompt']

    function isValidToolName(name: string): boolean {
      return validToolNames.includes(name)
    }

    it('should accept optimize-user-prompt', () => {
      expect(isValidToolName('optimize-user-prompt')).toBe(true)
    })

    it('should accept optimize-system-prompt', () => {
      expect(isValidToolName('optimize-system-prompt')).toBe(true)
    })

    it('should accept iterate-prompt', () => {
      expect(isValidToolName('iterate-prompt')).toBe(true)
    })

    it('should reject invalid tool name', () => {
      expect(isValidToolName('invalid-tool')).toBe(false)
    })

    it('should reject empty tool name', () => {
      expect(isValidToolName('')).toBe(false)
    })
  })

  describe('JSONRPC Response Format', () => {
    interface ToolResponse {
      isError?: boolean
      content: Array<{ type: string; text: string }>
    }

    function createSuccessResponse(text: string): ToolResponse {
      return {
        content: [{ type: 'text', text }],
      }
    }

    function createErrorResponse(message: string): ToolResponse {
      return {
        isError: true,
        content: [{ type: 'text', text: message }],
      }
    }

    it('should create success response with text content', () => {
      const response = createSuccessResponse('Optimization result')

      expect(response.isError).toBeUndefined()
      expect(response.content).toHaveLength(1)
      expect(response.content[0].type).toBe('text')
      expect(response.content[0].text).toBe('Optimization result')
    })

    it('should create error response with error flag', () => {
      const response = createErrorResponse('Error message')

      expect(response.isError).toBe(true)
      expect(response.content[0].text).toBe('Error message')
    })

    it('should preserve content structure for both success and error', () => {
      const success = createSuccessResponse('Result')
      const error = createErrorResponse('Error')

      expect(success.content[0].type).toBe(error.content[0].type)
      expect(success.content[0]).toHaveProperty('text')
    })
  })
})
