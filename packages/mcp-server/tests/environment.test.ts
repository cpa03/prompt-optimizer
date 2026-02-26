/**
 * Environment Configuration Tests
 *
 * Tests for the MCP server environment configuration loading and validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { loadConfig, validateConfig, type MCPServerConfig } from '../src/config/environment.js'
import { MCP_CONFIG } from '@prompt-optimizer/core'

describe('Environment Config', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    delete process.env.MCP_HTTP_PORT
    delete process.env.MCP_LOG_LEVEL
    delete process.env.MCP_DEFAULT_LANGUAGE
    delete process.env.MCP_DEFAULT_MODEL_PROVIDER
    delete process.env.MCP_ALLOWED_ORIGINS
    delete process.env.MCP_DNS_REBINDING_PROTECTION
  })

  describe('loadConfig', () => {
    it('should use default values when env vars not set', () => {
      const config = loadConfig()

      expect(config.httpPort).toBe(MCP_CONFIG.server.defaultHttpPort)
      expect(config.logLevel).toBe(MCP_CONFIG.logging.defaultLevel)
      expect(config.defaultLanguage).toBe(MCP_CONFIG.defaults.language)
      expect(config.allowedOrigins).toEqual(['*'])
      expect(config.enableDnsRebindingProtection).toBe(true)
    })

    it('should use custom HTTP port from environment', () => {
      process.env.MCP_HTTP_PORT = '8080'
      const config = loadConfig()

      expect(config.httpPort).toBe(8080)
    })

    it('should use custom log level from environment', () => {
      process.env.MCP_LOG_LEVEL = 'debug'
      const config = loadConfig()

      expect(config.logLevel).toBe('debug')
    })

    it('should use custom language from environment', () => {
      process.env.MCP_DEFAULT_LANGUAGE = 'en-US'
      const config = loadConfig()

      expect(config.defaultLanguage).toBe('en-US')
    })

    it('should use custom model provider from environment', () => {
      process.env.MCP_DEFAULT_MODEL_PROVIDER = 'openai'
      const config = loadConfig()

      expect(config.preferredModelProvider).toBe('openai')
    })

    it('should parse allowed origins from comma-separated string', () => {
      process.env.MCP_ALLOWED_ORIGINS = 'http://localhost:3000, https://example.com'
      const config = loadConfig()

      expect(config.allowedOrigins).toEqual([
        'http://localhost:3000',
        'https://example.com',
      ])
    })

    it('should handle empty allowed origins string', () => {
      process.env.MCP_ALLOWED_ORIGINS = ''
      const config = loadConfig()

      expect(config.allowedOrigins).toEqual(['*'])
    })

    it('should handle whitespace-only allowed origins string', () => {
      process.env.MCP_ALLOWED_ORIGINS = '   '
      const config = loadConfig()

      expect(config.allowedOrigins).toEqual([])
    })

    it('should enable DNS rebinding protection by default', () => {
      const config = loadConfig()

      expect(config.enableDnsRebindingProtection).toBe(true)
    })

    it('should allow disabling DNS rebinding protection', () => {
      process.env.MCP_DNS_REBINDING_PROTECTION = 'false'
      const config = loadConfig()

      expect(config.enableDnsRebindingProtection).toBe(false)
    })

    it('should handle all valid log levels', () => {
      const validLevels = ['debug', 'info', 'warn', 'error']

      for (const level of validLevels) {
        process.env.MCP_LOG_LEVEL = level
        const config = loadConfig()
        expect(config.logLevel).toBe(level)
      }
    })
  })

  describe('validateConfig', () => {
    it('should not throw for valid config', () => {
      const config: MCPServerConfig = {
        httpPort: 3000,
        logLevel: 'info',
        defaultLanguage: 'zh-CN',
        allowedOrigins: ['*'],
        enableDnsRebindingProtection: true,
      }

      expect(() => validateConfig(config)).not.toThrow()
    })

    it('should throw for port below minimum', () => {
      const config: MCPServerConfig = {
        httpPort: 0,
        logLevel: 'info',
        defaultLanguage: 'zh-CN',
        allowedOrigins: ['*'],
        enableDnsRebindingProtection: true,
      }

      expect(() => validateConfig(config)).toThrow(
        `HTTP port must be between ${MCP_CONFIG.server.minPort} and ${MCP_CONFIG.server.maxPort}`
      )
    })

    it('should throw for port above maximum', () => {
      const config: MCPServerConfig = {
        httpPort: 100000,
        logLevel: 'info',
        defaultLanguage: 'zh-CN',
        allowedOrigins: ['*'],
        enableDnsRebindingProtection: true,
      }

      expect(() => validateConfig(config)).toThrow(
        `HTTP port must be between ${MCP_CONFIG.server.minPort} and ${MCP_CONFIG.server.maxPort}`
      )
    })

    it('should throw for invalid log level', () => {
      const config: MCPServerConfig = {
        httpPort: 3000,
        logLevel: 'invalid' as any,
        defaultLanguage: 'zh-CN',
        allowedOrigins: ['*'],
        enableDnsRebindingProtection: true,
      }

      expect(() => validateConfig(config)).toThrow(
        `Log level must be one of: ${MCP_CONFIG.logging.validLevels.join(', ')}`
      )
    })

    it('should throw for empty log level', () => {
      const config: MCPServerConfig = {
        httpPort: 3000,
        logLevel: '' as any,
        defaultLanguage: 'zh-CN',
        allowedOrigins: ['*'],
        enableDnsRebindingProtection: true,
      }

      expect(() => validateConfig(config)).toThrow(
        `Log level must be one of: ${MCP_CONFIG.logging.validLevels.join(', ')}`
      )
    })

    it('should accept port at minimum boundary', () => {
      const config: MCPServerConfig = {
        httpPort: MCP_CONFIG.server.minPort,
        logLevel: 'info',
        defaultLanguage: 'zh-CN',
        allowedOrigins: ['*'],
        enableDnsRebindingProtection: true,
      }

      expect(() => validateConfig(config)).not.toThrow()
    })

    it('should accept port at maximum boundary', () => {
      const config: MCPServerConfig = {
        httpPort: MCP_CONFIG.server.maxPort,
        logLevel: 'info',
        defaultLanguage: 'zh-CN',
        allowedOrigins: ['*'],
        enableDnsRebindingProtection: true,
      }

      expect(() => validateConfig(config)).not.toThrow()
    })
  })
})
