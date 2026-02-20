/**
 * CoreServicesManager Integration Tests
 *
 * Tests the integration between MCP server and core package services
 * Note: These tests focus on type safety and API contracts without requiring
 * actual API keys for initialization.
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { CoreServicesManager } from '../src/adapters/core-services.js'

describe('CoreServicesManager Integration', () => {
  let coreServices: CoreServicesManager

  beforeAll(() => {
    coreServices = CoreServicesManager.getInstance()
  })

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = CoreServicesManager.getInstance()
      const instance2 = CoreServicesManager.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('Uninitialized State', () => {
    it('should report not initialized before initialize() is called', () => {
      expect(coreServices.isInitialized()).toBe(false)
    })

    it('should throw error when getting PromptService before initialization', () => {
      expect(() => coreServices.getPromptService()).toThrow(
        'CoreServicesManager not initialized or PromptService not available'
      )
    })

    it('should throw error when getting ModelManager before initialization', () => {
      expect(() => coreServices.getModelManager()).toThrow(
        'CoreServicesManager not initialized or ModelManager not available'
      )
    })

    it('should throw error when getting TemplateManager before initialization', () => {
      expect(() => coreServices.getTemplateManager()).toThrow(
        'CoreServicesManager not initialized or TemplateManager not available'
      )
    })

    it('should return health status showing not initialized', async () => {
      const healthStatus = await coreServices.getHealthStatus()
      expect(healthStatus.initialized).toBe(false)
      expect(healthStatus.services.modelManager).toBe(false)
      expect(healthStatus.services.llmService).toBe(false)
      expect(healthStatus.services.languageService).toBe(false)
      expect(healthStatus.services.templateManager).toBe(false)
      expect(healthStatus.services.historyManager).toBe(false)
      expect(healthStatus.services.promptService).toBe(false)
    })
  })

  describe('Type Safety', () => {
    it('should have correct method signatures', () => {
      expect(typeof coreServices.initialize).toBe('function')
      expect(typeof coreServices.getPromptService).toBe('function')
      expect(typeof coreServices.getModelManager).toBe('function')
      expect(typeof coreServices.getTemplateManager).toBe('function')
      expect(typeof coreServices.isInitialized).toBe('function')
      expect(typeof coreServices.getHealthStatus).toBe('function')
    })
  })
})
