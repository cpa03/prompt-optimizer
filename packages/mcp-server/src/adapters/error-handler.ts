/**
 * 错误处理适配器
 *
 * 将 Core 模块的错误转换为 MCP 协议兼容的错误格式
 */

import { McpError } from '@modelcontextprotocol/sdk/types.js'

// 定义 MCP 错误代码
export const MCP_ERROR_CODES = {
  INTERNAL_ERROR: -32000,
  PROMPT_OPTIMIZATION_FAILED: -32001,
  INVALID_PARAMS: -32602,
  METHOD_NOT_FOUND: -32601,
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
} as const

export class MCPErrorHandler {
  /**
   * 转换 Core 模块错误为 MCP 错误
   * 支持处理 Error 对象和非 Error 值
   */
  static convertCoreError(error: Error | unknown): McpError {
    const errorName = error instanceof Error ? error.name || 'Error' : 'UnknownError'
    const errorMessage = error instanceof Error ? error.message || 'Unknown error' : String(error)

    if (!(error instanceof Error)) {
      return new McpError(MCP_ERROR_CODES.INTERNAL_ERROR, `内部错误: ${errorMessage}`, {
        originalError: errorName,
      })
    }

    if (
      errorName.includes('OptimizationError') ||
      errorName.includes('IterationError') ||
      errorName.includes('TestError')
    ) {
      return new McpError(
        MCP_ERROR_CODES.PROMPT_OPTIMIZATION_FAILED,
        `提示词优化失败: ${errorMessage}`,
        { originalError: errorName }
      )
    }

    if (
      errorMessage.includes('必须是') ||
      errorMessage.includes('不能为空') ||
      errorMessage.includes('过长')
    ) {
      return new McpError(MCP_ERROR_CODES.INVALID_PARAMS, errorMessage, {
        originalError: errorName,
      })
    }

    if (
      errorMessage.includes('Model') ||
      errorMessage.includes('API key') ||
      errorMessage.includes('Template')
    ) {
      return new McpError(MCP_ERROR_CODES.INTERNAL_ERROR, `配置错误: ${errorMessage}`, {
        originalError: errorName,
      })
    }

    return new McpError(MCP_ERROR_CODES.INTERNAL_ERROR, `内部错误: ${errorMessage}`, {
      originalError: errorName,
    })
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
}
