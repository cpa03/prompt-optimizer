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

/**
 * Circuit Breaker Utility Module
 * Implements the Circuit Breaker pattern for improved reliability.
 * Prevents cascading failures by stopping calls to failing services.
 */

import { createDebugLogger } from './debug'
import { TIMEOUTS } from '../config/timeouts'

const logger = createDebugLogger('circuit-breaker')

export type CircuitState = 'closed' | 'open' | 'half-open'

export interface CircuitBreakerOptions {
  failureThreshold: number
  successThreshold: number
  timeout: number
  resetTimeout: number
  onStateChange?: (from: CircuitState, to: CircuitState) => void
  onFailure?: (error: Error) => void
  onSuccess?: () => void
}

export interface CircuitBreakerStats {
  state: CircuitState
  failures: number
  successes: number
  lastFailureTime: number | null
  lastSuccessTime: number | null
  totalCalls: number
  totalFailures: number
  totalSuccesses: number
}

export class CircuitBreakerError extends Error {
  constructor(
    public readonly circuitName: string,
    public readonly state: CircuitState,
    message?: string
  ) {
    super(message || `Circuit breaker '${circuitName}' is ${state}`)
    this.name = 'CircuitBreakerError'
  }
}

export class CircuitBreaker {
  private state: CircuitState = 'closed'
  private failures = 0
  private successes = 0
  private lastFailureTime: number | null = null
  private lastSuccessTime: number | null = null
  private totalCalls = 0
  private totalFailures = 0
  private totalSuccesses = 0
  private resetTimer: ReturnType<typeof setTimeout> | null = null

  constructor(
    public readonly name: string,
    private readonly options: CircuitBreakerOptions
  ) {}

  getState(): CircuitState {
    if (this.state === 'open') {
      if (this.shouldAttemptReset()) {
        this.transitionTo('half-open')
      }
    }
    return this.state
  }

