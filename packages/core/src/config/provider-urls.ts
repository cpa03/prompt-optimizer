/**
 * Provider API Key URLs Configuration Module
 * Eliminates hardcoded API key URLs across all image adapters
 * Flexy loves modularity! All URLs centralized and configurable.
 */

import { getEnvString } from './env'

/**
 * API key URLs for all image providers
 * These can be overridden via environment variables for enterprise deployments
 */
export const PROVIDER_API_KEY_URLS = {
  /** OpenAI API key URL */
  openai: getEnvString('VITE_OPENAI_API_KEY_URL', 'https://platform.openai.com/api-keys'),
  /** Google Gemini API key URL */
  gemini: getEnvString('VITE_GEMINI_API_KEY_URL', 'https://aistudio.google.com/apikey'),
  /** SiliconFlow API key URL */
  siliconflow: getEnvString(
    'VITE_SILICONFLOW_API_KEY_URL',
    'https://cloud.siliconflow.cn/account/ak'
  ),
  /** Alibaba DashScope API key URL */
  dashscope: getEnvString(
    'VITE_DASHSCOPE_API_KEY_URL',
    'https://bailian.console.aliyun.com/#/api-key'
  ),
  /** ModelScope API key URL */
  modelscope: getEnvString('VITE_MODELSCOPE_API_KEY_URL', 'https://modelscope.cn/my/apiKey'),
  /** SeaDream API key URL */
  seedream: getEnvString('VITE_SEEDREAM_API_KEY_URL', 'https://www.seaart.ai/workroom'),
  /** OpenRouter API key URL */
  openrouter: getEnvString('VITE_OPENROUTER_API_KEY_URL', 'https://openrouter.ai/keys'),
  /** Ollama - typically no API key needed, but provide docs URL */
  ollama: getEnvString('VITE_OLLAMA_DOCS_URL', 'https://ollama.com/download'),
  /** Anthropic - for future use */
  anthropic: getEnvString(
    'VITE_ANTHROPIC_API_KEY_URL',
    'https://console.anthropic.com/settings/keys'
  ),
  /** DeepSeek - for future use */
  deepseek: getEnvString('VITE_DEEPSEEK_API_KEY_URL', 'https://platform.deepseek.com/api_keys'),
  /** Zhipu AI - for future use */
  zhipu: getEnvString('VITE_ZHIPU_API_KEY_URL', 'https://open.bigmodel.cn/usercenter/apikeys'),
} as const

/**
 * Provider documentation URLs for help and reference
 */
export const PROVIDER_DOCS_URLS = {
  /** OpenAI documentation */
  openai: getEnvString('VITE_OPENAI_DOCS_URL', 'https://platform.openai.com/docs/guides/images'),
  /** Gemini documentation */
  gemini: getEnvString(
    'VITE_GEMINI_DOCS_URL',
    'https://ai.google.dev/gemini-api/docs/image-generation'
  ),
  /** SiliconFlow documentation */
  siliconflow: getEnvString('VITE_SILICONFLOW_DOCS_URL', 'https://docs.siliconflow.cn/'),
  /** DashScope documentation */
  dashscope: getEnvString(
    'VITE_DASHSCOPE_DOCS_URL',
    'https://help.aliyun.com/zh/model-studio/qwen-image-api'
  ),
  /** ModelScope documentation */
  modelscope: getEnvString('VITE_MODELSCOPE_DOCS_URL', 'https://modelscope.cn/docs'),
  /** SeaDream documentation */
  seedream: getEnvString('VITE_SEEDREAM_DOCS_URL', 'https://www.seaart.ai/docs'),
  /** OpenRouter documentation */
  openrouter: getEnvString('VITE_OPENROUTER_DOCS_URL', 'https://openrouter.ai/docs'),
  /** Ollama documentation */
  ollama: getEnvString(
    'VITE_OLLAMA_DOCS_URL',
    'https://github.com/ollama/ollama/blob/main/docs/modelfile.md'
  ),
} as const

/**
 * Get API key URL for a provider
 * @param providerId - The provider ID
 * @returns The API key URL or undefined if not found
 */
export function getProviderApiKeyUrl(providerId: string): string | undefined {
  return (PROVIDER_API_KEY_URLS as Record<string, string>)[providerId.toLowerCase()]
}

/**
 * Get documentation URL for a provider
 * @param providerId - The provider ID
 * @returns The documentation URL or undefined if not found
 */
export function getProviderDocsUrl(providerId: string): string | undefined {
  return (PROVIDER_DOCS_URLS as Record<string, string>)[providerId.toLowerCase()]
}
