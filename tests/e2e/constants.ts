/**
 * E2E Test Constants
 * Centralized constants for E2E tests to eliminate hardcoded values
 * Flexy loves modularity!
 */

// Re-export core constants for E2E tests
export {
  TIME,
  TIMEOUTS,
  RETRY,
  TEST_DATA,
  SCORES,
  E2E_ROUTES,
  WORKSPACE_MODES,
  TEST_IDS,
  TEST_COLORS,
} from '../../../packages/core/src/constants/test-constants'

export {
  HTTP_STATUS,
  HTTP_SUCCESS,
  HTTP_CLIENT_ERROR,
  HTTP_SERVER_ERROR,
  HTTP_METHODS,
  CONTENT_TYPES,
  HTTP_HEADERS,
  CORS_HEADERS,
  CACHE_CONTROL,
  CONNECTION,
} from '../../../packages/core/src/constants/http-codes'

export {
  OPENROUTER,
  API_PATHS,
  URL_PATTERNS,
  EXTERNAL_SERVICES,
  LLM_ENDPOINTS,
  IMAGE_ENDPOINTS,
  DATA_URL_PATTERNS,
  MIME_PATTERNS,
} from '../../../packages/core/src/constants/api-endpoints'
