/**
 * Vercel Serverless Health Check API
 * Provides system health status and deployment information
 */

function generateRequestId() {
  return crypto.randomUUID()
}

/**
 * Structured logging for Vercel functions
 * @param {object} params - Log parameters
 * @param {string} params.requestId - Request ID
 * @param {string} params.event - Event name
 * @param {string} [params.level] - Log level
 * @param {object} [params.data] - Additional data
 */
function log({ requestId, event, level = 'info', data = {} }) {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      requestId,
      event,
      level,
      ...data,
    })
  )
}

export default function handler(req, res) {
  const requestId = generateRequestId()
  const timestamp = new Date().toISOString()

  log({ requestId, event: 'health_check', data: { method: req.method } })

  res.setHeader('X-Request-ID', requestId)
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
  res.setHeader('X-Content-Type-Options', 'nosniff')

  if (req.method === 'GET') {
    const memoryUsage = process.memoryUsage()
    return res.status(200).json({
      status: 'ok',
      timestamp,
      requestId,
      version: process.env.npm_package_version || 'unknown',
      region: process.env.VERCEL_REGION || 'unknown',
      environment: process.env.NODE_ENV || 'unknown',
      deployment: {
        id: process.env.VERCEL_DEPLOYMENT_ID || 'unknown',
        url: process.env.VERCEL_URL || 'unknown',
        branch: process.env.VERCEL_GIT_COMMIT_REF || 'unknown',
        commitSha: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
      },
      runtime: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
          unit: 'MB',
        },
      },
    })
  }

  res.setHeader('Allow', 'GET')
  return res.status(405).json({
    status: 'error',
    message: 'Method not allowed',
    requestId,
  })
}
