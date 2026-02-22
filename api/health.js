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
    service: 'health-api',
    region: process.env.VERCEL_REGION || 'local',
    ...data,
  }
  console.log(JSON.stringify(logEntry))
}

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

export default function handler(req, res) {
  const requestId = generateRequestId()
  const timestamp = new Date().toISOString()
  const startTime = Date.now()

  res.setHeader('X-Request-ID', requestId)
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
  res.setHeader('X-Content-Type-Options', 'nosniff')

  log('debug', 'Health check request received', { requestId, method: req.method })

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

    log('info', 'Health check completed', { requestId, responseTime: `${responseTime}ms` })
    return res.status(200).json(healthData)
  }

  res.setHeader('Allow', 'GET')
  const responseTime = Date.now() - startTime
  res.setHeader('X-Response-Time', `${responseTime}ms`)
  log('warn', 'Method not allowed', { requestId, method: req.method })
  return res.status(405).json({
    status: 'error',
    message: 'Method not allowed',
    requestId,
    allowedMethods: ['GET'],
  })
}
