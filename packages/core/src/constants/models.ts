/**
 * Model Registry
 * Centralizes all model IDs to eliminate hardcoded values across adapters
 * Flexy loves modularity! All model identifiers in one place.
 */

// OpenAI Models
export const OPENAI_MODELS = {
  // GPT-5 series
  GPT5_MINI: 'gpt-5-mini',
  GPT5_1: 'gpt-5.1',
  GPT5_IMAGE_MINI: 'gpt-5-image-mini',

  // Legacy models (for reference)
  GPT4O: 'gpt-4o',
  GPT4O_MINI: 'gpt-4o-mini',
} as const

// Anthropic Models
export const ANTHROPIC_MODELS = {
  // Claude 4.0 series
  CLAUDE_OPUS_4: 'claude-opus-4-20250514',
  CLAUDE_SONNET_4: 'claude-sonnet-4-20250514',
} as const

// Gemini Models
export const GEMINI_MODELS = {
  // Gemini 2.5 series
  GEMINI_25_FLASH: 'gemini-2.5-flash',
  GEMINI_25_PRO: 'gemini-2.5-pro',

  // Gemini 3.0 series (preview)
  GEMINI_3_PRO_PREVIEW: 'gemini-3-pro-preview',

  // Image generation models
  GEMINI_25_FLASH_IMAGE: 'gemini-2.5-flash-image',
  GEMINI_3_PRO_IMAGE_PREVIEW: 'gemini-3-pro-image-preview',
} as const

// OpenRouter Models
export const OPENROUTER_MODELS = {
  // Google models via OpenRouter
  GOOGLE_GEMINI_25_FLASH_IMAGE: 'google/gemini-2.5-flash-image',

  // OpenAI models via OpenRouter
  OPENAI_GPT5_IMAGE_MINI: 'openai/gpt-5-image-mini',
} as const

// Model name mappings for UI display
export const MODEL_DISPLAY_NAMES: Record<string, string> = {
  // OpenAI
  [OPENAI_MODELS.GPT5_MINI]: 'GPT-5 Mini',
  [OPENAI_MODELS.GPT5_1]: 'GPT-5.1',
  [OPENAI_MODELS.GPT5_IMAGE_MINI]: 'GPT-5 Image Mini',

  // Anthropic
  [ANTHROPIC_MODELS.CLAUDE_OPUS_4]: 'Claude 4.0 Opus',
  [ANTHROPIC_MODELS.CLAUDE_SONNET_4]: 'Claude 4.0 Sonnet',

  // Gemini
  [GEMINI_MODELS.GEMINI_25_FLASH]: 'Gemini 2.5 Flash',
  [GEMINI_MODELS.GEMINI_25_PRO]: 'Gemini 2.5 Pro',
  [GEMINI_MODELS.GEMINI_3_PRO_PREVIEW]: 'Gemini 3.0 Pro Preview',
  [GEMINI_MODELS.GEMINI_25_FLASH_IMAGE]: 'Gemini 2.5 Flash Image',
  [GEMINI_MODELS.GEMINI_3_PRO_IMAGE_PREVIEW]: 'Gemini 3.0 Pro Image Preview',

  // OpenRouter
  [OPENROUTER_MODELS.GOOGLE_GEMINI_25_FLASH_IMAGE]: 'Gemini 2.5 Flash Image (via OpenRouter)',
  [OPENROUTER_MODELS.OPENAI_GPT5_IMAGE_MINI]: 'GPT-5 Image Mini (via OpenRouter)',
}

// Default model IDs by provider
export const DEFAULT_MODELS = {
  openai: OPENAI_MODELS.GPT5_MINI,
  anthropic: ANTHROPIC_MODELS.CLAUDE_SONNET_4,
  gemini: GEMINI_MODELS.GEMINI_25_FLASH,
  openrouter: OPENROUTER_MODELS.GOOGLE_GEMINI_25_FLASH_IMAGE,
} as const

// Export all model constants
export const MODEL_REGISTRY = {
  OPENAI: OPENAI_MODELS,
  ANTHROPIC: ANTHROPIC_MODELS,
  GEMINI: GEMINI_MODELS,
  OPENROUTER: OPENROUTER_MODELS,
  DISPLAY_NAMES: MODEL_DISPLAY_NAMES,
  DEFAULTS: DEFAULT_MODELS,
} as const

// Helper function to get display name for a model ID
export function getModelDisplayName(modelId: string): string {
  return MODEL_DISPLAY_NAMES[modelId] || modelId
}

// Helper function to check if a model ID is valid
export function isValidModelId(modelId: string): boolean {
  return modelId in MODEL_DISPLAY_NAMES
}

// Helper function to get all models for a provider
export function getProviderModels(provider: keyof typeof DEFAULT_MODELS): readonly string[] {
  switch (provider) {
    case 'openai':
      return Object.values(OPENAI_MODELS)
    case 'anthropic':
      return Object.values(ANTHROPIC_MODELS)
    case 'gemini':
      return Object.values(GEMINI_MODELS)
    case 'openrouter':
      return Object.values(OPENROUTER_MODELS)
    default:
      return []
  }
}
