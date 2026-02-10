/**
 * LLM Model Constants Configuration Module
 * Centralizes all hardcoded values for LLM adapters
 * Flexy loves modularity! No more magic numbers scattered in adapters.
 */

import { getEnvInt, getEnvString } from './env';

// ============================================================================
// Context Length Constants
// ============================================================================

/**
 * Standard context length values for different model tiers
 * These eliminate hardcoded 128000, 1000000 values in adapters
 */
export const CONTEXT_LENGTHS = {
  /** Standard context length for most modern LLMs (128K tokens = 128000) */
  STANDARD_128K: getEnvInt('VITE_CONTEXT_LENGTH_STANDARD', 128000),
  /** Standard context length in binary (128K = 131072) - used by some providers */
  STANDARD_128K_BINARY: getEnvInt('VITE_CONTEXT_LENGTH_STANDARD_BINARY', 131072),
  /** Large context length for models like Gemini, DashScope (1M tokens) */
  LARGE_1M: getEnvInt('VITE_CONTEXT_LENGTH_LARGE', 1000000),
  /** Small context length for older or lightweight models (4K tokens) */
  SMALL_4K: getEnvInt('VITE_CONTEXT_LENGTH_SMALL', 4096),
  /** Medium context length for standard models (8K tokens) */
  MEDIUM_8K: getEnvInt('VITE_CONTEXT_LENGTH_MEDIUM', 8192),
  /** Extended context length for some models (32K tokens) */
  EXTENDED_32K: getEnvInt('VITE_CONTEXT_LENGTH_EXTENDED', 32768),
  /** Maximum context length for enterprise models (200K tokens) */
  MAX_200K: getEnvInt('VITE_CONTEXT_LENGTH_MAX', 200000),
  /** Large context length for some models (96K tokens) */
  LARGE_96K: getEnvInt('VITE_CONTEXT_LENGTH_LARGE_96K', 96000),
  /** Very large context for GPT-5 models (~1M tokens) */
  VERY_LARGE_1M_PLUS: getEnvInt('VITE_CONTEXT_LENGTH_VERY_LARGE', 1047576),
} as const;

// ============================================================================
// Max Tokens Constants
// ============================================================================

/**
 * Default max tokens values for different use cases
 */
export const MAX_TOKENS = {
  /** Default for standard responses */
  DEFAULT: getEnvInt('VITE_MAX_TOKENS_DEFAULT', 4096),
  /** For chat/conversation models */
  CHAT: getEnvInt('VITE_MAX_TOKENS_CHAT', 4096),
  /** For reasoning models (Claude, etc.) */
  REASONING: getEnvInt('VITE_MAX_TOKENS_REASONING', 8192),
  /** For code generation */
  CODE: getEnvInt('VITE_MAX_TOKENS_CODE', 4096),
  /** For summaries */
  SUMMARY: getEnvInt('VITE_MAX_TOKENS_SUMMARY', 2048),
  /** Minimum value */
  MIN: getEnvInt('VITE_MAX_TOKENS_MIN', 1),
  /** Maximum value for most models */
  MAX_STANDARD: getEnvInt('VITE_MAX_TOKENS_MAX_STANDARD', 8192),
  /** Maximum value for extended models */
  MAX_EXTENDED: getEnvInt('VITE_MAX_TOKENS_MAX_EXTENDED', 1000000),
} as const;

// ============================================================================
// Temperature Constants
// ============================================================================

/**
 * Temperature values for different generation styles
 */
export const TEMPERATURE = {
  /** Deterministic/creative balance (default) */
  DEFAULT: 0.7,
  /** Deterministic, focused outputs */
  DETERMINISTIC: 0.0,
  /** Low randomness */
  LOW: 0.3,
  /** Medium randomness */
  MEDIUM: 0.7,
  /** High randomness, creative */
  HIGH: 1.0,
  /** Maximum creativity */
  MAX: 2.0,
  /** Minimum allowed value */
  MIN: 0.0,
  /** Maximum allowed value */
  MAX_ALLOWED: 2.0,
} as const;

