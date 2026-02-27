import { z } from 'zod'
import type { IStorageProvider } from '../storage/types'

export interface AnalyticsEvent {
  type: string
  timestamp: number
  data?: Record<string, unknown>
}

export interface TemplateSuggestionAnalytics {
  totalRequests: number
  totalAcceptances: number
  byType: Record<string, number>
  byLanguage: Record<string, number>
  byComplexity: Record<string, number>
  byAcceptedTemplate: Record<string, number>
  dailyCounts: Record<string, number>
  dailyAcceptances: Record<string, number>
  lastUpdated: number
}

const analyticsSchema = z.object({
  totalRequests: z.number().default(0),
  totalAcceptances: z.number().default(0),
  byType: z.record(z.number()).default({}),
  byLanguage: z.record(z.number()).default({}),
  byComplexity: z.record(z.number()).default({}),
  byAcceptedTemplate: z.record(z.number()).default({}),
  dailyCounts: z.record(z.number()).default({}),
  dailyAcceptances: z.record(z.number()).default({}),
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
      totalAcceptances: 0,
      byType: {},
      byLanguage: {},
      byComplexity: {},
      byAcceptedTemplate: {},
      dailyCounts: {},
      dailyAcceptances: {},
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
        totalAcceptances: 0,
        byType: {},
        byLanguage: {},
        byComplexity: {},
        byAcceptedTemplate: {},
        dailyCounts: {},
        dailyAcceptances: {},
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

  trackAcceptedSuggestion(params: {
    templateId?: string
    detectedType?: string
    language?: string
  }): void {
    const dateKey = getDateKey()

    this.analytics.totalAcceptances += 1

    if (params.templateId) {
      this.analytics.byAcceptedTemplate[params.templateId] =
        (this.analytics.byAcceptedTemplate[params.templateId] || 0) + 1
    }

    if (params.detectedType) {
      this.analytics.byType[params.detectedType] =
        (this.analytics.byType[params.detectedType] || 0) + 1
    }

    if (params.language) {
      this.analytics.byLanguage[params.language] =
        (this.analytics.byLanguage[params.language] || 0) + 1
    }

    this.analytics.dailyAcceptances[dateKey] =
      (this.analytics.dailyAcceptances[dateKey] || 0) + 1
  }

  getAnalytics(): TemplateSuggestionAnalytics {
    return { ...this.analytics }
  }

  getSummary(): {
    totalRequests: number
    totalAcceptances: number
    acceptanceRate: number
    topType: string | null
    topLanguage: string | null
    topComplexity: string | null
    topAcceptedTemplate: string | null
    todayCount: number
    todayAcceptances: number
    todayAcceptanceRate: number
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

    const topAcceptedTemplate = Object.entries(this.analytics.byAcceptedTemplate).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || null

    const acceptanceRate = this.analytics.totalRequests > 0
      ? (this.analytics.totalAcceptances / this.analytics.totalRequests) * 100
      : 0

    const todayAcceptanceRate = this.analytics.dailyCounts[today] > 0
      ? ((this.analytics.dailyAcceptances[today] || 0) / this.analytics.dailyCounts[today]) * 100
      : 0

    return {
      totalRequests: this.analytics.totalRequests,
      totalAcceptances: this.analytics.totalAcceptances,
      acceptanceRate: Math.round(acceptanceRate * 10) / 10,
      topType,
      topLanguage,
      topComplexity,
      topAcceptedTemplate,
      todayCount: this.analytics.dailyCounts[today] || 0,
      todayAcceptances: this.analytics.dailyAcceptances[today] || 0,
      todayAcceptanceRate: Math.round(todayAcceptanceRate * 10) / 10,
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

  async trackAcceptedAndSave(params: {
    templateId?: string
    detectedType?: string
    language?: string
  }): Promise<void> {
    this.trackAcceptedSuggestion(params)
    await this.save()
  }
}

export const templateAnalytics = new TemplateAnalytics()
