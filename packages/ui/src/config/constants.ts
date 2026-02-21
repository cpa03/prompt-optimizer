/**
 * Application constants configuration
 * Centralizes all hardcoded values for easy maintenance and customization
 * Flexy loves modularity - all values are now environment-configurable!
 */

import { getEnvInt as getViteEnvInt } from '@prompt-optimizer/core'

// Time constants (in milliseconds) - now environment-configurable
export const TIME_CONSTANTS = {
  // Toast notifications
  TOAST_DURATION: getViteEnvInt('VITE_TOAST_DURATION', 3000),
  TOAST_DURATION_LONG: getViteEnvInt('VITE_TOAST_DURATION_LONG', 8000), // For important messages that need user attention

  // Cache expiration
  CACHE_EXPIRY_MS: getViteEnvInt('VITE_CACHE_EXPIRY_MINUTES', 5) * 60 * 1000,

  // Session timeouts
  SESSION_TIMEOUT_MS: getViteEnvInt('VITE_SESSION_TIMEOUT_MS', 5000),
  SESSION_RETRY_DELAY_MS: getViteEnvInt('VITE_SESSION_RETRY_DELAY_MS', 50),
  SESSION_INIT_DELAY_MS: getViteEnvInt('VITE_SESSION_INIT_DELAY_MS', 0),

  // Debounce/Throttle defaults
  DEFAULT_DEBOUNCE_MS: getViteEnvInt('VITE_DEFAULT_DEBOUNCE_MS', 150),
  DEFAULT_THROTTLE_MS: getViteEnvInt('VITE_DEFAULT_THROTTLE_MS', 1000),
  THROTTLE_RESET_MS: getViteEnvInt('VITE_THROTTLE_RESET_MS', 10000),
  DEBOUNCE_INPUT_MS: getViteEnvInt('VITE_DEBOUNCE_INPUT_MS', 100), // For input field debouncing
  THROTTLE_UI_MS: getViteEnvInt('VITE_THROTTLE_UI_MS', 300), // For UI updates like scrolling

  // GC and cleanup
  GC_DELAY_MS: getViteEnvInt('VITE_GC_DELAY_MS', 0),
  MEMORY_CHECK_INTERVAL_MS: getViteEnvInt('VITE_MEMORY_CHECK_INTERVAL_MS', 5000),

  // Data persistence
  PERSISTENCE_DEBOUNCE_MS: getViteEnvInt('VITE_PERSISTENCE_DEBOUNCE_MS', 1000),

  // Input history
  INPUT_HISTORY_MERGE_THRESHOLD_MS: getViteEnvInt('VITE_INPUT_HISTORY_MERGE_THRESHOLD_MS', 1000),

  // Update check
  UPDATE_CHECK_DELAY_MS: getViteEnvInt('VITE_UPDATE_CHECK_DELAY_MS', 3000),

  // Cache max age (7 days)
  CACHE_MAX_AGE_MS: getViteEnvInt('VITE_CACHE_MAX_AGE_DAYS', 7) * 24 * 60 * 60 * 1000,

  // Tooltip delays
  TOOLTIP_DELAY_SHORT: getViteEnvInt('VITE_TOOLTIP_DELAY_SHORT', 200),
  TOOLTIP_DELAY_MEDIUM: getViteEnvInt('VITE_TOOLTIP_DELAY_MEDIUM', 300),
  TOOLTIP_DELAY_LONG: getViteEnvInt('VITE_TOOLTIP_DELAY_LONG', 500),
  TOOLTIP_DURATION_SHORT: getViteEnvInt('VITE_TOOLTIP_DURATION_SHORT', 150),

  // Animation durations
  ANIMATION_DURATION_SCORE: getViteEnvInt('VITE_ANIMATION_DURATION_SCORE', 800),
  ANIMATION_INDICATOR_DURATION: getViteEnvInt('VITE_ANIMATION_INDICATOR_DURATION', 2000),
  ANIMATION_POPOVER_DELAY: getViteEnvInt('VITE_ANIMATION_POPOVER_DELAY', 100),
  ANIMATION_SHORT_DELAY: getViteEnvInt('VITE_ANIMATION_SHORT_DELAY', 200), // For quick UI transitions like hiding popups
  ANIMATION_THEME_SWITCH: getViteEnvInt('VITE_ANIMATION_THEME_SWITCH', 400), // Theme toggle animation duration

  // Button/touch feedback
  PRESS_FEEDBACK_MS: getViteEnvInt('VITE_PRESS_FEEDBACK_MS', 150), // Duration for press feedback animation
  ICON_BOUNCE_MS: getViteEnvInt('VITE_ICON_BOUNCE_MS', 400), // Duration for icon bounce animation

  // Item animations
  ITEM_APPEAR_DELAY_MS: getViteEnvInt('VITE_ITEM_APPEAR_DELAY_MS', 600), // Delay before marking item as seen (for animation)

  // Scroll listener delays
  SCROLL_LISTENER_DELAY_MS: getViteEnvInt('VITE_SCROLL_LISTENER_DELAY_MS', 100),
} as const

