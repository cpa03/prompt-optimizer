/*
 * Security Headers Configuration
 *
 * This file defines security headers that should be applied to all responses.
 * Use these headers in your deployment configuration (Vercel, Cloudflare, Nginx, etc.)
 */

export const SECURITY_HEADERS = {
  // Prevents clickjacking attacks
  'X-Frame-Options': 'DENY',

  // Prevents MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Enables XSS protection in browsers
  'X-XSS-Protection': '1; mode=block',

  // Controls referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Prevents Flash/PDF cross-domain access
  'X-Permitted-Cross-Domain-Policies': 'none',

  // Forces HTTPS for all connections
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // Prevents DNS prefetching
  'X-DNS-Prefetch-Control': 'off',

  // Permissions Policy (formerly Feature Policy)
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
}

/**
 * Content Security Policy Configuration
 *
 * CSP helps prevent XSS attacks by controlling which resources can be loaded.
 * Customize based on your specific requirements.
 */
export const CONTENT_SECURITY_POLICY = {
  // Default policy for all resources
  'default-src': ["'self'"],

  // Script sources - needs 'unsafe-inline' and 'unsafe-eval' for Vue/Vite
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Vue.js
    "'unsafe-eval'", // Required for Vite HMR in development
  ],

  // Style sources
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for Vue.js scoped styles
  ],

  // Image sources - allow data URLs and HTTPS
  'img-src': [
    "'self'",
    'data:', // Base64 encoded images
    'https:', // HTTPS images from external sources
    'blob:', // Blob URLs
  ],

  // Font sources
  'font-src': ["'self'", 'data:'],

  // Connect sources - API endpoints
  'connect-src': [
    "'self'",
    // AI Provider API endpoints
    'https://api.openai.com',
    'https://api.anthropic.com',
    'https://generativelanguage.googleapis.com',
    'https://api.deepseek.com',
    'https://api.siliconflow.cn',
    'https://open.bigmodel.cn',
    'https://openrouter.ai',
    'https://dashscope.aliyuncs.com',
    'https://api-inference.modelscope.cn',
    'https://api.seaart.ai',
    // WebSocket for development
    process.env.NODE_ENV === 'development' ? 'ws://localhost:*' : '',
    // Allow custom endpoints
    'https:',
  ].filter(Boolean),

  // Object/embed/applet sources
  'object-src': ["'none'"],

  // Base URI
  'base-uri': ["'self'"],

  // Form action targets
  'form-action': ["'self'"],

  // Frame ancestors (prevents embedding)
  'frame-ancestors': ["'none'"],

  // Upgrade insecure requests
  'upgrade-insecure-requests': [],
}

/**
 * Generate CSP header string
 */
export function generateCSPHeader(): string {
  return Object.entries(CONTENT_SECURITY_POLICY)
    .map(([directive, values]) => {
      if (values.length === 0) return directive
      return `${directive} ${values.join(' ')}`
    })
    .join('; ')
}

/**
 * Security headers for static file responses
 */
export const STATIC_FILE_SECURITY_HEADERS = {
  ...SECURITY_HEADERS,
  // Cache control for static assets
  'Cache-Control': 'public, max-age=31536000, immutable',
}

/**
 * Security headers for API responses
 */
export const API_SECURITY_HEADERS = {
  ...SECURITY_HEADERS,
  // No caching for API responses
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

/**
 * Security headers for HTML pages
 */
export const HTML_SECURITY_HEADERS = {
  ...SECURITY_HEADERS,
  'Content-Security-Policy': generateCSPHeader(),
  // Moderate caching for HTML
  'Cache-Control': 'public, max-age=3600, must-revalidate',
}

/**
 * Example usage for Vercel (vercel.json)
 */
export const vercelSecurityConfig = {
  headers: [
    {
      source: '/(.*)',
      headers: Object.entries(SECURITY_HEADERS).map(([key, value]) => ({
        key,
        value,
      })),
    },
    {
      source: '/api/(.*)',
      headers: Object.entries(API_SECURITY_HEADERS).map(([key, value]) => ({
        key,
        value,
      })),
    },
    {
      source: '/assets/(.*)',
      headers: Object.entries(STATIC_FILE_SECURITY_HEADERS).map(([key, value]) => ({
        key,
        value,
      })),
    },
  ],
}

/**
 * Example usage for Nginx
 */
export const nginxSecurityConfig = `
# Add to your nginx.conf or site configuration
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header Content-Security-Policy "${generateCSPHeader()}" always;
add_header X-Permitted-Cross-Domain-Policies "none" always;
add_header X-DNS-Prefetch-Control "off" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
`

/**
 * Example usage for Express.js middleware
 */
export function expressSecurityMiddleware(req: any, res: any, next: () => void) {
  // Apply security headers
  Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
    res.setHeader(header, value)
  })

  // Apply CSP
  res.setHeader('Content-Security-Policy', generateCSPHeader())

  next()
}
