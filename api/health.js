function generateRequestId() {
  return `health_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export default function handler(req, res) {
  const requestId = generateRequestId()
  const timestamp = new Date().toISOString()

  res.setHeader('X-Request-ID', requestId)
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
  res.setHeader('X-Content-Type-Options', 'nosniff')

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      timestamp,
      requestId,
      version: process.env.npm_package_version || 'unknown',
      region: process.env.VERCEL_REGION || 'unknown',
      environment: process.env.NODE_ENV || 'unknown',
    })
  }

  res.setHeader('Allow', 'GET')
  return res.status(405).json({
    status: 'error',
    message: 'Method not allowed',
    requestId,
  })
}
