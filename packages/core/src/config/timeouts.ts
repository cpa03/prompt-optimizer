/**
 * Timeout Configuration Module
 * Eliminates hardcoded timeout values across the application
 * Flexy loves modularity! All timeouts centralized and configurable.
 */

export const TIMEOUTS = {
  // Default timeouts
  default: 30000,
  short: 5000,
  medium: 10000,
  long: 60000,
  
  // Network-specific timeouts
  network: {
    default: 30000,
    short: 5000,
    medium: 10000,
    long: 60000,
  },
  
  // Service-specific timeouts
  service: {
    llm: 60000,
    image: 120000,
    electronInit: 5000,
    saveOperation: 5000,
    emergencyExit: 10000,
  },
  
  // Retry configuration
  retry: {
    maxAttempts: 5,
    defaultDelay: 1000,
    maxDelay: 10000,
  },
} as const;

export const MAX_SAVE_TIME = TIMEOUTS.service.saveOperation;
export const EMERGENCY_EXIT_TIME = TIMEOUTS.service.emergencyExit;
