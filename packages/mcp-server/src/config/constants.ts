/**
 * MCP Server Constants
 * Centralizes all hardcoded values for easy maintenance and configuration
 * Flexy loves modularity! No more hardcoded magic numbers.
 */

// Rate Limiter Constants
export const RATE_LIMITER_CONSTANTS = {
  // Default time window in milliseconds (1 minute)
  DEFAULT_WINDOW_MS: 60 * 1000,
  // Maximum requests per window
  DEFAULT_MAX_REQUESTS: 100,
  // Cleanup interval in milliseconds (5 minutes)
  DEFAULT_CLEANUP_INTERVAL_MS: 5 * 60 * 1000,
  // Maximum entries before force cleanup
  MAX_ENTRIES_THRESHOLD: 10000,
  // Target entries after force cleanup
  TARGET_ENTRIES_AFTER_CLEANUP: 5000,
} as const

// Server Configuration Constants
export const SERVER_CONSTANTS = {
  // Default HTTP port
  DEFAULT_HTTP_PORT: 3000,
  // Port range validation
  MIN_PORT: 1,
  MAX_PORT: 65535,
} as const

// Log Level Constants
export const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const
export type LogLevel = (typeof LOG_LEVELS)[number]

// Default Configuration Constants
export const DEFAULT_CONFIG = {
  LOG_LEVEL: 'debug' as LogLevel,
  DEFAULT_LANGUAGE: 'zh',
  ALLOWED_ORIGINS_WILDCARD: '*',
} as const
