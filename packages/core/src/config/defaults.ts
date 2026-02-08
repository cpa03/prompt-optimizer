/**
 * Default Values Configuration Module
 * Eliminates hardcoded default parameters and image sizes
 * Flexy loves modularity! All defaults centralized and typed.
 */

// Image size presets for different providers
export const IMAGE_SIZE_PRESETS = {
  // Standard sizes used by most providers
  standard: {
    default: '1024x1024',
    available: ['1024x1024', '1536x1024', '1024x1536', 'auto'] as const,
  },
  
  // OpenAI specific
  openai: {
    default: '1024x1024',
    available: ['1024x1024', '1536x1024', '1024x1536', 'auto'] as const,
  },
  
  // SiliconFlow specific
  siliconflow: {
    default: '1024x1024',
    available: ['1024x1024', '960x1280', '768x1024', '1280x960', '1024x768', '1280x1280'] as const,
  },
  
  // Seedream specific (uses different format)
  seedream: {
    default: '2K',
    available: ['1K', '2K', '4K', '1024x1024', '512x512', '768x768'] as const,
  },
  
  // ModelScope specific
  modelscope: {
    default: '1024x1024',
    available: ['1024x1024', '1536x1024', '1024x1536'] as const,
  },
} as const;

// LLM default parameters
export const LLM_DEFAULTS = {
  temperature: 0.7,
  maxTokens: 4096,
  topP: 1.0,
  frequencyPenalty: 0,
  presencePenalty: 0,
} as const;

// Image generation defaults
export const IMAGE_DEFAULTS = {
  seedream: {
    aspectRatio: '2K',
    seed: '-1',
    sampleMethod: 'default',
    cfg: 7.5,
    steps: 20,
  },
  
  siliconflow: {
    steps: 20,
    guidanceScale: 7.5,
    numInferenceSteps: 50,
    strength: 4.0,
  },
  
  openai: {
    quality: 'standard',
    responseFormat: 'url',
    style: 'vivid',
  },
} as const;

// Constraint values
export const CONSTRAINTS = {
  image: {
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    maxCacheSizeBytes: 50 * 1024 * 1024, // 50MB
    maxDimension: 4096,
  },
  
  mcp: {
    maxPromptLength: 50000,
    maxRequirementsLength: 10000,
  },
  
  text: {
    maxRetries: 5,
  },
} as const;

// Model defaults
export const MODEL_DEFAULTS = {
  customModelId: 'custom-model',
  fallbackApiKey: 'ollama',
} as const;

// Storage keys
export const STORAGE_KEYS = {
  variables: 'variable-manager-data',
  globalSettings: 'global-settings/v1',
  chunkLoadRefreshPrompted: 'prompt-optimizer:chunk-load-refresh-prompted',
} as const;

// External URLs
export const EXTERNAL_URLS = {
  githubRepo: 'https://github.com/linshenkx/prompt-optimizer',
} as const;

// Version constants
export const VERSIONS = {
  contextStore: '1.0.0',
  globalSettings: 'v1',
} as const;

// SVG namespace
export const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
