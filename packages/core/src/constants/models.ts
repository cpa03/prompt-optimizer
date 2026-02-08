/**
 * Model IDs and Configuration Module
 * Eliminates hardcoded model identifiers across adapters
 * Flexy loves modularity! All model configurations centralized.
 */

// OpenAI Models
export const OPENAI_MODELS = {
  GPT_5_MINI: 'gpt-5-mini',
  GPT_5_1: 'gpt-5.1',
} as const;

// Anthropic Claude Models
export const ANTHROPIC_MODELS = {
  CLAUDE_OPUS_4: 'claude-opus-4-20250514',
  CLAUDE_SONNET_4: 'claude-sonnet-4-20250514',
} as const;

// Google Gemini Models
export const GEMINI_MODELS = {
  GEMINI_2_5_FLASH: 'gemini-2.5-flash',
  GEMINI_2_5_PRO: 'gemini-2.5-pro',
  GEMINI_3_PRO_PREVIEW: 'gemini-3-pro-preview',
} as const;

// Model Context Lengths (in tokens)
export const MODEL_CONTEXT_LENGTHS = {
  GPT_5: 1047576,
  CLAUDE_DEFAULT: 128000,
  GEMINI_DEFAULT: 1000000,
  GPT4_DEFAULT: 200000,
  FALLBACK_DEFAULT: 8192,
} as const;

// Model Categories for UI/Organization
export const MODEL_CATEGORIES = {
  FAST: ['gpt-5-mini', 'gemini-2.5-flash'],
  BALANCED: ['gpt-5.1', 'claude-sonnet-4-20250514'],
  POWERFUL: ['claude-opus-4-20250514', 'gemini-2.5-pro', 'gemini-3-pro-preview'],
} as const;

// Export combined model registry
export const MODEL_REGISTRY = {
  OPENAI: OPENAI_MODELS,
  ANTHROPIC: ANTHROPIC_MODELS,
  GEMINI: GEMINI_MODELS,
  CONTEXT_LENGTHS: MODEL_CONTEXT_LENGTHS,
  CATEGORIES: MODEL_CATEGORIES,
} as const;

// Type exports for type safety
export type OpenAIModel = typeof OPENAI_MODELS[keyof typeof OPENAI_MODELS];
export type AnthropicModel = typeof ANTHROPIC_MODELS[keyof typeof ANTHROPIC_MODELS];
export type GeminiModel = typeof GEMINI_MODELS[keyof typeof GEMINI_MODELS];
