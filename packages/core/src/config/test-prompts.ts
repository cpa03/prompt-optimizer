/**
 * Test Prompts Configuration Module
 * Eliminates hardcoded test prompts across all image adapters
 * Flexy loves modularity! All prompts centralized and configurable.
 */

import { getEnvString } from './env';

/**
 * Test prompt configurations for text-to-image generation
 */
export const TEST_PROMPTS_TEXT2IMAGE = {
  /** Default text-to-image test prompt */
  default: getEnvString('VITE_TEST_PROMPT_TEXT2IMAGE_DEFAULT', 'a simple red flower'),
  /** OpenAI-specific test prompt */
  openai: getEnvString('VITE_TEST_PROMPT_TEXT2IMAGE_OPENAI', 'a simple red flower'),
  /** SiliconFlow-specific test prompt */
  siliconflow: getEnvString('VITE_TEST_PROMPT_TEXT2IMAGE_SILICONFLOW', 'a flower'),
  /** Gemini-specific test prompt */
  gemini: getEnvString('VITE_TEST_PROMPT_TEXT2IMAGE_GEMINI', 'a simple red flower'),
  /** DashScope-specific test prompt (Chinese) */
  dashscope: getEnvString('VITE_TEST_PROMPT_TEXT2IMAGE_DASHSCOPE', '一朵简单的红色花朵'),
  /** ModelScope-specific test prompt */
  modelscope: getEnvString('VITE_TEST_PROMPT_TEXT2IMAGE_MODELSCOPE', 'a simple red flower'),
  /** SeaDream-specific test prompt */
  seedream: getEnvString('VITE_TEST_PROMPT_TEXT2IMAGE_SEEDREAM', 'a beautiful landscape with mountains and lake'),
  /** Ollama-specific test prompt */
  ollama: getEnvString('VITE_TEST_PROMPT_TEXT2IMAGE_OLLAMA', 'a simple red flower'),
  /** OpenRouter-specific test prompt */
  openrouter: getEnvString('VITE_TEST_PROMPT_TEXT2IMAGE_OPENROUTER', 'a simple red flower'),
} as const;

/**
 * Test prompt configurations for image-to-image generation
 */
export const TEST_PROMPTS_IMAGE2IMAGE = {
  /** Default image-to-image test prompt */
  default: getEnvString('VITE_TEST_PROMPT_IMAGE2IMAGE_DEFAULT', 'make this image more colorful'),
  /** OpenAI-specific test prompt */
  openai: getEnvString('VITE_TEST_PROMPT_IMAGE2IMAGE_OPENAI', 'make this image more colorful'),
  /** SiliconFlow-specific test prompt */
  siliconflow: getEnvString('VITE_TEST_PROMPT_IMAGE2IMAGE_SILICONFLOW', 'make it red'),
  /** Gemini-specific test prompt */
  gemini: getEnvString('VITE_TEST_PROMPT_IMAGE2IMAGE_GEMINI', 'make this image more colorful'),
  /** ModelScope-specific test prompt */
  modelscope: getEnvString('VITE_TEST_PROMPT_IMAGE2IMAGE_MODELSCOPE', 'make this image more colorful'),
  /** SeaDream-specific test prompt */
  seedream: getEnvString('VITE_TEST_PROMPT_IMAGE2IMAGE_SEEDREAM', 'enhance the colors and add more details'),
  /** Ollama-specific test prompt */
  ollama: getEnvString('VITE_TEST_PROMPT_IMAGE2IMAGE_OLLAMA', 'make this image more colorful'),
  /** OpenRouter-specific test prompt */
  openrouter: getEnvString('VITE_TEST_PROMPT_IMAGE2IMAGE_OPENROUTER', 'make this image more colorful'),
} as const;

/**
 * Get test prompt for a specific provider and test type
 * @param providerId - The provider ID (e.g., 'openai', 'siliconflow')
 * @param testType - The test type ('text2image' or 'image2image')
 * @returns The test prompt string
 */
export function getTestPrompt(
  providerId: string,
  testType: 'text2image' | 'image2image'
): string {
  const normalizedProviderId = providerId.toLowerCase();
  
  if (testType === 'text2image') {
    return (TEST_PROMPTS_TEXT2IMAGE as Record<string, string>)[normalizedProviderId] 
      || TEST_PROMPTS_TEXT2IMAGE.default;
  }
  
  return (TEST_PROMPTS_IMAGE2IMAGE as Record<string, string>)[normalizedProviderId]
    || TEST_PROMPTS_IMAGE2IMAGE.default;
}

/**
 * Test image generation count - centralized for consistency
 */
export const TEST_GENERATION_COUNT = {
  /** Default number of test images to generate */
  default: 1,
  /** Minimum allowed test count */
  min: 1,
  /** Maximum allowed test count */
  max: 1, // Currently fixed to 1 as multi-image is not supported
} as const;
