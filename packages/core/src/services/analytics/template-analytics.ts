import { z } from 'zod'
import type { IStorageProvider } from '../storage/types'

export interface AnalyticsEvent {
  type: string
  timestamp: number
  data?: Record<string, unknown>
}

export interface TemplateSuggestionAnalytics {
  totalRequests: number
  byType: Record<string, number>
  byLanguage: Record<string, number>
  byComplexity: Record<string, number>
  dailyCounts: Record<string, number>
  lastUpdated: number
}

const analyticsSchema = z.object({
  totalRequests: z.number().default(0),
  byType: z.record(z.number()).default({}),
  byLanguage: z.record(z.number()).default({}),
  byComplexity: z.record(z.number()).default({}),
  dailyCounts: z.record(z.number()).default({}),
  lastUpdated: z.number(),
})

const ANALYTICS_KEY = 'template_suggestion_analytics'

function getDateKey(): string {
  return new Date().toISOString().split('T')[0]
}

export class TemplateAnalytics {
  private analytics: TemplateSuggestionAnalytics
  private storage: IStorageProvider | null = null

  constructor(storage?: IStorageProvider) {
    this.analytics = {
      totalRequests: 0,
      byType: {},
      byLanguage: {},
      byComplexity: {},
      dailyCounts: {},
      lastUpdated: Date.now(),
    }
    this.storage = storage ?? null
  }

  setStorageProvider(storage: IStorageProvider): void {
    this.storage = storage
  }

  async load(): Promise<void> {
    if (!this.storage) return

    try {
      const stored = await this.storage.getItem(ANALYTICS_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        const validated = analyticsSchema.parse(parsed)
        this.analytics = validated
      }
    } catch {
      this.analytics = {
        totalRequests: 0,
        byType: {},
        byLanguage: {},
        byComplexity: {},
        dailyCounts: {},
        lastUpdated: Date.now(),
      }
    }
  }

  async save(): Promise<void> {
    if (!this.storage) return

    try {
      this.analytics.lastUpdated = Date.now()
      await this.storage.setItem(ANALYTICS_KEY, JSON.stringify(this.analytics))
    } catch (error) {
      console.error('Failed to save analytics:', error)
    }
  }

  trackSuggestion(params: {
    detectedType?: string
    language?: string
    complexity?: string
  }): void {
    const dateKey = getDateKey()

    this.analytics.totalRequests += 1

    if (params.detectedType) {
      this.analytics.byType[params.detectedType] =
        (this.analytics.byType[params.detectedType] || 0) + 1
    }

    if (params.language) {
      this.analytics.byLanguage[params.language] =
        (this.analytics.byLanguage[params.language] || 0) + 1
    }

    if (params.complexity) {
      this.analytics.byComplexity[params.complexity] =
        (this.analytics.byComplexity[params.complexity] || 0) + 1
    }

    this.analytics.dailyCounts[dateKey] =
      (this.analytics.dailyCounts[dateKey] || 0) + 1
  }

  getAnalytics(): TemplateSuggestionAnalytics {
    return { ...this.analytics }
  }

  getSummary(): {
    totalRequests: number
    topType: string | null
    topLanguage: string | null
    topComplexity: string | null
    todayCount: number
  } {
    const today = getDateKey()

    const topType = Object.entries(this.analytics.byType).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || null

    const topLanguage = Object.entries(this.analytics.byLanguage).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || null

    const topComplexity = Object.entries(this.analytics.byComplexity).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || null

    return {
      totalRequests: this.analytics.totalRequests,
      topType,
      topLanguage,
      topComplexity,
      todayCount: this.analytics.dailyCounts[today] || 0,
    }
  }

  async trackAndSave(params: {
    detectedType?: string
    language?: string
    complexity?: string
  }): Promise<void> {
    this.trackSuggestion(params)
    await this.save()
  }
}

export const templateAnalytics = new TemplateAnalytics()
