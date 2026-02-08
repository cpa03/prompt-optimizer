/**
 * Provider Configuration Module
 * Eliminates hardcoded provider URLs and defaults
 * Flexy loves modularity! No more hardcoded values.
 */

export const OLLAMA_CONFIG = {
  defaultBaseURL: 'http://localhost:11434/v1',
  fallbackApiKey: 'ollama',
  defaultModel: 'llama2',
} as const;

export const PROVIDER_URLS = {
  deepseek: 'https://api.deepseek.com/v1',
  siliconflow: 'https://api.siliconflow.cn/v1',
  openai: 'https://api.openai.com/v1',
  openrouter: 'https://openrouter.ai/api/v1',
  gemini: 'https://generativelanguage.googleapis.com/v1beta',
  dashscope: 'https://dashscope.aliyuncs.com/api/v1',
  modelscope: 'https://api-inference.modelscope.cn/v1',
  seedream: 'https://api.seaart.ai/v1',
  zhipu: 'https://open.bigmodel.cn/api/paas/v4',
} as const;

export const PROVIDER_ID_MAP: Record<string, string> = {
  'openai': 'openai',
  'anthropic': 'anthropic',
  'ollama': 'ollama',
  'deepseek': 'deepseek',
  'siliconflow': 'siliconflow',
  'openrouter': 'openrouter',
  'gemini': 'gemini',
  'dashscope': 'dashscope',
  'modelscope': 'modelscope',
  'zhipu': 'zhipu',
} as const;

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
} as const;

export type ProviderId = keyof typeof PROVIDER_ID_MAP;
export type ProviderUrl = keyof typeof PROVIDER_URLS;
