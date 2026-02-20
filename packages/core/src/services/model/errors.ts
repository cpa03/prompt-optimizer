/**
 * 模型基础错误
 *
 * Note: Now extends BaseError from '../../utils/error' for consistent error handling
 * with error chaining support.
 */
import { MODEL_ERROR_CODES, type ErrorParams } from '../../constants/error-codes'
import { BaseError, type ErrorOptionsWithCause } from '../../utils/error'

export class ModelError extends BaseError {
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
 * 模型验证错误
 */
export class ModelValidationError extends ModelError {
  constructor(
    details: string,
    public errors: string[]
  ) {
    super(MODEL_ERROR_CODES.VALIDATION_ERROR, details, { details })
    this.name = 'ModelValidationError'
  }
}

// 注意: ModelConfigError 已移至 llm/errors.ts，避免重复定义
