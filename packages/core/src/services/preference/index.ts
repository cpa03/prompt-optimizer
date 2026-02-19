/**
 * 偏好设置服务模块导出
 */

// 导出类型
export * from './types'

// 导出服务类
export { PreferenceService, createPreferenceService } from './service'

// 导出Electron代理
export { ElectronPreferenceServiceProxy } from './electron-proxy'
