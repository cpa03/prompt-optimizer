/**
 * Test timeout constants
 * Centralizes all timeout values for E2E tests to ensure consistency
 */

// Navigation timeouts
export const NAVIGATION_TIMEOUTS = {
  // Page load and navigation
  PAGE_LOAD: 15000,
  ROUTE_SWITCH: 20000,
  WORKSPACE_VISIBLE: 20000,

  // Selector visibility
  ELEMENT_VISIBLE: 15000,
  ELEMENT_HIDDEN: 3000,

  // Modal and dropdown
  MODAL_VISIBLE: 5000,
  DROPDOWN_VISIBLE: 3000,

  // Workspace specific
  WORKSPACE_BOOTSTRAP: 45000,
} as const

// Operation timeouts
export const OPERATION_TIMEOUTS = {
  // Button interactions
  BUTTON_CLICK: 20000,
  BUTTON_ENABLED: 15000,

  // Input interactions
  INPUT_VISIBLE: 15000,
  INPUT_READY: 10000,

  // Selection
  SELECT_VISIBLE: 20000,
  OPTION_VISIBLE: 20000,

  // File operations
  DOWNLOAD: 5000,
  UPLOAD: 30000,
} as const

// API and async operation timeouts
export const API_TIMEOUTS = {
  // Short operations
  SHORT_OPERATION: 10000,

  // Medium operations
  MEDIUM_OPERATION: 60000,

  // Long operations
  LONG_OPERATION: 120000,
  VERY_LONG_OPERATION: 240000,

  // Rate limiting
  RATE_LIMIT_DELAY: 60000,
} as const

// Wait and polling timeouts
export const WAIT_TIMEOUTS = {
  // Quick checks
  QUICK_CHECK: 1000,
  SHORT_WAIT: 2000,

  // Standard waits
  STANDARD_WAIT: 5000,
  MODERATE_WAIT: 10000,

  // Long waits
  EXTENDED_WAIT: 30000,
} as const

// Animation and UI transition timeouts
export const UI_TIMEOUTS = {
  // Micro animations (< 300ms)
  MICRO_WAIT: 200,

  // Small transitions (300-500ms)
  SMALL_WAIT: 300,
  UI_TRANSITION: 500,

  // Session restore operations
  SESSION_RESTORE: 2000,

  // Tag/Category operations
  TAG_OPERATION: 1000,

  // Favorite operations
  FAVORITE_ANIMATION: 800,
} as const

// Test-specific timeouts
export const TEST_TIMEOUTS = {
  // Default test timeout
  DEFAULT: 30000,

  // Integration tests
  INTEGRATION: 120000,

  // Smoke tests
  SMOKE_TEST: 15000,

  // Session persistence tests
  SESSION_PERSISTENCE: 20000,

  // Image generation tests
  IMAGE_GENERATION: 240000,

  // Analysis tests
  ANALYSIS: 180000,

  // Extended analysis tests (pro-variable, etc.)
  EXTENDED_ANALYSIS: 180000,

  // Full analysis with comparison
  FULL_ANALYSIS: 240000,

  // Image generation with upload
  IMAGE_GENERATION_WITH_UPLOAD: 900000,
} as const

// Export all timeout constants
export const TIMEOUTS = {
  NAVIGATION: NAVIGATION_TIMEOUTS,
  OPERATION: OPERATION_TIMEOUTS,
  API: API_TIMEOUTS,
  WAIT: WAIT_TIMEOUTS,
  TEST: TEST_TIMEOUTS,
  UI: UI_TIMEOUTS,
} as const

// Convenience exports for direct import
export const { PAGE_LOAD, ROUTE_SWITCH, WORKSPACE_VISIBLE, ELEMENT_VISIBLE } = NAVIGATION_TIMEOUTS

export const { BUTTON_CLICK, BUTTON_ENABLED, INPUT_VISIBLE } = OPERATION_TIMEOUTS

export const { LONG_OPERATION, VERY_LONG_OPERATION } = API_TIMEOUTS

export const {
  DEFAULT: DEFAULT_TEST_TIMEOUT,
  INTEGRATION: INTEGRATION_TEST_TIMEOUT,
  ANALYSIS: ANALYSIS_TEST_TIMEOUT,
  EXTENDED_ANALYSIS: EXTENDED_ANALYSIS_TEST_TIMEOUT,
  FULL_ANALYSIS: FULL_ANALYSIS_TEST_TIMEOUT,
  IMAGE_GENERATION: IMAGE_GENERATION_TEST_TIMEOUT,
  IMAGE_GENERATION_WITH_UPLOAD: IMAGE_GENERATION_WITH_UPLOAD_TEST_TIMEOUT,
} = TEST_TIMEOUTS

// UI transition timeout exports
export const {
  MICRO_WAIT,
  SMALL_WAIT,
  UI_TRANSITION,
  SESSION_RESTORE,
  TAG_OPERATION,
  FAVORITE_ANIMATION,
} = UI_TIMEOUTS
