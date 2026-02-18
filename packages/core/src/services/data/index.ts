/**
 * 数据管理服务模块导出
 */

// 导出类型
export type { ExportData, IDataManager } from './types'

// 导出错误类
export * from './errors'

// 导出管理器
export { DataManager, createDataManager } from './manager'

// 导出Electron代理
export { ElectronDataManagerProxy } from './electron-proxy'