// ============================================================================
// Provider Base URLs
// ============================================================================

/**
 * Base URLs for text LLM providers
 * Eliminates hardcoded URLs in model converters and adapters
 */
export const PROVIDER_BASE_URLS = {
  /** OpenAI API base URL */
  openai: getEnvString(
    'VITE_OPENAI_BASE_URL',
    'https://api.openai.com/v1'
  ),
  /** Anthropic Claude API base URL */
  anthropic: getEnvString(
    'VITE_ANTHROPIC_BASE_URL',
    'https://api.anthropic.com/v1'
  ),
  /** Zhipu AI (BigModel) API base URL */
  zhipu: getEnvString(
    'VITE_ZHIPU_BASE_URL',
    'https://open.bigmodel.cn/api/paas/v4'
  ),
  /** DeepSeek API base URL */
  deepseek: getEnvString(
    'VITE_DEEPSEEK_BASE_URL',
    'https://api.deepseek.com/v1'
  ),
  /** SiliconFlow API base URL */
  siliconflow: getEnvString(
    'VITE_SILICONFLOW_BASE_URL',
    'https://api.siliconflow.cn/v1'
  ),
  /** DashScope (Alibaba) API base URL */
  dashscope: getEnvString(
    'VITE_DASHSCOPE_BASE_URL',
    'https://dashscope.aliyuncs.com/api/v1'
  ),
  /** OpenRouter API base URL */
  openrouter: getEnvString(
    'VITE_OPENROUTER_BASE_URL',
    'https://openrouter.ai/api/v1'
  ),
  /** Gemini API base URL */
  gemini: getEnvString(
    'VITE_GEMINI_BASE_URL',
    'https://generativelanguage.googleapis.com/v1beta'
  ),
  /** Ollama local API base URL */
  ollama: getEnvString(
    'VITE_OLLAMA_BASE_URL',
    'http://localhost:11434/v1'
  ),
} as const;

// ============================================================================
// Text Provider API Key URLs
// ============================================================================

/**
 * API key URLs for text LLM providers
 */
export const TEXT_PROVIDER_API_KEY_URLS = {
  /** OpenAI */
  openai: getEnvString(
    'VITE_OPENAI_API_KEY_URL',
    'https://platform.openai.com/api-keys'
  ),
  /** Anthropic Claude */
  anthropic: getEnvString(
    'VITE_ANTHROPIC_API_KEY_URL',
    'https://console.anthropic.com/settings/keys'
  ),
  /** Zhipu AI */
  zhipu: getEnvString(
    'VITE_ZHIPU_API_KEY_URL',
    'https://open.bigmodel.cn/usercenter/apikeys'
  ),
  /** DeepSeek */
  deepseek: getEnvString(
    'VITE_DEEPSEEK_API_KEY_URL',
    'https://platform.deepseek.com/api_keys'
  ),
  /** SiliconFlow */
  siliconflow: getEnvString(
    'VITE_SILICONFLOW_API_KEY_URL',
    'https://cloud.siliconflow.cn/account/ak'
  ),
  /** DashScope */
  dashscope: getEnvString(
    'VITE_DASHSCOPE_API_KEY_URL',
    'https://bailian.console.aliyun.com/#/api-key'
  ),
  /** OpenRouter */
  openrouter: getEnvString(
    'VITE_OPENROUTER_API_KEY_URL',
    'https://openrouter.ai/settings/keys'
  ),
  /** Gemini */
  gemini: getEnvString(
    'VITE_GEMINI_API_KEY_URL',
    'https://aistudio.google.com/apikey'
  ),
  /** Ollama (docs instead of keys) */
  ollama: getEnvString(
    'VITE_OLLAMA_DOCS_URL',
    'https://ollama.com/download'
  ),
} as const;

// ============================================================================
// Model-Specific Defaults
// ============================================================================

