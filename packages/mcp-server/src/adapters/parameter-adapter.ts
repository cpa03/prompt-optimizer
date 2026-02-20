/**
 * 参数验证工具
 * 简化的参数验证，移除过度抽象
 */

import { CONSTRAINTS } from '@prompt-optimizer/core'

export class ParameterValidator {
  /**
   * 验证提示词输入
   */
  static validatePrompt(prompt: string): void {
    if (prompt === null || prompt === undefined) {
      throw new Error('提示词参数不能为空')
    }
    if (typeof prompt !== 'string') {
      throw new Error(`提示词必须是字符串类型，当前类型: ${typeof prompt}`)
    }
    if (prompt.trim().length === 0) {
      throw new Error('提示词不能为空字符串或纯空白字符')
    }
    if (prompt.length > CONSTRAINTS.mcp.maxPromptLength) {
      throw new Error(
        `提示词过长: ${prompt.length.toLocaleString()} 字符 (最大 ${CONSTRAINTS.mcp.maxPromptLength.toLocaleString()} 字符)`
      )
    }
  }

  /**
   * 验证模板输入
   */
  static validateTemplate(template?: string): void {
    if (template === undefined) {
      return
    }
    if (typeof template !== 'string') {
      throw new Error(`模板必须是字符串类型，当前类型: ${typeof template}`)
    }
    if (template.trim().length === 0) {
      throw new Error('模板不能为空字符串或纯空白字符')
    }
  }

  /**
   * 验证需求描述输入
   */
  static validateRequirements(requirements: string): void {
    if (requirements === null || requirements === undefined) {
      throw new Error('需求描述参数不能为空')
    }
    if (typeof requirements !== 'string') {
      throw new Error(`需求描述必须是字符串类型，当前类型: ${typeof requirements}`)
    }
    if (requirements.trim().length === 0) {
      throw new Error('需求描述不能为空字符串或纯空白字符')
    }
    if (requirements.length > CONSTRAINTS.mcp.maxRequirementsLength) {
      throw new Error(
        `需求描述过长: ${requirements.length.toLocaleString()} 字符 (最大 ${CONSTRAINTS.mcp.maxRequirementsLength.toLocaleString()} 字符)`
      )
    }
  }
}
