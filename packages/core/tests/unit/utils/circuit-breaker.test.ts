/*
 * Prompt Optimizer - AI提示词优化工具
 * Copyright (C) 2025 linshenkx
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  CircuitBreaker,
  CircuitBreakerRegistry,
  CircuitBreakerError,
  createCircuitBreaker,
  DEFAULT_CIRCUIT_BREAKER_OPTIONS,
} from '../../../src/utils/circuit-breaker'

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker

  beforeEach(() => {
    vi.useFakeTimers()
    breaker = new CircuitBreaker('test', {
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 1000,
      resetTimeout: 5000,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initial state', () => {
    it('should start in closed state', () => {
      expect(breaker.getState()).toBe('closed')
    })

    it('should have zero failures and successes initially', () => {
      const stats = breaker.getStats()
      expect(stats.failures).toBe(0)
      expect(stats.successes).toBe(0)
      expect(stats.totalCalls).toBe(0)
    })
  })

  describe('closed state', () => {
    it('should execute operation successfully', async () => {
      const operation = vi.fn().mockResolvedValue('success')
      const result = await breaker.execute(operation)

      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(1)
    })

    it('should reset failure count on success', async () => {
      const failingOp = vi.fn().mockRejectedValue(new Error('fail'))
      const successOp = vi.fn().mockResolvedValue('success')

      await expect(breaker.execute(failingOp)).rejects.toThrow('fail')
      await breaker.execute(successOp)

      const stats = breaker.getStats()
      expect(stats.failures).toBe(0)
    })

    it('should track total calls', async () => {
      const operation = vi.fn().mockResolvedValue('success')

      await breaker.execute(operation)
      await breaker.execute(operation)
      await breaker.execute(operation)

      expect(breaker.getStats().totalCalls).toBe(3)
    })
  })

  describe('opening circuit', () => {
    it('should open after reaching failure threshold', async () => {
      const failingOp = vi.fn().mockRejectedValue(new Error('fail'))

      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(failingOp)).rejects.toThrow('fail')
      }

      expect(breaker.getState()).toBe('open')
    })

    it('should reject calls when open', async () => {
      const failingOp = vi.fn().mockRejectedValue(new Error('fail'))
      const successOp = vi.fn().mockResolvedValue('success')

      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(failingOp)).rejects.toThrow('fail')
      }

      await expect(breaker.execute(successOp)).rejects.toThrow(CircuitBreakerError)
      expect(successOp).not.toHaveBeenCalled()
    })

    it('should track last failure time', async () => {
      const failingOp = vi.fn().mockRejectedValue(new Error('fail'))

      await expect(breaker.execute(failingOp)).rejects.toThrow('fail')

      expect(breaker.getStats().lastFailureTime).not.toBeNull()
    })
  })

  describe('half-open state', () => {
    beforeEach(async () => {
      const failingOp = vi.fn().mockRejectedValue(new Error('fail'))
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(failingOp)).rejects.toThrow('fail')
      }
    })

    it('should transition to half-open after reset timeout', async () => {
      expect(breaker.getState()).toBe('open')

      vi.advanceTimersByTime(5000)

      expect(breaker.getState()).toBe('half-open')
    })

    it('should close after success threshold in half-open', async () => {
      vi.advanceTimersByTime(5000)

      const successOp = vi.fn().mockResolvedValue('success')
      await breaker.execute(successOp)
      await breaker.execute(successOp)

      expect(breaker.getState()).toBe('closed')
    })

    it('should reopen on failure during half-open', async () => {
      vi.advanceTimersByTime(5000)

      const failingOp = vi.fn().mockRejectedValue(new Error('fail'))
      await expect(breaker.execute(failingOp)).rejects.toThrow('fail')

      expect(breaker.getState()).toBe('open')
    })
  })

  describe('timeout', () => {
    it('should timeout operations exceeding timeout limit', async () => {
      const slowOp = vi
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve('success'), 2000))
        )

      const promise = breaker.execute(slowOp)
      vi.advanceTimersByTime(1001)
      await expect(promise).rejects.toThrow('timed out')
    })
  })

  describe('state change callbacks', () => {
    it('should call onStateChange when state changes', async () => {
      const onStateChange = vi.fn()
      const breaker = new CircuitBreaker('test', {
        failureThreshold: 1,
        successThreshold: 1,
        resetTimeout: 1000,
        onStateChange,
      })

      const failingOp = vi.fn().mockRejectedValue(new Error('fail'))
      await expect(breaker.execute(failingOp)).rejects.toThrow('fail')

      expect(onStateChange).toHaveBeenCalledWith('closed', 'open')
    })

    it('should call onFailure on each failure', async () => {
      const onFailure = vi.fn()
      const breaker = new CircuitBreaker('test', {
        failureThreshold: 5,
        onFailure,
      })

      const failingOp = vi.fn().mockRejectedValue(new Error('fail'))
      await expect(breaker.execute(failingOp)).rejects.toThrow('fail')

      expect(onFailure).toHaveBeenCalledTimes(1)
    })

    it('should call onSuccess on each success', async () => {
      const onSuccess = vi.fn()
      const breaker = new CircuitBreaker('test', {
        onSuccess,
      })

      const successOp = vi.fn().mockResolvedValue('success')
      await breaker.execute(successOp)

      expect(onSuccess).toHaveBeenCalledTimes(1)
    })
  })

  describe('force operations', () => {
    it('should force open the circuit', () => {
      breaker.forceOpen()
      expect(breaker.getState()).toBe('open')
    })

    it('should force close the circuit', async () => {
      const failingOp = vi.fn().mockRejectedValue(new Error('fail'))
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(failingOp)).rejects.toThrow('fail')
      }

      breaker.forceClose()
      expect(breaker.getState()).toBe('closed')
    })

    it('should reset the circuit', async () => {
      const failingOp = vi.fn().mockRejectedValue(new Error('fail'))
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(failingOp)).rejects.toThrow('fail')
      }

      breaker.reset()

      const stats = breaker.getStats()
      expect(stats.state).toBe('closed')
      expect(stats.failures).toBe(0)
      expect(stats.successes).toBe(0)
    })
  })
})

describe('CircuitBreakerRegistry', () => {
  let registry: CircuitBreakerRegistry

  beforeEach(() => {
    registry = new CircuitBreakerRegistry({
      defaultFailureThreshold: 3,
      defaultSuccessThreshold: 2,
      defaultTimeout: 5000,
      defaultResetTimeout: 10000,
    })
  })

  describe('getOrCreate', () => {
    it('should create new breaker if not exists', () => {
      const breaker = registry.getOrCreate('test-service')
      expect(breaker).toBeDefined()
      expect(breaker.name).toBe('test-service')
    })

    it('should return existing breaker', () => {
      const breaker1 = registry.getOrCreate('test-service')
      const breaker2 = registry.getOrCreate('test-service')
      expect(breaker1).toBe(breaker2)
    })

    it('should use default options', () => {
      const breaker = registry.getOrCreate('test-service')
      const stats = breaker.getStats()

      expect(breaker.name).toBe('test-service')
    })

    it('should allow custom options', () => {
      const breaker = registry.getOrCreate('custom-service', {
        failureThreshold: 10,
      })
      expect(breaker).toBeDefined()
    })
  })

  describe('get', () => {
    it('should return undefined for non-existent breaker', () => {
      expect(registry.get('non-existent')).toBeUndefined()
    })

    it('should return existing breaker', () => {
      registry.getOrCreate('test-service')
      expect(registry.get('test-service')).toBeDefined()
    })
  })

  describe('getAllStats', () => {
    it('should return stats for all breakers', async () => {
      vi.useFakeTimers()

      const breaker1 = registry.getOrCreate('service-1')
      const breaker2 = registry.getOrCreate('service-2')

      const failingOp = vi.fn().mockRejectedValue(new Error('fail'))
      for (let i = 0; i < 3; i++) {
        await expect(breaker1.execute(failingOp)).rejects.toThrow('fail')
      }

      const stats = registry.getAllStats()

      expect(stats['service-1'].state).toBe('open')
      expect(stats['service-2'].state).toBe('closed')

      vi.useRealTimers()
    })
  })

  describe('resetAll', () => {
    it('should reset all breakers', async () => {
      vi.useFakeTimers()

      const breaker1 = registry.getOrCreate('service-1')
      const breaker2 = registry.getOrCreate('service-2')

      breaker1.forceOpen()
      breaker2.forceOpen()

      registry.resetAll()

      expect(breaker1.getState()).toBe('closed')
      expect(breaker2.getState()).toBe('closed')

      vi.useRealTimers()
    })
  })

  describe('remove', () => {
    it('should remove a breaker', () => {
      registry.getOrCreate('test-service')
      expect(registry.remove('test-service')).toBe(true)
      expect(registry.get('test-service')).toBeUndefined()
    })

    it('should return false for non-existent breaker', () => {
      expect(registry.remove('non-existent')).toBe(false)
    })
  })
})

describe('createCircuitBreaker', () => {
  it('should create breaker with default options', () => {
    const breaker = createCircuitBreaker('test')
    expect(breaker).toBeDefined()
    expect(breaker.name).toBe('test')
  })

  it('should create breaker with custom options', () => {
    const breaker = createCircuitBreaker('test', {
      failureThreshold: 10,
    })
    expect(breaker).toBeDefined()
  })
})

describe('CircuitBreakerError', () => {
  it('should create error with circuit info', () => {
    const error = new CircuitBreakerError('test-circuit', 'open')
    expect(error.name).toBe('CircuitBreakerError')
    expect(error.circuitName).toBe('test-circuit')
    expect(error.state).toBe('open')
    expect(error.message).toContain('open')
  })

  it('should allow custom message', () => {
    const error = new CircuitBreakerError('test-circuit', 'open', 'Custom message')
    expect(error.message).toBe('Custom message')
  })
})

describe('DEFAULT_CIRCUIT_BREAKER_OPTIONS', () => {
  it('should have sensible defaults', () => {
    expect(DEFAULT_CIRCUIT_BREAKER_OPTIONS.failureThreshold).toBe(5)
    expect(DEFAULT_CIRCUIT_BREAKER_OPTIONS.successThreshold).toBe(3)
    expect(DEFAULT_CIRCUIT_BREAKER_OPTIONS.timeout).toBe(30000)
    expect(DEFAULT_CIRCUIT_BREAKER_OPTIONS.resetTimeout).toBe(60000)
  })
})
