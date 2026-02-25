/**
 * Test Constants Module
 * Eliminates hardcoded timeout values and magic numbers in tests
 * Flexy loves modularity! All test constants centralized.
 */

// Time units in milliseconds - for readability and maintainability
export const TIME = {
  MS: 1,
  SECOND: 1000,
  MINUTE: 60 * 1000,
  TWO_MINUTES: 2 * 60 * 1000,
} as const

// Timeout constants for different test scenarios
export const TIMEOUTS = {
  // Ultra-short delays for micro-animations
  MICRO: 100,

  // Short delays for quick UI updates
  SHORT: 200,

  // Medium delays for standard animations
  MEDIUM: 300,

  // Standard delays for most operations
  STANDARD: 500,

  // Long delays for complex operations
  LONG: 1000,

  // Extended delays for heavy operations
  EXTENDED: 1500,

  // Maximum delays for page loads
  PAGE_LOAD: 2000,

  // Playwright-specific timeouts
  playwright: {
    ELEMENT_APPEAR: 15000,
    WORKSPACE_LOAD: 20000,
    BOOTSTRAP: 45000,
    ANALYSIS_COMPLETE: 60000,
    EVALUATION_COMPLETE: 90000,
  },

  // Integration test timeouts
  integration: {
    API_DELAY: 60000,
    TEST_TIMEOUT: 120000,
  },
} as const

// Retry and polling constants
export const RETRY = {
  MAX_ATTEMPTS: 5,
  BASE_DELAY_MS: 100,
  MAX_DELAY_MS: 1000,
} as const

// Test data size constants
export const TEST_DATA = {
  SMALL_TEXT: 100,
  MEDIUM_TEXT: 1000,
  LARGE_TEXT: 10000,
  VERY_LARGE_TEXT: 100000,
  MAX_HISTORY_ITEMS: 50,
  MAX_VARIABLES: 100,
  MAX_FAVORITES: 1000,
  SMALL_IMAGE_MB: 1,
  LARGE_IMAGE_MB: 10,
} as const

// Score constants
export const SCORES = {
  MIN: 0,
  MAX: 100,
  PASS_THRESHOLD: 60,
  EXCELLENT_THRESHOLD: 85,
} as const

// E2E Test route definitions - centralized to avoid string duplication
export const E2E_ROUTES = {
  BASIC_SYSTEM: '/#/basic/system',
  BASIC_USER: '/#/basic/user',
  PRO_MULTI: '/#/pro/multi',
  PRO_VARIABLE: '/#/pro/variable',
} as const

// Workspace mode identifiers
export const WORKSPACE_MODES = {
  BASIC_SYSTEM: 'basic-system',
  BASIC_USER: 'basic-user',
  PRO_MULTI: 'pro-multi',
  PRO_VARIABLE: 'pro-variable',
} as const

// Test IDs - centralized to avoid typos
export const TEST_IDS = {
  WORKSPACE: 'workspace',
  FUNCTION_MODE_SELECTOR: 'function-mode-selector',
  OPTIMIZATION_MODE_SELECTOR: 'optimization-mode-selector',
  CORE_NAV: 'core-nav',
} as const

// Color codes for test data (not for UI)
export const TEST_COLORS = {
  RED: '#ff0000',
  GREEN: '#00ff00',
  BLUE: '#0000ff',
  ORANGE: '#FF5722',
  GREEN_ALT: '#4CAF50',
} as const
