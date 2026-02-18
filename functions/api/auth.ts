export interface Env {
  ACCESS_PASSWORD?: string
}

const COOKIE_CONFIG = {
  ACCESS_TOKEN_NAME: 'cf_access_token',
  DEFAULT_MAX_AGE: 86400,
  SAME_SITE_POLICY: 'Strict',
}

const RATE_LIMIT = {
  MAX_ATTEMPTS: 5,
  WINDOW_MS: 60000,
  BLOCK_DURATION_MS: 300000,
}

declare global {
  interface AuthRateLimitStore {
    attempts: Map<string, { count: number; firstAttempt: number; blockedUntil?: number }>
  }
}

const rateLimitStore: AuthRateLimitStore = {
  attempts: new Map(),
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number; remaining?: number } {
  const now = Date.now()
  const entry = rateLimitStore.attempts.get(ip)

  if (entry?.blockedUntil && now < entry.blockedUntil) {
    return { allowed: false, retryAfter: Math.ceil((entry.blockedUntil - now) / 1000) }
  }

  if (entry?.blockedUntil && now >= entry.blockedUntil) {
    rateLimitStore.attempts.delete(ip)
    return { allowed: true, remaining: RATE_LIMIT.MAX_ATTEMPTS }
  }

  if (!entry) {
    return { allowed: true, remaining: RATE_LIMIT.MAX_ATTEMPTS }
  }

  if (now - entry.firstAttempt > RATE_LIMIT.WINDOW_MS) {
    rateLimitStore.attempts.delete(ip)
    return { allowed: true, remaining: RATE_LIMIT.MAX_ATTEMPTS }
  }

  return { allowed: true, remaining: RATE_LIMIT.MAX_ATTEMPTS - entry.count }
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now()
  const entry = rateLimitStore.attempts.get(ip)

  if (!entry) {
    rateLimitStore.attempts.set(ip, { count: 1, firstAttempt: now })
  } else if (now - entry.firstAttempt > RATE_LIMIT.WINDOW_MS) {
    rateLimitStore.attempts.set(ip, { count: 1, firstAttempt: now })
  } else {
    entry.count++
    if (entry.count >= RATE_LIMIT.MAX_ATTEMPTS) {
      entry.blockedUntil = now + RATE_LIMIT.BLOCK_DURATION_MS
    }
  }

  if (rateLimitStore.attempts.size > 10000) {
    const cutoff = now - RATE_LIMIT.WINDOW_MS - RATE_LIMIT.BLOCK_DURATION_MS
    for (const [key, val] of rateLimitStore.attempts) {
      if (val.firstAttempt < cutoff) {
        rateLimitStore.attempts.delete(key)
      }
    }
  }
}

function clearRateLimit(ip: string): void {
  rateLimitStore.attempts.delete(ip)
}

function getClientIP(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    request.headers.get('X-Real-IP') ||
    'unknown'
  )
}

function timingSafeEqual(a: string, b: string): boolean {
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

function validateBody(body: unknown, requiredFields: string[]): boolean {
  if (!body || typeof body !== 'object') {
    return false
  }
  const obj = body as Record<string, unknown>
  return requiredFields.every(
    (field) => field in obj && typeof obj[field] === 'string' && (obj[field] as string).length > 0
  )
}

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigins = origin || '*'
  return {
    'Access-Control-Allow-Origin': allowedOrigins,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    Vary: 'Origin',
  }
}

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context
  const requestId = generateRequestId()
  const origin = request.headers.get('Origin')
  const corsHeaders = getCorsHeaders(origin)
  const clientIP = getClientIP(request)

  const baseHeaders = {
    ...corsHeaders,
    ...securityHeaders,
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
    const rateLimitResult = checkRateLimit(clientIP)
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
          clearRateLimit(clientIP)
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
          recordFailedAttempt(clientIP)
          const remaining = checkRateLimit(clientIP).remaining || 0

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
      clearRateLimit(clientIP)
      const cookieValue = `${COOKIE_CONFIG.ACCESS_TOKEN_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=${COOKIE_CONFIG.SAME_SITE_POLICY}`

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