  getStats(): CircuitBreakerStats {
    return {
      state: this.getState(),
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      totalCalls: this.totalCalls,
      totalFailures: this.totalFailures,
      totalSuccesses: this.totalSuccesses,
    }
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    this.totalCalls++

    const currentState = this.getState()

    if (currentState === 'open') {
      logger.warn(`[${this.name}] Circuit is open, rejecting call`)
      throw new CircuitBreakerError(this.name, 'open')
    }

    try {
      const result = await this.executeWithTimeout(operation)
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure(error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  private async executeWithTimeout<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.options.timeout || this.options.timeout <= 0) {
      return operation()
    }

    return new Promise<T>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Operation timed out after ${this.options.timeout}ms`))
      }, this.options.timeout)

      operation()
        .then((result) => {
          clearTimeout(timeoutId)
          resolve(result)
        })
        .catch((error) => {
          clearTimeout(timeoutId)
          reject(error)
        })
    })
  }

  private onSuccess(): void {
    this.lastSuccessTime = Date.now()
    this.totalSuccesses++
    this.options.onSuccess?.()

    if (this.state === 'half-open') {
      this.successes++
      if (this.successes >= this.options.successThreshold) {
        logger.log(`[${this.name}] Half-open -> closed (${this.successes} successes)`)
        this.transitionTo('closed')
      }
    } else if (this.state === 'closed') {
      this.failures = 0
    }
  }

  private onFailure(error: Error): void {
    this.lastFailureTime = Date.now()
    this.totalFailures++
    this.failures++
    this.options.onFailure?.(error)

    if (this.state === 'half-open') {
      logger.warn(`[${this.name}] Half-open -> open (failure during half-open)`)
      this.transitionTo('open')
    } else if (this.state === 'closed') {
      if (this.failures >= this.options.failureThreshold) {
        logger.warn(`[${this.name}] Closed -> open (${this.failures} failures)`)
        this.transitionTo('open')
      }
    }
  }

  private shouldAttemptReset(): boolean {
    if (this.lastFailureTime === null) {
      return true
    }
    return Date.now() - this.lastFailureTime >= this.options.resetTimeout
  }

  private transitionTo(newState: CircuitState): void {
    const oldState = this.state
    this.state = newState

    if (newState === 'closed') {
      this.failures = 0
      this.successes = 0
      this.clearResetTimer()
    } else if (newState === 'open') {
      this.successes = 0
      this.scheduleReset()
    } else if (newState === 'half-open') {
      this.successes = 0
      logger.log(`[${this.name}] Attempting reset (half-open state)`)
    }

    this.options.onStateChange?.(oldState, newState)
  }

  private scheduleReset(): void {
    this.clearResetTimer()
    this.resetTimer = setTimeout(() => {
      if (this.state === 'open') {
        logger.log(`[${this.name}] Reset timeout reached, transitioning to half-open`)
        this.transitionTo('half-open')
      }
    }, this.options.resetTimeout)
  }

  private clearResetTimer(): void {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer)
      this.resetTimer = null
    }
  }

  forceOpen(): void {
    if (this.state !== 'open') {
      this.lastFailureTime = Date.now()
      logger.warn(`[${this.name}] Force opening circuit`)
      this.transitionTo('open')
    }
  }

  forceClose(): void {
    if (this.state !== 'closed') {
      logger.log(`[${this.name}] Force closing circuit`)
      this.transitionTo('closed')
    }
  }

  reset(): void {
    logger.log(`[${this.name}] Resetting circuit breaker`)
    this.failures = 0
    this.successes = 0
    this.lastFailureTime = null
    this.transitionTo('closed')
  }
}

export interface CircuitBreakerRegistryOptions {
  defaultFailureThreshold?: number
  defaultSuccessThreshold?: number
  defaultTimeout?: number
  defaultResetTimeout?: number
}

export class CircuitBreakerRegistry {
  private breakers = new Map<string, CircuitBreaker>()

  constructor(private readonly defaultOptions: CircuitBreakerRegistryOptions = {}) {}

  getOrCreate(name: string, options?: Partial<CircuitBreakerOptions>): CircuitBreaker {
    let breaker = this.breakers.get(name)
    if (!breaker) {
      breaker = new CircuitBreaker(name, {
        failureThreshold:
          options?.failureThreshold ??
          this.defaultOptions.defaultFailureThreshold ??
          TIMEOUTS.circuitBreaker.failureThreshold,
        successThreshold:
          options?.successThreshold ??
          this.defaultOptions.defaultSuccessThreshold ??
          TIMEOUTS.circuitBreaker.successThreshold,
        timeout: options?.timeout ?? this.defaultOptions.defaultTimeout ?? 30000,
        resetTimeout: options?.resetTimeout ?? this.defaultOptions.defaultResetTimeout ?? 60000,
        onStateChange: options?.onStateChange,
        onFailure: options?.onFailure,
        onSuccess: options?.onSuccess,
      })
      this.breakers.set(name, breaker)
    }
    return breaker
  }

  get(name: string): CircuitBreaker | undefined {
    return this.breakers.get(name)
  }

  getAllStats(): Record<string, CircuitBreakerStats> {
    const stats: Record<string, CircuitBreakerStats> = {}
    for (const [name, breaker] of this.breakers) {
      stats[name] = breaker.getStats()
    }
    return stats
  }

  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset()
    }
  }

  remove(name: string): boolean {
    return this.breakers.delete(name)
  }
}

export const DEFAULT_CIRCUIT_BREAKER_OPTIONS: CircuitBreakerOptions = {
  failureThreshold: TIMEOUTS.circuitBreaker.failureThreshold,
  successThreshold: TIMEOUTS.circuitBreaker.successThreshold,
  timeout: TIMEOUTS.network.default,
  resetTimeout: TIMEOUTS.long,
}

export function createCircuitBreaker(
  name: string,
  options?: Partial<CircuitBreakerOptions>
): CircuitBreaker {
  return new CircuitBreaker(name, {
    ...DEFAULT_CIRCUIT_BREAKER_OPTIONS,
    ...options,
  })
}
