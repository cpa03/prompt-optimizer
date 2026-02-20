/**
 * Unit tests for debug utility functions
 *
 * Tests cover:
 * - createDebugLogger factory function
 * - Debug namespace management
 * - Global debug toggle
 * - Environment-based debug detection
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  createDebugLogger,
  enableDebugNamespace,
  disableDebugNamespace,
  enableGlobalDebug,
  disableGlobalDebug,
  isDebugLoggingEnabled,
} from '../../../src/utils/debug'

describe('debug utilities', () => {
  let consoleSpy: {
    debug: ReturnType<typeof vi.spyOn>
    log: ReturnType<typeof vi.spyOn>
    warn: ReturnType<typeof vi.spyOn>
    error: ReturnType<typeof vi.spyOn>
  }

  beforeEach(() => {
    consoleSpy = {
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    }
    disableGlobalDebug()
  })

  afterEach(() => {
    consoleSpy.debug.mockRestore()
    consoleSpy.log.mockRestore()
    consoleSpy.warn.mockRestore()
    consoleSpy.error.mockRestore()
  })

  describe('createDebugLogger', () => {
    it('should create a logger with all log methods', () => {
      enableGlobalDebug()
      const logger = createDebugLogger('test')

      expect(logger.debug).toBeInstanceOf(Function)
      expect(logger.log).toBeInstanceOf(Function)
      expect(logger.warn).toBeInstanceOf(Function)
      expect(logger.error).toBeInstanceOf(Function)
      expect(typeof logger.enabled).toBe('boolean')
    })

    it('should log with namespace prefix when enabled', () => {
      enableGlobalDebug()
      const logger = createDebugLogger('test-namespace')

      logger.log('test message')

      expect(consoleSpy.log).toHaveBeenCalledWith('[test-namespace]', 'test message')
    })

    it('should not log when debug is disabled', () => {
      disableGlobalDebug()
      const logger = createDebugLogger('test-namespace')

      logger.log('test message')

      expect(consoleSpy.log).not.toHaveBeenCalled()
    })

    it('should use correct console methods for each log level', () => {
      enableGlobalDebug()
      const logger = createDebugLogger('test')

      logger.debug('debug message')
      logger.log('log message')
      logger.warn('warn message')
      logger.error('error message')

      expect(consoleSpy.debug).toHaveBeenCalledWith('[test]', 'debug message')
      expect(consoleSpy.log).toHaveBeenCalledWith('[test]', 'log message')
      expect(consoleSpy.warn).toHaveBeenCalledWith('[test]', 'warn message')
      expect(consoleSpy.error).toHaveBeenCalledWith('[test]', 'error message')
    })

    it('should handle multiple arguments', () => {
      enableGlobalDebug()
      const logger = createDebugLogger('test')

      logger.log('message', { key: 'value' }, 123)

      expect(consoleSpy.log).toHaveBeenCalledWith('[test]', 'message', { key: 'value' }, 123)
    })

    it('should report enabled status correctly', () => {
      disableGlobalDebug()
      const logger = createDebugLogger('test')

      expect(logger.enabled).toBe(false)

      enableGlobalDebug()

      expect(logger.enabled).toBe(true)
    })
  })

  describe('enableDebugNamespace / disableDebugNamespace', () => {
    it('should enable logging for specific namespace when global debug is on', () => {
      enableGlobalDebug()
      enableDebugNamespace('specific-namespace')

      const logger = createDebugLogger('specific-namespace')
      logger.log('test')

      expect(consoleSpy.log).toHaveBeenCalledWith('[specific-namespace]', 'test')
    })

    it('should not affect other namespaces when enabling specific one', () => {
      enableGlobalDebug()
      enableDebugNamespace('enabled-namespace')

      const enabledLogger = createDebugLogger('enabled-namespace')
      const disabledLogger = createDebugLogger('disabled-namespace')

      enabledLogger.log('test1')
      disabledLogger.log('test2')

      expect(consoleSpy.log).toHaveBeenCalledTimes(2)
      expect(consoleSpy.log).toHaveBeenCalledWith('[enabled-namespace]', 'test1')
      expect(consoleSpy.log).toHaveBeenCalledWith('[disabled-namespace]', 'test2')
    })

    it('should disable previously enabled namespace', () => {
      enableDebugNamespace('to-disable')
      disableDebugNamespace('to-disable')

      const logger = createDebugLogger('to-disable')
      logger.log('test')

      expect(consoleSpy.log).not.toHaveBeenCalled()
    })

    it('should support wildcard namespace', () => {
      enableGlobalDebug()
      enableDebugNamespace('*')

      const logger1 = createDebugLogger('any-namespace')
      const logger2 = createDebugLogger('another-namespace')

      logger1.log('test1')
      logger2.log('test2')

      expect(consoleSpy.log).toHaveBeenCalledTimes(2)
    })
  })

  describe('enableGlobalDebug / disableGlobalDebug', () => {
    it('should enable all logging globally', () => {
      disableGlobalDebug()
      enableGlobalDebug()

      const logger = createDebugLogger('global-test')
      logger.log('test')

      expect(consoleSpy.log).toHaveBeenCalledWith('[global-test]', 'test')
    })

    it('should disable all logging globally', () => {
      enableGlobalDebug()
      disableGlobalDebug()

      const logger = createDebugLogger('global-test')
      logger.log('test')

      expect(consoleSpy.log).not.toHaveBeenCalled()
    })
  })

  describe('isDebugLoggingEnabled', () => {
    it('should return true when global debug is enabled', () => {
      enableGlobalDebug()
      expect(isDebugLoggingEnabled()).toBe(true)
    })

    it('should return false when global debug is disabled', () => {
      disableGlobalDebug()
      expect(isDebugLoggingEnabled()).toBe(false)
    })
  })
})
