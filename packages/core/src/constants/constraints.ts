/**
 * Core constraints and limits
 * Centralizes all validation limits and constraints for easy maintenance
 * Flexy loves modularity - all values are now environment-configurable!
 */

import { getEnvInt } from '../config/env'

// Validation constraints - now environment-configurable
export const VALIDATION_CONSTRAINTS = {
  // Key length limits
  KEY_MAX_LENGTH: getEnvInt('VALIDATION_KEY_MAX_LENGTH', 50),
  KEY_MIN_LENGTH: getEnvInt('VALIDATION_KEY_MIN_LENGTH', 1),

  // Value length limits
  VALUE_MAX_LENGTH: getEnvInt('VALIDATION_VALUE_MAX_LENGTH', 1000),

  // Variable constraints
  VARIABLE_NAME_MAX_LENGTH: getEnvInt('VALIDATION_VARIABLE_NAME_MAX_LENGTH', 50),
  VARIABLE_VALUE_MAX_LENGTH: getEnvInt('VALIDATION_VARIABLE_VALUE_MAX_LENGTH', 10000),
  VARIABLE_DISPLAY_MAX_LENGTH: getEnvInt('VALIDATION_VARIABLE_DISPLAY_MAX_LENGTH', 5000),
  VARIABLE_HISTORY_MAX_ITEMS: getEnvInt('VALIDATION_VARIABLE_HISTORY_MAX_ITEMS', 50),

  // Cache constraints
  MAX_CACHE_SIZE: getEnvInt('VALIDATION_MAX_CACHE_SIZE', 100),

  // Input history constraints
  INPUT_HISTORY_MAX_ITEMS: getEnvInt('VALIDATION_INPUT_HISTORY_MAX_ITEMS', 50),
  INPUT_HISTORY_MERGE_THRESHOLD_MS: getEnvInt('VALIDATION_INPUT_HISTORY_MERGE_THRESHOLD_MS', 1000),

  // Description length
  MAX_DESCRIPTION_LENGTH: getEnvInt('VALIDATION_MAX_DESCRIPTION_LENGTH', 200),
} as const

// Storage constraints - now environment-configurable
export const STORAGE_CONSTRAINTS = {
  // Write delay for batching
  WRITE_DELAY_MS: getEnvInt('STORAGE_WRITE_DELAY_MS', 500),
  MAX_FLUSH_TIME_MS: getEnvInt('STORAGE_MAX_FLUSH_TIME_MS', 3000),

  // Large value threshold
  LARGE_VALUE_THRESHOLD: getEnvInt('STORAGE_LARGE_VALUE_THRESHOLD', 10000),

  // Maximum file operations
  MAX_CONCURRENT_WRITES: getEnvInt('STORAGE_MAX_CONCURRENT_WRITES', 3),

  // Maximum storage size for providers (in bytes, default 5MB for localStorage)
  MAX_STORAGE_SIZE_BYTES: getEnvInt('STORAGE_MAX_SIZE_MB', 5) * 1024 * 1024,

  // Async lock constraints
  LOCK_MAX_ATTEMPTS: getEnvInt('STORAGE_LOCK_MAX_ATTEMPTS', 100),
  LOCK_RETRY_DELAY_MS: getEnvInt('STORAGE_LOCK_RETRY_DELAY_MS', 10),
} as const

// Prompt constraints - now environment-configurable
export const PROMPT_CONSTRAINTS = {
  // Max length for prompt display
  MAX_DISPLAY_LENGTH: getEnvInt('PROMPT_MAX_DISPLAY_LENGTH', 200),

  // Template complexity threshold - stored as integer (0-100) for easier env var usage
  HIGH_COMPLEXITY_THRESHOLD: getEnvInt('PROMPT_HIGH_COMPLEXITY_THRESHOLD', 80) / 100,
  HIGH_LENGTH_THRESHOLD: getEnvInt('PROMPT_HIGH_LENGTH_THRESHOLD', 1000),
} as const

