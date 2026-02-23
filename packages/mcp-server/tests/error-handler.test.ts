/**
 * Tests for MCP Error Handler
 * @module mcp-server/tests/error-handler
 */

import { describe, it, expect } from 'vitest'
import { McpError } from '@modelcontextprotocol/sdk/types.js'
import {
  MCPErrorHandler,
  MCP_ERROR_CODES,
  type ErrorCategory,
} from '../src/adapters/error-handler.js'

describe('MCPErrorHandler', () => {
  describe('convertCoreError', () => {
    it('should convert non-Error values to internal error', () => {
      const result = MCPErrorHandler.convertCoreError('string error')
      expect(result).toBeInstanceOf(McpError)
      expect(result.code).toBe(MCP_ERROR_CODES.INTERNAL_ERROR)
      expect(result.message).toContain('string error')
    })

    it('should convert non-Error objects to internal error', () => {
      const result = MCPErrorHandler.convertCoreError({ foo: 'bar' })
      expect(result).toBeInstanceOf(McpError)
      expect(result.code).toBe(MCP_ERROR_CODES.INTERNAL_ERROR)
    })

    it('should classify rate limit errors', () => {
      const error = new Error('Rate limit exceeded: too many requests')
      const result = MCPErrorHandler.convertCoreError(error)
      expect(result.code).toBe(MCP_ERROR_CODES.AI_RATE_LIMITED)
      expect(result.message).toContain('频率超限')
    })

    it('should classify 429 errors as rate limit', () => {
      const error = new Error('429 Too Many Requests')
      const result = MCPErrorHandler.convertCoreError(error)
      expect(result.code).toBe(MCP_ERROR_CODES.AI_RATE_LIMITED)
    })

    it('should classify context length errors', () => {
      const error = new Error('context length exceeded')
      const result = MCPErrorHandler.convertCoreError(error)
      expect(result.code).toBe(MCP_ERROR_CODES.AI_CONTEXT_LENGTH_EXCEEDED)
    })

    it('should classify timeout errors', () => {
      const error = new Error('Request timeout')
      const result = MCPErrorHandler.convertCoreError(error)
      expect(result.code).toBe(MCP_ERROR_CODES.AI_RESPONSE_TIMEOUT)
    })

    it('should classify authentication errors', () => {
      const error = new Error('Unauthorized: invalid API key')
      const result = MCPErrorHandler.convertCoreError(error)
      expect(result.code).toBe(MCP_ERROR_CODES.AI_AUTHENTICATION_FAILED)
    })

    it('should classify model unavailable errors', () => {
      const error = new Error('Model not found')
      const result = MCPErrorHandler.convertCoreError(error)
      expect(result.code).toBe(MCP_ERROR_CODES.AI_MODEL_UNAVAILABLE)
    })

    it('should classify service overloaded errors', () => {
      const error = new Error('Service temporarily unavailable 503')
      const result = MCPErrorHandler.convertCoreError(error)
      expect(result.code).toBe(MCP_ERROR_CODES.AI_SERVICE_OVERLOADED)
    })

    it('should classify content filtered errors', () => {
      const error = new Error('Content filter triggered')
      const result = MCPErrorHandler.convertCoreError(error)
      expect(result.code).toBe(MCP_ERROR_CODES.AI_CONTENT_FILTERED)
    })

    it('should classify optimization errors', () => {
      const error = new Error('Optimization failed')
      error.name = 'OptimizationError'
      const result = MCPErrorHandler.convertCoreError(error)
      expect(result.code).toBe(MCP_ERROR_CODES.PROMPT_OPTIMIZATION_FAILED)
    })

    it('should classify iteration errors', () => {
      const error = new Error('Iteration failed')
      error.name = 'IterationError'
      const result = MCPErrorHandler.convertCoreError(error)
      expect(result.code).toBe(MCP_ERROR_CODES.PROMPT_OPTIMIZATION_FAILED)
    })

    it('should classify validation errors with empty string pattern', () => {
      const error = new Error('Field cannot be empty')
      const result = MCPErrorHandler.convertCoreError(error)
      expect(result.code).toBe(MCP_ERROR_CODES.INVALID_PARAMS)
    })

    it('should classify validation errors with required pattern', () => {
      const error = new Error('Field is required')
      const result = MCPErrorHandler.convertCoreError(error)
      expect(result.code).toBe(MCP_ERROR_CODES.INVALID_PARAMS)
    })

    it('should classify configuration errors with Model keyword', () => {
      const error = new Error('Model not configured')
      const result = MCPErrorHandler.convertCoreError(error)
      expect(result.code).toBe(MCP_ERROR_CODES.CONFIGURATION_ERROR)
    })

    it('should classify configuration errors with API key keyword', () => {
      const error = new Error('API key is missing')
      const result = MCPErrorHandler.convertCoreError(error)
      expect(result.code).toBe(MCP_ERROR_CODES.CONFIGURATION_ERROR)
    })

    it('should return internal error for unknown errors', () => {
      const error = new Error('Some random error')
      const result = MCPErrorHandler.convertCoreError(error)
      expect(result.code).toBe(MCP_ERROR_CODES.INTERNAL_ERROR)
    })

    it('should include timestamp in error data', () => {
      const error = new Error('Test error')
      const result = MCPErrorHandler.convertCoreError(error)
      const data = result.data as { timestamp: string }
      expect(data.timestamp).toBeDefined()
      expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp)
    })
  })

  describe('createValidationError', () => {
    it('should create validation error with correct code', () => {
      const result = MCPErrorHandler.createValidationError('Invalid parameter')
      expect(result).toBeInstanceOf(McpError)
      expect(result.code).toBe(MCP_ERROR_CODES.INVALID_PARAMS)
      expect(result.message).toContain('Invalid parameter')
    })

    it('should include validation category', () => {
      const result = MCPErrorHandler.createValidationError('Test')
      const data = result.data as { category: ErrorCategory }
      expect(data.category).toBe('validation')
    })
  })

  describe('createInternalError', () => {
    it('should create internal error with correct code', () => {
      const result = MCPErrorHandler.createInternalError('Something went wrong')
      expect(result).toBeInstanceOf(McpError)
      expect(result.code).toBe(MCP_ERROR_CODES.INTERNAL_ERROR)
      expect(result.message).toContain('Something went wrong')
    })

    it('should include internal category', () => {
      const result = MCPErrorHandler.createInternalError('Test')
      const data = result.data as { category: ErrorCategory }
      expect(data.category).toBe('internal')
    })
  })

  describe('createRateLimitError', () => {
    it('should create rate limit error with default message', () => {
      const result = MCPErrorHandler.createRateLimitError()
      expect(result.code).toBe(MCP_ERROR_CODES.AI_RATE_LIMITED)
      expect(result.message).toContain('频率超限')
    })

    it('should create rate limit error with custom message', () => {
      const result = MCPErrorHandler.createRateLimitError('Custom rate limit message')
      expect(result.message).toContain('Custom rate limit message')
    })

    it('should mark rate limit error as retryable', () => {
      const result = MCPErrorHandler.createRateLimitError()
      const data = result.data as { retryable: boolean }
      expect(data.retryable).toBe(true)
    })
  })

  describe('createServiceUnavailableError', () => {
    it('should create service unavailable error with default message', () => {
      const result = MCPErrorHandler.createServiceUnavailableError()
      expect(result.code).toBe(MCP_ERROR_CODES.SERVICE_UNAVAILABLE)
      expect(result.message).toContain('不可用')
    })

    it('should create service unavailable error with custom message', () => {
      const result = MCPErrorHandler.createServiceUnavailableError('Custom message')
      expect(result.message).toContain('Custom message')
    })

    it('should mark service unavailable error as retryable', () => {
      const result = MCPErrorHandler.createServiceUnavailableError()
      const data = result.data as { retryable: boolean }
      expect(data.retryable).toBe(true)
    })
  })

  describe('createServiceOverloadedError', () => {
    it('should create service overloaded error with default message', () => {
      const result = MCPErrorHandler.createServiceOverloadedError()
      expect(result.code).toBe(MCP_ERROR_CODES.AI_SERVICE_OVERLOADED)
      expect(result.message).toContain('过载')
    })

    it('should create service overloaded error with custom message', () => {
      const result = MCPErrorHandler.createServiceOverloadedError('Custom overload')
      expect(result.message).toContain('Custom overload')
    })

    it('should mark service overloaded error as retryable', () => {
      const result = MCPErrorHandler.createServiceOverloadedError()
      const data = result.data as { retryable: boolean }
      expect(data.retryable).toBe(true)
    })
  })

  describe('createContentFilteredError', () => {
    it('should create content filtered error with default message', () => {
      const result = MCPErrorHandler.createContentFilteredError()
      expect(result.code).toBe(MCP_ERROR_CODES.AI_CONTENT_FILTERED)
      expect(result.message).toContain('过滤')
    })

    it('should create content filtered error with custom message', () => {
      const result = MCPErrorHandler.createContentFilteredError('Content blocked')
      expect(result.message).toContain('Content blocked')
    })
  })

  describe('isRetryableError', () => {
    it('should return true for rate limit errors', () => {
      const error = MCPErrorHandler.createRateLimitError()
      expect(MCPErrorHandler.isRetryableError(error)).toBe(true)
    })

    it('should return true for timeout errors', () => {
      const error = new McpError(MCP_ERROR_CODES.AI_RESPONSE_TIMEOUT, 'Timeout', {
        category: 'ai-timeout',
      })
      expect(MCPErrorHandler.isRetryableError(error)).toBe(true)
    })

    it('should return true for service overloaded errors', () => {
      const error = MCPErrorHandler.createServiceOverloadedError()
      expect(MCPErrorHandler.isRetryableError(error)).toBe(true)
    })

    it('should return true for service unavailable errors', () => {
      const error = MCPErrorHandler.createServiceUnavailableError()
      expect(MCPErrorHandler.isRetryableError(error)).toBe(true)
    })

    it('should return false for validation errors', () => {
      const error = MCPErrorHandler.createValidationError('Invalid input')
      expect(MCPErrorHandler.isRetryableError(error)).toBe(false)
    })

    it('should return false for authentication errors', () => {
      const error = new McpError(MCP_ERROR_CODES.AI_AUTHENTICATION_FAILED, 'Auth failed', {
        category: 'ai-auth',
      })
      expect(MCPErrorHandler.isRetryableError(error)).toBe(false)
    })
  })

  describe('isClientError', () => {
    it('should return true for invalid params errors', () => {
      const error = MCPErrorHandler.createValidationError('Invalid')
      expect(MCPErrorHandler.isClientError(error)).toBe(true)
    })

    it('should return true for parse errors', () => {
      const error = new McpError(MCP_ERROR_CODES.PARSE_ERROR, 'Parse error', {})
      expect(MCPErrorHandler.isClientError(error)).toBe(true)
    })

    it('should return true for invalid request errors', () => {
      const error = new McpError(MCP_ERROR_CODES.INVALID_REQUEST, 'Invalid request', {})
      expect(MCPErrorHandler.isClientError(error)).toBe(true)
    })

    it('should return true for method not found errors', () => {
      const error = new McpError(MCP_ERROR_CODES.METHOD_NOT_FOUND, 'Not found', {})
      expect(MCPErrorHandler.isClientError(error)).toBe(true)
    })

    it('should return false for internal errors', () => {
      const error = MCPErrorHandler.createInternalError('Internal')
      expect(MCPErrorHandler.isClientError(error)).toBe(false)
    })

    it('should return false for rate limit errors', () => {
      const error = MCPErrorHandler.createRateLimitError()
      expect(MCPErrorHandler.isClientError(error)).toBe(false)
    })
  })

  describe('getErrorCategory', () => {
    it('should extract category from error data', () => {
      const error = MCPErrorHandler.createValidationError('Test')
      expect(MCPErrorHandler.getErrorCategory(error)).toBe('validation')
    })

    it('should return internal for errors without category', () => {
      const error = new McpError(MCP_ERROR_CODES.INTERNAL_ERROR, 'Test', {})
      expect(MCPErrorHandler.getErrorCategory(error)).toBe('internal')
    })

    it('should return correct category for rate limit errors', () => {
      const error = MCPErrorHandler.createRateLimitError()
      expect(MCPErrorHandler.getErrorCategory(error)).toBe('ai-rate-limit')
    })
  })

  describe('formatErrorForLogging', () => {
    it('should format error with all details', () => {
      const error = MCPErrorHandler.createRateLimitError('Rate limited')
      const formatted = MCPErrorHandler.formatErrorForLogging(error)
      expect(formatted).toContain('Code:')
      expect(formatted).toContain('Rate limited')
      expect(formatted).toContain('Category:')
      expect(formatted).toContain('Timestamp:')
      expect(formatted).toContain('Retryable:')
    })

    it('should include original error when present', () => {
      const error = MCPErrorHandler.convertCoreError(new Error('Original error'))
      const formatted = MCPErrorHandler.formatErrorForLogging(error)
      expect(formatted).toContain('Original Error:')
    })
  })

  describe('createErrorSummary', () => {
    it('should create structured error summary', () => {
      const error = MCPErrorHandler.createRateLimitError()
      const summary = MCPErrorHandler.createErrorSummary(error)
      expect(summary).toHaveProperty('code')
      expect(summary).toHaveProperty('category')
      expect(summary).toHaveProperty('message')
      expect(summary).toHaveProperty('retryable')
      expect(summary).toHaveProperty('timestamp')
    })

    it('should include correct code in summary', () => {
      const error = MCPErrorHandler.createValidationError('Test')
      const summary = MCPErrorHandler.createErrorSummary(error)
      expect(summary.code).toBe(MCP_ERROR_CODES.INVALID_PARAMS)
    })

    it('should include retryable status in summary', () => {
      const error = MCPErrorHandler.createRateLimitError()
      const summary = MCPErrorHandler.createErrorSummary(error)
      expect(summary.retryable).toBe(true)
    })
  })
})

