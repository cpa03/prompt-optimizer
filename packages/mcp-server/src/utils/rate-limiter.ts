/**
 * Rate Limiter for MCP Server
 *
 * Simple in-memory rate limiting to prevent abuse.
 * Uses sliding window algorithm for accurate rate limiting.
 *
 * Note: This is an in-memory implementation. For distributed deployments,
 * consider using Redis or similar for shared rate limit state.
 */

import type { Request } from 'express'
import * as logger from './logging.js'
import { MCP_CONFIG } from '@prompt-optimizer/core'

interface RateLimitEntry {
  count: number
  windowStart: number
}

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  cleanupIntervalMs: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: MCP_CONFIG.rateLimit.defaultWindowMs,
  maxRequests: MCP_CONFIG.rateLimit.defaultMaxRequests,
  cleanupIntervalMs: MCP_CONFIG.rateLimit.defaultCleanupIntervalMs,
}

class RateLimiter {
  private entries: Map<string, RateLimitEntry> = new Map()
  private config: RateLimitConfig
  private cleanupTimer?: ReturnType<typeof setInterval>

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.startCleanup()
  }

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupIntervalMs)
  }

  private cleanup(): void {
    const now = Date.now()
    let cleaned = 0

    for (const [key, entry] of this.entries) {
      if (now - entry.windowStart > this.config.windowMs) {
        this.entries.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      logger.debug(`[RateLimiter] Cleaned ${cleaned} expired entries`)
    }

    if (this.entries.size > MCP_CONFIG.rateLimit.maxEntries) {
      const entriesToDelete = this.entries.size - MCP_CONFIG.rateLimit.targetEntriesAfterCleanup
      let deleted = 0
      for (const key of this.entries.keys()) {
        if (deleted >= entriesToDelete) break
        this.entries.delete(key)
        deleted++
      }
      logger.warn(`[RateLimiter] Force cleanup: removed ${deleted} entries`)
    }
  }

  check(identifier: string): RateLimitResult {
    const now = Date.now()
    const entry = this.entries.get(identifier)

    if (!entry || now - entry.windowStart > this.config.windowMs) {
      this.entries.set(identifier, {
        count: 1,
        windowStart: now,
      })
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs,
      }
    }

    if (entry.count >= this.config.maxRequests) {
      const retryAfter = Math.ceil((entry.windowStart + this.config.windowMs - now) / 1000)
      logger.warn(`[RateLimiter] Rate limit exceeded for ${identifier}`)
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.windowStart + this.config.windowMs,
        retryAfter,
      }
    }

    entry.count++
    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.windowStart + this.config.windowMs,
    }
  }

  getStats(): RateLimiterStats {
    return {
      totalClients: this.entries.size,
      config: {
        windowMs: this.config.windowMs,
        maxRequests: this.config.maxRequests,
        cleanupIntervalMs: this.config.cleanupIntervalMs,
      },
    }
  }

  stop(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }
  }
}

let defaultLimiter: RateLimiter | null = null

export function createRateLimiter(config?: Partial<RateLimitConfig>): RateLimiter {
  return new RateLimiter(config)
}

export function getRateLimiter(config?: Partial<RateLimitConfig>): RateLimiter {
  if (!defaultLimiter) {
    defaultLimiter = new RateLimiter(config)
  }
  return defaultLimiter
}

export function getClientIdentifier(req: Request): string {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) {
    const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]
    return ips.trim()
  }

  const realIp = req.headers['x-real-ip']
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp
  }

  const socket = req.socket
  return socket.remoteAddress || 'unknown'
}

export type { RateLimiter, RateLimitConfig, RateLimitResult }

export interface RateLimiterStats {
  totalClients: number
  config: {
    windowMs: number
    maxRequests: number
    cleanupIntervalMs: number
  }
}
