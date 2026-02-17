import { describe, it, expect } from 'vitest'

import { i18n } from '../../../src/plugins/i18n'
import { getI18nErrorMessage, getErrorMessage, AppError } from '../../../src/utils/error'

function setLocale(locale: 'zh-CN' | 'zh-TW' | 'en-US') {
  i18n.global.locale.value = locale
}

describe('getI18nErrorMessage', () => {
  it('同一 code+params 在不同语言下返回不同文本（并包含 details 插值）', () => {
    const error = {
      code: 'error.prompt.optimization',
      params: { details: 'DETAILS_X' },
    }

    setLocale('zh-CN')
    const zh = getI18nErrorMessage(error)

    setLocale('en-US')
    const en = getI18nErrorMessage(error)

    expect(zh).toContain('DETAILS_X')
    expect(en).toContain('DETAILS_X')

    // 确保 i18n 真的生效（语言不同 -> 文本不同）
    expect(zh).not.toBe(en)

    // 不应把 debug 前缀暴露给用户
    expect(zh).not.toContain('[error.')
    expect(en).not.toContain('[error.')
  })

  it('context 插值在不同语言下返回不同文本', () => {
    const error = {
      code: 'error.history.not_found',
      params: { context: 'HISTORY_ID_1' },
    }

    setLocale('zh-TW')
    const zhtw = getI18nErrorMessage(error)

    setLocale('en-US')
    const en = getI18nErrorMessage(error)

    expect(zhtw).toContain('HISTORY_ID_1')
    expect(en).toContain('HISTORY_ID_1')
    expect(zhtw).not.toBe(en)
  })

  it('当 code 不存在或 key 不存在时回退到 error.message', () => {
    const fallbackError = Object.assign(new Error('RAW_MESSAGE'), {
      code: 'error.nonexistent.key',
      params: { details: 'SHOULD_NOT_APPEAR' },
    })

    setLocale('zh-CN')
    const msg = getI18nErrorMessage(fallbackError)
    expect(msg).toBe('RAW_MESSAGE')
  })
})

describe('getErrorMessage', () => {
  it('应该从 Error 实例中提取消息', () => {
    const error = new Error('Test error message')
    expect(getErrorMessage(error)).toBe('Test error message')
  })

  it('应该处理字符串错误', () => {
    expect(getErrorMessage('String error')).toBe('String error')
  })

  it('应该对 null 使用回退值', () => {
    expect(getErrorMessage(null, 'Fallback')).toBe('Fallback')
  })

  it('应该对 undefined 使用回退值', () => {
    expect(getErrorMessage(undefined, 'Fallback')).toBe('Fallback')
  })

  it('应该从对象中提取 message 属性', () => {
    const error = { message: 'Object error message', code: 'ERR_001' }
    expect(getErrorMessage(error)).toBe('Object error message')
  })

  it('应该处理没有 message 属性的对象', () => {
    const error = { code: 'ERR_001' }
    expect(getErrorMessage(error)).toContain('[object Object]')
  })

  it('应该处理数字错误', () => {
    expect(getErrorMessage(404)).toBe('404')
  })

  it('应该使用默认回退值', () => {
    expect(getErrorMessage(null)).toBe('Unknown error')
  })

  it('应该处理带空格的 message', () => {
    const error = { message: '  spaced message  ' }
    expect(getErrorMessage(error)).toBe('  spaced message  ')
  })

  it('应该处理空字符串 message（回退到对象字符串表示）', () => {
    const error = { message: '' }
    expect(getErrorMessage(error, 'Fallback')).toBe('[object Object]')
  })

  it('应该处理带有详细信息的错误', () => {
    const error = new Error('Basic message')
    expect(getErrorMessage(error)).toBe('Basic message')
  })
})

describe('AppError', () => {
  it('应该创建带有消息的 AppError', () => {
    const error = new AppError('Test message')
    expect(error.message).toBe('Test message')
    expect(error.name).toBe('AppError')
  })

  it('应该创建带有代码的 AppError', () => {
    const error = new AppError('Test message', 'ERROR_CODE')
    expect(error.code).toBe('ERROR_CODE')
  })

  it('应该使用默认代码 UNKNOWN_ERROR', () => {
    const error = new AppError('Test message')
    expect(error.code).toBe('UNKNOWN_ERROR')
  })

  it('应该创建带有详细信息的 AppError', () => {
    const details = { foo: 'bar', count: 42 }
    const error = new AppError('Test message', 'ERROR_CODE', details)
    expect(error.details).toEqual(details)
  })

  it('应该正确继承 Error', () => {
    const error = new AppError('Test message')
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(AppError)
  })

  it('应该捕获堆栈跟踪', () => {
    const error = new AppError('Test message')
    expect(error.stack).toBeDefined()
    expect(error.stack).toContain('AppError')
  })
})
