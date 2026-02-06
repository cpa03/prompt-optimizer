/**
 * Application constants configuration
 * Centralizes all hardcoded values for easy maintenance and customization
 */

// Time constants (in milliseconds)
export const TIME_CONSTANTS = {
  // Toast notifications
  TOAST_DURATION: 3000,
  
  // Cache expiration
  CACHE_EXPIRY_MS: 5 * 60 * 1000, // 5 minutes
  
  // Session timeouts
  SESSION_TIMEOUT_MS: 5000, // 5 seconds
  SESSION_RETRY_DELAY_MS: 50,
  SESSION_INIT_DELAY_MS: 0,
  
  // Debounce/Throttle defaults
  DEFAULT_DEBOUNCE_MS: 150,
  DEFAULT_THROTTLE_MS: 1000,
  THROTTLE_RESET_MS: 10000,
  
  // GC and cleanup
  GC_DELAY_MS: 0,
  MEMORY_CHECK_INTERVAL_MS: 5000,
  
  // Data persistence
  PERSISTENCE_DEBOUNCE_MS: 1000,
  
  // Input history
  INPUT_HISTORY_MERGE_THRESHOLD_MS: 1000,
  
  // Update check
  UPDATE_CHECK_DELAY_MS: 3000,
  
  // Cache max age (7 days)
  CACHE_MAX_AGE_MS: 7 * 24 * 60 * 60 * 1000,
} as const

// Variable constraints
export const VARIABLE_CONSTRAINTS = {
  MAX_NAME_LENGTH: 50,
  MAX_VALUE_LENGTH: 10000,
  MAX_DISPLAY_LENGTH: 5000,
  MAX_HISTORY_ITEMS: 50,
} as const

// UI constants
export const UI_CONSTANTS = {
  // Animation durations
  ANIMATION_DURATION_MS: 300,
  FEEDBACK_DURATION_MS: 1000,
  
  // Layout
  MAX_DESCRIPTION_LENGTH: 100,
  DEFAULT_ROWS: 3,
  MAX_ROWS: 20,
  
  // Responsive breakpoints
  MOBILE_BREAKPOINT_PX: 768,
  TABLET_BREAKPOINT_PX: 1024,
} as const

// Template processing
export const TEMPLATE_CONSTANTS = {
  HIGH_COMPLEXITY_THRESHOLD: 0.8,
  HIGH_LENGTH_THRESHOLD: 1000,
} as const

// Z-index scale
export const Z_INDEX = {
  BASE: 1,
  DROPDOWN: 100,
  STICKY: 200,
  MODAL: 1000,
  POPOVER: 2000,
  TOOLTIP: 3000,
  TOAST: 4000,
  FOCUS_OVERLAY: 10000,
} as const
