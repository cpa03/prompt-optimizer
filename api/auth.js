import { COOKIE_CONFIG, RATE_LIMIT_CONFIG } from '../scripts/config/constants.js'

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

/**
 * Structured logging for Vercel serverless functions
 * Outputs JSON format compatible with Vercel logs
 * @param {string} level - Log level (debug, info, warn, error)
 * @param {string} message - Log message
 * @param {object} data - Additional data to log
 */
function log(level, message, data = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    service: 'auth-api',
    region: process.env.VERCEL_REGION || 'local',
    ...data,
  }
  console.log(JSON.stringify(logEntry))
}

const rateLimitStore = {
  attempts: new Map(),
}

/**
 * Get client IP address from request
 * Handles multiple headers in order of preference:
 * 1. x-vercel-forwarded-for (Vercel-specific, most reliable)
 * 2. x-forwarded-for (standard proxy header)
 * 3. x-real-ip (Nginx-style)
 * 4. connection.remoteAddress (fallback)
 * @param {object} req - Express-like request object
 * @returns {string} - Client IP address
 */
function getClientIP(req) {
  return (
    req.headers['x-vercel-forwarded-for']?.split(',')[0]?.trim() ||
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
    return { allowed: true, remaining: RATE_LIMIT_CONFIG.MAX_ATTEMPTS }
  }

  if (!entry) {
    return { allowed: true, remaining: RATE_LIMIT_CONFIG.MAX_ATTEMPTS }
  }

  if (now - entry.firstAttempt > RATE_LIMIT_CONFIG.WINDOW_MS) {
    rateLimitStore.attempts.delete(ip)
    return { allowed: true, remaining: RATE_LIMIT_CONFIG.MAX_ATTEMPTS }
  }

  return { allowed: true, remaining: RATE_LIMIT_CONFIG.MAX_ATTEMPTS - entry.count }
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
  } else if (now - entry.firstAttempt > RATE_LIMIT_CONFIG.WINDOW_MS) {
    rateLimitStore.attempts.set(ip, { count: 1, firstAttempt: now })
  } else {
    entry.count++
    if (entry.count >= RATE_LIMIT_CONFIG.MAX_ATTEMPTS) {
      entry.blockedUntil = now + RATE_LIMIT_CONFIG.BLOCK_DURATION_MS
    }
  }

  if (rateLimitStore.attempts.size > RATE_LIMIT_CONFIG.MAX_STORE_SIZE) {
    const cutoff = now - RATE_LIMIT_CONFIG.WINDOW_MS - RATE_LIMIT_CONFIG.BLOCK_DURATION_MS
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
 * Uses crypto.randomUUID() for cryptographically secure, unpredictable identifiers
 * @returns {string} - Unique request ID
 */
function generateRequestId() {
  return `req_${Date.now()}_${crypto.randomUUID().split('-')[0]}`
}

/**
 * Timing-safe string comparison to prevent timing attacks
 * Uses constant-time comparison by always iterating over the longer string length
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {boolean} - Whether strings are equal
 */
function timingSafeEqual(a, b) {
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
}

export default function handler(req, res) {
  const requestId = generateRequestId()
  const clientIP = getClientIP(req)
  const isProduction = process.env.NODE_ENV === 'production'
  const startTime = Date.now()

  log('info', 'Request received', { requestId, method: req.method, path: req.url, ip: clientIP })

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

  // Add response time header before sending response
  const originalEnd = res.end.bind(res)
  res.end = function (...args) {
    const responseTime = Date.now() - startTime
    res.setHeader('X-Response-Time', `${responseTime}ms`)
    return originalEnd(...args)
  }

  const originalJson = res.json.bind(res)
  res.json = function (data) {
    const responseTime = Date.now() - startTime
    res.setHeader('X-Response-Time', `${responseTime}ms`)
    return originalJson(data)
  }

  if (req.method === 'OPTIONS') {
    log('debug', 'CORS preflight handled', { requestId })
    res.status(200).end()
    return
  }

  const accessPassword = process.env.ACCESS_PASSWORD

  if (!accessPassword) {
    log('warn', 'No password protection configured', { requestId })
    return res.status(200).json({
      success: true,
      message: 'No password protection configured',
    })
  }

  if (req.method === 'POST') {
    const rateLimitResult = checkRateLimit(clientIP)
    if (!rateLimitResult.allowed) {
      log('warn', 'Rate limit exceeded', { requestId, ip: clientIP, retryAfter: rateLimitResult.retryAfter })
      res.setHeader(
        'Retry-After',
        String(rateLimitResult.retryAfter || RATE_LIMIT_CONFIG.DEFAULT_RETRY_AFTER_SECONDS)
      )
      return res.status(429).json({
        success: false,
        message: 'Too many attempts. Please try again later.',
        retryAfter: rateLimitResult.retryAfter,
      })
    }

    const { password, action } = req.body || {}

    if (!validateBody(req.body, ['action'])) {
      log('warn', 'Invalid request body', { requestId })
      return res.status(400).json({
        success: false,
        message: 'Invalid request body',
      })
    }

    if (action === 'verify') {
      if (!validateBody(req.body, ['password'])) {
        log('warn', 'Password missing in verify request', { requestId })
        return res.status(400).json({
          success: false,
          message: 'Password is required',
        })
      }

      if (timingSafeEqual(password, accessPassword)) {
        clearRateLimit(clientIP)
        const maxAge = COOKIE_CONFIG.DEFAULT_MAX_AGE
        const secureFlag = isProduction ? '; Secure' : ''
        res.setHeader('Set-Cookie', [
          `${COOKIE_CONFIG.ACCESS_TOKEN_NAME}=authenticated; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=${COOKIE_CONFIG.SAME_SITE_POLICY}${secureFlag}`,
        ])

        const responseTime = Date.now() - startTime
        log('info', 'Authentication successful', { requestId, ip: clientIP, responseTime: `${responseTime}ms` })
        return res.status(200).json({
          success: true,
          message: 'Authentication successful',
        })
      } else {
        recordFailedAttempt(clientIP)
        const remaining = checkRateLimit(clientIP).remaining || 0

        log('warn', 'Authentication failed', { requestId, ip: clientIP, attemptsRemaining: remaining })
        return res.status(401).json({
          success: false,
          message: 'Invalid password',
          attemptsRemaining: remaining,
        })
      }
    }

    log('warn', 'Invalid action', { requestId, action })
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

      const responseTime = Date.now() - startTime
      log('info', 'Logout successful', { requestId, ip: clientIP, responseTime: `${responseTime}ms` })
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      })
    }

    log('warn', 'Invalid GET action', { requestId, action })
    return res.status(400).json({
      success: false,
      message: 'Invalid action',
    })
  }

  log('warn', 'Method not allowed', { requestId, method: req.method })
  res.status(405).json({ success: false, error: 'Method not allowed', allowedMethods: ['GET', 'POST', 'OPTIONS'] })
}
