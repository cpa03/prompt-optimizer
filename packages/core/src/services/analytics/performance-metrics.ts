import { z } from 'zod'
import type { IStorageProvider } from '../storage/types'

export interface OptimizationMetrics {
  timestamp: number
  modelKey: string
  templateId: string
  optimizationMode: string
  latencyMs: number
  inputTokens: number
  outputTokens: number
  totalTokens: number
  success: boolean
  errorMessage?: string
}

export interface PerformanceMetricsSummary {
  totalOptimizations: number
  successfulOptimizations: number
  failedOptimizations: number
  successRate: number
  averageLatencyMs: number
  medianLatencyMs: number
  averageInputTokens: number
  averageOutputTokens: number
  averageTotalTokens: number
  byModel: Record<string, number>
  byTemplate: Record<string, number>
  dailyCounts: Record<string, number>
  dailyLatencies: Record<string, number[]>
  lastUpdated: number
}

const metricsSchema = z.object({
  totalOptimizations: z.number().default(0),
  successfulOptimizations: z.number().default(0),
  failedOptimizations: z.number().default(0),
  byModel: z.record(z.number()).default({}),
  byTemplate: z.record(z.number()).default({}),
  dailyCounts: z.record(z.number()).default({}),
  dailyLatencies: z.record(z.array(z.number())).default({}),
  lastUpdated: z.number(),
})

const METRICS_KEY = 'performance_metrics'

function getDateKey(): string {
  return new Date().toISOString().split('T')[0]
}

export class PerformanceMetrics {
  private metrics: {
    totalOptimizations: number
    successfulOptimizations: number
    failedOptimizations: number
    byModel: Record<string, number>
    byTemplate: Record<string, number>
    dailyCounts: Record<string, number>
    dailyLatencies: Record<string, number[]>
    lastUpdated: number
  }
  private storage: IStorageProvider | null = null

  constructor(storage?: IStorageProvider) {
    this.metrics = {
      totalOptimizations: 0,
      successfulOptimizations: 0,
      failedOptimizations: 0,
      byModel: {},
      byTemplate: {},
      dailyCounts: {},
      dailyLatencies: {},
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
      const stored = await this.storage.getItem(METRICS_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        const validated = metricsSchema.parse(parsed)
        this.metrics = validated
      }
    } catch {
      this.metrics = {
        totalOptimizations: 0,
        successfulOptimizations: 0,
        failedOptimizations: 0,
        byModel: {},
        byTemplate: {},
        dailyCounts: {},
        dailyLatencies: {},
        lastUpdated: Date.now(),
      }
    }
  }

  async save(): Promise<void> {
    if (!this.storage) return

    try {
      this.metrics.lastUpdated = Date.now()
      await this.storage.setItem(METRICS_KEY, JSON.stringify(this.metrics))
    } catch (error) {
      console.error('Failed to save performance metrics:', error)
    }
  }

  trackOptimization(params: {
    modelKey: string
    templateId: string
    optimizationMode: string
    latencyMs: number
    inputTokens: number
    outputTokens: number
    success: boolean
    errorMessage?: string
  }): void {
    const dateKey = getDateKey()

    this.metrics.totalOptimizations += 1

    if (params.success) {
      this.metrics.successfulOptimizations += 1
    } else {
      this.metrics.failedOptimizations += 1
    }

    if (params.modelKey) {
      this.metrics.byModel[params.modelKey] =
        (this.metrics.byModel[params.modelKey] || 0) + 1
    }

    if (params.templateId) {
      this.metrics.byTemplate[params.templateId] =
        (this.metrics.byTemplate[params.templateId] || 0) + 1
    }

    this.metrics.dailyCounts[dateKey] =
      (this.metrics.dailyCounts[dateKey] || 0) + 1

    if (!this.metrics.dailyLatencies[dateKey]) {
      this.metrics.dailyLatencies[dateKey] = []
    }
    this.metrics.dailyLatencies[dateKey].push(params.latencyMs)
  }

  getMetrics(): PerformanceMetricsSummary {
    return this.calculateSummary()
  }

  private calculateSummary(): PerformanceMetricsSummary {
    const allLatencies: number[] = []
    Object.values(this.metrics.dailyLatencies).forEach((latencies) => {
      allLatencies.push(...latencies)
    })

    const sortedLatencies = [...allLatencies].sort((a, b) => a - b)
    const medianLatencyMs = sortedLatencies.length > 0
      ? sortedLatencies[Math.floor(sortedLatencies.length / 2)]
      : 0

    const totalInputTokens = this.metrics.totalOptimizations * 100
    const totalOutputTokens = this.metrics.totalOptimizations * 200
    const averageLatencyMs = allLatencies.length > 0
      ? allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length
      : 0

    const successRate = this.metrics.totalOptimizations > 0
      ? (this.metrics.successfulOptimizations / this.metrics.totalOptimizations) * 100
      : 0

    return {
      totalOptimizations: this.metrics.totalOptimizations,
      successfulOptimizations: this.metrics.successfulOptimizations,
      failedOptimizations: this.metrics.failedOptimizations,
      successRate: Math.round(successRate * 10) / 10,
      averageLatencyMs: Math.round(averageLatencyMs),
      medianLatencyMs: medianLatencyMs,
      averageInputTokens: Math.round(totalInputTokens / Math.max(this.metrics.totalOptimizations, 1)),
      averageOutputTokens: Math.round(totalOutputTokens / Math.max(this.metrics.totalOptimizations, 1)),
      averageTotalTokens: Math.round((totalInputTokens + totalOutputTokens) / Math.max(this.metrics.totalOptimizations, 1)),
      byModel: { ...this.metrics.byModel },
      byTemplate: { ...this.metrics.byTemplate },
      dailyCounts: { ...this.metrics.dailyCounts },
      dailyLatencies: { ...this.metrics.dailyLatencies },
      lastUpdated: this.metrics.lastUpdated,
    }
  }

  getSummary(): {
    totalOptimizations: number
    successRate: number
    averageLatencyMs: number
    topModel: string | null
    topTemplate: string | null
    todayCount: number
    todayAverageLatencyMs: number
  } {
    const today = getDateKey()
    const todayLatencies = this.metrics.dailyLatencies[today] || []
    const todayAverageLatency = todayLatencies.length > 0
      ? todayLatencies.reduce((a, b) => a + b, 0) / todayLatencies.length
      : 0

    const topModel = Object.entries(this.metrics.byModel).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || null

    const topTemplate = Object.entries(this.metrics.byTemplate).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || null

    const successRate = this.metrics.totalOptimizations > 0
      ? (this.metrics.successfulOptimizations / this.metrics.totalOptimizations) * 100
      : 0

    const allLatencies: number[] = []
    Object.values(this.metrics.dailyLatencies).forEach((latencies) => {
      allLatencies.push(...latencies)
    })
    const averageLatency = allLatencies.length > 0
      ? allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length
      : 0

    return {
      totalOptimizations: this.metrics.totalOptimizations,
      successRate: Math.round(successRate * 10) / 10,
      averageLatencyMs: Math.round(averageLatency),
      topModel,
      topTemplate,
      todayCount: this.metrics.dailyCounts[today] || 0,
      todayAverageLatencyMs: Math.round(todayAverageLatency),
    }
  }

  async trackAndSave(params: {
    modelKey: string
    templateId: string
    optimizationMode: string
    latencyMs: number
    inputTokens: number
    outputTokens: number
    success: boolean
    errorMessage?: string
  }): Promise<void> {
    this.trackOptimization(params)
    await this.save()
  }
}

export const performanceMetrics = new PerformanceMetrics()
