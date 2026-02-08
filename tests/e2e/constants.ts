/**
 * E2E Test Constants
 * Centralized constants for E2E tests to eliminate hardcoded values
 * Flexy loves modularity!
 */

// Re-export core test constants for E2E tests from built package
export {
  TIME,
  RETRY,
  TEST_DATA,
  SCORES,
  E2E_ROUTES,
  WORKSPACE_MODES,
  TEST_IDS,
  TEST_COLORS,
  // HTTP constants with TEST_ prefix to avoid conflicts
  TEST_HTTP_STATUS as HTTP_STATUS,
  TEST_HTTP_SUCCESS as HTTP_SUCCESS,
  TEST_HTTP_CLIENT_ERROR as HTTP_CLIENT_ERROR,
  TEST_HTTP_SERVER_ERROR as HTTP_SERVER_ERROR,
  TEST_HTTP_METHODS as HTTP_METHODS,
  TEST_CONTENT_TYPES as CONTENT_TYPES,
  TEST_HTTP_HEADERS as HTTP_HEADERS,
  TEST_CORS_HEADERS as CORS_HEADERS,
  TEST_CACHE_CONTROL as CACHE_CONTROL,
  TEST_CONNECTION as CONNECTION,
  // API endpoint constants
  OPENROUTER,
  API_PATHS,
  URL_PATTERNS,
  EXTERNAL_SERVICES,
  LLM_ENDPOINTS,
  IMAGE_ENDPOINTS,
  DATA_URL_PATTERNS,
  MIME_PATTERNS,
} from '@prompt-optimizer/core'
