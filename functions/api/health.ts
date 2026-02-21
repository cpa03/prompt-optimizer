import type { IncomingRequestCfProperties } from '@cloudflare/workers-types'
import { type Env, SECURITY_HEADERS, generateRequestId } from '../_utils'

export type { Env }

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request } = context
  const requestId = generateRequestId('cf_health')
  const timestamp = new Date().toISOString()

  const headers: Record<string, string> = {
    'X-Request-ID': requestId,
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    ...SECURITY_HEADERS,
    'Content-Type': 'application/json',
  }

  if (request.method === 'GET') {
    const cfRay = request.headers.get('CF-Ray') || 'unknown'
    const cfConnectingIp = request.headers.get('CF-Connecting-IP') || 'unknown'
    const cfCountry = request.headers.get('CF-IPCountry') || 'unknown'
    const cfVisitor = request.headers.get('CF-Visitor')
    let cfColo = 'unknown'
    let cfTimezone = 'unknown'

    const cf = (request as Request & { cf?: IncomingRequestCfProperties }).cf
    if (cf) {
      cfColo = cf.colo ?? cfColo
      cfTimezone = (cf as IncomingRequestCfProperties & { timezone?: string }).timezone ?? cfTimezone
    }

    let scheme = 'https'
    if (cfVisitor) {
      try {
        const visitor = JSON.parse(cfVisitor)
        scheme = visitor.scheme || scheme
      } catch {
        // Invalid JSON, keep default
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
