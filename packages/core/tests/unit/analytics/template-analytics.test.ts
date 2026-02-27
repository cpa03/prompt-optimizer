import { describe, it, expect, beforeEach } from 'vitest'
import { TemplateAnalytics } from '../../../src/services/analytics/template-analytics'

describe('TemplateAnalytics', () => {
  let analytics: TemplateAnalytics

  beforeEach(() => {
    analytics = new TemplateAnalytics()
  })

  describe('trackSuggestion', () => {
    it('should track total requests', () => {
      analytics.trackSuggestion({ detectedType: 'question', language: 'en', complexity: 'simple' })
      analytics.trackSuggestion({ detectedType: 'task', language: 'zh', complexity: 'complex' })

      const result = analytics.getAnalytics()
      expect(result.totalRequests).toBe(2)
    })

    it('should track by type', () => {
      analytics.trackSuggestion({ detectedType: 'question' })
      analytics.trackSuggestion({ detectedType: 'question' })
      analytics.trackSuggestion({ detectedType: 'task' })

      const result = analytics.getAnalytics()
      expect(result.byType.question).toBe(2)
      expect(result.byType.task).toBe(1)
    })

    it('should track by language', () => {
      analytics.trackSuggestion({ language: 'en' })
      analytics.trackSuggestion({ language: 'en' })
      analytics.trackSuggestion({ language: 'zh' })

      const result = analytics.getAnalytics()
      expect(result.byLanguage.en).toBe(2)
      expect(result.byLanguage.zh).toBe(1)
    })

    it('should track by complexity', () => {
      analytics.trackSuggestion({ complexity: 'simple' })
      analytics.trackSuggestion({ complexity: 'complex' })
      analytics.trackSuggestion({ complexity: 'complex' })

      const result = analytics.getAnalytics()
      expect(result.byComplexity.simple).toBe(1)
      expect(result.byComplexity.complex).toBe(2)
    })

    it('should track daily counts', () => {
      analytics.trackSuggestion({})
      analytics.trackSuggestion({})

      const result = analytics.getAnalytics()
      const today = new Date().toISOString().split('T')[0]
      expect(result.dailyCounts[today]).toBe(2)
    })
  })

  describe('trackAcceptedSuggestion', () => {
    it('should track total acceptances', () => {
      analytics.trackAcceptedSuggestion({ templateId: 'general-optimize', detectedType: 'question', language: 'en' })
      analytics.trackAcceptedSuggestion({ templateId: 'user-prompt-basic', detectedType: 'task', language: 'zh' })

      const result = analytics.getAnalytics()
      expect(result.totalAcceptances).toBe(2)
    })

    it('should track by accepted template', () => {
      analytics.trackAcceptedSuggestion({ templateId: 'general-optimize' })
      analytics.trackAcceptedSuggestion({ templateId: 'general-optimize' })
      analytics.trackAcceptedSuggestion({ templateId: 'user-prompt-basic' })

      const result = analytics.getAnalytics()
      expect(result.byAcceptedTemplate['general-optimize']).toBe(2)
      expect(result.byAcceptedTemplate['user-prompt-basic']).toBe(1)
    })

    it('should track daily acceptances', () => {
      analytics.trackAcceptedSuggestion({ templateId: 'general-optimize' })
      analytics.trackAcceptedSuggestion({ templateId: 'user-prompt-basic' })

      const result = analytics.getAnalytics()
      const today = new Date().toISOString().split('T')[0]
      expect(result.dailyAcceptances[today]).toBe(2)
    })
  })

  describe('getSummary with acceptance', () => {
    it('should calculate acceptance rate', () => {
      analytics.trackSuggestion({ detectedType: 'question', language: 'en' })
      analytics.trackSuggestion({ detectedType: 'question', language: 'en' })
      analytics.trackSuggestion({ detectedType: 'task', language: 'zh' })
      analytics.trackSuggestion({ detectedType: 'task', language: 'zh' })
      analytics.trackSuggestion({ detectedType: 'task', language: 'zh' })

      analytics.trackAcceptedSuggestion({ templateId: 'general-optimize', detectedType: 'question' })
      analytics.trackAcceptedSuggestion({ templateId: 'user-prompt-basic', detectedType: 'task' })

      const summary = analytics.getSummary()
      expect(summary.totalRequests).toBe(5)
      expect(summary.totalAcceptances).toBe(2)
      expect(summary.acceptanceRate).toBe(40)
    })

    it('should return top accepted template', () => {
      analytics.trackSuggestion({})
      analytics.trackSuggestion({})
      analytics.trackSuggestion({})

      analytics.trackAcceptedSuggestion({ templateId: 'general-optimize' })
      analytics.trackAcceptedSuggestion({ templateId: 'general-optimize' })
      analytics.trackAcceptedSuggestion({ templateId: 'user-prompt-basic' })

      const summary = analytics.getSummary()
      expect(summary.topAcceptedTemplate).toBe('general-optimize')
    })

    it('should calculate today acceptance rate', () => {
      analytics.trackSuggestion({})
      analytics.trackSuggestion({})
      analytics.trackSuggestion({})
      analytics.trackSuggestion({})

      analytics.trackAcceptedSuggestion({ templateId: 'general-optimize' })
      analytics.trackAcceptedSuggestion({ templateId: 'user-prompt-basic' })

      const summary = analytics.getSummary()
      expect(summary.todayCount).toBe(4)
      expect(summary.todayAcceptances).toBe(2)
      expect(summary.todayAcceptanceRate).toBe(50)
    })

    it('should return zero acceptance rate when no requests', () => {
      const summary = analytics.getSummary()
      expect(summary.acceptanceRate).toBe(0)
      expect(summary.todayAcceptanceRate).toBe(0)
    })
  })

  describe('getSummary', () => {
    it('should return summary with top metrics', () => {
      analytics.trackSuggestion({ detectedType: 'question', language: 'en', complexity: 'simple' })
      analytics.trackSuggestion({ detectedType: 'question', language: 'en', complexity: 'simple' })
      analytics.trackSuggestion({ detectedType: 'task', language: 'zh', complexity: 'complex' })

      const summary = analytics.getSummary()
      expect(summary.totalRequests).toBe(3)
      expect(summary.topType).toBe('question')
      expect(summary.topLanguage).toBe('en')
      expect(summary.topComplexity).toBe('simple')
      expect(summary.todayCount).toBe(3)
    })

    it('should return null for top metrics when no data', () => {
      const summary = analytics.getSummary()
      expect(summary.totalRequests).toBe(0)
      expect(summary.topType).toBeNull()
      expect(summary.topLanguage).toBeNull()
      expect(summary.topComplexity).toBeNull()
    })
  })

  describe('with storage provider', () => {
    it('should handle storage provider', async () => {
      const mockStorage = {
        getItem: async () => null,
        setItem: async () => {},
        removeItem: async () => {},
        clearAll: async () => {},
        keys: async () => [],
        updateData: async () => {},
        batchUpdate: async () => {},
      }

      analytics.setStorageProvider(mockStorage as any)
      await analytics.load()

      analytics.trackSuggestion({ detectedType: 'task' })
      await analytics.save()

      const result = analytics.getAnalytics()
      expect(result.totalRequests).toBe(1)
    })

    it('should load existing analytics from storage', async () => {
      const existingAnalytics = {
        totalRequests: 10,
        totalAcceptances: 3,
        byType: { question: 5, task: 5 },
        byLanguage: { en: 8, zh: 2 },
        byComplexity: { simple: 6, complex: 4 },
        byAcceptedTemplate: { 'general-optimize': 2, 'user-prompt-basic': 1 },
        dailyCounts: { '2026-02-25': 10 },
        dailyAcceptances: { '2026-02-25': 3 },
        lastUpdated: Date.now(),
      }

      const mockStorage = {
        getItem: async () => JSON.stringify(existingAnalytics),
        setItem: async () => {},
        removeItem: async () => {},
        clearAll: async () => {},
        keys: async () => [],
        updateData: async () => {},
        batchUpdate: async () => {},
      }

      analytics.setStorageProvider(mockStorage as any)
      await analytics.load()

      const result = analytics.getAnalytics()
      expect(result.totalRequests).toBe(10)
      expect(result.totalAcceptances).toBe(3)
      expect(result.byType.question).toBe(5)
      expect(result.byAcceptedTemplate['general-optimize']).toBe(2)
    })
  })
})
