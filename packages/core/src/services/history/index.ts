/**
 * 历史记录服务模块导出
 */

// 导出类型
export * from './types'

// 导出错误类
export * from './errors'

// 导出管理器
export { HistoryManager, createHistoryManager } from './manager'

// 导出Electron代理
export { ElectronHistoryManagerProxy } from './electron-proxy'
