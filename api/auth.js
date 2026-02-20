import { COOKIE_CONFIG } from '../scripts/config/constants.js'

/**
 * Vercel Serverless Authentication API
 *
 * Rate Limiting Implementation:
 * Uses in-memory storage within the serverless function invocation.
 * Note: Vercel serverless functions may have cold starts and limited
 * memory persistence, so this provides basic protection against
 * brute force attacks within a single warm instance.
 *
 * For production with distributed rate limiting:
 * 1. Use Vercel KV (Redis) or similar distributed cache
 * 2. Consider using a WAF with rate limiting features
 *
 * @see https://vercel.com/docs/storage/vercel-kv
 */

const RATE_LIMIT = {
  MAX_ATTEMPTS: 5,
  WINDOW_MS: 60000,
  BLOCK_DURATION_MS: 300000,
}

const rateLimitStore = {
  attempts: new Map(),
}

/**
 * Get client IP address from request
 * @param {object} req - Express-like request object
 * @returns {string} - Client IP address
 */
function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    'unknown'
  )
}

/**
 * Check if IP is rate limited
 * @param {string} ip - Client IP address
 * @returns {{allowed: boolean, retryAfter?: number, remaining?: number}}
 */
function checkRateLimit(ip) {
  const now = Date.now()
  const entry = rateLimitStore.attempts.get(ip)

  if (entry?.blockedUntil && now < entry.blockedUntil) {
    return { allowed: false, retryAfter: Math.ceil((entry.blockedUntil - now) / 1000) }
  }

  if (entry?.blockedUntil && now >= entry.blockedUntil) {
    rateLimitStore.attempts.delete(ip)
    return { allowed: true, remaining: RATE_LIMIT.MAX_ATTEMPTS }
  }

  if (!entry) {
    return { allowed: true, remaining: RATE_LIMIT.MAX_ATTEMPTS }
  }

  if (now - entry.firstAttempt > RATE_LIMIT.WINDOW_MS) {
    rateLimitStore.attempts.delete(ip)
    return { allowed: true, remaining: RATE_LIMIT.MAX_ATTEMPTS }
  }

  return { allowed: true, remaining: RATE_LIMIT.MAX_ATTEMPTS - entry.count }
}

/**
 * Record a failed authentication attempt
 * @param {string} ip - Client IP address
 */
function recordFailedAttempt(ip) {
  const now = Date.now()
  const entry = rateLimitStore.attempts.get(ip)

  if (!entry) {
    rateLimitStore.attempts.set(ip, { count: 1, firstAttempt: now })
  } else if (now - entry.firstAttempt > RATE_LIMIT.WINDOW_MS) {
    rateLimitStore.attempts.set(ip, { count: 1, firstAttempt: now })
  } else {
    entry.count++
    if (entry.count >= RATE_LIMIT.MAX_ATTEMPTS) {
      entry.blockedUntil = now + RATE_LIMIT.BLOCK_DURATION_MS
    }
  }

  if (rateLimitStore.attempts.size > 10000) {
    const cutoff = now - RATE_LIMIT.WINDOW_MS - RATE_LIMIT.BLOCK_DURATION_MS
    for (const [key, val] of rateLimitStore.attempts) {
      if (val.firstAttempt < cutoff) {
        rateLimitStore.attempts.delete(key)
      }
    }
  }
}

/**
 * Clear rate limit for an IP (after successful auth)
 * @param {string} ip - Client IP address
 */
function clearRateLimit(ip) {
  rateLimitStore.attempts.delete(ip)
}

/**
 * Generate a unique request ID for logging/tracing
 * @returns {string} - Unique request ID
 */
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Structured logging for Vercel functions
 * @param {object} params - Log parameters
 * @param {string} params.requestId - Request ID
 * @param {string} params.event - Event name
 * @param {object} params.data - Additional data
 */
function log({ requestId, event, data = {} }) {
  const timestamp = new Date().toISOString()
  const logLevel = data.error ? 'ERROR' : 'INFO'
  console.log(JSON.stringify({ timestamp, requestId, event, level: logLevel, ...data }))
}

