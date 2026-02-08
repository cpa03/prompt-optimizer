/**
 * HTTP Configuration Module
 * Eliminates hardcoded MIME types and HTTP headers
 * Flexy loves modularity! All HTTP constants centralized.
 */

export const MIME_TYPES = {
  // Image types
  image: {
    png: 'image/png',
    jpeg: 'image/jpeg',
    jpg: 'image/jpg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
  },
  
  // Application types
  application: {
    json: 'application/json',
    xml: 'application/xml',
    formUrlEncoded: 'application/x-www-form-urlencoded',
    octetStream: 'application/octet-stream',
  },
  
  // Text types
  text: {
    plain: 'text/plain',
    html: 'text/html',
    css: 'text/css',
    javascript: 'text/javascript',
  },
} as const;

export const HTTP_HEADERS = {
  json: {
    'Content-Type': MIME_TYPES.application.json,
  },
  
  image: {
    png: {
      'Content-Type': MIME_TYPES.image.png,
    },
  },
  
  authorization: (token: string) => ({
    'Authorization': `Bearer ${token}`,
  }),
  
  apiKey: (key: string, headerName: string = 'Authorization') => ({
    [headerName]: key,
  }),
} as const;

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TIMEOUT: 408,
  TOO_MANY_REQUESTS: 429,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;