// Variable constraints - environment configurable
export const VARIABLE_CONSTRAINTS = {
  MAX_NAME_LENGTH: getViteEnvInt('VITE_VARIABLE_MAX_NAME_LENGTH', 50),
  MAX_VALUE_LENGTH: getViteEnvInt('VITE_VARIABLE_MAX_VALUE_LENGTH', 10000),
  MAX_DISPLAY_LENGTH: getViteEnvInt('VITE_VARIABLE_MAX_DISPLAY_LENGTH', 5000),
  MAX_HISTORY_ITEMS: getViteEnvInt('VITE_VARIABLE_MAX_HISTORY_ITEMS', 50),
} as const

// UI constants - environment configurable
export const UI_CONSTANTS = {
  // Animation durations
  ANIMATION_DURATION_MS: getViteEnvInt('VITE_ANIMATION_DURATION_MS', 300),
  FEEDBACK_DURATION_MS: getViteEnvInt('VITE_FEEDBACK_DURATION_MS', 1000),

  // Layout
  MAX_DESCRIPTION_LENGTH: getViteEnvInt('VITE_MAX_DESCRIPTION_LENGTH', 100),
  DEFAULT_ROWS: getViteEnvInt('VITE_DEFAULT_ROWS', 3),
  MAX_ROWS: getViteEnvInt('VITE_MAX_ROWS', 20),

  // Responsive breakpoints
  MOBILE_BREAKPOINT_PX: getViteEnvInt('VITE_MOBILE_BREAKPOINT_PX', 768),
  TABLET_BREAKPOINT_PX: getViteEnvInt('VITE_TABLET_BREAKPOINT_PX', 1024),
} as const

// Template processing - environment configurable
export const TEMPLATE_CONSTANTS = {
  HIGH_COMPLEXITY_THRESHOLD: getViteEnvInt('VITE_HIGH_COMPLEXITY_THRESHOLD', 80) / 100,
  HIGH_LENGTH_THRESHOLD: getViteEnvInt('VITE_HIGH_LENGTH_THRESHOLD', 1000),
} as const

// Z-index scale - environment configurable for theme flexibility
export const Z_INDEX = {
  BASE: getViteEnvInt('VITE_Z_INDEX_BASE', 1),
  DROPDOWN: getViteEnvInt('VITE_Z_INDEX_DROPDOWN', 100),
  STICKY: getViteEnvInt('VITE_Z_INDEX_STICKY', 200),
  MODAL: getViteEnvInt('VITE_Z_INDEX_MODAL', 1000),
  POPOVER: getViteEnvInt('VITE_Z_INDEX_POPOVER', 2000),
  TOOLTIP: getViteEnvInt('VITE_Z_INDEX_TOOLTIP', 3000),
  TOAST: getViteEnvInt('VITE_Z_INDEX_TOAST', 4000),
  FOCUS_OVERLAY: getViteEnvInt('VITE_Z_INDEX_FOCUS_OVERLAY', 10000),
} as const

