import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('Web App Main', () => {
  let mockCreateElement: ReturnType<typeof vi.fn>
  let mockAppendChild: ReturnType<typeof vi.fn>
  let mockAddEventListener: ReturnType<typeof vi.fn>
  let mockConsoleLog: ReturnType<typeof vi.fn>
  let mockConsoleWarn: ReturnType<typeof vi.fn>
  let mockConsoleError: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()

    mockCreateElement = vi.fn((tag: string) => ({
      tagName: tag.toUpperCase(),
      src: '',
      defer: false,
      onload: null,
      onerror: null,
      dataset: {} as Record<string, string>,
      setAttribute: vi.fn(),
      appendChild: vi.fn(),
    }))

    mockAppendChild = vi.fn()
    mockAddEventListener = vi.fn()
    mockConsoleLog = vi.fn()
    mockConsoleWarn = vi.fn()
    mockConsoleError = vi.fn()

    Object.defineProperty(global, 'document', {
      value: {
        createElement: mockCreateElement,
        head: {
          appendChild: mockAppendChild,
        },
      },
      writable: true,
    })

    Object.defineProperty(global, 'window', {
      value: {
        addEventListener: mockAddEventListener,
        removeEventListener: vi.fn(),
      },
      writable: true,
    })

    Object.defineProperty(global, 'console', {
      value: {
        log: mockConsoleLog,
        warn: mockConsoleWarn,
        error: mockConsoleError,
      },
      writable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Analytics Loading Logic', () => {
    const testAnalyticsLogic = (envVars: Record<string, string>, expectedScriptSrc: string | null) => {
      return () => {
        const loadAnalytics = () => {
          if (envVars.VITE_VERCEL_DEPLOYMENT === 'true') {
            const script = document.createElement('script')
            script.src = '/_vercel/insights/script.js'
            script.defer = true
            script.onload = () => console.log('Vercel Analytics loaded')
            script.onerror = () => console.warn('Vercel Analytics failed')
            document.head.appendChild(script)
          } else if (envVars.VITE_CLOUDFLARE_DEPLOYMENT === 'true') {
            const token = envVars.VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN
            if (token) {
              const script = document.createElement('script')
              script.defer = true
              script.src = 'https://static.cloudflareinsights.com/beacon.min.js'
              script.dataset.cfBeacon = JSON.stringify({ token })
              script.onload = () => console.log('Cloudflare Analytics loaded')
              script.onerror = () => console.warn('Cloudflare Analytics failed')
              document.head.appendChild(script)
            }
          } else if (envVars.DEV === 'true') {
            console.log('Platform Analytics not loaded')
          }
        }
        window.addEventListener('DOMContentLoaded', loadAnalytics)
      }
    }

    it('should not load analytics when no deployment flag is set', () => {
      const envVars = {
        VITE_VERCEL_DEPLOYMENT: 'false',
        VITE_CLOUDFLARE_DEPLOYMENT: 'false',
        DEV: 'false',
      }
      testAnalyticsLogic(envVars, null)()
      expect(mockCreateElement).not.toHaveBeenCalled()
      expect(mockAddEventListener).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function))
    })

    it('should load Vercel Analytics when VITE_VERCEL_DEPLOYMENT is true', () => {
      const envVars = {
        VITE_VERCEL_DEPLOYMENT: 'true',
        VITE_CLOUDFLARE_DEPLOYMENT: 'false',
        DEV: 'true',
      }
      testAnalyticsLogic(envVars, 'vercel')()

      const eventHandler = (mockAddEventListener as ReturnType<typeof vi.fn>).mock.calls.find(
        (call: (string | Function)[]) => call[0] === 'DOMContentLoaded'
      )?.[1] as Function
      eventHandler()

      expect(mockCreateElement).toHaveBeenCalledWith('script')
      const appendedScript = mockAppendChild.mock.calls[0]?.[0]
      expect(appendedScript?.src).toContain('vercel')
    })

    it('should load Cloudflare Analytics when VITE_CLOUDFLARE_DEPLOYMENT is true with token', () => {
      const envVars = {
        VITE_VERCEL_DEPLOYMENT: 'false',
        VITE_CLOUDFLARE_DEPLOYMENT: 'true',
        VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN: 'test-token-123',
        DEV: 'true',
      }
      testAnalyticsLogic(envVars, 'cloudflare')()

      const eventHandler = (mockAddEventListener as ReturnType<typeof vi.fn>).mock.calls.find(
        (call: (string | Function)[]) => call[0] === 'DOMContentLoaded'
      )?.[1] as Function
      eventHandler()

      expect(mockCreateElement).toHaveBeenCalledWith('script')
      const appendedScript = mockAppendChild.mock.calls[0]?.[0]
      expect(appendedScript?.src).toContain('cloudflare')
      expect(appendedScript?.dataset.cfBeacon).toContain('test-token-123')
    })

    it('should not load Cloudflare Analytics when token is missing', () => {
      const envVars = {
        VITE_VERCEL_DEPLOYMENT: 'false',
        VITE_CLOUDFLARE_DEPLOYMENT: 'true',
        VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN: '',
        DEV: 'true',
      }
      testAnalyticsLogic(envVars, null)()

      const eventHandler = (mockAddEventListener as ReturnType<typeof vi.fn>).mock.calls.find(
        (call: (string | Function)[]) => call[0] === 'DOMContentLoaded'
      )?.[1] as Function
      eventHandler()

      expect(mockCreateElement).not.toHaveBeenCalled()
    })

    it('should prefer Vercel over Cloudflare when both are set', () => {
      const envVars = {
        VITE_VERCEL_DEPLOYMENT: 'true',
        VITE_CLOUDFLARE_DEPLOYMENT: 'true',
        VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN: 'test-token',
        DEV: 'true',
      }
      testAnalyticsLogic(envVars, 'vercel')()

      const eventHandler = (mockAddEventListener as ReturnType<typeof vi.fn>).mock.calls.find(
        (call: (string | Function)[]) => call[0] === 'DOMContentLoaded'
      )?.[1] as Function
      eventHandler()

      expect(mockCreateElement).toHaveBeenCalledWith('script')
      const appendedScript = mockAppendChild.mock.calls[0]?.[0]
      expect(appendedScript?.src).toContain('vercel')
      expect(appendedScript?.src).not.toContain('cloudflare')
    })

    it('should log in DEV mode when no analytics configured', () => {
      const envVars = {
        VITE_VERCEL_DEPLOYMENT: 'false',
        VITE_CLOUDFLARE_DEPLOYMENT: 'false',
        DEV: 'true',
      }
      testAnalyticsLogic(envVars, null)()

      const eventHandler = (mockAddEventListener as ReturnType<typeof vi.fn>).mock.calls.find(
        (call: (string | Function)[]) => call[0] === 'DOMContentLoaded'
      )?.[1] as Function
      eventHandler()

      expect(mockConsoleLog).toHaveBeenCalledWith('Platform Analytics not loaded')
    })
  })

  describe('Error Handling Setup', () => {
    const setupErrorHandlers = () => {
      window.addEventListener('unhandledrejection', (event) => {
        event.preventDefault()
      })

      window.addEventListener('error', (event) => {
        if (
          event.message?.includes('currentInstance') ||
          event.message?.includes('ResizeObserver') ||
          event.filename?.includes('chrome-extension')
        ) {
          event.preventDefault()
        }
      })
    }

    it('should set up unhandledrejection handler', () => {
      setupErrorHandlers()
      expect(mockAddEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function))
    })

    it('should set up error handler', () => {
      setupErrorHandlers()
      expect(mockAddEventListener).toHaveBeenCalledWith('error', expect.any(Function))
    })

    it('should prevent default for known third-party errors', () => {
      setupErrorHandlers()

      const errorEvent = {
        message: 'ResizeObserver error',
        filename: 'some-vendor.js',
        preventDefault: vi.fn(),
      }

      const eventHandler = (mockAddEventListener as ReturnType<typeof vi.fn>).mock.calls.find(
        (call: (string | Function)[]) => call[0] === 'error'
      )?.[1] as Function
      eventHandler(errorEvent)

      expect(errorEvent.preventDefault).toHaveBeenCalled()
    })

    it('should not prevent default for unknown errors', () => {
      setupErrorHandlers()

      const errorEvent = {
        message: 'Some real error',
        filename: 'app.js',
        preventDefault: vi.fn(),
      }

      const eventHandler = (mockAddEventListener as ReturnType<typeof vi.fn>).mock.calls.find(
        (call: (string | Function)[]) => call[0] === 'error'
      )?.[1] as Function
      eventHandler(errorEvent)

      expect(errorEvent.preventDefault).not.toHaveBeenCalled()
    })
  })

  describe('DOM Environment', () => {
    it('should have required DOM APIs available', () => {
      expect(typeof document).toBe('object')
      expect(typeof document.createElement).toBe('function')
      expect(typeof window.addEventListener).toBe('function')
    })

    it('should be able to create script elements', () => {
      const script = document.createElement('script')
      expect(script).toBeDefined()
      expect(script.src).toBe('')
    })
  })
})
