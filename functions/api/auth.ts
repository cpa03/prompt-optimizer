export interface Env {
  ACCESS_PASSWORD?: string
}

const COOKIE_CONFIG = {
  ACCESS_TOKEN_NAME: 'cf_access_token',
  DEFAULT_MAX_AGE: 86400,
  SAME_SITE_POLICY: 'Strict',
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
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
        },
      }
    )
  }

  if (request.method === 'POST') {
    try {
      const body = (await request.json()) as {
        password?: string
        action?: string
      }
      const { password, action } = body

      if (action === 'verify') {
        if (password === accessPassword) {
          const maxAge = COOKIE_CONFIG.DEFAULT_MAX_AGE
          const cookieValue = `${COOKIE_CONFIG.ACCESS_TOKEN_NAME}=${accessPassword}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=${COOKIE_CONFIG.SAME_SITE_POLICY}; Secure`

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
              },
            }
          )
        }
      }
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
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
          },
        }
      )
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  })
}
