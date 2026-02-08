/**
 * HTTP Status Codes Module
 * Eliminates hardcoded HTTP status codes
 * Flexy loves modularity! No more magic numbers in HTTP handling.
 */

// Successful responses (2xx)
export const HTTP_SUCCESS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  PARTIAL_CONTENT: 206,
} as const;

// Client error responses (4xx)
export const HTTP_CLIENT_ERROR = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
} as const;

// Server error responses (5xx)
export const HTTP_SERVER_ERROR = {
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// Combined HTTP status codes
export const HTTP_STATUS = {
  ...HTTP_SUCCESS,
  ...HTTP_CLIENT_ERROR,
  ...HTTP_SERVER_ERROR,
} as const;

// HTTP methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
} as const;

// Content type headers
export const CONTENT_TYPES = {
  JSON: 'application/json',
  TEXT: 'text/plain',
  HTML: 'text/html',
  XML: 'application/xml',
  FORM: 'application/x-www-form-urlencoded',
  MULTIPART: 'multipart/form-data',
  STREAM: 'text/event-stream',
  OCTET_STREAM: 'application/octet-stream',
} as const;

// Common HTTP headers
export const HTTP_HEADERS = {
  CONTENT_TYPE: 'content-type',
  CONTENT_LENGTH: 'content-length',
  CONTENT_ENCODING: 'content-encoding',
  AUTHORIZATION: 'authorization',
  ACCEPT: 'accept',
  CACHE_CONTROL: 'cache-control',
  CONNECTION: 'connection',
  TRANSFER_ENCODING: 'transfer-encoding',
  ACCESS_CONTROL_ALLOW_ORIGIN: 'access-control-allow-origin',
  ACCESS_CONTROL_ALLOW_HEADERS: 'access-control-allow-headers',
} as const;

// CORS headers
export const CORS_HEADERS = {
  ALLOW_ORIGIN: '*',
  ALLOW_HEADERS: '*',
} as const;

// Cache control values
export const CACHE_CONTROL = {
  NO_CACHE: 'no-cache',
  NO_STORE: 'no-store',
  MUST_REVALIDATE: 'must-revalidate',
  MAX_AGE_0: 'max-age=0',
} as const;

// Connection values
export const CONNECTION = {
  KEEP_ALIVE: 'keep-alive',
  CLOSE: 'close',
} as const;
