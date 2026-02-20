/**
 * 错误处理适配器
 *
 * 将 Core 模块的错误转换为 MCP 协议兼容的错误格式
 *
 * ## AI Agent Integration Notes
 *
 * This error handler provides standardized error codes for AI agent integrations.
 * When integrating with AI agents via MCP, use these error codes to:
 *
 * 1. **Error Classification**: Identify the type of error for proper handling
 * 2. **Retry Logic**: Some errors (rate limiting, timeouts) may be retryable
 * 3. **User Feedback**: Provide meaningful error messages to end users
 *
 * ### Error Code Categories:
 * - `-32xxx`: Standard JSON-RPC errors
 * - `-32000` to `-32099`: Internal server errors
 * - `-32100` to `-32199`: AI-specific errors (rate limits, context length, etc.)
 *
 * @module mcp-server/error-handler
 */

import { McpError } from '@modelcontextprotocol/sdk/types.js'

/**
 * MCP 错误代码定义
 *
 * Standardized error codes for MCP protocol communication.
 * Follows JSON-RPC 2.0 specification with custom extensions for AI operations.
 */
export const MCP_ERROR_CODES = {
  // Standard JSON-RPC errors
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,

  // Internal server errors (-32000 to -32099)
  INTERNAL_ERROR: -32000,
  PROMPT_OPTIMIZATION_FAILED: -32001,
  CONFIGURATION_ERROR: -32002,
  SERVICE_UNAVAILABLE: -32003,

  // AI-specific errors (-32100 to -32199)
  AI_RATE_LIMITED: -32100,
  AI_CONTEXT_LENGTH_EXCEEDED: -32101,
  AI_MODEL_UNAVAILABLE: -32102,
  AI_RESPONSE_TIMEOUT: -32103,
  AI_AUTHENTICATION_FAILED: -32104,
} as const

/**
 * Error pattern matchers for AI-specific error classification.
 * These patterns help identify common AI API errors and map them to appropriate codes.
 */
const AI_ERROR_PATTERNS = {
  rateLimit: /rate\s*limit|too\s*many\s*requests|429|quota/i,
  contextLength: /context\s*length|token\s*limit|max.*tokens|context.*exceeded/i,
  timeout: /timeout|timed?\s*out|ETIMEDOUT/i,
  auth: /unauthorized|invalid.*api.*key|authentication|401|403/i,
  modelUnavailable: /model.*not\s*found|model.*unavailable|model.*does\s*not\s*exist/i,
} as const

/**
 * Error pattern matchers for validation errors.
 */
const VALIDATION_ERROR_PATTERNS = {
  emptyString: /必须是非空|不能为空|cannot\s*be\s*empty|required/i,
  tooLong: /过长|too\s*long|exceeds?\s*limit|max.*length/i,
  invalidType: /必须是|must\s*be|invalid\s*type|expected/i,
} as const

export class MCPErrorHandler {
  /**
   * 转换 Core 模块错误为 MCP 错误
   * 支持处理 Error 对象和非 Error 值
   *
   * @param error - The error to convert
   * @returns A standardized MCP error with appropriate error code
   */
  static convertCoreError(error: Error | unknown): McpError {
    const errorName = error instanceof Error ? error.name || 'Error' : 'UnknownError'
    const errorMessage = error instanceof Error ? error.message || 'Unknown error' : String(error)

    if (!(error instanceof Error)) {
      return new McpError(MCP_ERROR_CODES.INTERNAL_ERROR, `内部错误: ${errorMessage}`, {
        originalError: errorName,
        category: 'internal',
      })
    }

    // Check for AI-specific errors first (higher priority)
    const aiError = this.classifyAIError(errorMessage, errorName)
    if (aiError) {
      return aiError
    }

    // Check for optimization-specific errors
    if (
      errorName.includes('OptimizationError') ||
      errorName.includes('IterationError') ||
      errorName.includes('TestError')
    ) {
      return new McpError(
        MCP_ERROR_CODES.PROMPT_OPTIMIZATION_FAILED,
        `提示词优化失败: ${errorMessage}`,
        { originalError: errorName, category: 'optimization' }
      )
    }

    // Check for validation errors
    if (this.isValidationError(errorMessage)) {
      return new McpError(MCP_ERROR_CODES.INVALID_PARAMS, errorMessage, {
        originalError: errorName,
        category: 'validation',
      })
    }

    // Check for configuration errors
    if (
      errorMessage.includes('Model') ||
      errorMessage.includes('API key') ||
      errorMessage.includes('Template')
    ) {
      return new McpError(MCP_ERROR_CODES.CONFIGURATION_ERROR, `配置错误: ${errorMessage}`, {
        originalError: errorName,
        category: 'configuration',
      })
    }

    return new McpError(MCP_ERROR_CODES.INTERNAL_ERROR, `内部错误: ${errorMessage}`, {
      originalError: errorName,
      category: 'internal',
    })
  }

