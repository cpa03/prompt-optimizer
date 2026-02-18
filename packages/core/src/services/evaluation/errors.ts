/**
 * Evaluation service error classes
 * 评估服务错误类
 */

import { EVALUATION_ERROR_CODES, type ErrorParams } from '../../constants/error-codes'
import { BaseError, type ErrorOptionsWithCause } from '../llm/errors'

/**
 * Base error class for evaluation service
 * 评估服务基础错误类
 * Extends BaseError for consistent error handling across all services
 */
export class EvaluationError extends BaseError {
  constructor(
    code: string,
    message?: string,
    params?: ErrorParams,
    options?: ErrorOptionsWithCause
  ) {
    super(code, message, params, options)
  }
}

/**
 * Evaluation request validation error
 * 评估请求验证错误
 */
export class EvaluationValidationError extends EvaluationError {
  constructor(message: string) {
    super(EVALUATION_ERROR_CODES.VALIDATION_ERROR, message)
  }
}

/**
 * Evaluation model error (model does not exist or is misconfigured)
 * 评估模型错误（模型不存在或配置错误）
 */
export class EvaluationModelError extends EvaluationError {
  constructor(modelKey: string) {
    super(EVALUATION_ERROR_CODES.MODEL_NOT_FOUND, undefined, { context: modelKey })
  }
}

/**
 * Evaluation template error (template does not exist)
 * 评估模板错误（模板不存在）
 */
export class EvaluationTemplateError extends EvaluationError {
  constructor(templateId: string) {
    super(EVALUATION_ERROR_CODES.TEMPLATE_NOT_FOUND, undefined, { context: templateId })
  }
}

/**
 * Evaluation parse error (cannot parse LLM evaluation result)
 * 评估解析错误（无法解析 LLM 返回的评估结果）
 */
export class EvaluationParseError extends EvaluationError {
  constructor(message: string) {
    super(EVALUATION_ERROR_CODES.PARSE_ERROR, message)
  }
}

/**
 * Evaluation execution error (LLM call failed, etc.)
 * 评估执行错误（LLM 调用失败等）
 */
export class EvaluationExecutionError extends EvaluationError {
  constructor(message: string, cause?: Error) {
    super(EVALUATION_ERROR_CODES.EXECUTION_ERROR, message, undefined, { cause })
  }
}
