/**
 * Generate a unique request ID for logging/tracing
 * Uses crypto.randomUUID() for cryptographically secure, unpredictable identifiers
 * @returns {string} - Unique request ID
 */
function generateRequestId() {
  return `health_${Date.now()}_${crypto.randomUUID().split('-')[0]}`
}

/**
 * Get process memory usage in MB
 * @returns {object} - Memory stats in MB
 */
function getMemoryStats() {
  const usage = process.memoryUsage()
  return {
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
    rss: Math.round(usage.rss / 1024 / 1024),
    external: Math.round(usage.external / 1024 / 1024),
  }
}

/**
 * Get uptime in seconds
 * @returns {number} - Uptime in seconds
 */
function getUptime() {
  return Math.round(process.uptime())
}

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
}

export default function handler(req, res) {
  const requestId = generateRequestId()
  const timestamp = new Date().toISOString()
  const startTime = Date.now()

  res.setHeader('X-Request-ID', requestId)
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value)
  })

  if (req.method === 'GET') {
    const responseTime = Date.now() - startTime
    res.setHeader('X-Response-Time', `${responseTime}ms`)
    const healthData = {
      status: 'ok',
      timestamp,
      requestId,
      version: process.env.npm_package_version || 'unknown',
      region: process.env.VERCEL_REGION || 'unknown',
      environment: process.env.NODE_ENV || 'unknown',
      uptime: getUptime(),
      memory: getMemoryStats(),
      responseTime: `${responseTime}ms`,
    }

    return res.status(200).json(healthData)
  }

  res.setHeader('Allow', 'GET')
  const responseTime = Date.now() - startTime
  res.setHeader('X-Response-Time', `${responseTime}ms`)
  return res.status(405).json({
    status: 'error',
    message: 'Method not allowed',
    requestId,
    allowedMethods: ['GET'],
  })
}
