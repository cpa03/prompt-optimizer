/**
 * Core constraints and limits
 * Centralizes all validation limits and constraints for easy maintenance
 */

// Validation constraints
export const VALIDATION_CONSTRAINTS = {
  // Key length limits
  KEY_MAX_LENGTH: 50,
  KEY_MIN_LENGTH: 1,
  
  // Value length limits  
  VALUE_MAX_LENGTH: 1000,
  
  // Variable constraints
  VARIABLE_NAME_MAX_LENGTH: 50,
  VARIABLE_VALUE_MAX_LENGTH: 10000,
  VARIABLE_DISPLAY_MAX_LENGTH: 5000,
  VARIABLE_HISTORY_MAX_ITEMS: 50,
  
  // Cache constraints
  MAX_CACHE_SIZE: 100,
  
  // Input history constraints
  INPUT_HISTORY_MAX_ITEMS: 50,
  INPUT_HISTORY_MERGE_THRESHOLD_MS: 1000,
  
  // Description length
  MAX_DESCRIPTION_LENGTH: 200,
} as const

// Storage constraints
export const STORAGE_CONSTRAINTS = {
  // Write delay for batching
  WRITE_DELAY_MS: 500,
  MAX_FLUSH_TIME_MS: 3000,
  
  // Large value threshold
  LARGE_VALUE_THRESHOLD: 10000,
  
  // Maximum file operations
  MAX_CONCURRENT_WRITES: 3,
} as const

// Prompt constraints
export const PROMPT_CONSTRAINTS = {
  // Max length for prompt display
  MAX_DISPLAY_LENGTH: 200,
  
  // Template complexity threshold
  HIGH_COMPLEXITY_THRESHOLD: 0.8,
  HIGH_LENGTH_THRESHOLD: 1000,
} as const

// LLM constraints
export const LLM_CONSTRAINTS = {
  // Default token limits
  DEFAULT_MAX_TOKENS: 8192,
  MIN_THINKING_BUDGET_TOKENS: 1024,
  
  // Context length limits by provider
  MAX_CONTEXT_LENGTH_CLAUDE: 128000,
  MAX_CONTEXT_LENGTH_GEMINI: 1000000,
  MAX_CONTEXT_LENGTH_GPT4: 200000,
  MAX_CONTEXT_LENGTH_DEFAULT: 8192,
} as const

// Image constraints
export const IMAGE_CONSTRAINTS = {
  // Polling intervals
  DEFAULT_POLL_INTERVAL_MS: 2000,
  
  // Image size limits (in bytes)
  MAX_IMAGE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  
  // Supported MIME types
  SUPPORTED_MIME_TYPES: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
} as const

// Session constraints
export const SESSION_CONSTRAINTS = {
  // Timeouts
  INIT_TIMEOUT_MS: 5000,
  RETRY_DELAY_MS: 50,
  INIT_DELAY_MS: 0,
  
  // GC and cleanup
  GC_DELAY_MS: 0,
  MEMORY_CHECK_INTERVAL_MS: 5000,
} as const

// API constraints
export const API_CONSTRAINTS = {
  // Timeout defaults
  DEFAULT_TIMEOUT_MS: 5000,
  LONG_OPERATION_TIMEOUT_MS: 10000,
  
  // Rate limiting
  MIN_REQUEST_DELAY_MS: 100,
  MAX_REQUEST_DELAY_MS: 1000,
  
  // Pagination
  DEFAULT_PAGE_SIZE: 100,
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
} as const
