import { describe, it, expect } from 'vitest'
import { escapeHtml, unescapeHtml } from '../../../src/utils/text'

describe('text utilities', () => {
  describe('escapeHtml', () => {
    it('should return empty string for empty input', () => {
      expect(escapeHtml('')).toBe('')
    })

    it('should return same string if no special characters', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World')
    })

    it('should escape ampersand', () => {
      expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry')
    })

    it('should escape less than sign', () => {
      expect(escapeHtml('a < b')).toBe('a &lt; b')
    })

    it('should escape greater than sign', () => {
      expect(escapeHtml('a > b')).toBe('a &gt; b')
    })

    it('should escape double quotes', () => {
      expect(escapeHtml('Say "Hello"')).toBe('Say &quot;Hello&quot;')
    })

    it('should escape single quotes', () => {
      expect(escapeHtml("It's a test")).toBe('It&#39;s a test')
    })

    it('should escape multiple special characters', () => {
      expect(escapeHtml('<script>alert("XSS")</script>')).toBe(
        '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
      )
    })

    it('should handle complex HTML-like content', () => {
      const input = '<div class="test">Hello & goodbye</div>'
      const expected = '&lt;div class=&quot;test&quot;&gt;Hello &amp; goodbye&lt;/div&gt;'
      expect(escapeHtml(input)).toBe(expected)
    })
  })

  describe('unescapeHtml', () => {
    it('should return empty string for empty input', () => {
      expect(unescapeHtml('')).toBe('')
    })

    it('should return same string if no entities', () => {
      expect(unescapeHtml('Hello World')).toBe('Hello World')
    })

    it('should unescape ampersand', () => {
      expect(unescapeHtml('Tom &amp; Jerry')).toBe('Tom & Jerry')
    })

    it('should unescape less than sign', () => {
      expect(unescapeHtml('a &lt; b')).toBe('a < b')
    })

    it('should unescape greater than sign', () => {
      expect(unescapeHtml('a &gt; b')).toBe('a > b')
    })

    it('should unescape double quotes', () => {
      expect(unescapeHtml('Say &quot;Hello&quot;')).toBe('Say "Hello"')
    })

    it('should unescape single quotes', () => {
      expect(unescapeHtml('It&#39;s a test')).toBe("It's a test")
    })

    it('should unescape multiple entities', () => {
      expect(unescapeHtml('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;')).toBe(
        '<script>alert("XSS")</script>'
      )
    })

    it('should be inverse of escapeHtml', () => {
      const original = '<div class="test">Hello & goodbye</div>'
      const escaped = escapeHtml(original)
      const unescaped = unescapeHtml(escaped)
      expect(unescaped).toBe(original)
    })
  })
})
