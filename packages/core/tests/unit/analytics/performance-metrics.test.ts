import { describe, it, expect, beforeEach } from 'vitest'
import { PerformanceMetrics } from '../../../src/services/analytics/performance-metrics'

describe('PerformanceMetrics', () => {
  let metrics: PerformanceMetrics

  beforeEach(() => {
    metrics = new PerformanceMetrics()
  })

  describe('trackOptimization', () => {
    it('should track total optimizations', () => {
      metrics.trackOptimization({
        modelKey: 'gpt-4o',
        templateId: 'general-optimize',
        optimizationMode: 'user',
        latencyMs: 1500,
        inputTokens: 100,
        outputTokens: 200,
        success: true,
      })
      metrics.trackOptimization({
        modelKey: 'claude-3',
        templateId: 'user-optimize',
        optimizationMode: 'system',
        latencyMs: 2000,
        inputTokens: 150,
        outputTokens: 250,
        success: true,
      })

      const result = metrics.getMetrics()
      expect(result.totalOptimizations).toBe(2)
    })

    it('should track successful optimizations', () => {
      metrics.trackOptimization({
        modelKey: 'gpt-4o',
        templateId: 'general-optimize',
        optimizationMode: 'user',
        latencyMs: 1500,
        inputTokens: 100,
        outputTokens: 200,
        success: true,
      })
      metrics.trackOptimization({
        modelKey: 'claude-3',
        templateId: 'user-optimize',
        optimizationMode: 'system',
        latencyMs: 2000,
        inputTokens: 150,
        outputTokens: 250,
        success: false,
        errorMessage: 'API error',
      })

      const result = metrics.getMetrics()
      expect(result.successfulOptimizations).toBe(1)
      expect(result.failedOptimizations).toBe(1)
    })

    it('should track by model', () => {
      metrics.trackOptimization({
        modelKey: 'gpt-4o',
        templateId: 'general-optimize',
        optimizationMode: 'user',
        latencyMs: 1500,
        inputTokens: 100,
        outputTokens: 200,
        success: true,
      })
      metrics.trackOptimization({
        modelKey: 'gpt-4o',
        templateId: 'user-optimize',
        optimizationMode: 'system',
        latencyMs: 2000,
        inputTokens: 150,
        outputTokens: 250,
        success: true,
      })
      metrics.trackOptimization({
        modelKey: 'claude-3',
        templateId: 'general-optimize',
        optimizationMode: 'user',
        latencyMs: 1800,
        inputTokens: 120,
        outputTokens: 180,
        success: true,
      })

      const result = metrics.getMetrics()
      expect(result.byModel['gpt-4o']).toBe(2)
      expect(result.byModel['claude-3']).toBe(1)
    })

    it('should track by template', () => {
      metrics.trackOptimization({
        modelKey: 'gpt-4o',
        templateId: 'general-optimize',
        optimizationMode: 'user',
        latencyMs: 1500,
        inputTokens: 100,
        outputTokens: 200,
        success: true,
      })
      metrics.trackOptimization({
        modelKey: 'claude-3',
        templateId: 'general-optimize',
        optimizationMode: 'system',
        latencyMs: 2000,
        inputTokens: 150,
        outputTokens: 250,
        success: true,
      })
      metrics.trackOptimization({
        modelKey: 'gpt-4o',
        templateId: 'user-optimize',
        optimizationMode: 'user',
        latencyMs: 1800,
        inputTokens: 120,
        outputTokens: 180,
        success: true,
      })

      const result = metrics.getMetrics()
      expect(result.byTemplate['general-optimize']).toBe(2)
      expect(result.byTemplate['user-optimize']).toBe(1)
    })

    it('should track daily counts', () => {
      metrics.trackOptimization({
        modelKey: 'gpt-4o',
        templateId: 'general-optimize',
        optimizationMode: 'user',
        latencyMs: 1500,
        inputTokens: 100,
        outputTokens: 200,
        success: true,
      })
      metrics.trackOptimization({
        modelKey: 'claude-3',
        templateId: 'general-optimize',
        optimizationMode: 'system',
        latencyMs: 2000,
        inputTokens: 150,
        outputTokens: 250,
        success: true,
      })

      const result = metrics.getMetrics()
      const today = new Date().toISOString().split('T')[0]
      expect(result.dailyCounts[today]).toBe(2)
    })

    it('should track latency per day', () => {
      metrics.trackOptimization({
        modelKey: 'gpt-4o',
        templateId: 'general-optimize',
        optimizationMode: 'user',
        latencyMs: 1000,
        inputTokens: 100,
        outputTokens: 200,
        success: true,
      })
      metrics.trackOptimization({
        modelKey: 'claude-3',
        templateId: 'general-optimize',
        optimizationMode: 'system',
        latencyMs: 2000,
        inputTokens: 150,
        outputTokens: 250,
        success: true,
      })

      const result = metrics.getMetrics()
      const today = new Date().toISOString().split('T')[0]
      expect(result.dailyLatencies[today]).toEqual([1000, 2000])
    })
  })

  describe('getSummary', () => {
    it('should calculate success rate', () => {
      metrics.trackOptimization({
        modelKey: 'gpt-4o',
        templateId: 'general-optimize',
        optimizationMode: 'user',
        latencyMs: 1500,
        inputTokens: 100,
        outputTokens: 200,
        success: true,
      })
      metrics.trackOptimization({
        modelKey: 'claude-3',
        templateId: 'general-optimize',
        optimizationMode: 'system',
        latencyMs: 2000,
        inputTokens: 150,
        outputTokens: 250,
        success: false,
      })
      metrics.trackOptimization({
        modelKey: 'gemini',
        templateId: 'user-optimize',
        optimizationMode: 'user',
        latencyMs: 1800,
        inputTokens: 120,
        outputTokens: 180,
        success: true,
      })

      const summary = metrics.getSummary()
      expect(summary.totalOptimizations).toBe(3)
      expect(summary.successRate).toBeCloseTo(66.7, 1)
    })

    it('should calculate average latency', () => {
      metrics.trackOptimization({
        modelKey: 'gpt-4o',
        templateId: 'general-optimize',
        optimizationMode: 'user',
        latencyMs: 1000,
        inputTokens: 100,
        outputTokens: 200,
        success: true,
      })
      metrics.trackOptimization({
        modelKey: 'claude-3',
        templateId: 'general-optimize',
        optimizationMode: 'system',
        latencyMs: 2000,
        inputTokens: 150,
        outputTokens: 250,
        success: true,
      })
      metrics.trackOptimization({
        modelKey: 'gemini',
        templateId: 'user-optimize',
        optimizationMode: 'user',
        latencyMs: 3000,
        inputTokens: 120,
        outputTokens: 180,
        success: true,
      })

      const summary = metrics.getSummary()
      expect(summary.averageLatencyMs).toBe(2000)
    })

    it('should identify top model and template', () => {
      metrics.trackOptimization({
        modelKey: 'gpt-4o',
        templateId: 'general-optimize',
        optimizationMode: 'user',
        latencyMs: 1500,
        inputTokens: 100,
        outputTokens: 200,
        success: true,
      })
      metrics.trackOptimization({
        modelKey: 'gpt-4o',
        templateId: 'general-optimize',
        optimizationMode: 'system',
        latencyMs: 2000,
        inputTokens: 150,
        outputTokens: 250,
        success: true,
      })
      metrics.trackOptimization({
        modelKey: 'claude-3',
        templateId: 'user-optimize',
        optimizationMode: 'user',
        latencyMs: 1800,
        inputTokens: 120,
        outputTokens: 180,
        success: true,
      })

      const summary = metrics.getSummary()
      expect(summary.topModel).toBe('gpt-4o')
      expect(summary.topTemplate).toBe('general-optimize')
    })

    it('should track today metrics separately', () => {
      metrics.trackOptimization({
        modelKey: 'gpt-4o',
        templateId: 'general-optimize',
        optimizationMode: 'user',
        latencyMs: 1000,
        inputTokens: 100,
        outputTokens: 200,
        success: true,
      })
      metrics.trackOptimization({
        modelKey: 'claude-3',
        templateId: 'general-optimize',
        optimizationMode: 'system',
        latencyMs: 2000,
        inputTokens: 150,
        outputTokens: 250,
        success: true,
      })

      const summary = metrics.getSummary()
      expect(summary.todayCount).toBe(2)
      expect(summary.todayAverageLatencyMs).toBe(1500)
    })
  })

  describe('getMetrics', () => {
    it('should return complete metrics object', () => {
      metrics.trackOptimization({
        modelKey: 'gpt-4o',
        templateId: 'general-optimize',
        optimizationMode: 'user',
        latencyMs: 1500,
        inputTokens: 100,
        outputTokens: 200,
        success: true,
      })

      const result = metrics.getMetrics()
      expect(result.totalOptimizations).toBe(1)
      expect(result.successfulOptimizations).toBe(1)
      expect(result.failedOptimizations).toBe(0)
      expect(result.successRate).toBe(100)
      expect(result.byModel).toHaveProperty('gpt-4o')
      expect(result.byTemplate).toHaveProperty('general-optimize')
    })
  })

  describe('trackAndSave', () => {
    it('should track and save without error when no storage', async () => {
      await expect(
        metrics.trackAndSave({
          modelKey: 'gpt-4o',
          templateId: 'general-optimize',
          optimizationMode: 'user',
          latencyMs: 1500,
          inputTokens: 100,
          outputTokens: 200,
          success: true,
        })
      ).resolves.not.toThrow()
    })
  })

  describe('load and save with storage', () => {
    it('should load metrics from storage', async () => {
      const mockStorage = {
        getItem: vi.fn().mockResolvedValue(JSON.stringify({
          totalOptimizations: 5,
          successfulOptimizations: 4,
          failedOptimizations: 1,
          byModel: { 'gpt-4o': 3, 'claude-3': 2 },
          byTemplate: { 'general-optimize': 5 },
          dailyCounts: { '2026-02-27': 5 },
          dailyLatencies: { '2026-02-27': [1000, 1500, 2000, 1200, 1800] },
          lastUpdated: Date.now(),
        })),
        setItem: vi.fn().mockResolvedValue(undefined),
      }

      const metricsWithStorage = new PerformanceMetrics(mockStorage as any)
      await metricsWithStorage.load()

      const result = metricsWithStorage.getMetrics()
      expect(result.totalOptimizations).toBe(5)
      expect(result.successfulOptimizations).toBe(4)
      expect(result.byModel['gpt-4o']).toBe(3)
    })

    it('should save metrics to storage', async () => {
      const mockStorage = {
        getItem: vi.fn().mockResolvedValue(null),
        setItem: vi.fn().mockResolvedValue(undefined),
      }

      const metricsWithStorage = new PerformanceMetrics(mockStorage as any)
      await metricsWithStorage.load()

      metricsWithStorage.trackOptimization({
        modelKey: 'gpt-4o',
        templateId: 'general-optimize',
        optimizationMode: 'user',
        latencyMs: 1500,
        inputTokens: 100,
        outputTokens: 200,
        success: true,
      })

      await metricsWithStorage.save()

      expect(mockStorage.setItem).toHaveBeenCalled()
    })
  })
})
