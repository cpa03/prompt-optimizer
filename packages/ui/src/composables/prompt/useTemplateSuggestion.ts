import { ref, computed } from 'vue'
import { getTemplateSuggestions, type SuggestTemplatesResponse } from '@prompt-optimizer/core'

export type SupportedLanguage = 'zh-CN' | 'zh-TW' | 'en-US'

export interface TemplateSuggestionState {
  suggestions: SuggestTemplatesResponse | null
  isAnalyzing: boolean
  error: string | null
}

/**
 * useTemplateSuggestion Composable
 *
 * Provides AI-powered template suggestions based on prompt pattern analysis.
 * This composable wraps the core template suggestion service.
 *
 * Features:
 * - Local pattern analysis (no API calls needed)
 * - Bilingual support (zh/en)
 * - Reactive suggestions state
 *
 * Part of Growth-Innovation-Strategist Phase 2: UI Integration
 */
export function useTemplateSuggestion() {
  const suggestions = ref<SuggestTemplatesResponse | null>(null)
  const isAnalyzing = ref(false)
  const error = ref<string | null>(null)

  /**
   * Map app locale to suggestion language
   */
  function mapLocaleToSuggestionLanguage(locale: SupportedLanguage): 'zh' | 'en' {
    if (locale.startsWith('zh')) {
      return 'zh'
    }
    return 'en'
  }

  /**
   * Analyze prompt and get template suggestions
   * @param prompt - The prompt text to analyze
   * @param locale - Current app locale (default: en-US)
   */
  function analyzePrompt(prompt: string, locale: SupportedLanguage = 'en-US'): void {
    if (!prompt || prompt.trim().length === 0) {
      suggestions.value = null
      error.value = null
      return
    }

    isAnalyzing.value = true
    error.value = null

    try {
      const language = mapLocaleToSuggestionLanguage(locale)
      const result = getTemplateSuggestions(prompt, language)
      suggestions.value = result
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Analysis failed'
      suggestions.value = null
    } finally {
      isAnalyzing.value = false
    }
  }

  /**
   * Clear suggestions
   */
  function clearSuggestions(): void {
    suggestions.value = null
    error.value = null
  }

  /**
   * Check if suggestions are available
   */
  const hasSuggestions = computed(() => {
    return suggestions.value !== null && suggestions.value.suggestions.length > 0
  })

  /**
   * Get top suggestion
   */
  const topSuggestion = computed(() => {
    if (!hasSuggestions.value) return null
    return suggestions.value!.suggestions[0]
  })

  return {
    suggestions,
    isAnalyzing,
    error,
    hasSuggestions,
    topSuggestion,
    analyzePrompt,
    clearSuggestions,
  }
}
