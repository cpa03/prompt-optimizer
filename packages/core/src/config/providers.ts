/**
 * Provider Configuration Module
 * Eliminates hardcoded provider URLs and defaults
 * Flexy loves modularity! All URLs configurable via environment.
 */

import { getEnvString } from './env'

// Ollama configuration - fully configurable via environment
export const OLLAMA_CONFIG = {
  defaultBaseURL: getEnvString('VITE_OLLAMA_BASE_URL', 'http://localhost:11434/v1'),
  fallbackApiKey: getEnvString('VITE_OLLAMA_API_KEY', 'ollama'),
  defaultModel: getEnvString('VITE_OLLAMA_DEFAULT_MODEL', 'llama2'),
} as const

// Provider URLs - all overridable via environment variables for enterprise proxies
export const PROVIDER_URLS = {
  deepseek: getEnvString('VITE_DEEPSEEK_BASE_URL', 'https://api.deepseek.com/v1'),
  siliconflow: getEnvString('VITE_SILICONFLOW_BASE_URL', 'https://api.siliconflow.cn/v1'),
  openai: getEnvString('VITE_OPENAI_BASE_URL', 'https://api.openai.com/v1'),
  openrouter: getEnvString('VITE_OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1'),
  gemini: getEnvString('VITE_GEMINI_BASE_URL', 'https://generativelanguage.googleapis.com'),
  dashscope: getEnvString('VITE_DASHSCOPE_BASE_URL', 'https://dashscope.aliyuncs.com/api/v1'),
  modelscope: getEnvString('VITE_MODELSCOPE_BASE_URL', 'https://api-inference.modelscope.cn/v1'),
  seedream: getEnvString('VITE_SEEDREAM_BASE_URL', 'https://api.seaart.ai/v1'),
  zhipu: getEnvString('VITE_ZHIPU_BASE_URL', 'https://open.bigmodel.cn/api/paas/v4'),
  anthropic: getEnvString('VITE_ANTHROPIC_BASE_URL', 'https://api.anthropic.com'),
  ollama: getEnvString('VITE_OLLAMA_BASE_URL', 'http://localhost:11434/v1'),
} as const

// Provider ID mapping
export const PROVIDER_ID_MAP: Record<string, string> = {
  openai: 'openai',
  anthropic: 'anthropic',
  ollama: 'ollama',
  deepseek: 'deepseek',
  siliconflow: 'siliconflow',
  openrouter: 'openrouter',
  gemini: 'gemini',
  dashscope: 'dashscope',
  modelscope: 'modelscope',
  zhipu: 'zhipu',
} as const

// Environment variable keys for API keys
export const PROVIDER_ENV_KEYS: Record<string, string> = {
  openai: 'VITE_OPENAI_API_KEY',
  anthropic: 'VITE_ANTHROPIC_API_KEY',
  ollama: 'VITE_OLLAMA_API_KEY',
  deepseek: 'VITE_DEEPSEEK_API_KEY',
  siliconflow: 'VITE_SILICONFLOW_API_KEY',
  openrouter: 'VITE_OPENROUTER_API_KEY',
  gemini: 'VITE_GEMINI_API_KEY',
  dashscope: 'VITE_DASHSCOPE_API_KEY',
  modelscope: 'VITE_MODELSCOPE_API_KEY',
  zhipu: 'VITE_ZHIPU_API_KEY',
} as const

// Helper function to get provider URL with environment override
export function getProviderUrl(provider: keyof typeof PROVIDER_URLS): string {
  return PROVIDER_URLS[provider]
}

// Helper function to check if a provider URL has been customized
export function isProviderUrlCustomized(provider: keyof typeof PROVIDER_URLS): boolean {
  const envKey = `VITE_${provider.toUpperCase()}_BASE_URL`
  const envValue = getEnvString(envKey, '')
  return !!envValue
}

export type ProviderId = keyof typeof PROVIDER_ID_MAP
export type ProviderUrl = keyof typeof PROVIDER_URLS
