import { COOKIE_CONFIG } from '../scripts/config/constants.js'

const RATE_LIMIT = {
  MAX_ATTEMPTS: 5,
  WINDOW_MS: 60000,
  BLOCK_DURATION_MS: 300000,
}

const rateLimitStore = new Map()

function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    'unknown'
  )
}

function checkRateLimit(ip) {
  const now = Date.now()
  const entry = rateLimitStore.get(ip)

  if (entry?.blockedUntil && now < entry.blockedUntil) {
    return { allowed: false, retryAfter: Math.ceil((entry.blockedUntil - now) / 1000) }
  }

  if (entry?.blockedUntil && now >= entry.blockedUntil) {
    rateLimitStore.delete(ip)
    return { allowed: true, remaining: RATE_LIMIT.MAX_ATTEMPTS }
  }

  if (!entry) {
    return { allowed: true, remaining: RATE_LIMIT.MAX_ATTEMPTS }
  }

  if (now - entry.firstAttempt > RATE_LIMIT.WINDOW_MS) {
    rateLimitStore.delete(ip)
    return { allowed: true, remaining: RATE_LIMIT.MAX_ATTEMPTS }
  }

  return { allowed: true, remaining: RATE_LIMIT.MAX_ATTEMPTS - entry.count }
}

function recordFailedAttempt(ip) {
  const now = Date.now()
  const entry = rateLimitStore.get(ip)

  if (!entry) {
    rateLimitStore.set(ip, { count: 1, firstAttempt: now })
  } else if (now - entry.firstAttempt > RATE_LIMIT.WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, firstAttempt: now })
  } else {
    entry.count++
    if (entry.count >= RATE_LIMIT.MAX_ATTEMPTS) {
      entry.blockedUntil = now + RATE_LIMIT.BLOCK_DURATION_MS
    }
  }

  if (rateLimitStore.size > 10000) {
    const cutoff = now - RATE_LIMIT.WINDOW_MS - RATE_LIMIT.BLOCK_DURATION_MS
    for (const [key, val] of rateLimitStore) {
      if (val.firstAttempt < cutoff) {
        rateLimitStore.delete(key)
      }
    }
  }
}

function clearRateLimit(ip) {
  rateLimitStore.delete(ip)
}

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
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
}

export default function handler(req, res) {
  const requestId = generateRequestId()
  const clientIP = getClientIP(req)

  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value)
  })
  res.setHeader('X-Request-ID', requestId)

  const isProduction = process.env.NODE_ENV === 'production'
  const corsOrigin = isProduction ? req.headers.origin || '*' : '*'
  res.setHeader('Access-Control-Allow-Origin', corsOrigin)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Vary', 'Origin')

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
      res.setHeader('Retry-After', String(rateLimitResult.retryAfter || 60))
      return res.status(429).json({
        success: false,
        message: 'Too many attempts. Please try again later.',
        retryAfter: rateLimitResult.retryAfter,
      })
    }

    let body
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON body',
      })
    }

    const { password, action } = body || {}

    if (!validateBody(body, ['action'])) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body',
      })
    }

    if (action === 'verify') {
      if (!validateBody(body, ['password'])) {
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

        return res.status(200).json({
          success: true,
          message: 'Authentication successful',
        })
      } else {
        recordFailedAttempt(clientIP)
        const remaining = checkRateLimit(clientIP).remaining || 0

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
