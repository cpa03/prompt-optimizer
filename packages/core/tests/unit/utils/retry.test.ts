import { describe, it, expect, vi } from 'vitest'
import {
  withRetry,
  sleep,
  createTimeoutSignal,
  RETRY_PRESETS,
  TimeoutError,
} from '../../../src/utils/retry'

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

    it('should call onRetry callback with correct parameters', async () => {
      vi.useFakeTimers()
      const error = new Error('ECONNRESET')
      const onRetry = vi.fn()
      const operation = vi.fn().mockRejectedValueOnce(error).mockResolvedValueOnce('success')

      const resultPromise = withRetry(operation, {
        maxAttempts: 3,
        baseDelayMs: 100,
        maxDelayMs: 1000,
        onRetry,
      })

      await vi.runAllTimersAsync()
      await resultPromise

      expect(onRetry).toHaveBeenCalledTimes(1)
      expect(onRetry).toHaveBeenCalledWith(1, error, expect.any(Number))
      const delayArg = onRetry.mock.calls[0][2]
      expect(delayArg).toBeGreaterThanOrEqual(100)
      expect(delayArg).toBeLessThanOrEqual(130)
      vi.useRealTimers()
    })

    it('should support custom retryable errors', async () => {
      vi.useFakeTimers()
      const error = new Error('Custom error')
      const operation = vi.fn().mockRejectedValueOnce(error).mockResolvedValueOnce('success')

      const resultPromise = withRetry(operation, {
        maxAttempts: 3,
        baseDelayMs: 10,
        retryableErrors: ['Custom error'],
      })

      await vi.runAllTimersAsync()
      const result = await resultPromise

      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(2)
      vi.useRealTimers()
    })

    it('should retry on HTTP 408 status', async () => {
      vi.useFakeTimers()
      const error = new Error('Request timeout') as any
      error.status = 408
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

    it('should retry on HTTP 502, 503, 504 status codes', async () => {
      const statusCodes = [502, 503, 504]

      for (const statusCode of statusCodes) {
        vi.useFakeTimers()
        const error = new Error(`Server error ${statusCode}`) as any
        error.status = statusCode
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
      }
    })
  })

  describe('TimeoutError', () => {
    it('should have correct name and message', () => {
      const error = new TimeoutError(5000)
      expect(error.name).toBe('TimeoutError')
      expect(error.message).toBe('Operation timed out after 5000ms')
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
