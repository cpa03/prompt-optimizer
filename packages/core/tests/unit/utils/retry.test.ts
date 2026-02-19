import { describe, it, expect, vi } from 'vitest'
import { withRetry, sleep, createTimeoutSignal, RETRY_PRESETS } from '../../../src/utils/retry'

describe('retry utility', () => {
  describe('sleep', () => {
    it('should resolve after specified time', async () => {
      vi.useFakeTimers()
      const promise = sleep(1000)
      await vi.runAllTimersAsync()
      await expect(promise).resolves.toBeUndefined()
      vi.useRealTimers()
    })
  })

  describe('createTimeoutSignal', () => {
    it('should create an abort signal that triggers after timeout', async () => {
      vi.useFakeTimers()
      const { signal, cleanup } = createTimeoutSignal(1000)
      expect(signal.aborted).toBe(false)

      await vi.runAllTimersAsync()
      expect(signal.aborted).toBe(true)

      cleanup()
      vi.useRealTimers()
    })

    it('should not trigger if cleanup is called before timeout', async () => {
      vi.useFakeTimers()
      const { signal, cleanup } = createTimeoutSignal(1000)
      cleanup()

      await vi.runAllTimersAsync()
      expect(signal.aborted).toBe(false)
      vi.useRealTimers()
    })
  })

  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const operation = vi.fn().mockResolvedValue('success')

      const result = await withRetry(operation, { maxAttempts: 3 })

      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(1)
    })

    it('should retry on retryable error', async () => {
      vi.useFakeTimers()
      const error = new Error('ECONNRESET')
      const operation = vi.fn().mockRejectedValueOnce(error).mockResolvedValueOnce('success')

      const resultPromise = withRetry(operation, {
        maxAttempts: 3,
        baseDelayMs: 10,
      })

      await vi.runAllTimersAsync()
      const result = await resultPromise

      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(2)
      vi.useRealTimers()
    })

    it('should throw immediately on non-retryable error', async () => {
      const error = new Error('Non-retryable error')
      const operation = vi.fn().mockRejectedValue(error)

      await expect(withRetry(operation, { maxAttempts: 3 })).rejects.toThrow('Non-retryable error')
      expect(operation).toHaveBeenCalledTimes(1)
    })

    it('should retry on HTTP 429 status', async () => {
      vi.useFakeTimers()
      const error = new Error('Rate limited') as any
      error.status = 429
      const operation = vi.fn().mockRejectedValueOnce(error).mockResolvedValueOnce('success')

      const resultPromise = withRetry(operation, {
        maxAttempts: 3,
        baseDelayMs: 10,
      })

      await vi.runAllTimersAsync()
      const result = await resultPromise

      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(2)
      vi.useRealTimers()
    })

    it('should retry on HTTP 5xx status codes', async () => {
      vi.useFakeTimers()
      const error = new Error('Server error') as any
      error.status = 500
      const operation = vi.fn().mockRejectedValueOnce(error).mockResolvedValueOnce('success')

      const resultPromise = withRetry(operation, {
        maxAttempts: 3,
        baseDelayMs: 10,
      })

      await vi.runAllTimersAsync()
      const result = await resultPromise

      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(2)
      vi.useRealTimers()
    })
  })

  describe('RETRY_PRESETS', () => {
    it('should have correct preset values', () => {
      expect(RETRY_PRESETS.aggressive.maxAttempts).toBe(5)
      expect(RETRY_PRESETS.aggressive.baseDelayMs).toBe(500)
      expect(RETRY_PRESETS.aggressive.maxDelayMs).toBe(5000)

      expect(RETRY_PRESETS.standard.maxAttempts).toBe(3)
      expect(RETRY_PRESETS.standard.baseDelayMs).toBe(1000)
      expect(RETRY_PRESETS.standard.maxDelayMs).toBe(10000)

      expect(RETRY_PRESETS.conservative.maxAttempts).toBe(2)
      expect(RETRY_PRESETS.conservative.baseDelayMs).toBe(2000)
      expect(RETRY_PRESETS.conservative.maxDelayMs).toBe(20000)
    })
  })
})
