/**
 * 模板服务模块导出
 */

// 导出类型
export * from './types'

// 导出错误类
export * from './errors'

// 导出管理器
export { TemplateManager, createTemplateManager } from './manager'

// 导出处理器
export { TemplateProcessor } from './processor'

// 导出语言服务
export { TemplateLanguageService, createTemplateLanguageService } from './languageService'
export type { BuiltinTemplateLanguage, ITemplateLanguageService } from './languageService'

// 导出静态加载器
export { StaticLoader } from './static-loader'

// 导出默认模板
export { ALL_TEMPLATES } from './default-templates'

// 导出Electron代理
export { ElectronTemplateManagerProxy } from './electron-proxy'
export { ElectronTemplateLanguageServiceProxy } from './electron-language-proxy'

// 导出最小化版本
export * from './minimal'
