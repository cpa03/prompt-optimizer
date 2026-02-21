/**
 * Cloudflare Pages Authentication API
 *
 * IMPORTANT: Rate Limiting Limitation
 * The current rate limiting implementation uses in-memory storage (Map).
 * In Cloudflare's edge environment, each Worker isolate has its own memory,
 * so rate limiting is NOT distributed across edge locations.
 *
 * For production use with distributed rate limiting:
 * 1. Enable KV namespace in wrangler.toml (see commented section)
 * 2. Implement rate limiting using KV with TTL
 * 3. Alternatively, use Cloudflare's Rate Limiting product
 *
 * @see https://developers.cloudflare.com/waf/rate-limiting-rules/
 */

import {
  type Env,
  type AuthRateLimitStore,
  COOKIE_CONFIG,
  SECURITY_HEADERS,
  timingSafeEqual,
  generateRequestId,
  getClientIP,
  validateBody,
  getCorsHeaders,
  checkRateLimit,
  recordFailedAttempt,
  clearRateLimit,
} from '../_utils'

export type { Env }

const rateLimitStore: AuthRateLimitStore = {
  attempts: new Map(),
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context
  const requestId = generateRequestId('auth')
  const origin = request.headers.get('Origin')
  const corsHeaders = getCorsHeaders(origin)
  const clientIP = getClientIP(request)

  const baseHeaders = {
    ...corsHeaders,
    ...SECURITY_HEADERS,
    'X-Request-ID': requestId,
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: baseHeaders,
    })
  }

  const accessPassword = env.ACCESS_PASSWORD

  if (!accessPassword) {
    return new Response(
      JSON.stringify({
        success: true,
        message: 'No password protection configured',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...baseHeaders,
        },
      }
    )
  }

  if (request.method === 'POST') {
    const rateLimitResult = checkRateLimit(clientIP, rateLimitStore)
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Too many attempts. Please try again later.',
          retryAfter: rateLimitResult.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimitResult.retryAfter || 60),
            ...baseHeaders,
          },
        }
      )
    }

    try {
      const body = (await request.json()) as { password?: string; action?: string }

      if (!validateBody(body, ['action'])) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Invalid request body',
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...baseHeaders,
            },
          }
        )
      }

      const { password, action } = body

      if (action === 'verify') {
        if (!validateBody(body, ['password'])) {
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Password is required',
            }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...baseHeaders,
              },
            }
          )
        }

        if (timingSafeEqual(password!, accessPassword)) {
          clearRateLimit(clientIP, rateLimitStore)
          const maxAge = COOKIE_CONFIG.DEFAULT_MAX_AGE
          const cookieValue = `${COOKIE_CONFIG.ACCESS_TOKEN_NAME}=authenticated; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=${COOKIE_CONFIG.SAME_SITE_POLICY}; Secure`

          return new Response(
            JSON.stringify({
              success: true,
              message: 'Authentication successful',
            }),
            {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': cookieValue,
                ...baseHeaders,
              },
            }
          )
        } else {
          recordFailedAttempt(clientIP, rateLimitStore)
          const remaining = checkRateLimit(clientIP, rateLimitStore).remaining || 0

          return new Response(
            JSON.stringify({
              success: false,
              message: 'Invalid password',
              attemptsRemaining: remaining,
            }),
            {
              status: 401,
              headers: {
                'Content-Type': 'application/json',
                ...baseHeaders,
              },
            }
          )
        }
      }

      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid action',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...baseHeaders,
          },
        }
      )
    } catch {
      return new Response(JSON.stringify({ success: false, message: 'Invalid request body' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...baseHeaders,
        },
      })
    }
  }

  if (request.method === 'GET') {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')

    if (action === 'logout') {
      clearRateLimit(clientIP, rateLimitStore)
      const cookieValue = `${COOKIE_CONFIG.ACCESS_TOKEN_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=${COOKIE_CONFIG.SAME_SITE_POLICY}; Secure`

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Logged out successfully',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': cookieValue,
            ...baseHeaders,
          },
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Invalid action',
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...baseHeaders,
        },
      }
    )
  }

  return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
    status: 405,
    headers: {
      'Content-Type': 'application/json',
      ...baseHeaders,
    },
  })
}
