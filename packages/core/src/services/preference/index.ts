/**
 * 偏好设置服务模块导出
 */

// 导出类型
export type { IPreferenceService } from './types'

// 导出服务类和工厂函数
export { PreferenceService, createPreferenceService } from './service'

// 导出Electron代理
export { ElectronPreferenceServiceProxy } from './electron-proxy'
