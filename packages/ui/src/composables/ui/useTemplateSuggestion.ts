import { ref } from 'vue'

import type { SuggestTemplatesResponse, TemplateSuggestion } from '@prompt-optimizer/core'

export interface UseTemplateSuggestionOptions {
  apiUrl?: string
}

export interface UseTemplateSuggestionReturn {
  suggestions: TemplateSuggestion[]
  analysis: SuggestTemplatesResponse['analysis'] | null
  loading: boolean
  error: string | null
  getSuggestions: (prompt: string, language?: 'zh' | 'en') => Promise<void>
  reset: () => void
}

/**
 * Template Suggestion Composable
 * Provides AI-powered template suggestions based on prompt pattern analysis
 * Integrates with the template-suggestion API endpoint
 */
export function useTemplateSuggestion(
  options: UseTemplateSuggestionOptions = {}
): UseTemplateSuggestionReturn {
  const apiUrl = options.apiUrl || '/api/template-suggestion'

  const suggestions = ref<TemplateSuggestion[]>([])
  const analysis = ref<SuggestTemplatesResponse['analysis'] | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getSuggestions = async (prompt: string, language: 'zh' | 'en' = 'en'): Promise<void> => {
    if (!prompt || prompt.trim().length === 0) {
      error.value = 'Prompt is required'
      return
    }

    loading.value = true
    error.value = null

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, language }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `API error: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to get suggestions')
      }

      suggestions.value = result.data.suggestions
      analysis.value = result.data.analysis
    } catch (e) {
      const err = e as Error
      error.value = err.message || 'Failed to get template suggestions'
      console.error('[useTemplateSuggestion] Error:', err)
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    suggestions.value = []
    analysis.value = null
    error.value = null
  }

  return {
    suggestions,
    analysis,
    loading,
    error,
    getSuggestions,
    reset,
  }
}
