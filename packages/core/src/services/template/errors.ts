/**
 * 提示词错误基类
 *
 * Note: Now extends BaseError from '../../utils/error' for consistent error handling
 * with error chaining support.
 */
import { TEMPLATE_ERROR_CODES, type ErrorParams } from '../../constants/error-codes'
import { BaseError, type ErrorOptionsWithCause } from '../../utils/error'

export class TemplateError extends BaseError {
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
 * 提示词加载错误
 */
export class TemplateLoadError extends TemplateError {
  constructor(templateId: string, details?: string) {
    super(TEMPLATE_ERROR_CODES.LOAD_ERROR, details, { ...(details ? { details } : {}), templateId })
    this.name = 'TemplateLoadError'
    this.templateId = templateId
  }

  public templateId: string
}

/**
 * 提示词验证错误
 */
export class TemplateValidationError extends TemplateError {
  constructor(details?: string) {
    super(TEMPLATE_ERROR_CODES.VALIDATION_ERROR, details, details ? { details } : undefined)
    this.name = 'TemplateValidationError'
  }
}

/**
 * 提示词缓存错误
 */
export class TemplateCacheError extends TemplateError {
  constructor(details?: string) {
    super(TEMPLATE_ERROR_CODES.CACHE_ERROR, details, details ? { details } : undefined)
    this.name = 'TemplateCacheError'
  }
}

/**
 * 提示词存储错误
 */
export class TemplateStorageError extends TemplateError {
  constructor(details?: string) {
    super(TEMPLATE_ERROR_CODES.STORAGE_ERROR, details, details ? { details } : undefined)
    this.name = 'TemplateStorageError'
  }
}
