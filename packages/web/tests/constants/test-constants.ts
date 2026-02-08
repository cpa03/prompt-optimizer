/**
 * Test Constants Configuration
 * Centralizes all test timeouts and constants to eliminate hardcoded values
 * Flexy loves modularity! All test configuration is centralized.
 */

// Wait timeouts (in milliseconds)
export const TEST_TIMEOUTS = {
  // Quick waits for immediate checks
  FAST_CHECK: 100,
  SHORT_WAIT: 200,
  MEDIUM_WAIT: 500,
  QUICK_CHECK: 1000,

  // Visibility and element detection
  VISIBILITY: 3000,
  ELEMENT_VISIBLE: 3000,

  // Medium waits for operations
  MEDIUM_OPERATION: 2000,

  // Long waits for async operations
  LONG_OPERATION: 5000,

  // Test suite timeout
  TEST_TIMEOUT: 120000,

  // Page load timeout
  PAGE_LOAD: 10000,
} as const

// HTTP Status codes for tests
export const TEST_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const

// Test data constants
export const TEST_DATA = {
  // Selection lengths
  MAX_SELECTION_LENGTH: 200,

  // Input limits
  MAX_INPUT_LENGTH: 1000,

  // Test user data
  DEFAULT_USER_EMAIL: 'test@example.com',
  DEFAULT_USER_NAME: 'Test User',
} as const

// Animation/transition timing for tests
export const TEST_ANIMATION = {
  DURATION: 300,
  DEBOUNCE: 150,
  TRANSITION: 200,
} as const

// Viewport dimensions for responsive testing
export const TEST_VIEWPORT = {
  MOBILE_WIDTH: 375,
  MOBILE_HEIGHT: 667,
  TABLET_WIDTH: 768,
  TABLET_HEIGHT: 1024,
  DESKTOP_WIDTH: 1280,
  DESKTOP_HEIGHT: 720,
} as const

// Retry configuration for flaky tests
export const TEST_RETRY = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
} as const