// UI Dimensions (widths, heights, in pixels or CSS values)
export const UI_DIMENSIONS = {
  // Drawer widths
  DRAWER_WIDTH: 420,

  // Modal widths
  MODAL_WIDTH_COMPACT: '500px',
  MODAL_WIDTH_SMALL: '600px',
  MODAL_WIDTH_MEDIUM: '800px',
  MODAL_WIDTH_LARGE: '1200px',
  MODAL_WIDTH_XL: '1400px',

  // Modal viewport-relative sizes
  MODAL_WIDTH_VW: '90vw',
  MODAL_HEIGHT_VH: '90vh',
  MODAL_WIDTH_VW_SMALL: 'min(520px, 90vw)',
  MODAL_SIZE_LARGE: { width: 'min(800px, 90vw)', height: 'min(600px, 80vh)' },

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

// Performance thresholds - environment configurable
export const PERFORMANCE_THRESHOLDS = {
  // Frame timing (60fps = 16.67ms)
  TARGET_FPS_MS: getViteEnvInt('VITE_TARGET_FPS_MS', 16),
  MAX_RENDER_TIME_MS: getViteEnvInt('VITE_MAX_RENDER_TIME_MS', 32),

  // Memory thresholds (in MB, converted to bytes)
  MEMORY_WARNING_BYTES: getViteEnvInt('VITE_MEMORY_WARNING_MB', 50) * 1024 * 1024,
  MEMORY_CRITICAL_BYTES: getViteEnvInt('VITE_MEMORY_CRITICAL_MB', 100) * 1024 * 1024,

  // Update frequency
  UPDATE_COUNT_WARNING: getViteEnvInt('VITE_UPDATE_COUNT_WARNING', 50),
  UPDATE_COUNT_CRITICAL: getViteEnvInt('VITE_UPDATE_COUNT_CRITICAL', 100),
  UPDATE_RENDER_RATIO_WARNING: getViteEnvInt('VITE_UPDATE_RENDER_RATIO_WARNING', 10),

  // Timeouts
  API_TIMEOUT_MS: getViteEnvInt('VITE_API_TIMEOUT_MS', 5000),
  LONG_OPERATION_TIMEOUT_MS: getViteEnvInt('VITE_LONG_OPERATION_TIMEOUT_MS', 10000),
} as const

// Responsive breakpoints (in pixels) - environment configurable
export const BREAKPOINTS = {
  MOBILE: getViteEnvInt('VITE_BREAKPOINT_MOBILE', 640),
  TABLET: getViteEnvInt('VITE_BREAKPOINT_TABLET', 768),
  DESKTOP: getViteEnvInt('VITE_BREAKPOINT_DESKTOP', 1024),
  LARGE: getViteEnvInt('VITE_BREAKPOINT_LARGE', 1200),
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
  XXXXL: 32,
} as const

// Font weights - for consistent typography
export const FONT_WEIGHTS = {
  NORMAL: 400,
  MEDIUM: 500,
  SEMIBOLD: 600,
  BOLD: 700,
} as const

// Line heights - for consistent text layout
export const LINE_HEIGHTS = {
  TIGHT: 1.25,
  NORMAL: 1.5,
  RELAXED: 1.6,
  LOOSE: 1.75,
} as const

// Typography utility values - for consistent text styling
export const TYPOGRAPHY = {
  MAX_WIDTH_TOOLTIP: '320px',
  MAX_WIDTH_POPOVER: '400px',
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
  EXCELLENT: '#18a058', // Green - high scores
  GOOD: '#2080f0', // Blue - good scores
  AVERAGE: '#f0a020', // Orange/Yellow - average scores
  POOR: '#d03050', // Red - poor scores
  CRITICAL: '#d03050', // Red - critical scores (same as poor)

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

// Theme icon colors - used in ThemeToggleUI component
export const THEME_ICON_COLORS = {
  LIGHT: '#eab308', // yellow-500
  DARK: '#60a5fa', // blue-400
  BLUE: '#2563eb', // blue-600
  GREEN: '#16a34a', // green-600
  PURPLE: '#9333ea', // purple-600
  CLASSIC: '#b08968', // classic brown
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

// File size limits (in MB, converted to bytes) - environment configurable
export const FILE_SIZE_LIMITS = {
  // Maximum upload size for variable files
  MAX_VARIABLE_FILE_SIZE_BYTES: getViteEnvInt('VITE_MAX_VARIABLE_FILE_SIZE_MB', 10) * 1024 * 1024,
  // Maximum upload size for images
  MAX_IMAGE_FILE_SIZE_BYTES: getViteEnvInt('VITE_MAX_IMAGE_FILE_SIZE_MB', 10) * 1024 * 1024,
  // Maximum cache size
  MAX_CACHE_SIZE_BYTES: getViteEnvInt('VITE_MAX_CACHE_SIZE_MB', 50) * 1024 * 1024,
} as const

// Layout constants - environment configurable
export const LAYOUT_CONSTANTS = {
  // Test column configuration
  TEST_COLUMN: {
    DEFAULT_COUNT: getViteEnvInt('VITE_TEST_COLUMN_DEFAULT_COUNT', 2),
    MIN_COUNT: getViteEnvInt('VITE_TEST_COLUMN_MIN_COUNT', 2),
    MAX_COUNT: getViteEnvInt('VITE_TEST_COLUMN_MAX_COUNT', 4),
    VALID_COUNTS: [2, 3, 4] as const,
  },

  // Split panel configuration
  SPLIT_PANEL: {
    DEFAULT_LEFT_PCT: getViteEnvInt('VITE_SPLIT_PANEL_DEFAULT_LEFT_PCT', 50),
    MIN_LEFT_PCT: getViteEnvInt('VITE_SPLIT_PANEL_MIN_LEFT_PCT', 20),
    MAX_LEFT_PCT: getViteEnvInt('VITE_SPLIT_PANEL_MAX_LEFT_PCT', 80),
  },
} as const

// Calculation constants - for consistent math operations
export const CALCULATION_CONSTANTS = {
  // Percentage calculations
  PERCENTAGE_FACTOR: 100, // Multiply to get percentage, divide to get decimal

  // Time calculations (in milliseconds)
  MS_PER_SECOND: 1000,
  MS_PER_MINUTE: 60 * 1000,
  MS_PER_HOUR: 60 * 60 * 1000,
  MS_PER_DAY: 24 * 60 * 60 * 1000,

  // Bytes conversions
  BYTES_PER_KB: 1024,
  BYTES_PER_MB: 1024 * 1024,
  BYTES_PER_GB: 1024 * 1024 * 1024,
} as const

// Component-specific constants - environment configurable where applicable
export const COMPONENT_CONSTANTS = {
  // VariableImporter
  VARIABLE_IMPORTER: {
    UPLOAD_AREA_PADDING: getViteEnvInt('VITE_UPLOAD_AREA_PADDING', 24),
    UPLOAD_ICON_SIZE: getViteEnvInt('VITE_UPLOAD_ICON_SIZE', 48),
    UPLOAD_ICON_MARGIN_BOTTOM: getViteEnvInt('VITE_UPLOAD_ICON_MARGIN_BOTTOM', 12),
    MONOSPACE_FONT_SIZE: getViteEnvInt('VITE_MONOSPACE_FONT_SIZE', 13),
    HELP_TEXT_FONT_SIZE: getViteEnvInt('VITE_HELP_TEXT_FONT_SIZE', 12),
    PREVIEW_MAX_HEIGHT: getViteEnvInt('VITE_PREVIEW_MAX_HEIGHT', 240),
    MODAL_MAX_WIDTH: '90vw',
    MAX_FILE_SIZE_BYTES: FILE_SIZE_LIMITS.MAX_VARIABLE_FILE_SIZE_BYTES,
  },

  // TextModelEditModal
  TEXT_MODEL_EDIT_MODAL: {
    WIDTH: '90vw',
    MAX_WIDTH: getViteEnvInt('VITE_TEXT_MODEL_EDIT_MODAL_MAX_WIDTH', 1000),
    DIVIDER_MARGIN: '12px 0',
    SECTION_TITLE_FONT_SIZE: getViteEnvInt('VITE_SECTION_TITLE_FONT_SIZE', 14),
    INPUT_PADDING: '0 4px',
  },

  // General modal content
  MODAL_CONTENT: {
    PADDING_SMALL: getViteEnvInt('VITE_MODAL_PADDING_SMALL', 12),
    PADDING_MEDIUM: getViteEnvInt('VITE_MODAL_PADDING_MEDIUM', 16),
    PADDING_LARGE: getViteEnvInt('VITE_MODAL_PADDING_LARGE', 24),
    GAP_SMALL: getViteEnvInt('VITE_MODAL_GAP_SMALL', 8),
    GAP_MEDIUM: getViteEnvInt('VITE_MODAL_GAP_MEDIUM', 12),
    GAP_LARGE: getViteEnvInt('VITE_MODAL_GAP_LARGE', 16),
  },

  // Workspace panels
  WORKSPACE: {
    PANEL_MIN_HEIGHT: getViteEnvInt('VITE_WORKSPACE_PANEL_MIN_HEIGHT', 200),
    FONT_SIZE_HEADER: getViteEnvInt('VITE_WORKSPACE_FONT_SIZE_HEADER', 18),
    FONT_SIZE_LABEL: getViteEnvInt('VITE_WORKSPACE_FONT_SIZE_LABEL', 12),
    BUTTON_WIDTH: getViteEnvInt('VITE_WORKSPACE_BUTTON_WIDTH', 92),
  },

  // CategoryManager
  CATEGORY_MANAGER: {
    MODAL_WIDTH: 'min(520px, 90vw)',
    SEARCH_INPUT_WIDTH: getViteEnvInt('VITE_CATEGORY_MANAGER_SEARCH_WIDTH', 200),
  },

  // EvaluationScoreBadge
  EVALUATION_SCORE_BADGE: {
    SMALL: {
      MIN_WIDTH: getViteEnvInt('VITE_SCORE_BADGE_SMALL_MIN_WIDTH', 32),
      HEIGHT: getViteEnvInt('VITE_SCORE_BADGE_SMALL_HEIGHT', 22),
      PADDING_HORIZONTAL: getViteEnvInt('VITE_SCORE_BADGE_SMALL_PADDING', 6),
      FONT_SIZE: getViteEnvInt('VITE_SCORE_BADGE_SMALL_FONT_SIZE', 12),
    },
    MEDIUM: {
      MIN_WIDTH: getViteEnvInt('VITE_SCORE_BADGE_MEDIUM_MIN_WIDTH', 40),
      HEIGHT: getViteEnvInt('VITE_SCORE_BADGE_MEDIUM_HEIGHT', 28),
      PADDING_HORIZONTAL: getViteEnvInt('VITE_SCORE_BADGE_MEDIUM_PADDING', 8),
      FONT_SIZE: getViteEnvInt('VITE_SCORE_BADGE_MEDIUM_FONT_SIZE', 14),
    },
  },

  // CodeMirror extensions
  CODEMIRROR: {
    TOOLTIP_MAX_WIDTH: getViteEnvInt('VITE_CODEMIRROR_TOOLTIP_MAX_WIDTH', 420),
    VALUE_PREVIEW_MAX_LENGTH: getViteEnvInt('VITE_CODEMIRROR_VALUE_PREVIEW_MAX_LENGTH', 50),
    VALUE_PREVIEW_MAX_HEIGHT_PX: getViteEnvInt('VITE_CODEMIRROR_VALUE_PREVIEW_MAX_HEIGHT_PX', 180),
    AUTOCOMPLETE_MAX_OPTIONS: getViteEnvInt('VITE_CODEMIRROR_AUTOCOMPLETE_MAX_OPTIONS', 20),
  },

  // Smart Variable Extractor
  SMART_VARIABLE_EXTRACTOR: {
    MAX_SUGGESTIONS_PER_CATEGORY: getViteEnvInt('VITE_SMART_VAR_MAX_SUGGESTIONS_PER_CATEGORY', 3),
    MAX_TOTAL_SUGGESTIONS: getViteEnvInt('VITE_SMART_VAR_MAX_TOTAL_SUGGESTIONS', 8),
    LONG_TEXT_THRESHOLD: getViteEnvInt('VITE_SMART_VAR_LONG_TEXT_THRESHOLD', 200),
    MULTILINE_THRESHOLD: getViteEnvInt('VITE_SMART_VAR_MULTILINE_THRESHOLD', 3),
    CONFIDENCE_DECREMENT: getViteEnvInt('VITE_SMART_VAR_CONFIDENCE_DECREMENT', 10) / 100,
    LONG_TEXT_CONFIDENCE: getViteEnvInt('VITE_SMART_VAR_LONG_TEXT_CONFIDENCE', 60) / 100,
    MULTILINE_CONFIDENCE: getViteEnvInt('VITE_SMART_VAR_MULTILINE_CONFIDENCE', 70) / 100,
    JSON_CONFIDENCE: getViteEnvInt('VITE_SMART_VAR_JSON_CONFIDENCE', 80) / 100,
  },

  // Layout minimum heights
  LAYOUT: {
    PANEL_MIN_HEIGHT_PX: getViteEnvInt('VITE_LAYOUT_PANEL_MIN_HEIGHT', 200),
    BUTTON_MIN_WIDTH_PX: getViteEnvInt('VITE_LAYOUT_BUTTON_MIN_WIDTH', 48),
  },
} as const
