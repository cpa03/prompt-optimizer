/**
 * UI Package Utilities
 * Centralized utility functions for the UI package
 */

// Date utilities
export { formatDate, formatDateShort, formatTime, formatRelativeTime } from './date'

// Text utilities
export { truncateText, truncateMiddle, capitalize, camelToTitle, normalizeWhitespace } from './text'

// Platform utilities
export { type Platform, getPlatform, platform } from './platform'

// Error utilities
export {
  type ExtendedError,
  AppError,
  getErrorMessage,
  getI18nErrorMessage,
  isExtendedError,
  asExtendedError,
  getDetailedErrorMessage,
  createExtendedError,
  createErrorHandler,
  logErrorInDev,
} from './error'

// Data transformer utilities
export { DataTransformer, OptionAccessors } from './data-transformer'

// Prompt variable utilities
export {
  type ForbiddenTemplateSyntax,
  scanVariableNames,
  findForbiddenTemplateSyntax,
  findMissingVariables,
  replaceVariablesInContent,
  hashString,
  stableStringifyVars,
  hashVariables,
  type PromptExecutionContext,
  buildPromptExecutionContext,
} from './prompt-variables'