describe('MCP_ERROR_CODES', () => {
  it('should have standard JSON-RPC error codes', () => {
    expect(MCP_ERROR_CODES.PARSE_ERROR).toBe(-32700)
    expect(MCP_ERROR_CODES.INVALID_REQUEST).toBe(-32600)
    expect(MCP_ERROR_CODES.METHOD_NOT_FOUND).toBe(-32601)
    expect(MCP_ERROR_CODES.INVALID_PARAMS).toBe(-32602)
  })

  it('should have internal error codes in correct range', () => {
    expect(MCP_ERROR_CODES.INTERNAL_ERROR).toBeGreaterThanOrEqual(-32099)
    expect(MCP_ERROR_CODES.INTERNAL_ERROR).toBeLessThanOrEqual(-32000)
    expect(MCP_ERROR_CODES.SERVICE_UNAVAILABLE).toBeGreaterThanOrEqual(-32099)
    expect(MCP_ERROR_CODES.SERVICE_UNAVAILABLE).toBeLessThanOrEqual(-32000)
  })

  it('should have AI-specific error codes in correct range', () => {
    expect(MCP_ERROR_CODES.AI_RATE_LIMITED).toBeGreaterThanOrEqual(-32199)
    expect(MCP_ERROR_CODES.AI_RATE_LIMITED).toBeLessThanOrEqual(-32100)
    expect(MCP_ERROR_CODES.AI_CONTENT_FILTERED).toBeGreaterThanOrEqual(-32199)
    expect(MCP_ERROR_CODES.AI_CONTENT_FILTERED).toBeLessThanOrEqual(-32100)
  })
})
