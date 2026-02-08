/**
 * Core configuration constants
 * Centralized location for all hardcoded values
 */

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
  testImageBase64:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAABGVJREFUeJztm01oXFUUx3/vzZtJMmnapPWjraZN/SCNrS200KKgIGhBXYhQcOHChYJbwY3gQnDhwoWgi4ILQRFciCCCC1sQwYKLii1YC1ppbWsb29Sm+Zg0mWTevHfvcefOm8nMm5lk3ryZvPwgvHvfO+fcO//cc8+79wZCQkJCQkJCQrZJAC5wC3gd+B54HfgCuO7ad4C/KsuLtR3E6gFvAH1AAiwDPwBLwBzwmXveaH4H8ASwF7yfawNYBL4Cfq7VPrMF3AVcB/qATdJ6x8CXwNEa+x6qY8BDwG/AADAKzAJZYMLN7zMfnCYA4G3gJDAJzAO9wPfAEPCKG7vE6sYAfAK8BOwDFoC7gVHgWWARsL0VX6wGYANYBnYCu4BjQMIVKyfdcxH4FrgJfOiOHnAM+BWwgZNAGhjw4rZZM4BF4BzwJ3DCjUWkqaXABeAi8CKQAl4DFoATwB1uxd8wCxQZ0XPBYuAJoO3DfOOZjhvAOeB5V6SdABYZWKkNwAbwDLAKnDZP7Qa+Av4Gzo/xH7IbuOJe+yTwByvBr+3VwxrrQKvkL+Bf4LE2VsU8cBGYIIKfuxRFJiYJAL9nE8zf/M2zW/Ll7zqgBBxoY1XMAmNE8HOXothNJiYJAL9hE9wdGF4IcVlmNPqfk4QsXFkCQu3fBrAjQNVsChFJ6CeS4CaZJqAnQNVsChFZeECCm0y9N0AAGElwk1lTSewNUDWbQkQS3GQaeIsAngBUsyn0E0lwk1lN6NeB3jZWxZOElIQHUC8J/UQS3GRqQh8E2hnfVBL7Atb9phGRhAckuMnUhD4A/N3GqlCShJ5NMMGJJLjJ1AT3AXOEVJS7Qcrb2zhGJMFNpiZ0P/APcG+AqtkUIpLgJlMT2gfs3SaP5N8EEnwP8Kf7gGFgO8x0xyUhK+Dre4K6o82g0o4h2zDTbVpHyMrLanxT9AV9a9VpQWgJV1HKBq4CqeKG6KbL9bbN3OVqw7q1W8gMlLOHh40TzE0hKwqjbO6qFJO5sn+OE9u0JnQGJiXJ1mKdR/gSF5Z9E0ywFaHbXGDEg4j8WjSC7hJyIcmP0SjMCWElwW0MEUH0s4k4zWuIyGKFmGDl5aBGdI/9/8mABDeZmtB7gV4iekKT2BNwD7DfYx4+W5JZd1fI0xDKq+qJakTi0xRzMKTGsR7eI+J9gptMTWg/+Ku6tSXhEt7hCTfgJXjX6wa8hBfwxVPgaLW8hNeUbDK7hVxuLcLVF0zSh3R+Q/hsKIr2+zZLT8jnJOQ7wn5H2O8I+x1hvyPsd4T9jrDfEfY7wn5H2O8I+x1hvyPsd4T9jrDfEfY7wn5H2O8I+x1hvyPsd4T9jrDfEfY7wn5H2O8I+x1hfZKwvyVd10ukBOvMNeAj4B9gAnh3+wfbEy9TZx+c7R+Ay3Q2v1ek3gJOufblO7/YnphrCfn8Yr0F7HOfgG35j5tOpK4+GWfA6y4y5ePa8t0v4wyY8pq/Am9tQ10hISEhISEhIaFo/gOE5C7Cek1g0wAAAABJRU5ErkJggg==',
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
  models: 'core:models',
  imageModels: 'core:image-models',
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