  /**
   * Classifies AI-specific errors from error message patterns.
   *
   * @param errorMessage - The error message to analyze
   * @param errorName - The error name/class
   * @returns McpError if AI-specific error detected, null otherwise
   * @private
   */
  private static classifyAIError(errorMessage: string, errorName: string): McpError | null {
    // Rate limiting
    if (AI_ERROR_PATTERNS.rateLimit.test(errorMessage)) {
      return new McpError(MCP_ERROR_CODES.AI_RATE_LIMITED, `AI 服务请求频率超限: ${errorMessage}`, {
        originalError: errorName,
        category: 'ai-rate-limit',
        retryable: true,
      })
    }

    // Context length exceeded
    if (AI_ERROR_PATTERNS.contextLength.test(errorMessage)) {
      return new McpError(
        MCP_ERROR_CODES.AI_CONTEXT_LENGTH_EXCEEDED,
        `AI 上下文长度超限: ${errorMessage}`,
        { originalError: errorName, category: 'ai-context-length' }
      )
    }

    // Timeout
    if (AI_ERROR_PATTERNS.timeout.test(errorMessage)) {
      return new McpError(MCP_ERROR_CODES.AI_RESPONSE_TIMEOUT, `AI 服务响应超时: ${errorMessage}`, {
        originalError: errorName,
        category: 'ai-timeout',
        retryable: true,
      })
    }

    // Authentication
    if (AI_ERROR_PATTERNS.auth.test(errorMessage)) {
      return new McpError(
        MCP_ERROR_CODES.AI_AUTHENTICATION_FAILED,
        `AI 服务认证失败: ${errorMessage}`,
        { originalError: errorName, category: 'ai-auth' }
      )
    }

    // Model unavailable
    if (AI_ERROR_PATTERNS.modelUnavailable.test(errorMessage)) {
      return new McpError(MCP_ERROR_CODES.AI_MODEL_UNAVAILABLE, `AI 模型不可用: ${errorMessage}`, {
        originalError: errorName,
        category: 'ai-model',
      })
    }

    return null
  }

  /**
   * Checks if an error message represents a validation error.
   *
   * @param errorMessage - The error message to check
   * @returns true if validation error pattern found
   * @private
   */
  private static isValidationError(errorMessage: string): boolean {
    return (
      VALIDATION_ERROR_PATTERNS.emptyString.test(errorMessage) ||
      VALIDATION_ERROR_PATTERNS.tooLong.test(errorMessage) ||
      VALIDATION_ERROR_PATTERNS.invalidType.test(errorMessage)
    )
  }

  /**
   * 创建参数验证错误
   */
  static createValidationError(message: string): McpError {
    return new McpError(MCP_ERROR_CODES.INVALID_PARAMS, `参数验证失败: ${message}`)
  }

  /**
   * 创建内部错误
   */
  static createInternalError(message: string): McpError {
    return new McpError(MCP_ERROR_CODES.INTERNAL_ERROR, message)
  }

  /**
   * Creates an AI rate limit error with retry suggestion.
   *
   * @param message - Optional custom message
   * @returns McpError with rate limit code
   */
  static createRateLimitError(message?: string): McpError {
    return new McpError(
      MCP_ERROR_CODES.AI_RATE_LIMITED,
      message || 'AI 服务请求频率超限，请稍后重试',
      { category: 'ai-rate-limit', retryable: true }
    )
  }

  /**
   * Creates a service unavailable error.
   *
   * @param message - Optional custom message
   * @returns McpError with service unavailable code
   */
  static createServiceUnavailableError(message?: string): McpError {
    return new McpError(
      MCP_ERROR_CODES.SERVICE_UNAVAILABLE,
      message || '服务暂时不可用，请稍后重试',
      { category: 'service-unavailable', retryable: true }
    )
  }

  /**
   * Checks if an error is retryable based on its code.
   *
   * @param error - The McpError to check
   * @returns true if the error is potentially recoverable with retry
   */
  static isRetryableError(error: McpError): boolean {
    const retryableCodes = [
      MCP_ERROR_CODES.AI_RATE_LIMITED,
      MCP_ERROR_CODES.AI_RESPONSE_TIMEOUT,
      MCP_ERROR_CODES.SERVICE_UNAVAILABLE,
    ]
    return retryableCodes.includes(error.code as (typeof retryableCodes)[number])
  }

  /**
   * Checks if an error is a client error (4xx equivalent).
   * Client errors are caused by invalid input from the client
   * and should be shown to the user with details.
   *
   * @param error - The McpError to check
   * @returns true if the error is a client error
   */
  static isClientError(error: McpError): boolean {
    const clientErrorCodes = [
      MCP_ERROR_CODES.INVALID_PARAMS,
      MCP_ERROR_CODES.INVALID_REQUEST,
      MCP_ERROR_CODES.METHOD_NOT_FOUND,
      MCP_ERROR_CODES.PARSE_ERROR,
    ]
    return clientErrorCodes.includes(error.code as (typeof clientErrorCodes)[number])
  }
}
