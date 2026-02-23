/**
 * Rate Limiter Tests
 *
 * Tests for the in-memory rate limiting functionality used by MCP server
 * to prevent abuse from AI agents.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createRateLimiter, getClientIdentifier, RateLimiter } from '../src/utils/rate-limiter.js'
import { MCP_CONFIG } from '@prompt-optimizer/core'

describe('RateLimiter', () => {
  let limiter: RateLimiter

  beforeEach(() => {
    vi.useFakeTimers()
    limiter = createRateLimiter({
      windowMs: 1000,
      maxRequests: 5,
      cleanupIntervalMs: 10000,
    })
  })

  afterEach(() => {
    limiter.stop()
    vi.useRealTimers()
  })

  describe('basic rate limiting', () => {
    it('should allow requests within the limit', () => {
      const result = limiter.check('client-1')
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4)
      expect(result.resetTime).toBeGreaterThan(Date.now())
    })

    it('should decrement remaining count on each request', () => {
      for (let i = 5; i > 0; i--) {
        const result = limiter.check('client-2')
        expect(result.allowed).toBe(true)
        expect(result.remaining).toBe(i - 1)
      }
    })

    it('should block requests when limit is exceeded', () => {
      for (let i = 0; i < 5; i++) {
        limiter.check('client-3')
      }

      const result = limiter.check('client-3')
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should provide retryAfter when blocked', () => {
      for (let i = 0; i < 5; i++) {
        limiter.check('client-4')
      }

      const result = limiter.check('client-4')
      expect(result.allowed).toBe(false)
      expect(result.retryAfter).toBeDefined()
      expect(result.retryAfter).toBeGreaterThan(0)
    })
  })

  describe('window reset', () => {
    it('should reset count after window expires', () => {
      for (let i = 0; i < 5; i++) {
        limiter.check('client-5')
      }

      expect(limiter.check('client-5').allowed).toBe(false)

      vi.advanceTimersByTime(1100)

      const result = limiter.check('client-5')
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4)
    })
  })

  describe('multiple clients', () => {
    it('should track different clients separately', () => {
      for (let i = 0; i < 5; i++) {
        limiter.check('client-a')
      }

      expect(limiter.check('client-a').allowed).toBe(false)
      expect(limiter.check('client-b').allowed).toBe(true)
    })

    it('should not affect other clients when one is blocked', () => {
      for (let i = 0; i < 5; i++) {
        limiter.check('blocked-client')
      }

      expect(limiter.check('blocked-client').allowed).toBe(false)

      for (let i = 0; i < 5; i++) {
        expect(limiter.check('other-client').allowed).toBe(true)
      }
    })
  })

  describe('cleanup', () => {
    it('should stop cleanup timer when stop is called', () => {
      const shortLimiter = createRateLimiter({
        windowMs: 100,
        maxRequests: 5,
        cleanupIntervalMs: 50,
      })

      shortLimiter.check('test')
      shortLimiter.stop()

      expect(() => shortLimiter.stop()).not.toThrow()
    })

    it('should perform force cleanup when entries exceed maxEntries', () => {
      const maxEntriesSpy = vi.spyOn(MCP_CONFIG.rateLimit, 'maxEntries', 'get').mockReturnValue(10)
      const targetEntriesSpy = vi
        .spyOn(MCP_CONFIG.rateLimit, 'targetEntriesAfterCleanup', 'get')
        .mockReturnValue(5)

      const forceCleanupLimiter = createRateLimiter({
        windowMs: 1000,
        maxRequests: 5,
        cleanupIntervalMs: 100,
      })

      for (let i = 0; i < 15; i++) {
        forceCleanupLimiter.check(`client-${i}`)
      }

      expect(forceCleanupLimiter.getStats().totalClients).toBe(15)

      vi.advanceTimersByTime(100)

      expect(forceCleanupLimiter.getStats().totalClients).toBe(5)

      forceCleanupLimiter.stop()
      maxEntriesSpy.mockRestore()
      targetEntriesSpy.mockRestore()
    })

    it('should not perform force cleanup when entries are below maxEntries', () => {
      const maxEntriesSpy = vi.spyOn(MCP_CONFIG.rateLimit, 'maxEntries', 'get').mockReturnValue(100)

      const normalLimiter = createRateLimiter({
        windowMs: 1000,
        maxRequests: 5,
        cleanupIntervalMs: 100,
      })

      for (let i = 0; i < 10; i++) {
        normalLimiter.check(`client-${i}`)
      }

      expect(normalLimiter.getStats().totalClients).toBe(10)

      vi.advanceTimersByTime(100)

      expect(normalLimiter.getStats().totalClients).toBe(10)

      normalLimiter.stop()
      maxEntriesSpy.mockRestore()
    })
  })

  describe('getStats', () => {
    it('should return stats with zero clients initially', () => {
      const stats = limiter.getStats()
      expect(stats.totalClients).toBe(0)
      expect(stats.config.windowMs).toBe(1000)
      expect(stats.config.maxRequests).toBe(5)
      expect(stats.config.cleanupIntervalMs).toBe(10000)
    })

    it('should track unique clients in stats', () => {
      limiter.check('client-a')
      limiter.check('client-b')
      limiter.check('client-c')

      const stats = limiter.getStats()
      expect(stats.totalClients).toBe(3)
    })

    it('should not count duplicate requests as new clients', () => {
      limiter.check('client-a')
      limiter.check('client-a')
      limiter.check('client-a')

      const stats = limiter.getStats()
      expect(stats.totalClients).toBe(1)
    })

    it('should reflect config values in stats', () => {
      const customLimiter = createRateLimiter({
        windowMs: 5000,
        maxRequests: 100,
        cleanupIntervalMs: 60000,
      })

      const stats = customLimiter.getStats()
      expect(stats.config.windowMs).toBe(5000)
      expect(stats.config.maxRequests).toBe(100)
      expect(stats.config.cleanupIntervalMs).toBe(60000)

      customLimiter.stop()
    })
  })

  describe('reset', () => {
    it('should reset a specific client', () => {
      limiter.check('client-a')
      limiter.check('client-b')

      expect(limiter.getStats().totalClients).toBe(2)

      const result = limiter.reset('client-a')
      expect(result).toBe(true)
      expect(limiter.getStats().totalClients).toBe(1)
    })

    it('should return false when resetting non-existent client', () => {
      const result = limiter.reset('non-existent')
      expect(result).toBe(false)
    })

    it('should allow requests after reset', () => {
      for (let i = 0; i < 5; i++) {
        limiter.check('client-to-reset')
      }
      expect(limiter.check('client-to-reset').allowed).toBe(false)

      limiter.reset('client-to-reset')

      const result = limiter.check('client-to-reset')
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4)
    })

    it('should reset all clients when no identifier provided', () => {
      limiter.check('client-a')
      limiter.check('client-b')
      limiter.check('client-c')

      expect(limiter.getStats().totalClients).toBe(3)

      limiter.reset()
      expect(limiter.getStats().totalClients).toBe(0)
    })

    it('should return true when any client was reset', () => {
      limiter.check('client-a')
      const result = limiter.reset()
      expect(result).toBe(true)
    })

    it('should return false when no clients exist to reset', () => {
      const result = limiter.reset()
      expect(result).toBe(false)
    })
  })
})

describe('getClientIdentifier', () => {
  it('should use x-forwarded-for header when available', () => {
    const req = {
      headers: {
        'x-forwarded-for': '192.168.1.1, 10.0.0.1',
      },
      socket: { remoteAddress: '127.0.0.1' },
    } as any

    expect(getClientIdentifier(req)).toBe('192.168.1.1')
  })

  it('should handle x-forwarded-for as array', () => {
    const req = {
      headers: {
        'x-forwarded-for': ['192.168.1.2', '10.0.0.2'],
      },
      socket: { remoteAddress: '127.0.0.1' },
    } as any

    expect(getClientIdentifier(req)).toBe('192.168.1.2')
  })

  it('should use x-real-ip header when x-forwarded-for is not available', () => {
    const req = {
      headers: {
        'x-real-ip': '192.168.1.3',
      },
      socket: { remoteAddress: '127.0.0.1' },
    } as any

    expect(getClientIdentifier(req)).toBe('192.168.1.3')
  })

  it('should handle x-real-ip as array', () => {
    const req = {
      headers: {
        'x-real-ip': ['192.168.1.4'],
      },
      socket: { remoteAddress: '127.0.0.1' },
    } as any

    expect(getClientIdentifier(req)).toBe('192.168.1.4')
  })

  it('should fallback to socket remoteAddress', () => {
    const req = {
      headers: {},
      socket: { remoteAddress: '127.0.0.1' },
    } as any

    expect(getClientIdentifier(req)).toBe('127.0.0.1')
  })

  it('should return "unknown" when no IP is available', () => {
    const req = {
      headers: {},
      socket: {},
    } as any

    expect(getClientIdentifier(req)).toBe('unknown')
  })
})
