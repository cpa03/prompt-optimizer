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

// Spacing system (in pixels) - for consistent margins, paddings, and gaps
export const SPACING = {
  // Base spacing units
  XS: 4,
  SM: 8,
  MD: 12,
  LG: 16,
  XL: 20,
  XXL: 24,
  XXXL: 32,

  // Component-specific spacing
  GAP_SMALL: 8,
  GAP_MEDIUM: 12,
  GAP_LARGE: 16,

  PADDING_SMALL: 12,
  PADDING_MEDIUM: 16,
  PADDING_LARGE: 24,

  MARGIN_SMALL: 8,
  MARGIN_MEDIUM: 12,
  MARGIN_LARGE: 16,
} as const

// Font sizes (in pixels) - for consistent typography
export const FONT_SIZES = {
  XS: 12,
  SM: 13,
  BASE: 14,
  LG: 16,
  XL: 18,
  XXL: 20,
  XXXL: 24,
} as const

// Border radius values (in pixels or CSS values)
export const BORDER_RADIUS = {
  NONE: '0',
  SM: '2px',
  MD: '4px',
  LG: '6px',
  XL: '8px',
  XXL: '12px',
  FULL: '9999px',
} as const

// Evaluation score colors - for consistent scoring visualization
export const EVALUATION_COLORS = {
  // Score level colors
  EXCELLENT: '#18a058',      // Green - high scores
  GOOD: '#2080f0',           // Blue - good scores
  AVERAGE: '#f0a020',        // Orange/Yellow - average scores
  POOR: '#d03050',           // Red - poor scores
  CRITICAL: '#d03050',       // Red - critical scores (same as poor)
  
  // Background colors (with transparency)
  EXCELLENT_BG: 'rgba(24, 160, 88, 0.15)',
  GOOD_BG: 'rgba(32, 128, 240, 0.15)',
  AVERAGE_BG: 'rgba(240, 160, 32, 0.15)',
  POOR_BG: 'rgba(208, 48, 80, 0.15)',
  CRITICAL_BG: 'rgba(208, 48, 80, 0.2)',
  
  // Text colors for dark backgrounds
  TEXT_ON_EXCELLENT: '#ffffff',
  TEXT_ON_GOOD: '#ffffff',
  TEXT_ON_AVERAGE: '#000000',
  TEXT_ON_POOR: '#ffffff',
  TEXT_ON_CRITICAL: '#ffffff',
} as const

// Theme color palette - for consistent theming
export const THEME_COLORS = {
  // Primary colors
  PRIMARY: '#2080f0',
  PRIMARY_LIGHT: '#60a5fa',
  PRIMARY_DARK: '#1a6bc7',
  
  // Success colors
  SUCCESS: '#18a058',
  SUCCESS_LIGHT: '#22c55e',
  
  // Warning colors
  WARNING: '#f0a020',
  WARNING_LIGHT: '#fbbf24',
  
  // Error colors
  ERROR: '#d03050',
  ERROR_LIGHT: '#ef4444',
  
  // Info colors
  INFO: '#2080f0',
  INFO_LIGHT: '#60a5fa',
  
  // Neutral colors
  NEUTRAL_100: '#ffffff',
  NEUTRAL_200: '#f5f5f5',
  NEUTRAL_300: '#e0e0e6',
  NEUTRAL_400: '#999999',
  NEUTRAL_500: '#666666',
  NEUTRAL_600: '#333333',
  NEUTRAL_700: '#000000',
} as const

// Semantic colors - for specific UI elements
export const SEMANTIC_COLORS = {
  // Required field indicator
  REQUIRED: '#ff4d4f',
  
  // Favorite/star
  FAVORITE: '#f0a020',
  FAVORITE_ACTIVE: '#f0a020',
  
  // Theme-specific
  THEME_LIGHT: '#eab308',
  THEME_DARK: '#60a5fa',
  THEME_BLUE: '#2563eb',
  THEME_GREEN: '#16a34a',
  THEME_PURPLE: '#9333ea',
  THEME_CLASSIC: '#b08968',
} as const

// Icon sizes (in pixels) - for consistent icon sizing
export const ICON_SIZES = {
  XS: 12,
  SM: 16,
  MD: 20,
  LG: 24,
  XL: 32,
  XXL: 48,
} as const
