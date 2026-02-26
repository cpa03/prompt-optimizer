/**
 * Language Service Tests
 *
 * Tests for the MCP server language service adapter
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { SimpleLanguageService, createSimpleLanguageService } from '../src/adapters/language-service.js'
import { BuiltinTemplateLanguage } from '@prompt-optimizer/core'

describe('SimpleLanguageService', () => {
  let languageService: SimpleLanguageService

  beforeEach(() => {
    languageService = new SimpleLanguageService()
  })

  describe('constructor', () => {
    it('should default to zh-CN', async () => {
      const service = new SimpleLanguageService()
      await expect(service.getCurrentLanguage()).resolves.toBe('zh-CN')
    })

    it('should accept zh language code', async () => {
      const service = new SimpleLanguageService('zh')
      await expect(service.getCurrentLanguage()).resolves.toBe('zh-CN')
    })

    it('should accept zh-CN language code', async () => {
      const service = new SimpleLanguageService('zh-CN')
      await expect(service.getCurrentLanguage()).resolves.toBe('zh-CN')
    })

    it('should accept chinese as language name', async () => {
      const service = new SimpleLanguageService('chinese')
      await expect(service.getCurrentLanguage()).resolves.toBe('zh-CN')
    })

    it('should accept en language code', async () => {
      const service = new SimpleLanguageService('en')
      await expect(service.getCurrentLanguage()).resolves.toBe('en-US')
    })

    it('should accept en-US language code', async () => {
      const service = new SimpleLanguageService('en-US')
      await expect(service.getCurrentLanguage()).resolves.toBe('en-US')
    })

    it('should accept english as language name', async () => {
      const service = new SimpleLanguageService('english')
      await expect(service.getCurrentLanguage()).resolves.toBe('en-US')
    })

    it('should fallback to zh-CN for unknown language', async () => {
      const service = new SimpleLanguageService('unknown-language')
      await expect(service.getCurrentLanguage()).resolves.toBe('zh-CN')
    })
  })

  describe('initialize', () => {
    it('should set initialized flag', async () => {
      expect(languageService.isInitialized()).toBe(false)
      await languageService.initialize()
      expect(languageService.isInitialized()).toBe(true)
    })
  })

  describe('getCurrentLanguage', () => {
    it('should return current language', async () => {
      const lang = await languageService.getCurrentLanguage()
      expect(lang).toBe('zh-CN')
    })
  })

  describe('setLanguage', () => {
    it('should set valid language', async () => {
      await languageService.setLanguage('en-US')
      const lang = await languageService.getCurrentLanguage()
      expect(lang).toBe('en-US')
    })

    it('should throw for invalid language', async () => {
      await expect(languageService.setLanguage('invalid' as BuiltinTemplateLanguage)).rejects.toThrow(
        'Unsupported language: invalid'
      )
    })
  })

  describe('toggleLanguage', () => {
    it('should toggle from zh-CN to en-US', async () => {
      const newLang = await languageService.toggleLanguage()
      expect(newLang).toBe('en-US')
      expect(await languageService.getCurrentLanguage()).toBe('en-US')
    })

    it('should toggle back from en-US to zh-CN', async () => {
      await languageService.setLanguage('en-US')
      const newLang = await languageService.toggleLanguage()
      expect(newLang).toBe('zh-CN')
      expect(await languageService.getCurrentLanguage()).toBe('zh-CN')
    })
  })

  describe('isValidLanguage', () => {
    it('should return true for zh-CN', async () => {
      const isValid = await languageService.isValidLanguage('zh-CN')
      expect(isValid).toBe(true)
    })

    it('should return true for en-US', async () => {
      const isValid = await languageService.isValidLanguage('en-US')
      expect(isValid).toBe(true)
    })

    it('should return false for invalid language', async () => {
      const isValid = await languageService.isValidLanguage('fr-FR')
      expect(isValid).toBe(false)
    })
  })

  describe('getSupportedLanguages', () => {
    it('should return supported languages', async () => {
      const languages = await languageService.getSupportedLanguages()
      expect(languages).toEqual(['zh-CN', 'en-US'])
    })
  })

  describe('getLanguageDisplayName', () => {
    it('should return Chinese display name for zh-CN', () => {
      const displayName = languageService.getLanguageDisplayName('zh-CN')
      expect(displayName).toBe('中文')
    })

    it('should return English display name for en-US', () => {
      const displayName = languageService.getLanguageDisplayName('en-US')
      expect(displayName).toBe('English')
    })

    it('should return language code for unknown language', () => {
      const displayName = languageService.getLanguageDisplayName('fr-FR')
      expect(displayName).toBe('fr-FR')
    })
  })

  describe('isInitialized', () => {
    it('should return false before initialization', () => {
      expect(languageService.isInitialized()).toBe(false)
    })

    it('should return true after initialization', async () => {
      await languageService.initialize()
      expect(languageService.isInitialized()).toBe(true)
    })
  })
})

describe('createSimpleLanguageService', () => {
  it('should create service with default language', async () => {
    const service = createSimpleLanguageService()
    await expect(service.getCurrentLanguage()).resolves.toBe('zh-CN')
  })

  it('should create service with custom language', async () => {
    const service = createSimpleLanguageService('en-US')
    await expect(service.getCurrentLanguage()).resolves.toBe('en-US')
  })

  it('should use default when no language provided', async () => {
    const service = createSimpleLanguageService()
    await expect(service.getCurrentLanguage()).resolves.toBe('zh-CN')
  })
})
