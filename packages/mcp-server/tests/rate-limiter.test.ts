/**
 * Rate Limiter Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  createRateLimiter,
  getClientIdentifier,
  type RateLimiter,
} from '../src/utils/rate-limiter.js'
import type { Request } from 'express'

describe('RateLimiter', () => {
  let limiter: RateLimiter

  beforeEach(() => {
    limiter = createRateLimiter({
      windowMs: 1000,
      maxRequests: 3,
      cleanupIntervalMs: 100,
    })
  })

  afterEach(() => {
    limiter.stop()
  })

  describe('check', () => {
    it('should allow requests within limit', () => {
      const result1 = limiter.check('client1')
      expect(result1.allowed).toBe(true)
      expect(result1.remaining).toBe(2)

      const result2 = limiter.check('client1')
      expect(result2.allowed).toBe(true)
      expect(result2.remaining).toBe(1)

      const result3 = limiter.check('client1')
      expect(result3.allowed).toBe(true)
      expect(result3.remaining).toBe(0)
    })

    it('should block requests exceeding limit', () => {
      limiter.check('client1')
      limiter.check('client1')
      limiter.check('client1')

      const result = limiter.check('client1')
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.retryAfter).toBeDefined()
    })

    it('should track different clients separately', () => {
      limiter.check('client1')
      limiter.check('client1')
      limiter.check('client1')

      const result1 = limiter.check('client1')
      expect(result1.allowed).toBe(false)

      const result2 = limiter.check('client2')
      expect(result2.allowed).toBe(true)
      expect(result2.remaining).toBe(2)
    })

    it('should reset after window expires', async () => {
      limiter.check('client1')
      limiter.check('client1')
      limiter.check('client1')

      const result1 = limiter.check('client1')
      expect(result1.allowed).toBe(false)

      await new Promise((resolve) => setTimeout(resolve, 1100))

      const result2 = limiter.check('client1')
      expect(result2.allowed).toBe(true)
      expect(result2.remaining).toBe(2)
    })

    it('should return correct reset time', () => {
      const before = Date.now()
      const result = limiter.check('client1')
      const after = Date.now()

      expect(result.resetTime).toBeGreaterThanOrEqual(before)
      expect(result.resetTime).toBeLessThanOrEqual(after + 1000)
    })
  })

  describe('stop', () => {
    it('should stop cleanup timer', () => {
      const spy = vi.spyOn(global, 'clearInterval')
      limiter.stop()
      expect(spy).toHaveBeenCalled()
    })
  })
})

describe('getClientIdentifier', () => {
  it('should use x-forwarded-for header', () => {
    const req = {
      headers: {
        'x-forwarded-for': '192.168.1.1, 10.0.0.1',
      },
      socket: { remoteAddress: '127.0.0.1' },
    } as unknown as Request

    expect(getClientIdentifier(req)).toBe('192.168.1.1')
  })

  it('should use x-real-ip header when x-forwarded-for is not present', () => {
    const req = {
      headers: {
        'x-real-ip': '192.168.1.2',
      },
      socket: { remoteAddress: '127.0.0.1' },
    } as unknown as Request

    expect(getClientIdentifier(req)).toBe('192.168.1.2')
  })

  it('should use socket remote address as fallback', () => {
    const req = {
      headers: {},
      socket: { remoteAddress: '127.0.0.1' },
    } as unknown as Request

    expect(getClientIdentifier(req)).toBe('127.0.0.1')
  })

  it('should return unknown when no address available', () => {
    const req = {
      headers: {},
      socket: {},
    } as unknown as Request

    expect(getClientIdentifier(req)).toBe('unknown')
  })

  it('should handle array x-forwarded-for header', () => {
    const req = {
      headers: {
        'x-forwarded-for': ['192.168.1.3', '10.0.0.2'],
      },
      socket: { remoteAddress: '127.0.0.1' },
    } as unknown as Request

    expect(getClientIdentifier(req)).toBe('192.168.1.3')
  })

  it('should handle array x-real-ip header', () => {
    const req = {
      headers: {
        'x-real-ip': ['192.168.1.4'],
      },
      socket: { remoteAddress: '127.0.0.1' },
    } as unknown as Request

    expect(getClientIdentifier(req)).toBe('192.168.1.4')
  })
})
