/**
 * Core configuration constants
 * Centralized location for all hardcoded values
 */

import { TEST_IMAGES } from './test-data';

// ============================================================================
// Template Configuration
// ============================================================================

export const TEMPLATE_CONFIG = {
  supportedLanguages: ['zh-CN', 'en-US'] as const,
  defaultLanguage: 'en-US' as const,
  idRegex: /^[a-z0-9-]{3,}$/,
  randomSuffixLength: 6,
  maxRetries: 3,
} as const;

// ============================================================================
// Storage Configuration
// ============================================================================

export const STORAGE_CONFIG = {
  fileSuffixes: {
    temp: '.tmp',
    backup: '.backup',
  },
  timeouts: {
    writeDelayMs: 300,
    maxFlushTimeMs: 5000,
    maxFlushAttempts: 3,
  },
  retry: {
    maxAttempts: 3,
    baseDelayMs: 100,
    maxDelayMs: 5000,
  },
} as const;

// ============================================================================
// Preference Configuration
// ============================================================================

export const PREFERENCE_CONFIG = {
  prefix: 'pref:',
  keys: {
    selectedOptimizeTemplate: 'app:selected-optimize-template',
    selectedUserOptimizeTemplate: 'app:selected-user-optimize-template',
    selectedIterateTemplate: 'app:selected-iterate-template',
  },
} as const;

// ============================================================================
// Context Configuration
// ============================================================================

export const CONTEXT_CONFIG = {
  storeKey: 'ctx:store',
  defaultMode: 'system' as const,
  version: '1.0.0',
} as const;

// ============================================================================
// Image Configuration
// ============================================================================

export const IMAGE_CONFIG = {
  mimeTypes: {
    png: 'image/png',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
  },
  processing: {
    defaultCount: 1,
    cacheCleanupRatio: 0.9,
  },
  testImageBase64: TEST_IMAGES.LEGACY_PNG,
} as const;

// ============================================================================
// LLM Configuration
// ============================================================================

export const LLM_CONFIG = {
  streaming: {
    doneMarkers: ['data: [DONE]', 'data:[DONE]'],
  },
  prompt: {
    previewRatio: 0.75,
    renderPhases: {
      optimize: 'optimize',
    },
  },
  fallbackChains: {
    optimize: ['userOptimize'],
    userOptimize: ['optimize'],
    iterate: ['optimize', 'userOptimize'],
    text2imageOptimize: ['userOptimize', 'optimize'],
    image2imageOptimize: ['text2imageOptimize', 'userOptimize', 'optimize'],
    imageIterate: ['iterate', 'text2imageOptimize', 'userOptimize'],
  } as const,
} as const;

// ============================================================================
// Environment Configuration
// ============================================================================

export const ENV_CONFIG = {
  patterns: {
    suffix: /^[a-zA-Z0-9_-]+$/,
  },
  limits: {
    maxSuffixLength: 50,
  },
} as const;

// ============================================================================
// Model Configuration
// ============================================================================

export const MODEL_CONFIG = {
  parameterPatterns: {
    allowed: /^[A-Za-z0-9._\-:/]+$/,
  },
} as const;

// ============================================================================
// HTTP Configuration
// ============================================================================

export const HTTP_CONFIG = {
  cacheControl: {
    noCache: 'no-cache',
    noStore: 'no-store',
    mustRevalidate: 'must-revalidate',
    maxAge0: 'max-age=0',
  },
} as const;

// ============================================================================
// SVG Configuration
// ============================================================================

export const SVG_CONFIG = {
  namespace: 'http://www.w3.org/2000/svg',
} as const;

// ============================================================================
// Compare Configuration
// ============================================================================

export const COMPARE_CONFIG = {
  changeTypes: {
    unchanged: 'unchanged',
    added: 'added',
    removed: 'removed',
  },
} as const;

// ============================================================================
// Service Keys
// ============================================================================

export const SERVICE_KEYS = {
  models: 'models',
  imageModels: 'image-models',
} as const;

// ============================================================================
// Image Adapter Configuration
// ============================================================================

export const IMAGE_ADAPTER_CONFIG = {
  modelscope: {
    asyncMode: 'true',
    status: {
      terminal: ['FAILED', 'ERROR', 'CANCELLED', 'CANCELED'],
      pending: ['PENDING', 'RUNNING', 'PROCESSING'],
    },
  },
  seedream: {
    sequentialGeneration: 'disabled',
  },
} as const;
