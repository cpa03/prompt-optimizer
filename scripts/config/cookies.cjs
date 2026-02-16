/**
 * Shared Cookie Configuration
 * CommonJS module for use in middleware and API routes
 * Flexy loves modularity! Centralized cookie settings.
 */

const COOKIE_CONFIG = {
  ACCESS_TOKEN_NAME: 'vercel_access_token',
  DEFAULT_MAX_AGE: 60 * 60 * 24 * 7, // 7 days in seconds
  SAME_SITE_POLICY: 'Strict',
  CACHE_CONTROL: 'no-cache, no-store, must-revalidate',
}

const HTTP_STATUS = {
  OK: 200,
  UNAUTHORIZED: 401,
  METHOD_NOT_ALLOWED: 405,
}

module.exports = {
  COOKIE_CONFIG,
  HTTP_STATUS,
}
