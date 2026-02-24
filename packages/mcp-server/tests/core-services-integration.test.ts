/**
 * CoreServicesManager Integration Tests
 *
 * Tests the integration between MCP server and core package services
 * Note: These tests focus on type safety and API contracts without requiring
 * actual API keys for initialization.
 */

import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { CoreServicesManager } from '../src/adapters/core-services.js'

describe('CoreServicesManager Integration', () => {
  let coreServices: CoreServicesManager

  beforeAll(() => {
    coreServices = CoreServicesManager.getInstance()
  })

  afterEach(() => {
    coreServices.reset()
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
      expect(typeof coreServices.reset).toBe('function')
    })
  })

  describe('Reset Functionality', () => {
    it('should reset initialized state to false', () => {
      coreServices.reset()
      expect(coreServices.isInitialized()).toBe(false)
    })

    it('should reset all services to null', async () => {
      coreServices.reset()
      const healthStatus = await coreServices.getHealthStatus()
      expect(healthStatus.initialized).toBe(false)
      expect(healthStatus.services.modelManager).toBe(false)
      expect(healthStatus.services.llmService).toBe(false)
      expect(healthStatus.services.languageService).toBe(false)
      expect(healthStatus.services.templateManager).toBe(false)
      expect(healthStatus.services.historyManager).toBe(false)
      expect(healthStatus.services.promptService).toBe(false)
    })

    it('should allow re-initialization after reset', () => {
      coreServices.reset()
      expect(coreServices.isInitialized()).toBe(false)
      const sameInstance = CoreServicesManager.getInstance()
      expect(sameInstance).toBe(coreServices)
      expect(sameInstance.isInitialized()).toBe(false)
    })

    it('should throw errors when accessing services after reset', () => {
      coreServices.reset()
      expect(() => coreServices.getPromptService()).toThrow(
        'CoreServicesManager not initialized or PromptService not available'
      )
      expect(() => coreServices.getModelManager()).toThrow(
        'CoreServicesManager not initialized or ModelManager not available'
      )
      expect(() => coreServices.getTemplateManager()).toThrow(
        'CoreServicesManager not initialized or TemplateManager not available'
      )
    })
  })
})
  })

  describe('Reset Functionality', () => {
    it('should reset initialized state to false', () => {
      coreServices.reset()
      expect(coreServices.isInitialized()).toBe(false)
    })

    it('should reset all services to null', async () => {
      coreServices.reset()
      const healthStatus = await coreServices.getHealthStatus()
      expect(healthStatus.initialized).toBe(false)
      expect(healthStatus.services.modelManager).toBe(false)
      expect(healthStatus.services.llmService).toBe(false)
      expect(healthStatus.services.languageService).toBe(false)
      expect(healthStatus.services.templateManager).toBe(false)
      expect(healthStatus.services.historyManager).toBe(false)
      expect(healthStatus.services.promptService).toBe(false)
    })

    it('should allow re-initialization after reset', () => {
      coreServices.reset()
      expect(coreServices.isInitialized()).toBe(false)
      const sameInstance = CoreServicesManager.getInstance()
      expect(sameInstance).toBe(coreServices)
      expect(sameInstance.isInitialized()).toBe(false)
    })

    it('should throw errors when accessing services after reset', () => {
      coreServices.reset()
      expect(() => coreServices.getPromptService()).toThrow(
        'CoreServicesManager not initialized or PromptService not available'
      )
      expect(() => coreServices.getModelManager()).toThrow(
        'CoreServicesManager not initialized or ModelManager not available'
      )
      expect(() => coreServices.getTemplateManager()).toThrow(
        'CoreServicesManager not initialized or TemplateManager not available'
      )
=======
>>>>>>> origin/develop
    })
  })
})
