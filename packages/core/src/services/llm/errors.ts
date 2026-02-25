/**
 * Base error class
 * 基础错误类
 *
 * Note: BaseError, ErrorOptionsWithCause, and setErrorCause are now imported from
 * '../../utils/error' for centralized error handling utilities.
 */

import { LLM_ERROR_CODES, type ErrorParams } from '../../constants/error-codes'
import {
  BaseError as BaseErrorClass,
  type ErrorOptionsWithCause,
  setErrorCause,
} from '../../utils/error'

// Re-export for backward compatibility
export { type ErrorOptionsWithCause, setErrorCause }
export { BaseErrorClass as BaseError }

/**
 * API error - Used for errors during API calls
 * API错误 - 用于表示API调用过程中的错误
 */
export class APIError extends BaseErrorClass {
  constructor(message: string, options?: ErrorOptionsWithCause) {
    super(LLM_ERROR_CODES.API_ERROR, message, undefined, options)
  }
}

/**
 * Request configuration error - Used for request configuration validation failures
 * 请求配置错误 - 用于表示请求配置验证失败的错误
 */
export class RequestConfigError extends BaseErrorClass {
  constructor(message: string, options?: ErrorOptionsWithCause) {
    super(LLM_ERROR_CODES.CONFIG_ERROR, message, undefined, options)
  }
}

/**
 * Validation error - Used for parameter validation failures
 * 验证错误 - 用于表示参数验证失败的错误
 */
export class ValidationError extends BaseErrorClass {
  constructor(message: string, options?: ErrorOptionsWithCause) {
    super(LLM_ERROR_CODES.VALIDATION_ERROR, message, undefined, options)
  }
}

/**
 * Initialization error - Used for service initialization failures
 * 初始化错误 - 用于表示服务初始化失败的错误
 */
export class InitializationError extends BaseErrorClass {
  constructor(message: string, options?: ErrorOptionsWithCause) {
    super(LLM_ERROR_CODES.INITIALIZATION_ERROR, message, undefined, options)
  }
}

/**
 * LLM service base error
 * LLM服务基础错误
 */
export class LLMError extends BaseErrorClass {
  constructor(
    code: string,
    message?: string,
    params?: ErrorParams,
    options?: ErrorOptionsWithCause
  ) {
    super(code, message, params, options)
    this.name = 'LLMError'
  }
}

/**
 * Model configuration error
 * 模型配置错误
 */
export class ModelConfigError extends LLMError {
  constructor(message: string, options?: ErrorOptionsWithCause) {
    super(LLM_ERROR_CODES.CONFIG_ERROR, message, undefined, options)
    this.name = 'ModelConfigError'
  }
}

/**
 * Unified error code constants for LLM operations
 * LLM操作的统一错误代码常量
 *
 * @deprecated Use LLM_ERROR_CODES from '@prompt-optimizer/core/constants/error-codes' instead
 */
export const ERROR_MESSAGES = {
  API_KEY_REQUIRED: LLM_ERROR_CODES.API_KEY_REQUIRED,
  MODEL_NOT_FOUND: LLM_ERROR_CODES.MODEL_NOT_FOUND,
  TEMPLATE_INVALID: LLM_ERROR_CODES.TEMPLATE_INVALID,
  EMPTY_INPUT: LLM_ERROR_CODES.EMPTY_INPUT,
  OPTIMIZATION_FAILED: LLM_ERROR_CODES.OPTIMIZATION_FAILED,
  ITERATION_FAILED: LLM_ERROR_CODES.ITERATION_FAILED,
  TEST_FAILED: LLM_ERROR_CODES.TEST_FAILED,
  MODEL_KEY_REQUIRED: LLM_ERROR_CODES.MODEL_KEY_REQUIRED,
  INPUT_TOO_LONG: LLM_ERROR_CODES.INPUT_TOO_LONG,
} as const
