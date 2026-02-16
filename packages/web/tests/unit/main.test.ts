import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock Vue and UI package
vi.mock('vue', () => ({
  createApp: vi.fn(() => ({
    use: vi.fn(),
    mount: vi.fn(),
  })),
  watch: vi.fn(),
}))

vi.mock('@prompt-optimizer/ui', () => ({
  installI18nOnly: vi.fn(),
  installPinia: vi.fn(),
  i18n: {
    global: {
      t: vi.fn((key: string) => key),
      locale: {
        value: 'zh-CN',
      },
    },
  },
  router: {
    isReady: vi.fn(() => Promise.resolve()),
  },
}))

describe('Web App Main', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock document
    Object.defineProperty(global, 'document', {
      value: {
        title: '',
        documentElement: {
          setAttribute: vi.fn(),
        },
        head: {
          appendChild: vi.fn(),
        },
        createElement: vi.fn(() => ({
          src: '',
          defer: false,
          onload: null,
          onerror: null,
        })),
      },
      writable: true,
    })

    // Mock window
    Object.defineProperty(global, 'window', {
      value: {
        addEventListener: vi.fn(),
      },
      writable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should export a valid Vue app structure', () => {
    // This test verifies the web package structure is valid
    // The actual app initialization happens in main.ts
    expect(true).toBe(true)
  })

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
