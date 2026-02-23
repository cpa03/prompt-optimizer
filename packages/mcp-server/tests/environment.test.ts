/**
 * Environment Configuration Tests
 *
 * Tests for configuration loading and validation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { loadConfig, validateConfig, MCPServerConfig } from '../src/config/environment.js'

describe('Environment Configuration', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    delete process.env.MCP_HTTP_PORT
    delete process.env.MCP_LOG_LEVEL
    delete process.env.MCP_DEFAULT_LANGUAGE
    delete process.env.MCP_DEFAULT_MODEL_PROVIDER
    delete process.env.MCP_ALLOWED_ORIGINS
    delete process.env.MCP_DNS_REBINDING_PROTECTION
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  describe('loadConfig', () => {
    it('should load default configuration when no env vars set', () => {
      const config = loadConfig()

      expect(config.httpPort).toBeGreaterThanOrEqual(1)
      expect(config.httpPort).toBeLessThanOrEqual(65535)
      expect(['debug', 'info', 'warn', 'error']).toContain(config.logLevel)
      expect(config.defaultLanguage).toBeDefined()
      expect(Array.isArray(config.allowedOrigins)).toBe(true)
      expect(typeof config.enableDnsRebindingProtection).toBe('boolean')
    })

    it('should load custom HTTP port from environment', () => {
      process.env.MCP_HTTP_PORT = '3456'
      const config = loadConfig()

      expect(config.httpPort).toBe(3456)
    })

    it('should load custom log level from environment', () => {
      process.env.MCP_LOG_LEVEL = 'debug'
      const config = loadConfig()

      expect(config.logLevel).toBe('debug')
    })

    it('should load custom language from environment', () => {
      process.env.MCP_DEFAULT_LANGUAGE = 'en'
      const config = loadConfig()

      expect(config.defaultLanguage).toBe('en')
    })

    it('should load preferred model provider from environment', () => {
      process.env.MCP_DEFAULT_MODEL_PROVIDER = 'openai'
      const config = loadConfig()

      expect(config.preferredModelProvider).toBe('openai')
    })

    it('should load allowed origins from environment', () => {
      process.env.MCP_ALLOWED_ORIGINS = 'http://localhost:3000,https://example.com'
      const config = loadConfig()

      expect(config.allowedOrigins).toEqual([
        'http://localhost:3000',
        'https://example.com',
      ])
    })

    it('should handle empty allowed origins string', () => {
      process.env.MCP_ALLOWED_ORIGINS = ''
      const config = loadConfig()

      expect(config.allowedOrigins).toEqual([])
    })

    it('should filter empty origins from list', () => {
      process.env.MCP_ALLOWED_ORIGINS = 'http://localhost:3000,,https://example.com'
      const config = loadConfig()

      expect(config.allowedOrigins).toEqual([
        'http://localhost:3000',
        'https://example.com',
      ])
    })

    it('should enable DNS rebinding protection when set to true', () => {
      process.env.MCP_DNS_REBINDING_PROTECTION = 'true'
      const config = loadConfig()

      expect(config.enableDnsRebindingProtection).toBe(true)
    })

    it('should disable DNS rebinding protection by default', () => {
      const config = loadConfig()

      expect(config.enableDnsRebindingProtection).toBe(false)
    })
  })

  describe('validateConfig', () => {
    it('should pass valid configuration', () => {
      const config: MCPServerConfig = {
        httpPort: 3000,
        logLevel: 'info',
        defaultLanguage: 'zh',
        allowedOrigins: ['*'],
        enableDnsRebindingProtection: false,
      }

      expect(() => validateConfig(config)).not.toThrow()
    })

    it('should throw error for port below minimum', () => {
      const config: MCPServerConfig = {
        httpPort: 0,
        logLevel: 'info',
        defaultLanguage: 'zh',
        allowedOrigins: ['*'],
        enableDnsRebindingProtection: false,
      }

      expect(() => validateConfig(config)).toThrow(
        /HTTP port must be between \d+ and \d+/
      )
    })

    it('should throw error for port above maximum', () => {
      const config: MCPServerConfig = {
        httpPort: 70000,
        logLevel: 'info',
        defaultLanguage: 'zh',
        allowedOrigins: ['*'],
        enableDnsRebindingProtection: false,
      }

      expect(() => validateConfig(config)).toThrow(
        /HTTP port must be between \d+ and \d+/
      )
    })

    it('should throw error for invalid log level', () => {
      const config: MCPServerConfig = {
        httpPort: 3000,
        logLevel: 'invalid' as 'info',
        defaultLanguage: 'zh',
        allowedOrigins: ['*'],
        enableDnsRebindingProtection: false,
      }

      expect(() => validateConfig(config)).toThrow(
        /Log level must be one of:/
      )
    })

    it('should accept all valid log levels', () => {
      const validLevels: Array<'debug' | 'info' | 'warn' | 'error'> = [
        'debug',
        'info',
        'warn',
        'error',
      ]

      for (const level of validLevels) {
        const config: MCPServerConfig = {
          httpPort: 3000,
          logLevel: level,
          defaultLanguage: 'zh',
          allowedOrigins: ['*'],
          enableDnsRebindingProtection: false,
        }

        expect(() => validateConfig(config)).not.toThrow()
      }
    })
  })

  describe('loadConfig with validation', () => {
    it('should produce valid configuration by default', () => {
      const config = loadConfig()
      expect(() => validateConfig(config)).not.toThrow()
    })

    it('should validate configuration loaded from environment', () => {
      process.env.MCP_HTTP_PORT = '3000'
      process.env.MCP_LOG_LEVEL = 'info'

      const config = loadConfig()
      expect(() => validateConfig(config)).not.toThrow()
    })
  })
})
