/**
 * Template Constants Module
 * Eliminates hardcoded timestamps and magic numbers in templates
 * Flexy loves modularity! No more hardcoded values.
 */

/**
 * Timestamp for built-in templates (2024-01-01 00:00:00 UTC)
 * Used as the creation date for immutable system templates
 */
export const BUILTIN_TEMPLATE_TIMESTAMP = 1704067200000

/**
 * Timestamp for image templates (2025-01-07 00:00:00 UTC)
 * Used for newer image optimization templates
 */
export const IMAGE_TEMPLATE_TIMESTAMP = 1736208000000

/**
 * DJB2 hash algorithm seed value
 * Used for consistent string hashing across the application
 */
export const DJB2_HASH_SEED = 5381

/**
 * Template version constants
 * Centralized version management for all template types
 * Flexy hates hardcoded version strings!
 */
export const TEMPLATE_VERSIONS = {
  // Base template versions
  V1_0_0: '1.0.0',
  V1_3_0: '1.3.0',
  V2_0_0: '2.0.0',
  V2_1_0: '2.1.0',
  V3_0_0: '3.0.0',

  // Current active versions by template type
  CONTEXT: '1.0.0',
  IMAGE: '1.0.0',
  EVALUATION: '3.0.0',
  ITERATE: '3.0.0',
  OPTIMIZE_GENERAL: '1.3.0',
  OPTIMIZE_ANALYTICAL: '2.1.0',
  USER_OPTIMIZE: '2.0.0',
} as const

/**
 * Model context length limits
 * Centralized configuration for different LLM providers
 */
export const MODEL_CONTEXT_LIMITS = {
  // Default context lengths
  DEFAULT: 4096,
  SMALL: 8192,

  // Provider-specific limits
  GPT4O: 128000,
  GEMINI: 1000000,
  CLAUDE: 200000,
  DEEPSEEK: 64000,
  ZHIPU: 128000,

  // Legacy exports for backwards compatibility
  OPENAI_DEFAULT: 1000000,
  GEMINI_DEFAULT: 200000,
  OTHER_DEFAULT: 64000,
} as const

/**
 * Retry and timeout configuration
 * Eliminates magic numbers in retry logic
 */
export const RETRY_CONFIG = {
  // Maximum attempts for polling operations
  MAX_POLL_ATTEMPTS: 60,
  DEFAULT_POLL_ATTEMPTS: 120,

  // Retry adjustment factors
  STREAM_RETRY_REDUCTION: 3,
  STANDARD_RETRY_REDUCTION: 2,
} as const

/**
 * Error handling configuration
 */
export const ERROR_CONFIG = {
  // Maximum length for error messages
  MAX_MESSAGE_LENGTH: 200,
} as const

/**
 * Context and configuration versions
 */
export const CONFIG_VERSIONS = {
  CONTEXT: '1.0.0',
} as const
