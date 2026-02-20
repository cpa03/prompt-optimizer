/**
 * Evaluation service error classes
 * 评估服务错误类
 *
 * Note: Now extends BaseError from '../../utils/error' for consistent error handling
 * with error chaining support. Constructor signature updated to match BaseError:
 * (code, message?, params?, options?)
 */

import { EVALUATION_ERROR_CODES, type ErrorParams } from '../../constants/error-codes'
import { BaseError, type ErrorOptionsWithCause } from '../../utils/error'

/**
 * Base error class for evaluation service
 * 评估服务基础错误类
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
  constructor(message: string, options?: ErrorOptionsWithCause) {
    super(EVALUATION_ERROR_CODES.VALIDATION_ERROR, message, undefined, options)
  }
}

/**
 * Evaluation model error (model does not exist or is misconfigured)
 * 评估模型错误（模型不存在或配置错误）
 */
export class EvaluationModelError extends EvaluationError {
  constructor(modelKey: string, options?: ErrorOptionsWithCause) {
    super(EVALUATION_ERROR_CODES.MODEL_NOT_FOUND, undefined, { context: modelKey }, options)
  }
}

/**
 * Evaluation template error (template does not exist)
 * 评估模板错误（模板不存在）
 */
export class EvaluationTemplateError extends EvaluationError {
  constructor(templateId: string, options?: ErrorOptionsWithCause) {
    super(EVALUATION_ERROR_CODES.TEMPLATE_NOT_FOUND, undefined, { context: templateId }, options)
  }
}

/**
 * Evaluation parse error (cannot parse LLM evaluation result)
 * 评估解析错误（无法解析 LLM 返回的评估结果）
 */
export class EvaluationParseError extends EvaluationError {
  constructor(message: string, options?: ErrorOptionsWithCause) {
    super(EVALUATION_ERROR_CODES.PARSE_ERROR, message, undefined, options)
  }
}

/**
 * Evaluation execution error (LLM call failed, etc.)
 * 评估执行错误（LLM 调用失败等）
 */
export class EvaluationExecutionError extends EvaluationError {
  constructor(message: string, cause?: Error, options?: ErrorOptionsWithCause) {
    super(EVALUATION_ERROR_CODES.EXECUTION_ERROR, message, { cause: cause?.message }, options)
    if (cause) {
      ;(this as any).cause = cause
    }
  }
}
