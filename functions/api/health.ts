import type { IncomingRequestCfProperties } from '@cloudflare/workers-types'
import { type Env, SECURITY_HEADERS, generateRequestId } from '../_utils'

export type { Env }

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request } = context
  const requestId = generateRequestId('cf_health')
  const timestamp = new Date().toISOString()
  const startTime = performance.now()

  const headers: Record<string, string> = {
    'X-Request-ID': requestId,
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    ...SECURITY_HEADERS,
    'Content-Type': 'application/json',
  }

  function addServerTiming(): void {
    const processingTime = performance.now() - startTime
    headers['Server-Timing'] = `total;dur=${processingTime.toFixed(2)}`
  }

  if (request.method === 'GET') {
    const cfRay = request.headers.get('CF-Ray') || 'unknown'
    const cfConnectingIp = request.headers.get('CF-Connecting-IP') || 'unknown'
    const cfCountry = request.headers.get('CF-IPCountry') || 'unknown'
    const cfVisitor = request.headers.get('CF-Visitor')

    let cfColo = 'unknown'
    let cfTimezone = 'unknown'
    let cfCity: string | undefined
    let cfRegion: string | undefined
    let cfRegionCode: string | undefined
    let cfAsn: number | undefined
    let cfAsOrganization: string | undefined

    const cf = (request as Request & { cf?: IncomingRequestCfProperties }).cf
    if (cf) {
      cfColo = cf.colo ?? cfColo
      cfTimezone = (cf as IncomingRequestCfProperties & { timezone?: string }).timezone ?? cfTimezone
      cfCity = cf.city as string | undefined
      cfRegion = cf.region as string | undefined
      cfRegionCode = cf.regionCode as string | undefined
      cfAsn = cf.asn as number | undefined
      cfAsOrganization = cf.asOrganization as string | undefined
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

    const responseBody: Record<string, unknown> = {
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
    }

    if (cfCity) responseBody.city = cfCity
    if (cfRegion) responseBody.regionDetail = cfRegion
    if (cfRegionCode) responseBody.regionCode = cfRegionCode
    if (cfAsn) responseBody.asn = cfAsn
    if (cfAsOrganization) responseBody.asOrganization = cfAsOrganization

    addServerTiming()

    return new Response(JSON.stringify(responseBody), { status: 200, headers })
  }

  headers['Allow'] = 'GET'
  addServerTiming()

  return new Response(
    JSON.stringify({
      status: 'error',
      message: 'Method not allowed',
      requestId,
    }),
    { status: 405, headers }
  )
}
