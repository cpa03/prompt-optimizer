import { describe, it, expect } from 'vitest'
import { getTemplateSuggestions, analyzePromptPattern } from '../../../src/services/template/suggestion'

describe('Template Suggestion Service', () => {
  describe('analyzePromptPattern', () => {
    it('should detect question patterns', () => {
      const result = analyzePromptPattern('How do I write a function in Python?', 'en')
      expect(result.detectedType).toBe('question')
    })

    it('should detect task patterns', () => {
      const result = analyzePromptPattern('Write a story about a brave knight', 'en')
      expect(result.detectedType).toBe('task')
    })

    it('should detect code patterns', () => {
      const result = analyzePromptPattern('Debug this code function', 'en')
      expect(result.detectedType).toBe('code')
    })

    it('should detect complexity', () => {
      const simple = analyzePromptPattern('Hello world', 'en')
      expect(simple.complexity).toBe('simple')

      // Test with more than 100 words to trigger complex
      const complexWords = Array(101).fill('word').join(' ')
      const complex = analyzePromptPattern(complexWords, 'en')
      expect(complex.complexity).toBe('complex')
    })

    it('should detect context indicators', () => {
      const withContext = analyzePromptPattern('Write a function because I need it', 'en')
      expect(withContext.hasContext).toBe(true)

      const withoutContext = analyzePromptPattern('Write a function', 'en')
      expect(withoutContext.hasContext).toBe(false)
    })

    it('should work with Chinese prompts', () => {
      const result = analyzePromptPattern('请帮我写一段代码', 'zh')
      expect(result.detectedType).toBe('task')
    })

    it('should detect translation patterns', () => {
      const result = analyzePromptPattern('Translate this into French', 'en')
      expect(result.detectedType).toBe('translation')
    })

    it('should detect summarization patterns', () => {
      const result = analyzePromptPattern('Summarize the key points of this article', 'en')
      expect(result.detectedType).toBe('summarization')
    })

    it('should detect Chinese translation patterns', () => {
      const result = analyzePromptPattern('请把这段话翻译成英文', 'zh')
      expect(result.detectedType).toBe('translation')
    })

    it('should detect Chinese summarization patterns', () => {
      const result = analyzePromptPattern('请概括这篇文章的主要内容', 'zh')
      expect(result.detectedType).toBe('summarization')
    })
  })

  describe('getTemplateSuggestions', () => {
    it('should return suggestions for question prompts', () => {
      const result = getTemplateSuggestions('What is the meaning of life?', 'en')
      expect(result.suggestions.length).toBeGreaterThan(0)
      expect(result.analysis.detectedType).toBe('question')
    })

    it('should return suggestions for task prompts', () => {
      const result = getTemplateSuggestions('Create a todo app with React', 'en')
      expect(result.suggestions.length).toBeGreaterThan(0)
      expect(result.analysis.detectedType).toBe('task')
    })

    it('should return suggestions with confidence scores', () => {
      const result = getTemplateSuggestions('Write a poem about love', 'en')
      expect(result.suggestions[0].confidence).toBeGreaterThan(0)
      expect(result.suggestions[0].templateId).toBeDefined()
    })

    it('should include reasons in suggestions', () => {
      const result = getTemplateSuggestions('How does photosynthesis work?', 'en')
      expect(result.suggestions[0].reason).toBeDefined()
    })

    it('should default to English when no language specified', () => {
      const result = getTemplateSuggestions('Write code')
      expect(result.suggestions.length).toBeGreaterThan(0)
    })

    it('should work with Chinese prompts', () => {
      const result = getTemplateSuggestions('请帮我优化这段提示词', 'zh')
      expect(result.suggestions.length).toBeGreaterThan(0)
      expect(result.suggestions[0].templateName).toContain('优化')
    })

    it('should return suggestions for translation prompts', () => {
      const result = getTemplateSuggestions('Translate this email into Spanish', 'en')
      expect(result.suggestions.length).toBeGreaterThan(0)
      expect(result.analysis.detectedType).toBe('translation')
    })

    it('should return suggestions for summarization prompts', () => {
      const result = getTemplateSuggestions('Summarize this document', 'en')
      expect(result.suggestions.length).toBeGreaterThan(0)
      expect(result.analysis.detectedType).toBe('summarization')
    })

    it('should work with Chinese translation prompts', () => {
      const result = getTemplateSuggestions('把这段中文翻译成日文', 'zh')
      expect(result.suggestions.length).toBeGreaterThan(0)
      expect(result.analysis.detectedType).toBe('translation')
    })
  })
})
