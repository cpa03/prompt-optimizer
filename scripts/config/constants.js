/**
 * Scripts Configuration Module
 * Centralizes all hardcoded values for build scripts and tooling
 * Flexy loves modularity! No more hardcoded magic numbers.
 */

// Server and port configuration
export const SERVER_CONFIG = {
  DEFAULT_PORT: 18181,
  DEV_SERVER_STARTUP_WAIT_MS: 10000,
  KILL_DEV_WAIT_MS: 2000,
  CONSOLE_MONITOR_WAIT_MS: 3000,
  ROUTE_CHECK_WAIT_MS: 2000,
}

// Browser viewport configuration
export const VIEWPORT_CONFIG = {
  DEFAULT_WIDTH: 1280,
  DEFAULT_HEIGHT: 720,
}

// Brocula monitoring configuration
export const BROCULA_CONFIG = {
  MAIN_BRANCH: 'develop',
  MIN_LIGHTHOUSE_SCORE: 90,
  CHECK_INTERVAL_MS: 300000, // 5 minutes
  MAX_RETRIES: 3,
  CONSOLE_MONITOR_TIMEOUT_MS: 120000,
  LIGHTHOUSE_TIMEOUT_MS: 120000,
}

// Application routes for testing
export const APP_ROUTES = {
  HOME: '/',
  OPTIMIZE: '/optimize',
  HISTORY: '/history',
  SETTINGS: '/settings',
  ALL: ['/', '/optimize', '/history', '/settings'],
}

// Cookie configuration
export const COOKIE_CONFIG = {
  // Platform-aware cookie naming: Vercel uses 'vercel_access_token',
  // Cloudflare uses 'cf_access_token'
  // Detect platform based on environment variable or default to vercel for backward compatibility
  ACCESS_TOKEN_NAME: process.env.CF_PAGES ? 'cf_access_token' : 'vercel_access_token',
  DEFAULT_MAX_AGE: 86400, // 24 hours in seconds
  SAME_SITE_POLICY: 'Strict',
  CACHE_CONTROL: 'no-cache, no-store, must-revalidate',
}

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  // Maximum failed login attempts before blocking
  MAX_ATTEMPTS: parseInt(process.env.RATE_LIMIT_MAX_ATTEMPTS, 10) || 5,
  // Time window in milliseconds to count attempts
  WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000, // 1 minute
  // Duration to block after exceeding max attempts
  BLOCK_DURATION_MS: parseInt(process.env.RATE_LIMIT_BLOCK_DURATION_MS, 10) || 300000, // 5 minutes
  // Maximum entries in rate limit store before cleanup
  MAX_STORE_SIZE: parseInt(process.env.RATE_LIMIT_MAX_STORE_SIZE, 10) || 10000,
  // Default retry-after seconds for rate limited responses
  DEFAULT_RETRY_AFTER_SECONDS: parseInt(process.env.RATE_LIMIT_RETRY_AFTER_SECONDS, 10) || 60,
}

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
}

// Platform identifiers
export const PLATFORM = {
  WIN32: 'win32',
  DARWIN: 'darwin',
  LINUX: 'linux',
}

// Export all configurations
export default {
  SERVER_CONFIG,
  VIEWPORT_CONFIG,
  BROCULA_CONFIG,
  APP_ROUTES,
  COOKIE_CONFIG,
  RATE_LIMIT_CONFIG,
  HTTP_STATUS,
  PLATFORM,
}