/**
 * Default configurations for specific model families
 */
export const MODEL_FAMILY_DEFAULTS = {
  /** GPT-4 family defaults */
  gpt4: {
    contextLength: CONTEXT_LENGTHS.STANDARD_128K,
    maxTokens: MAX_TOKENS.DEFAULT,
    temperature: TEMPERATURE.DEFAULT,
    supportsTools: true,
    supportsVision: true,
  },
  /** Claude family defaults */
  claude: {
    contextLength: CONTEXT_LENGTHS.STANDARD_128K,
    maxTokens: MAX_TOKENS.REASONING,
    temperature: TEMPERATURE.DEFAULT,
    supportsTools: true,
    supportsVision: true,
  },
  /** DeepSeek family defaults */
  deepseek: {
    contextLength: CONTEXT_LENGTHS.STANDARD_128K,
    maxTokens: MAX_TOKENS.DEFAULT,
    temperature: TEMPERATURE.DEFAULT,
    supportsTools: true,
    supportsReasoning: true,
  },
  /** Gemini family defaults */
  gemini: {
    contextLength: CONTEXT_LENGTHS.LARGE_1M,
    maxTokens: MAX_TOKENS.MAX_EXTENDED,
    temperature: TEMPERATURE.DEFAULT,
    supportsTools: true,
    supportsVision: true,
  },
  /** Qwen family defaults (Alibaba) */
  qwen: {
    contextLength: CONTEXT_LENGTHS.LARGE_1M,
    maxTokens: MAX_TOKENS.DEFAULT,
    temperature: TEMPERATURE.DEFAULT,
    supportsTools: true,
  },
  /** Llama family defaults */
  llama: {
    contextLength: CONTEXT_LENGTHS.STANDARD_128K,
    maxTokens: MAX_TOKENS.DEFAULT,
    temperature: TEMPERATURE.DEFAULT,
    supportsTools: true,
  },
} as const;

// ============================================================================
// Streaming Constants
// ============================================================================

/**
 * Constants for streaming response handling
 */
export const STREAMING = {
  /** End-of-stream markers */
  doneMarkers: ['data: [DONE]', 'data:[DONE]'],
  /** Keep-alive interval in milliseconds */
  keepAliveIntervalMs: 15000,
  /** Chunk delimiter */
  chunkDelimiter: '\n\n',
  /** Line prefix for SSE */
  linePrefix: 'data: ',
} as const;

// ============================================================================
// Reasoning Constants
// ============================================================================

/**
 * Constants for reasoning/thinking output handling
 */
export const REASONING = {
  /** Opening think tag pattern */
  thinkTagOpen: '<think>',
  /** Closing think tag pattern */
  thinkTagClose: '</think>',
  /** Opening thinking tag pattern (Claude-style) */
  thinkingTagOpen: '<thinking>',
  /** Closing thinking tag pattern (Claude-style) */
  thinkingTagClose: '</thinking>',
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get base URL for a text provider
 * @param providerId - The provider ID
 * @returns The base URL or undefined if not found
 */
export function getProviderBaseUrl(providerId: string): string | undefined {
  return (PROVIDER_BASE_URLS as Record<string, string>)[providerId.toLowerCase()];
}

/**
 * Get API key URL for a text provider
 * @param providerId - The provider ID
 * @returns The API key URL or undefined if not found
 */
export function getTextProviderApiKeyUrl(providerId: string): string | undefined {
  return (TEXT_PROVIDER_API_KEY_URLS as Record<string, string>)[providerId.toLowerCase()];
}

/**
 * Get model family defaults
 * @param family - The model family name
 * @returns The default configuration or undefined if not found
 */
export function getModelFamilyDefaults(family: string): typeof MODEL_FAMILY_DEFAULTS.gpt4 | undefined {
  return (MODEL_FAMILY_DEFAULTS as Record<string, typeof MODEL_FAMILY_DEFAULTS.gpt4>)[family.toLowerCase()];
}
