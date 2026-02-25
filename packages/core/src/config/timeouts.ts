/**
 * Timeout Configuration Module
 * Eliminates hardcoded timeout values across the application
 * Flexy loves modularity! All timeouts centralized and configurable via environment.
 */

import { getEnvInt } from './env'

// Base timeout values - all configurable via environment variables
export const TIMEOUTS = {
  // Default timeouts
  default: getEnvInt('VITE_TIMEOUT_DEFAULT', 30000),
  short: getEnvInt('VITE_TIMEOUT_SHORT', 5000),
  medium: getEnvInt('VITE_TIMEOUT_MEDIUM', 10000),
  long: getEnvInt('VITE_TIMEOUT_LONG', 60000),

  // Network-specific timeouts
  network: {
    default: getEnvInt('VITE_NETWORK_TIMEOUT_DEFAULT', 30000),
    short: getEnvInt('VITE_NETWORK_TIMEOUT_SHORT', 5000),
    medium: getEnvInt('VITE_NETWORK_TIMEOUT_MEDIUM', 10000),
    long: getEnvInt('VITE_NETWORK_TIMEOUT_LONG', 60000),
  },

  // Service-specific timeouts
  service: {
    llm: getEnvInt('VITE_LLM_TIMEOUT', 60000),
    image: getEnvInt('VITE_IMAGE_TIMEOUT', 120000),
    electronInit: getEnvInt('VITE_ELECTRON_INIT_TIMEOUT', 5000),
    saveOperation: getEnvInt('VITE_SAVE_TIMEOUT', 5000),
    emergencyExit: getEnvInt('VITE_EMERGENCY_EXIT_TIMEOUT', 10000),
  },

  // Retry configuration
  retry: {
    maxAttempts: getEnvInt('VITE_RETRY_MAX_ATTEMPTS', 5),
    defaultDelay: getEnvInt('VITE_RETRY_DELAY', 1000),
    maxDelay: getEnvInt('VITE_RETRY_MAX_DELAY', 10000),
  },

  // Circuit breaker configuration
  circuitBreaker: {
    failureThreshold: getEnvInt('VITE_CIRCUIT_BREAKER_FAILURE_THRESHOLD', 5),
    successThreshold: getEnvInt('VITE_CIRCUIT_BREAKER_SUCCESS_THRESHOLD', 3),
    timeout: getEnvInt('VITE_CIRCUIT_BREAKER_TIMEOUT', 30000),
    resetTimeout: getEnvInt('VITE_CIRCUIT_BREAKER_RESET_TIMEOUT', 60000),
  },

  // Error-specific retry delays (based on error classification)
  errorRetryDelay: {
    rateLimit: getEnvInt('VITE_ERROR_RETRY_DELAY_RATE_LIMIT', 60000), // 1 minute for rate limits
    server: getEnvInt('VITE_ERROR_RETRY_DELAY_SERVER', 5000), // 5 seconds for server errors
    timeout: getEnvInt('VITE_ERROR_RETRY_DELAY_TIMEOUT', 2000), // 2 seconds for timeouts
    network: getEnvInt('VITE_ERROR_RETRY_DELAY_NETWORK', 3000), // 3 seconds for network errors
    default: getEnvInt('VITE_ERROR_RETRY_DELAY_DEFAULT', 1000), // 1 second default
  },
} as const

// Export commonly used timeout values for convenience
export const MAX_SAVE_TIME = TIMEOUTS.service.saveOperation
export const EMERGENCY_EXIT_TIME = TIMEOUTS.service.emergencyExit
export const LLM_TIMEOUT = TIMEOUTS.service.llm
export const IMAGE_TIMEOUT = TIMEOUTS.service.image
