/**
 * Provider ID Constants Module
 * Centralizes all LLM provider identifiers to eliminate hardcoded values
 * Flexy loves modularity! All provider IDs in one place.
 */

// ============================================================================
// Provider ID Constants
// ============================================================================

/**
 * Gemini provider ID
 * Google Generative AI provider
 */
export const PROVIDER_GEMINI = 'gemini' as const

/**
 * Anthropic provider ID
 * Anthropic Claude models provider
 */
export const PROVIDER_ANTHROPIC = 'anthropic' as const

/**
 * DeepSeek provider ID
 * DeepSeek OpenAI-compatible models provider
 */
export const PROVIDER_DEEPSEEK = 'deepseek' as const

/**
 * SiliconFlow provider ID
 * SiliconFlow OpenAI-compatible models provider
 */
export const PROVIDER_SILICONFLOW = 'siliconflow' as const

/**
 * Zhipu AI provider ID
 * Zhipu GLM OpenAI-compatible models provider
 */
export const PROVIDER_ZHIPU = 'zhipu' as const

/**
 * OpenAI provider ID
 * OpenAI GPT models and compatible APIs provider
 */
export const PROVIDER_OPENAI = 'openai' as const

/**
 * Custom provider ID
 * Used for custom OpenAI-compatible endpoints
 */
export const PROVIDER_CUSTOM = 'custom' as const

// ============================================================================
// Provider Registry
// ============================================================================

/**
 * All provider IDs registry
 * Centralized collection of all supported provider identifiers
 */
export const PROVIDER_IDS = {
  GEMINI: PROVIDER_GEMINI,
  ANTHROPIC: PROVIDER_ANTHROPIC,
  DEEPSEEK: PROVIDER_DEEPSEEK,
  SILICONFLOW: PROVIDER_SILICONFLOW,
  ZHIPU: PROVIDER_ZHIPU,
  OPENAI: PROVIDER_OPENAI,
  CUSTOM: PROVIDER_CUSTOM,
} as const

/**
 * Provider mapping from legacy provider strings to provider IDs
 * Used for converting legacy configurations
 */
export const LEGACY_PROVIDER_MAP: Record<string, string> = {
  [PROVIDER_GEMINI]: PROVIDER_GEMINI,
  [PROVIDER_ANTHROPIC]: PROVIDER_ANTHROPIC,
  [PROVIDER_DEEPSEEK]: PROVIDER_DEEPSEEK,
  [PROVIDER_SILICONFLOW]: PROVIDER_SILICONFLOW,
  [PROVIDER_ZHIPU]: PROVIDER_ZHIPU,
  [PROVIDER_OPENAI]: PROVIDER_OPENAI,
  [PROVIDER_CUSTOM]: PROVIDER_OPENAI, // Custom defaults to OpenAI
} as const

/**
 * Default provider ID
 * Used when provider is not recognized
 */
export const DEFAULT_PROVIDER_ID = PROVIDER_OPENAI

/**
 * Provider display names
 * Human-readable names for each provider
 */
export const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  [PROVIDER_GEMINI]: 'Google Gemini',
  [PROVIDER_ANTHROPIC]: 'Anthropic',
  [PROVIDER_DEEPSEEK]: 'DeepSeek',
  [PROVIDER_SILICONFLOW]: 'SiliconFlow',
  [PROVIDER_ZHIPU]: 'Zhipu AI',
  [PROVIDER_OPENAI]: 'OpenAI',
  [PROVIDER_CUSTOM]: 'Custom',
} as const

/**
 * Provider descriptions
 * Brief descriptions for each provider
 */
export const PROVIDER_DESCRIPTIONS: Record<string, string> = {
  [PROVIDER_GEMINI]: 'Google Generative AI models',
  [PROVIDER_ANTHROPIC]: 'Anthropic Claude models',
  [PROVIDER_DEEPSEEK]: 'DeepSeek OpenAI-compatible models',
  [PROVIDER_SILICONFLOW]: 'SiliconFlow OpenAI-compatible models',
  [PROVIDER_ZHIPU]: 'Zhipu GLM OpenAI-compatible models',
  [PROVIDER_OPENAI]: 'OpenAI GPT models and OpenAI-compatible APIs',
  [PROVIDER_CUSTOM]: 'Custom OpenAI-compatible endpoints',
} as const

// ============================================================================
// Provider Utility Functions
// ============================================================================

/**
 * Get provider ID from legacy provider string
 * @param legacyProvider The legacy provider string
 * @returns The standardized provider ID
 */
export function getProviderIdFromLegacy(legacyProvider: string): string {
  return LEGACY_PROVIDER_MAP[legacyProvider] || DEFAULT_PROVIDER_ID
}

/**
 * Check if a provider ID is valid
 * @param providerId The provider ID to check
 * @returns True if valid, false otherwise
 */
export function isValidProviderId(providerId: string): boolean {
  return Object.values(PROVIDER_IDS).includes(providerId as any)
}

/**
 * Get display name for a provider ID
 * @param providerId The provider ID
 * @returns The display name or the ID if not found
 */
export function getProviderDisplayName(providerId: string): string {
  return PROVIDER_DISPLAY_NAMES[providerId] || providerId
}

/**
 * Get description for a provider ID
 * @param providerId The provider ID
 * @returns The description or empty string if not found
 */
export function getProviderDescription(providerId: string): string {
  return PROVIDER_DESCRIPTIONS[providerId] || ''
}

// Type exports for type safety
export type ProviderId = typeof PROVIDER_IDS[keyof typeof PROVIDER_IDS]