// LLM constraints - now environment-configurable
export const LLM_CONSTRAINTS = {
  // Default token limits
  DEFAULT_MAX_TOKENS: getEnvInt('LLM_DEFAULT_MAX_TOKENS', 8192),
  MIN_THINKING_BUDGET_TOKENS: getEnvInt('LLM_MIN_THINKING_BUDGET_TOKENS', 1024),

  // Context length limits by provider - now environment-configurable
  MAX_CONTEXT_LENGTH_CLAUDE: getEnvInt('LLM_MAX_CONTEXT_LENGTH_CLAUDE', 128000),
  MAX_CONTEXT_LENGTH_GEMINI: getEnvInt('LLM_MAX_CONTEXT_LENGTH_GEMINI', 1000000),
  MAX_CONTEXT_LENGTH_GPT4: getEnvInt('LLM_MAX_CONTEXT_LENGTH_GPT4', 200000),
  MAX_CONTEXT_LENGTH_DEFAULT: getEnvInt('LLM_MAX_CONTEXT_LENGTH_DEFAULT', 8192),
} as const

// Image constraints - now environment-configurable
export const IMAGE_CONSTRAINTS = {
  // Polling intervals
  DEFAULT_POLL_INTERVAL_MS: getEnvInt('IMAGE_DEFAULT_POLL_INTERVAL_MS', 2000),

  // Image size limits (in MB, converted to bytes)
  MAX_IMAGE_SIZE_BYTES: getEnvInt('IMAGE_MAX_SIZE_MB', 10) * 1024 * 1024,

  // Supported MIME types - using env string with comma separation
  SUPPORTED_MIME_TYPES: (() => {
    const envTypes = process?.env?.['IMAGE_SUPPORTED_MIME_TYPES']
    if (envTypes) {
      return envTypes.split(',').map((t) => t.trim())
    }
    return ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
  })(),

  // Image storage constraints
  STORAGE_MAX_AGE_MS: getEnvInt('IMAGE_STORAGE_MAX_AGE_DAYS', 7) * 24 * 60 * 60 * 1000,
  STORAGE_MAX_COUNT: getEnvInt('IMAGE_STORAGE_MAX_COUNT', 100),
  STORAGE_CLEANUP_THRESHOLD: getEnvInt('IMAGE_STORAGE_CLEANUP_THRESHOLD_PERCENT', 80) / 100,
  STORAGE_MIGRATION_CHUNK_SIZE: getEnvInt('IMAGE_STORAGE_MIGRATION_CHUNK_SIZE', 25),
} as const

// Session constraints - now environment-configurable
export const SESSION_CONSTRAINTS = {
  // Timeouts
  INIT_TIMEOUT_MS: getEnvInt('SESSION_INIT_TIMEOUT_MS', 5000),
  RETRY_DELAY_MS: getEnvInt('SESSION_RETRY_DELAY_MS', 50),
  INIT_DELAY_MS: getEnvInt('SESSION_INIT_DELAY_MS', 0),

  // GC and cleanup
  GC_DELAY_MS: getEnvInt('SESSION_GC_DELAY_MS', 0),
  MEMORY_CHECK_INTERVAL_MS: getEnvInt('SESSION_MEMORY_CHECK_INTERVAL_MS', 5000),
} as const

// API constraints - now environment-configurable
export const API_CONSTRAINTS = {
  // Timeout defaults
  DEFAULT_TIMEOUT_MS: getEnvInt('API_DEFAULT_TIMEOUT_MS', 5000),
  LONG_OPERATION_TIMEOUT_MS: getEnvInt('API_LONG_OPERATION_TIMEOUT_MS', 10000),

  // Rate limiting
  MIN_REQUEST_DELAY_MS: getEnvInt('API_MIN_REQUEST_DELAY_MS', 100),
  MAX_REQUEST_DELAY_MS: getEnvInt('API_MAX_REQUEST_DELAY_MS', 1000),

  // Pagination
  DEFAULT_PAGE_SIZE: getEnvInt('API_DEFAULT_PAGE_SIZE', 100),
} as const

// History constraints - now environment-configurable
export const HISTORY_CONSTRAINTS = {
  // Maximum number of records to keep
  MAX_RECORDS: getEnvInt('HISTORY_MAX_RECORDS', 50),
} as const

// Export all constraints
export const CORE_CONSTRAINTS = {
  VALIDATION: VALIDATION_CONSTRAINTS,
  STORAGE: STORAGE_CONSTRAINTS,
  PROMPT: PROMPT_CONSTRAINTS,
  LLM: LLM_CONSTRAINTS,
  IMAGE: IMAGE_CONSTRAINTS,
  SESSION: SESSION_CONSTRAINTS,
  API: API_CONSTRAINTS,
  HISTORY: HISTORY_CONSTRAINTS,
} as const

// Re-export env helpers for convenience
export { getEnvInt, getEnvFloat, getEnvString, getEnvBoolean as getEnvBool } from '../config/env'
