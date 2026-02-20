/**
 * MCP Tools 基础测试
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { CoreServicesManager } from '../src/adapters/core-services.js'
import { ParameterValidator } from '../src/adapters/parameter-adapter.js'
import { MCPErrorHandler, MCP_ERROR_CODES } from '../src/adapters/error-handler.js'

describe('MCP Server Tools', () => {
  let coreServices: CoreServicesManager

  beforeAll(async () => {
    // 设置测试环境变量
    process.env.MCP_DEFAULT_MODEL_API_KEY = 'test-key'
    process.env.MCP_DEFAULT_MODEL_PROVIDER = 'openai'
    process.env.MCP_DEFAULT_MODEL_NAME = 'gpt-4'

    coreServices = CoreServicesManager.getInstance()

    // 注意：这里只测试初始化，不测试实际的 LLM 调用
    // 实际的 LLM 调用需要真实的 API 密钥
  })

  describe('ParameterValidator', () => {
    it('应该正确验证提示词输入', () => {
      expect(() => ParameterValidator.validatePrompt('有效的提示词')).not.toThrow()
      expect(() => ParameterValidator.validatePrompt('')).toThrow(
        '提示词不能为空字符串或纯空白字符'
      )
      expect(() => ParameterValidator.validatePrompt('   ')).toThrow(
        '提示词不能为空字符串或纯空白字符'
      )
      expect(() => ParameterValidator.validatePrompt('a'.repeat(60000))).toThrow('提示词过长')
    })

    it('应该正确验证需求输入', () => {
      expect(() => ParameterValidator.validateRequirements('有效的需求描述')).not.toThrow()
      expect(() => ParameterValidator.validateRequirements('')).toThrow(
        '需求描述不能为空字符串或纯空白字符'
      )
      expect(() => ParameterValidator.validateRequirements('   ')).toThrow(
        '需求描述不能为空字符串或纯空白字符'
      )
      expect(() => ParameterValidator.validateRequirements('a'.repeat(15000))).toThrow(
        '需求描述过长'
      )
    })

    it('应该正确验证模板输入', () => {
      expect(() => ParameterValidator.validateTemplate('valid-template')).not.toThrow()
      expect(() => ParameterValidator.validateTemplate(undefined)).not.toThrow()
      expect(() => ParameterValidator.validateTemplate('')).toThrow(
        '模板不能为空字符串或纯空白字符'
      )
      expect(() => ParameterValidator.validateTemplate('   ')).toThrow(
        '模板不能为空字符串或纯空白字符'
      )
    })
  })

  describe('MCPErrorHandler', () => {
    it('应该正确转换验证错误', () => {
      const error = new Error('提示词必须是非空字符串')
      const mcpError = MCPErrorHandler.convertCoreError(error)

      expect(mcpError.code).toBe(MCP_ERROR_CODES.INVALID_PARAMS) // -32602
      expect(mcpError.message).toContain('提示词必须是非空字符串')
    })

    it('应该正确转换优化错误', () => {
      const error = new Error('优化失败')
      error.name = 'OptimizationError'
      const mcpError = MCPErrorHandler.convertCoreError(error)

      expect(mcpError.code).toBe(MCP_ERROR_CODES.PROMPT_OPTIMIZATION_FAILED) // -32001
      expect(mcpError.message).toContain('提示词优化失败')
    })

    it('应该将未知错误处理为内部错误', () => {
      const error = new Error('未知错误')
      const mcpError = MCPErrorHandler.convertCoreError(error)

      expect(mcpError.code).toBe(MCP_ERROR_CODES.INTERNAL_ERROR) // -32000
      expect(mcpError.message).toContain('内部错误')
    })

    it('应该正确创建验证错误', () => {
      const mcpError = MCPErrorHandler.createValidationError('测试验证错误')

      expect(mcpError.code).toBe(MCP_ERROR_CODES.INVALID_PARAMS)
      expect(mcpError.message).toContain('参数验证失败: 测试验证错误')
    })

    it('应该正确创建内部错误', () => {
      const mcpError = MCPErrorHandler.createInternalError('测试内部错误')

      expect(mcpError.code).toBe(MCP_ERROR_CODES.INTERNAL_ERROR)
      expect(mcpError.message).toContain('测试内部错误')
    })

    it('应该正确处理非Error对象', () => {
      const mcpError = MCPErrorHandler.convertCoreError('字符串错误')

      expect(mcpError.code).toBe(MCP_ERROR_CODES.INTERNAL_ERROR)
      expect(mcpError.message).toContain('字符串错误')
    })

    it('应该正确处理null值', () => {
      const mcpError = MCPErrorHandler.convertCoreError(null)

      expect(mcpError.code).toBe(MCP_ERROR_CODES.INTERNAL_ERROR)
      expect(mcpError.message).toContain('内部错误')
    })

    it('应该正确处理undefined值', () => {
      const mcpError = MCPErrorHandler.convertCoreError(undefined)

      expect(mcpError.code).toBe(MCP_ERROR_CODES.INTERNAL_ERROR)
      expect(mcpError.message).toContain('内部错误')
    })

    it('应该正确处理空name属性的Error', () => {
      const error = new Error('测试错误')
      error.name = ''
      const mcpError = MCPErrorHandler.convertCoreError(error)

      expect(mcpError.code).toBe(MCP_ERROR_CODES.INTERNAL_ERROR)
      expect(mcpError.message).toContain('测试错误')
    })

    it('应该正确处理配置相关错误', () => {
      const error = new Error('API key is invalid')
      const mcpError = MCPErrorHandler.convertCoreError(error)

      expect(mcpError.code).toBe(MCP_ERROR_CODES.CONFIGURATION_ERROR)
      expect(mcpError.message).toContain('配置错误')
    })

    it('应该正确处理AI模型不可用错误', () => {
      const error = new Error('Model not found')
      const mcpError = MCPErrorHandler.convertCoreError(error)

      expect(mcpError.code).toBe(MCP_ERROR_CODES.AI_MODEL_UNAVAILABLE)
      expect(mcpError.message).toContain('AI 模型不可用')
    })

    describe('AI Error Classification', () => {
      it('应该正确识别AI速率限制错误', () => {
        const error = new Error('Rate limit exceeded, status 429')
        const mcpError = MCPErrorHandler.convertCoreError(error)

        expect(mcpError.code).toBe(MCP_ERROR_CODES.AI_RATE_LIMITED)
        expect(mcpError.message).toContain('AI 服务请求频率超限')
      })

      it('应该正确识别AI超时错误', () => {
        const error = new Error('Request timeout: ETIMEDOUT')
        const mcpError = MCPErrorHandler.convertCoreError(error)

        expect(mcpError.code).toBe(MCP_ERROR_CODES.AI_RESPONSE_TIMEOUT)
        expect(mcpError.message).toContain('AI 服务响应超时')
      })

      it('应该正确识别AI认证错误', () => {
        const error = new Error('Unauthorized: invalid API key')
        const mcpError = MCPErrorHandler.convertCoreError(error)

        expect(mcpError.code).toBe(MCP_ERROR_CODES.AI_AUTHENTICATION_FAILED)
        expect(mcpError.message).toContain('AI 服务认证失败')
      })

      it('应该正确识别AI上下文长度错误', () => {
        const error = new Error('Context length exceeded: max tokens')
        const mcpError = MCPErrorHandler.convertCoreError(error)

        expect(mcpError.code).toBe(MCP_ERROR_CODES.AI_CONTEXT_LENGTH_EXCEEDED)
        expect(mcpError.message).toContain('AI 上下文长度超限')
      })
    })

    describe('isRetryableError', () => {
      it('应该正确识别可重试错误 - 速率限制', () => {
        const mcpError = MCPErrorHandler.createRateLimitError()
        expect(MCPErrorHandler.isRetryableError(mcpError)).toBe(true)
      })

      it('应该正确识别可重试错误 - 服务不可用', () => {
        const mcpError = MCPErrorHandler.createServiceUnavailableError()
        expect(MCPErrorHandler.isRetryableError(mcpError)).toBe(true)
      })

      it('应该正确识别可重试错误 - 超时', () => {
        const error = new Error('timeout')
        const mcpError = MCPErrorHandler.convertCoreError(error)
        expect(MCPErrorHandler.isRetryableError(mcpError)).toBe(true)
      })

      it('应该正确识别不可重试错误 - 认证失败', () => {
        const error = new Error('unauthorized')
        const mcpError = MCPErrorHandler.convertCoreError(error)
        expect(MCPErrorHandler.isRetryableError(mcpError)).toBe(false)
      })

      it('应该正确识别不可重试错误 - 内部错误', () => {
        const mcpError = MCPErrorHandler.createInternalError('test error')
        expect(MCPErrorHandler.isRetryableError(mcpError)).toBe(false)
      })
    })

    describe('isClientError', () => {
      it('应该正确识别客户端错误 - 参数验证错误', () => {
        const mcpError = MCPErrorHandler.createValidationError('invalid input')
        expect(MCPErrorHandler.isClientError(mcpError)).toBe(true)
      })

      it('应该正确识别客户端错误 - 空提示词错误', () => {
        const error = new Error('提示词必须是非空字符串')
        const mcpError = MCPErrorHandler.convertCoreError(error)
        expect(MCPErrorHandler.isClientError(mcpError)).toBe(true)
      })

      it('应该正确识别非客户端错误 - 内部错误', () => {
        const mcpError = MCPErrorHandler.createInternalError('test error')
        expect(MCPErrorHandler.isClientError(mcpError)).toBe(false)
      })

      it('应该正确识别非客户端错误 - AI速率限制', () => {
        const mcpError = MCPErrorHandler.createRateLimitError()
        expect(MCPErrorHandler.isClientError(mcpError)).toBe(false)
      })

      it('应该正确识别非客户端错误 - 服务不可用', () => {
        const mcpError = MCPErrorHandler.createServiceUnavailableError()
        expect(MCPErrorHandler.isClientError(mcpError)).toBe(false)
      })

      it('应该正确识别非客户端错误 - AI认证失败', () => {
        const error = new Error('Unauthorized: invalid API key')
        const mcpError = MCPErrorHandler.convertCoreError(error)
        expect(MCPErrorHandler.isClientError(mcpError)).toBe(false)
      })

      it('应该正确识别非客户端错误 - 配置错误', () => {
        const error = new Error('API key is invalid')
        const mcpError = MCPErrorHandler.convertCoreError(error)
        expect(MCPErrorHandler.isClientError(mcpError)).toBe(false)
      })
    })

    describe('createRateLimitError', () => {
      it('应该创建默认速率限制错误', () => {
        const mcpError = MCPErrorHandler.createRateLimitError()
        expect(mcpError.code).toBe(MCP_ERROR_CODES.AI_RATE_LIMITED)
        expect(mcpError.message).toContain('AI 服务请求频率超限')
      })

      it('应该创建自定义消息的速率限制错误', () => {
        const mcpError = MCPErrorHandler.createRateLimitError('自定义速率限制消息')
        expect(mcpError.code).toBe(MCP_ERROR_CODES.AI_RATE_LIMITED)
        expect(mcpError.message).toContain('自定义速率限制消息')
      })
    })

    describe('createServiceUnavailableError', () => {
      it('应该创建默认服务不可用错误', () => {
        const mcpError = MCPErrorHandler.createServiceUnavailableError()
        expect(mcpError.code).toBe(MCP_ERROR_CODES.SERVICE_UNAVAILABLE)
        expect(mcpError.message).toContain('服务暂时不可用')
      })

      it('应该创建自定义消息的服务不可用错误', () => {
        const mcpError = MCPErrorHandler.createServiceUnavailableError('自定义服务不可用消息')
        expect(mcpError.code).toBe(MCP_ERROR_CODES.SERVICE_UNAVAILABLE)
        expect(mcpError.message).toContain('自定义服务不可用消息')
      })
    })
  })
})