/**
 * Timing-safe string comparison to prevent timing attacks
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {boolean} - Whether strings are equal
 */
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false
  }
  if (a.length !== b.length) {
    return false
  }
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

/**
 * Validate request body for required fields
 * @param {object} body - Request body
 * @param {string[]} requiredFields - Required field names
 * @returns {boolean} - Whether body is valid
 */
function validateBody(body, requiredFields) {
  if (!body || typeof body !== 'object') {
    return false
  }
  return requiredFields.every(
    (field) => field in body && typeof body[field] === 'string' && body[field].length > 0
  )
}

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
}

export default function handler(req, res) {
  const requestId = generateRequestId()
  const clientIP = getClientIP(req)
  const isProduction = process.env.NODE_ENV === 'production'

  log({
    requestId,
    event: 'request_received',
    data: { method: req.method, path: req.url, ip: clientIP },
  })

  const corsOrigin = isProduction ? req.headers.origin || '*' : '*'

  const baseHeaders = {
    ...SECURITY_HEADERS,
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    Vary: 'Origin',
    'X-Request-ID': requestId,
  }

  Object.entries(baseHeaders).forEach(([key, value]) => {
    res.setHeader(key, value)
  })

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const accessPassword = process.env.ACCESS_PASSWORD

  if (!accessPassword) {
    return res.status(200).json({
      success: true,
      message: 'No password protection configured',
    })
  }

  if (req.method === 'POST') {
    const rateLimitResult = checkRateLimit(clientIP)
    if (!rateLimitResult.allowed) {
      log({
        requestId,
        event: 'rate_limited',
        data: { ip: clientIP, retryAfter: rateLimitResult.retryAfter },
      })
      res.setHeader('Retry-After', String(rateLimitResult.retryAfter || 60))
      return res.status(429).json({
        success: false,
        message: 'Too many attempts. Please try again later.',
        retryAfter: rateLimitResult.retryAfter,
      })
    }

    const { password, action } = req.body || {}

    if (!validateBody(req.body, ['action'])) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body',
      })
    }

    if (action === 'verify') {
      if (!validateBody(req.body, ['password'])) {
        return res.status(400).json({
          success: false,
          message: 'Password is required',
        })
      }

      if (timingSafeEqual(password, accessPassword)) {
        clearRateLimit(clientIP)
        log({ requestId, event: 'auth_success', data: { ip: clientIP } })
        const maxAge = COOKIE_CONFIG.DEFAULT_MAX_AGE
        const secureFlag = isProduction ? '; Secure' : ''
        res.setHeader('Set-Cookie', [
          `${COOKIE_CONFIG.ACCESS_TOKEN_NAME}=authenticated; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=${COOKIE_CONFIG.SAME_SITE_POLICY}${secureFlag}`,
        ])

        return res.status(200).json({
          success: true,
          message: 'Authentication successful',
        })
      } else {
        recordFailedAttempt(clientIP)
        const remaining = checkRateLimit(clientIP).remaining || 0
        log({
          requestId,
          event: 'auth_failed',
          data: { ip: clientIP, attemptsRemaining: remaining },
        })
        return res.status(401).json({
          success: false,
          message: 'Invalid password',
          attemptsRemaining: remaining,
        })
      }
    }

    return res.status(400).json({
      success: false,
      message: 'Invalid action',
    })
  }

  if (req.method === 'GET') {
    const { action } = req.query || {}

    if (action === 'logout') {
      clearRateLimit(clientIP)
      res.setHeader('Set-Cookie', [
        `${COOKIE_CONFIG.ACCESS_TOKEN_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=${COOKIE_CONFIG.SAME_SITE_POLICY}`,
      ])

      return res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      })
    }

    return res.status(400).json({
      success: false,
      message: 'Invalid action',
    })
  }

  res.status(405).json({ success: false, error: 'Method not allowed' })
}
