export interface Env {
  ACCESS_PASSWORD?: string
}

const COOKIE_CONFIG = {
  ACCESS_TOKEN_NAME: 'cf_access_token',
  CACHE_CONTROL: 'no-cache, no-store, must-revalidate',
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

function generateAuthPage(isChinese: boolean): string {
  const text = {
    title: isChinese ? '访问验证 - Prompt Optimizer' : 'Access Verification - Prompt Optimizer',
    heading: 'Prompt Optimizer',
    subtitle: isChinese ? '此站点受密码保护' : 'This site is password protected',
    passwordLabel: isChinese ? '访问密码' : 'Access Password',
    passwordPlaceholder: isChinese ? '请输入访问密码' : 'Enter access password',
    submitButton: isChinese ? '验证并访问' : 'Verify & Access',
    loading: isChinese ? '验证中，请稍候...' : 'Verifying, please wait...',
    footer: isChinese
      ? '安全访问控制 | Powered by Cloudflare'
      : 'Secure Access Control | Powered by Cloudflare',
    errorNetwork: isChinese ? '网络错误，请重试' : 'Network error, please try again',
  }

  return `
<!DOCTYPE html>
<html lang="${isChinese ? 'zh-CN' : 'en'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${text.title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .auth-modal {
            background: white;
            padding: 2.5rem;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            width: 100%;
            max-width: 400px;
            text-align: center;
            animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .logo { font-size: 2rem; margin-bottom: 1rem; color: #667eea; }
        h1 { font-size: 1.5rem; color: #333; margin-bottom: 0.5rem; }
        .subtitle { color: #666; margin-bottom: 2rem; font-size: 0.9rem; }
        .form-group { margin-bottom: 1.5rem; text-align: left; }
        label { display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500; }
        input[type="password"] {
            width: 100%;
            padding: 0.75rem;
            border: 2px solid #e1e5e9;
            border-radius: 6px;
            font-size: 1rem;
            transition: border-color 0.3s;
        }
        input[type="password"]:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        .submit-btn {
            width: 100%;
            padding: 0.75rem;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        .submit-btn:hover:not(:disabled) { background: #5a6fd8; }
        .submit-btn:disabled { background: #ccc; cursor: not-allowed; }
        .error-message {
            color: #e74c3c;
            margin-top: 1rem;
            font-size: 0.9rem;
            display: none;
            padding: 0.5rem;
            background: #ffeaea;
            border-radius: 4px;
            border-left: 4px solid #e74c3c;
        }
        .loading { display: none; margin-top: 1rem; color: #667eea; }
        .footer {
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #eee;
            font-size: 0.8rem;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="auth-modal">
        <div class="logo">🚀</div>
        <h1>${text.heading}</h1>
        <p class="subtitle">${text.subtitle}</p>
        <form id="authForm">
            <div class="form-group">
                <label for="password">${text.passwordLabel}</label>
                <input 
                    type="password" 
                    id="password" 
                    name="password" 
                    required 
                    placeholder="${text.passwordPlaceholder}"
                    autocomplete="current-password"
                >
            </div>
            <button type="submit" class="submit-btn" id="submitBtn">
                <span id="btnText">${text.submitButton}</span>
            </button>
            <div class="error-message" id="errorMessage"></div>
            <div class="loading" id="loading">${text.loading}</div>
        </form>
        <div class="footer">${text.footer}</div>
    </div>
    <script>
        const form = document.getElementById('authForm');
        const submitBtn = document.getElementById('submitBtn');
        const btnText = document.getElementById('btnText');
        const errorMessage = document.getElementById('errorMessage');
        const loading = document.getElementById('loading');
        const passwordInput = document.getElementById('password');
        const isChinese = document.documentElement.lang === 'zh-CN';
        const errorMessages = {
            network: '${text.errorNetwork}',
            invalidPassword: isChinese ? '密码错误，请重试' : 'Invalid password, please try again'
        };
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = passwordInput.value.trim();
            if (!password) return;
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            loading.style.display = 'block';
            errorMessage.style.display = 'none';
            try {
                const response = await fetch('/api/auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ action: 'verify', password })
                });
                const data = await response.json();
                if (data.success) {
                    window.location.reload();
                } else {
                    errorMessage.textContent = data.message || errorMessages.invalidPassword;
                    errorMessage.style.display = 'block';
                    passwordInput.value = '';
                    passwordInput.focus();
                }
            } catch (error) {
                errorMessage.textContent = errorMessages.network;
                errorMessage.style.display = 'block';
            } finally {
                submitBtn.disabled = false;
                btnText.style.display = 'inline';
                loading.style.display = 'none';
            }
        });
        passwordInput.focus();
        passwordInput.addEventListener('input', () => { errorMessage.style.display = 'none'; });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') { passwordInput.focus(); errorMessage.style.display = 'none'; }
        });
    </script>
</body>
</html>`
}

const CONTENT_SECURITY_POLICY =
  "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https: wss:; worker-src 'self' blob:; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests"

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'Permissions-Policy':
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Cross-Origin-Opener-Policy': 'same-origin',
}

const EXCLUDED_PATHS = ['/api/', '/_next/static', '/_next/image', '/favicon.ico', '/assets/']

function shouldExcludePath(pathname: string): boolean {
  if (EXCLUDED_PATHS.some((p) => pathname.startsWith(p))) {
    return true
  }
  if (pathname.match(/\.[a-zA-Z0-9]+$/)) {
    return true
  }
  return false
}

export async function onRequest(context: {
  request: Request
  env: Env
  next: () => Promise<Response>
}): Promise<Response> {
  const { request, env, next } = context
  const url = new URL(request.url)
  const pathname = url.pathname

  if (shouldExcludePath(pathname)) {
    return next()
  }

  const accessPassword = env.ACCESS_PASSWORD

  if (!accessPassword) {
    return next()
  }

  const cookieHeader = request.headers.get('cookie')
  let authenticated = false

  if (cookieHeader) {
    const cookies = cookieHeader.split(';')
    const accessTokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith(`${COOKIE_CONFIG.ACCESS_TOKEN_NAME}=`)
    )

    if (accessTokenCookie) {
      const accessToken = accessTokenCookie.split('=')[1]?.trim()
      authenticated = timingSafeEqual(accessToken, 'authenticated')
    }
  }

  if (authenticated) {
    return next()
  }

  const acceptLanguage = request.headers.get('accept-language') || ''
  const preferChinese = acceptLanguage.includes('zh')

  return new Response(generateAuthPage(preferChinese), {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': COOKIE_CONFIG.CACHE_CONTROL,
      'Content-Security-Policy': CONTENT_SECURITY_POLICY,
      ...SECURITY_HEADERS,
    },
  })
}
