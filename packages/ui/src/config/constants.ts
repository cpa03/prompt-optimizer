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

// UI Dimensions (widths, heights, in pixels or CSS values)
export const UI_DIMENSIONS = {
  // Modal widths
  MODAL_WIDTH_COMPACT: '500px',
  MODAL_WIDTH_SMALL: '600px',
  MODAL_WIDTH_MEDIUM: '800px',
  MODAL_WIDTH_LARGE: '1200px',
  MODAL_WIDTH_XL: '1400px',

  // Sidebar widths by mode
  SIDEBAR_WIDTH_BASIC: 220,
  SIDEBAR_WIDTH_IMAGE: 260,

  // Scrollbar max heights
  SCROLLBAR_MAX_HEIGHT_SMALL: 200,
  SCROLLBAR_MAX_HEIGHT_MEDIUM: 400,
  SCROLLBAR_MAX_HEIGHT_LARGE: 500,

  // Column widths for tables
  TABLE_COL_WIDTH_NAME: 200,
  TABLE_COL_WIDTH_TYPE: 80,
  TABLE_COL_WIDTH_VALUE: 200,
  TABLE_COL_WIDTH_ACTIONS: 160,
} as const

// Animation and transition constants
export const ANIMATION_CONSTANTS = {
  // Durations (in ms)
  TRANSITION_DURATION_MS: 120,
  HOVER_TRANSITION_MS: 200,
  FEEDBACK_ANIMATION_MS: 300,
  COPY_SUCCESS_DURATION_MS: 1500,

  // Easing functions
  TRANSITION_EASING: 'ease',
  TRANSITION_CUBIC_BEZIER: 'cubic-bezier(0.4, 0, 0.2, 1)',

  // Border radius values
  BORDER_RADIUS_PILL: '999px',
  BORDER_RADIUS_SMALL: '2px',
  BORDER_RADIUS_MEDIUM: '4px',
  BORDER_RADIUS_LARGE: '6px',
  BORDER_RADIUS_XL: '8px',
  BORDER_RADIUS_ROUND: '50%',
} as const

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  // Frame timing (60fps = 16.67ms)
  TARGET_FPS_MS: 16,
  MAX_RENDER_TIME_MS: 32,

  // Memory thresholds (in bytes)
  MEMORY_WARNING_BYTES: 50 * 1024 * 1024, // 50MB
  MEMORY_CRITICAL_BYTES: 100 * 1024 * 1024, // 100MB

  // Update frequency
  UPDATE_COUNT_WARNING: 50,
  UPDATE_COUNT_CRITICAL: 100,
  UPDATE_RENDER_RATIO_WARNING: 10,

  // Timeouts
  API_TIMEOUT_MS: 5000,
  LONG_OPERATION_TIMEOUT_MS: 10000,
} as const

// Responsive breakpoints (in pixels)
export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 768,
  DESKTOP: 1024,
  LARGE: 1200,
} as const
