export interface Env {
  ACCESS_PASSWORD?: string
}

/**
 * Generate a unique request ID for logging/tracing.
 * Uses crypto.randomUUID() for cryptographically secure, unpredictable identifiers.
 * This is safer than Math.random() which is predictable and not meant for security.
 * @returns A unique request ID string
 */
function generateRequestId(): string {
  return `cf_health_${Date.now()}_${crypto.randomUUID()}`
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request } = context
  const requestId = generateRequestId()
  const timestamp = new Date().toISOString()

  const headers: Record<string, string> = {
    'X-Request-ID': requestId,
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Permitted-Cross-Domain-Policies': 'none',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Content-Type': 'application/json',
  }

  if (request.method === 'GET') {
    const cfRay = request.headers.get('CF-Ray') || 'unknown'
    const cfConnectingIp = request.headers.get('CF-Connecting-IP') || 'unknown'
    const cfCountry = request.headers.get('CF-IPCountry') || 'unknown'
    const cfVisitor = request.headers.get('CF-Visitor')
    let cfColo = 'unknown'
    let cfTimezone = 'unknown'

    try {
      const cf = (request as any).cf
      if (cf) {
        cfColo = cf.colo || cfColo
        cfTimezone = cf.timezone || cfTimezone
      }
    } catch {
    }

    let scheme = 'https'
    if (cfVisitor) {
      try {
        const visitor = JSON.parse(cfVisitor)
        scheme = visitor.scheme || scheme
      } catch {
      }
    }

    return new Response(
      JSON.stringify({
        status: 'ok',
        timestamp,
        requestId,
        version: 'cloudflare-pages',
        platform: 'cloudflare',
        region: cfColo,
        colo: cfColo,
        country: cfCountry,
        timezone: cfTimezone,
        scheme,
        cfRay,
        cfConnectingIp,
      }),
      { status: 200, headers }
    )
  }

  headers['Allow'] = 'GET'
  return new Response(
    JSON.stringify({
      status: 'error',
      message: 'Method not allowed',
      requestId,
    }),
    { status: 405, headers }
  )
}
