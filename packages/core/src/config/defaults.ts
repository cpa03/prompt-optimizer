/**
 * Default Values Configuration Module
 * Eliminates hardcoded default parameters and image sizes
 * Flexy loves modularity! All defaults centralized and typed.
 */

import { getEnvString, getEnvInt, getEnvFloat } from './env'

// LLM Parameters type definition
interface LLMParameters {
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
}

// Image size presets - now configurable via environment
export const IMAGE_SIZE_PRESETS = {
  standard: {
    default: getEnvString('VITE_IMAGE_SIZE_DEFAULT', '1024x1024'),
    available: getEnvString('VITE_IMAGE_SIZE_OPTIONS', '1024x1024,1536x1024,1024x1536,auto').split(
      ','
    ) as string[],
  },
  openai: {
    default: getEnvString('VITE_OPENAI_IMAGE_SIZE_DEFAULT', '1024x1024'),
    available: getEnvString(
      'VITE_OPENAI_IMAGE_SIZE_OPTIONS',
      '1024x1024,1536x1024,1024x1536,auto'
    ).split(',') as string[],
  },
  siliconflow: {
    default: getEnvString('VITE_SILICONFLOW_IMAGE_SIZE_DEFAULT', '1024x1024'),
    available: getEnvString(
      'VITE_SILICONFLOW_IMAGE_SIZE_OPTIONS',
      '1024x1024,960x1280,768x1024,1280x960,1024x768,1280x1280'
    ).split(',') as string[],
  },
  seedream: {
    default: getEnvString('VITE_SEEDREAM_SIZE_DEFAULT', '2K'),
    available: getEnvString(
      'VITE_SEEDREAM_SIZE_OPTIONS',
      '1K,2K,4K,1024x1024,512x512,768x768'
    ).split(',') as string[],
  },
  modelscope: {
    default: getEnvString('VITE_MODELSCOPE_IMAGE_SIZE_DEFAULT', '1024x1024'),
    available: getEnvString(
      'VITE_MODELSCOPE_IMAGE_SIZE_OPTIONS',
      '1024x1024,1536x1024,1024x1536'
    ).split(',') as string[],
  },
} as const

// LLM default parameters - fully configurable via environment
export const LLM_DEFAULTS: LLMParameters = {
  temperature: getEnvFloat('VITE_LLM_TEMPERATURE', 0.7),
  maxTokens: getEnvInt('VITE_LLM_MAX_TOKENS', 4096),
  topP: getEnvFloat('VITE_LLM_TOP_P', 1.0),
  frequencyPenalty: getEnvFloat('VITE_LLM_FREQ_PENALTY', 0),
  presencePenalty: getEnvFloat('VITE_LLM_PRESENCE_PENALTY', 0),
}

// Image generation defaults - configurable per provider
export const IMAGE_DEFAULTS = {
  seedream: {
    aspectRatio: getEnvString('VITE_SEEDREAM_ASPECT_RATIO', '2K'),
    seed: getEnvString('VITE_SEEDREAM_SEED', '-1'),
    sampleMethod: getEnvString('VITE_SEEDREAM_SAMPLE_METHOD', 'default'),
    cfg: getEnvFloat('VITE_SEEDREAM_CFG', 7.5),
    steps: getEnvInt('VITE_SEEDREAM_STEPS', 20),
  },
  siliconflow: {
    steps: getEnvInt('VITE_SILICONFLOW_STEPS', 20),
    guidanceScale: getEnvFloat('VITE_SILICONFLOW_GUIDANCE_SCALE', 7.5),
    numInferenceSteps: getEnvInt('VITE_SILICONFLOW_INFERENCE_STEPS', 50),
    strength: getEnvFloat('VITE_SILICONFLOW_STRENGTH', 4.0),
  },
  openai: {
    quality: getEnvString('VITE_OPENAI_IMAGE_QUALITY', 'standard'),
    responseFormat: getEnvString('VITE_OPENAI_IMAGE_FORMAT', 'url'),
    style: getEnvString('VITE_OPENAI_IMAGE_STYLE', 'vivid'),
  },
} as const

// Constraint values - all configurable via environment
export const CONSTRAINTS = {
  image: {
    maxSizeBytes: getEnvInt('VITE_MAX_IMAGE_SIZE_BYTES', 10 * 1024 * 1024), // 10MB default
    maxCacheSizeBytes: getEnvInt('VITE_MAX_IMAGE_CACHE_BYTES', 50 * 1024 * 1024), // 50MB default
    maxDimension: getEnvInt('VITE_MAX_IMAGE_DIMENSION', 4096),
  },
  mcp: {
    maxPromptLength: getEnvInt('VITE_MCP_MAX_PROMPT_LENGTH', 50000),
    maxRequirementsLength: getEnvInt('VITE_MCP_MAX_REQUIREMENTS_LENGTH', 10000),
    maxTemplateLength: getEnvInt('VITE_MCP_MAX_TEMPLATE_LENGTH', 100),
  },
  text: {
    maxRetries: getEnvInt('VITE_MAX_RETRIES', 5),
  },
  storage: {
    maxKeyLength: getEnvInt('VITE_STORAGE_MAX_KEY_LENGTH', 1024),
    maxValueSize: getEnvInt('VITE_STORAGE_MAX_VALUE_SIZE', 50 * 1024 * 1024), // 50MB default
  },
} as const

// Model defaults
export const MODEL_DEFAULTS = {
  customModelId: getEnvString('VITE_CUSTOM_MODEL_ID', 'custom-model'),
  fallbackApiKey: getEnvString('VITE_FALLBACK_API_KEY', 'ollama'),
} as const

// Storage keys - centralized
export const STORAGE_KEYS = {
  variables: getEnvString('VITE_STORAGE_KEY_VARIABLES', 'variable-manager-data'),
  globalSettings: getEnvString('VITE_STORAGE_KEY_SETTINGS', 'global-settings/v1'),
  chunkLoadRefreshPrompted: getEnvString(
    'VITE_STORAGE_KEY_CHUNK_PROMPT',
    'prompt-optimizer:chunk-load-refresh-prompted'
  ),
  imageText2ImageSession: getEnvString('VITE_STORAGE_KEY_IMG_T2I', 'image:text2image:session'),
  imageImage2ImageSession: getEnvString('VITE_STORAGE_KEY_IMG_I2I', 'image:image2image:session'),
} as const

// Version constants - read from package.json if available
function getPackageVersion(): string {
  try {
    // Try to get version from env first
    const envVersion = getEnvString('VITE_APP_VERSION', '')
    if (envVersion) return envVersion

    return '2.5.3' // Fallback version
  } catch {
    return '2.5.3'
  }
}

// External URLs - configurable via environment
export const EXTERNAL_URLS = {
  githubRepo: getEnvString('VITE_GITHUB_REPO_URL', 'https://github.com/linshenkx/prompt-optimizer'),
} as const

// Version constants
export const VERSIONS = {
  contextStore: getPackageVersion(),
  globalSettings: getEnvString('VITE_SETTINGS_VERSION', 'v1'),
} as const

// SVG namespace - W3C standard, should not change
import { SVG_CONFIG } from './core-config'
export const SVG_NAMESPACE = SVG_CONFIG.namespace
