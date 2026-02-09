/**
 * Time Constants Module
 * Eliminates magic numbers for timing values
 * Flexy loves modularity! All time constants centralized.
 */

// Debounce and Throttle Defaults
export const DEBOUNCE_DEFAULTS = {
  DELAY_MS: 300,
  THROTTLE_DELAY_MS: 100,
} as const;

// Smart Debounce Configuration
export const SMART_DEBOUNCE = {
  MIN_DELAY_MS: 100,
  MAX_DELAY_MS: 1000,
  FREQUENCY_THRESHOLDS: {
    HIGH: 10,
    MEDIUM: 5,
    LOW: 2,
  },
  COUNTER_RESET_MS: 10000,
} as const;

// UI Timing Constants
export const UI_TIMING = {
  TRANSITION_DURATION_MS: 200,
  TOAST_DURATION_MS: 3000,
  MODAL_ANIMATION_MS: 300,
  SCROLL_DEBOUNCE_MS: 100,
  RESIZE_DEBOUNCE_MS: 150,
} as const;

// Test Timeouts
export const TEST_TIMEOUTS = {
  UNIT: 5000,
  INTEGRATION: 10000,
  E2E: 30000,
  POLL_INTERVAL_MS: 100,
  WAIT_SHORT_MS: 200,
  WAIT_MEDIUM_MS: 1000,
  WAIT_LONG_MS: 2000,
} as const;

// Build Configuration
export const BUILD_TIMING = {
  WATCH_DELAY_MS: 100,
  CHUNK_SIZE_WARNING_KB: 3500,
  ASSETS_INLINE_LIMIT_BYTES: 4096,
} as const;

// Session and Cache Timing
export const SESSION_TIMING = {
  GC_DELAY_MS: 0,
  MEMORY_CHECK_INTERVAL_MS: 5000,
  WRITE_DELAY_MS: 500,
  MAX_FLUSH_TIME_MS: 3000,
} as const;

// Export combined time constants
export const TIME_CONSTANTS = {
  DEBOUNCE: DEBOUNCE_DEFAULTS,
  SMART_DEBOUNCE,
  UI: UI_TIMING,
  TEST: TEST_TIMEOUTS,
  BUILD: BUILD_TIMING,
  SESSION: SESSION_TIMING,
} as const;
