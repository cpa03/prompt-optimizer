export interface Env {
  ACCESS_PASSWORD?: string
}

const COOKIE_CONFIG = {
  ACCESS_TOKEN_NAME: 'cf_access_token',
  DEFAULT_MAX_AGE: 86400,
  SAME_SITE_POLICY: 'Strict',
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
  const origin = request.headers.get('Origin')
  const corsHeaders = getCorsHeaders(origin)

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: { ...corsHeaders, ...securityHeaders },
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
          ...corsHeaders,
          ...securityHeaders,
        },
      }
    )
  }

  if (request.method === 'POST') {
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
              ...corsHeaders,
              ...securityHeaders,
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
                ...corsHeaders,
                ...securityHeaders,
              },
            }
          )
        }

        if (timingSafeEqual(password!, accessPassword)) {
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
                ...corsHeaders,
                ...securityHeaders,
              },
            }
          )
        } else {
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Invalid password',
            }),
            {
              status: 401,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
                ...securityHeaders,
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
            ...corsHeaders,
            ...securityHeaders,
          },
        }
      )
    } catch {
      return new Response(JSON.stringify({ success: false, message: 'Invalid request body' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
          ...securityHeaders,
        },
      })
    }
  }

  if (request.method === 'GET') {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')

    if (action === 'logout') {
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
            ...corsHeaders,
            ...securityHeaders,
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
          ...corsHeaders,
          ...securityHeaders,
        },
      }
    )
  }

  return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
    status: 405,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
      ...securityHeaders,
    },
  })
}
