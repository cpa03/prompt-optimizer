/**
 * Template Constants Module
 * Eliminates hardcoded timestamps and magic numbers in templates
 * Flexy loves modularity! All values are now environment-configurable.
 */

import { getEnvInt, getEnvString } from '../config/env'

/**
 * Timestamp for built-in templates (2024-01-01 00:00:00 UTC)
 * Used as the creation date for immutable system templates
 * Environment-configurable for build-time customization
 */
export const BUILTIN_TEMPLATE_TIMESTAMP = getEnvInt('TEMPLATE_BUILTIN_TIMESTAMP', 1704067200000)

/**
 * Timestamp for image templates (2025-01-07 00:00:00 UTC)
 * Used for newer image optimization templates
 * Environment-configurable for build-time customization
 */
export const IMAGE_TEMPLATE_TIMESTAMP = getEnvInt('TEMPLATE_IMAGE_TIMESTAMP', 1736208000000)

/**
 * DJB2 hash algorithm seed value
 * Used for consistent string hashing across the application
 * Environment-configurable for custom hash implementations
 */
export const DJB2_HASH_SEED = getEnvInt('DJB2_HASH_SEED', 5381)

/**
 * Template version constants
 * Centralized version management for all template types
 * Flexy hates hardcoded version strings - now they're env-configurable!
 */
export const TEMPLATE_VERSIONS = {
  // Base template versions
  V1_0_0: '1.0.0',
  V1_3_0: '1.3.0',
  V2_0_0: '2.0.0',
  V2_1_0: '2.1.0',
  V3_0_0: '3.0.0',

  // Current active versions by template type - now environment-configurable
  CONTEXT: getEnvString('TEMPLATE_VERSION_CONTEXT', '1.0.0'),
  IMAGE: getEnvString('TEMPLATE_VERSION_IMAGE', '1.0.0'),
  EVALUATION: getEnvString('TEMPLATE_VERSION_EVALUATION', '3.0.0'),
  ITERATE: getEnvString('TEMPLATE_VERSION_ITERATE', '3.0.0'),
  OPTIMIZE_GENERAL: getEnvString('TEMPLATE_VERSION_OPTIMIZE_GENERAL', '1.3.0'),
  OPTIMIZE_ANALYTICAL: getEnvString('TEMPLATE_VERSION_OPTIMIZE_ANALYTICAL', '2.1.0'),
  USER_OPTIMIZE: getEnvString('TEMPLATE_VERSION_USER_OPTIMIZE', '2.0.0'),
} as const

/**
 * Model context length limits
 * Centralized configuration for different LLM providers
 * Now environment-configurable for provider updates without code changes
 */
export const MODEL_CONTEXT_LIMITS = {
  // Default context lengths
  DEFAULT: getEnvInt('MODEL_CONTEXT_DEFAULT', 4096),
  SMALL: getEnvInt('MODEL_CONTEXT_SMALL', 8192),

  // Provider-specific limits - now environment-configurable
  GPT4O: getEnvInt('MODEL_CONTEXT_GPT4O', 128000),
  GEMINI: getEnvInt('MODEL_CONTEXT_GEMINI', 1000000),
  CLAUDE: getEnvInt('MODEL_CONTEXT_CLAUDE', 200000),
  DEEPSEEK: getEnvInt('MODEL_CONTEXT_DEEPSEEK', 64000),
  ZHIPU: getEnvInt('MODEL_CONTEXT_ZHIPU', 128000),

  // Legacy exports for backwards compatibility - environment-configurable
  OPENAI_DEFAULT: getEnvInt('MODEL_CONTEXT_OPENAI_DEFAULT', 1000000),
  GEMINI_DEFAULT: getEnvInt('MODEL_CONTEXT_GEMINI_DEFAULT', 200000),
  OTHER_DEFAULT: getEnvInt('MODEL_CONTEXT_OTHER_DEFAULT', 64000),
} as const

/**
 * Retry and timeout configuration
 * Eliminates magic numbers in retry logic - now environment-configurable
 */
export const RETRY_CONFIG = {
  // Maximum attempts for polling operations
  MAX_POLL_ATTEMPTS: getEnvInt('RETRY_MAX_POLL_ATTEMPTS', 60),
  DEFAULT_POLL_ATTEMPTS: getEnvInt('RETRY_DEFAULT_POLL_ATTEMPTS', 120),

  // Retry adjustment factors
  STREAM_RETRY_REDUCTION: getEnvInt('RETRY_STREAM_REDUCTION', 3),
  STANDARD_RETRY_REDUCTION: getEnvInt('RETRY_STANDARD_REDUCTION', 2),
} as const

/**
 * Error handling configuration - now environment-configurable
 */
export const ERROR_CONFIG = {
  // Maximum length for error messages
  MAX_MESSAGE_LENGTH: getEnvInt('ERROR_MAX_MESSAGE_LENGTH', 200),
} as const

/**
 * Context and configuration versions - now environment-configurable
 */
export const CONFIG_VERSIONS = {
  CONTEXT: getEnvString('CONFIG_VERSION_CONTEXT', '1.0.0'),
} as const
