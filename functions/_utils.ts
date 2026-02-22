/**
 * Shared utilities for Cloudflare Pages Functions
 *
 * This module provides common functionality used across multiple Cloudflare function handlers.
 */

export interface Env {
  ACCESS_PASSWORD?: string
  SESSIONS?: KVNamespace
}

export const COOKIE_CONFIG = {
  ACCESS_TOKEN_NAME: 'cf_access_token',
  DEFAULT_MAX_AGE: 86400,
  SAME_SITE_POLICY: 'Strict',
  CACHE_CONTROL: 'no-cache, no-store, must-revalidate',
} as const

export const RATE_LIMIT = {
  MAX_ATTEMPTS: 5,
  WINDOW_MS: 60000,
  BLOCK_DURATION_MS: 300000,
} as const

export const PERMISSIONS_POLICY =
  'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'

export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'Permissions-Policy': PERMISSIONS_POLICY,
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Cross-Origin-Opener-Policy': 'same-origin',
} as const

export const CONTENT_SECURITY_POLICY =
  "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https: wss:; worker-src 'self' blob:; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests"

export const EXCLUDED_PATHS = ['/api/', '/_next/static', '/_next/image', '/favicon.ico', '/assets/'] as const

export function timingSafeEqual(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false
  }
  const lenA = a.length
  const lenB = b.length
  const maxLen = Math.max(lenA, lenB)
  let result = lenA ^ lenB
  for (let i = 0; i < maxLen; i++) {
    const charA = i < lenA ? a.charCodeAt(i) : 0
    const charB = i < lenB ? b.charCodeAt(i) : 0
    result |= charA ^ charB
  }
  return result === 0
}

export function generateRequestId(prefix = 'req'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

export function getClientIP(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    request.headers.get('X-Real-IP') ||
    'unknown'
  )
}

export function shouldExcludePath(pathname: string): boolean {
  if (EXCLUDED_PATHS.some((p) => pathname.startsWith(p))) {
    return true
  }
  if (pathname.match(/\.[a-zA-Z0-9]+$/)) {
    return true
  }
  return false
}

export function validateBody(body: unknown, requiredFields: string[]): boolean {
  if (!body || typeof body !== 'object') {
    return false
  }
  const obj = body as Record<string, unknown>
  return requiredFields.every(
    (field) => field in obj && typeof obj[field] === 'string' && (obj[field] as string).length > 0
  )
}

export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigins = origin || '*'
  return {
    'Access-Control-Allow-Origin': allowedOrigins,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    Vary: 'Origin',
  }
}

export interface RateLimitEntry {
  count: number
  firstAttempt: number
  blockedUntil?: number
}

export interface AuthRateLimitStore {
  attempts: Map<string, RateLimitEntry>
}

export function checkRateLimit(
  ip: string,
  store: AuthRateLimitStore
): { allowed: boolean; retryAfter?: number; remaining?: number } {
  const now = Date.now()
  const entry = store.attempts.get(ip)

  if (entry?.blockedUntil && now < entry.blockedUntil) {
    return { allowed: false, retryAfter: Math.ceil((entry.blockedUntil - now) / 1000) }
  }

  if (entry?.blockedUntil && now >= entry.blockedUntil) {
    store.attempts.delete(ip)
    return { allowed: true, remaining: RATE_LIMIT.MAX_ATTEMPTS }
  }

  if (!entry) {
    return { allowed: true, remaining: RATE_LIMIT.MAX_ATTEMPTS }
  }

  if (now - entry.firstAttempt > RATE_LIMIT.WINDOW_MS) {
    store.attempts.delete(ip)
    return { allowed: true, remaining: RATE_LIMIT.MAX_ATTEMPTS }
  }

  return { allowed: true, remaining: RATE_LIMIT.MAX_ATTEMPTS - entry.count }
}

export function recordFailedAttempt(ip: string, store: AuthRateLimitStore): void {
  const now = Date.now()
  const entry = store.attempts.get(ip)

  if (!entry) {
    store.attempts.set(ip, { count: 1, firstAttempt: now })
  } else if (now - entry.firstAttempt > RATE_LIMIT.WINDOW_MS) {
    store.attempts.set(ip, { count: 1, firstAttempt: now })
  } else {
    entry.count++
    if (entry.count >= RATE_LIMIT.MAX_ATTEMPTS) {
      entry.blockedUntil = now + RATE_LIMIT.BLOCK_DURATION_MS
    }
  }

  if (store.attempts.size > 10000) {
    const cutoff = now - RATE_LIMIT.WINDOW_MS - RATE_LIMIT.BLOCK_DURATION_MS
    for (const [key, val] of store.attempts) {
      if (val.firstAttempt < cutoff) {
        store.attempts.delete(key)
      }
    }
  }
}

export function clearRateLimit(ip: string, store: AuthRateLimitStore): void {
  store.attempts.delete(ip)
}
