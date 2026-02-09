/**
 * API Endpoints Module
 * Eliminates hardcoded API URLs and endpoints
 * Flexy loves modularity! All API endpoints centralized.
 */

import { getEnvString } from '../config/env';

// OpenRouter API endpoints
export const OPENROUTER = {
  BASE_URL: getEnvString('OPENROUTER_BASE_URL', 'https://openrouter.ai'),
  API_VERSION: 'v1',
  get BASE_API_URL() {
    return `${this.BASE_URL}/api/${this.API_VERSION}`;
  },
  ENDPOINTS: {
    MODELS: '/models',
    CHAT_COMPLETIONS: '/chat/completions',
  },
} as const;

// Common API path patterns
export const API_PATHS = {
  V1: '/api/v1',
  CHAT_COMPLETIONS: '/chat/completions',
  MODELS: '/models',
} as const;

// URL patterns for normalization
export const URL_PATTERNS = {
  // Matches /api/v1 at the end
  API_VERSION_SUFFIX: /\/api\/v1$/,
  // Matches /api at the end
  API_SUFFIX: /\/api$/,
  // Matches trailing slash
  TRAILING_SLASH: /\/$/,
} as const;

// External service URLs
export const EXTERNAL_SERVICES = {
  W3C_SVG_NAMESPACE: 'http://www.w3.org/2000/svg',
} as const;

// LLM Provider endpoints
export const LLM_ENDPOINTS = {
  CHAT_COMPLETIONS: '/chat/completions',
  COMPLETIONS: '/completions',
  MODELS: '/models',
  EMBEDDINGS: '/embeddings',
} as const;

// Image generation endpoints
export const IMAGE_ENDPOINTS = {
  GENERATIONS: '/images/generations',
  EDITS: '/images/edits',
  VARIATIONS: '/images/variations',
} as const;

// Data URL patterns
export const DATA_URL_PATTERNS = {
  PREFIX: 'data:',
  BASE64_PREFIX: ';base64,',
  IMAGE_PREFIX: 'image/',
} as const;

// MIME type patterns
export const MIME_PATTERNS = {
  IMAGE: /^image\//,
  JSON: /^application\/json/,
  TEXT: /^text\//,
  STREAM: /^text\/event-stream/,
} as const;

// MIME type constants - eliminates hardcoded MIME type strings
export const MIME_TYPES = {
  // Image types
  PNG: 'image/png',
  JPEG: 'image/jpeg',
  WEBP: 'image/webp',
  GIF: 'image/gif',
  
  // Application types
  JSON: 'application/json',
  
  // Text types
  PLAIN_TEXT: 'text/plain',
  HTML: 'text/html',
  CSV: 'text/csv',
} as const;

// XML namespaces - eliminates hardcoded namespace strings
export const XML_NAMESPACES = {
  SVG: 'http://www.w3.org/2000/svg',
  XHTML: 'http://www.w3.org/1999/xhtml',
  XLINK: 'http://www.w3.org/1999/xlink',
} as const;
