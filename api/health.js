/**
 * Health Check Endpoint
 *
 * Lightweight endpoint for monitoring and health checks.
 * Used by Vercel deployments, load balancers, and monitoring services.
 *
 * @see https://vercel.com/docs/functions/serverless-functions/runtimes#official-runtimes
 */

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cache-Control': 'no-store, max-age=0',
}

export default function handler(req, res) {
  const headers = {
    ...SECURITY_HEADERS,
    'Content-Type': 'application/json',
  }

  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value)
  })

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || 'unknown',
    region: process.env.VERCEL_REGION || 'local',
  })
}
