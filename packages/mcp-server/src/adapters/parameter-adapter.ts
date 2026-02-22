/**
 * 参数验证工具
 * 简化的参数验证，移除过度抽象
 */

import { CONSTRAINTS } from '@prompt-optimizer/core'

type StringValidationOptions = {
  fieldName: string
  value: unknown
  required: boolean
  maxLength: number
  allowWhitespace?: boolean
}

function validateString(options: StringValidationOptions): void {
  const { fieldName, value, required, maxLength, allowWhitespace = false } = options

  if (value === null || value === undefined) {
    if (required) {
      throw new Error(`${fieldName}参数不能为空`)
    }
    return
  }

  if (typeof value !== 'string') {
    throw new Error(`${fieldName}必须是字符串类型，当前类型: ${typeof value}`)
  }

  if (!allowWhitespace && value.trim().length === 0) {
    throw new Error(`${fieldName}不能为空字符串或纯空白字符`)
  }

  if (value.length > maxLength) {
    throw new Error(
      `${fieldName}过长: ${value.length.toLocaleString()} 字符 (最大 ${maxLength.toLocaleString()} 字符)`
    )
  }
}

export class ParameterValidator {
  /**
   * 验证提示词输入
   */
  static validatePrompt(prompt: unknown): void {
    validateString({
      fieldName: '提示词',
      value: prompt,
      required: true,
      maxLength: CONSTRAINTS.mcp.maxPromptLength,
    })
  }

  /**
   * 验证模板输入
   */
  static validateTemplate(template: unknown): void {
    validateString({
      fieldName: '模板',
      value: template,
      required: false,
      maxLength: CONSTRAINTS.mcp.maxTemplateLength,
    })
  }

  /**
   * 验证需求描述输入
   */
  static validateRequirements(requirements: unknown): void {
    validateString({
      fieldName: '需求描述',
      value: requirements,
      required: true,
      maxLength: CONSTRAINTS.mcp.maxRequirementsLength,
    })
  }
}
