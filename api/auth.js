import { COOKIE_CONFIG } from '../scripts/config/constants.js'

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

export default function handler(req, res) {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')

  // Set CORS headers - restrict to same origin in production
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

  // If no password is configured, return success
  if (!accessPassword) {
    return res.status(200).json({
      success: true,
      message: 'No password protection configured',
    })
  }

  if (req.method === 'POST') {
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

      // Use timing-safe comparison to prevent timing attacks
      if (timingSafeEqual(password, accessPassword)) {
        // Set cookie to remember user authentication state
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
        // Use same response time for invalid password to prevent timing attacks
        return res.status(401).json({
          success: false,
          message: 'Invalid password',
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
      // Clear cookie
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
