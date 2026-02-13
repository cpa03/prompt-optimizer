/**
 * 静态常量定义
 * 这个文件只包含纯静态常量，没有任何动态逻辑或副作用
 * 可以安全地在 Electron preload 脚本的沙箱环境中加载
 */

// IPC事件名称常量
const IPC_EVENTS = {
  UPDATE_CHECK: 'updater-check-update',
  UPDATE_CHECK_ALL_VERSIONS: 'updater-check-all-versions',
  UPDATE_START_DOWNLOAD: 'updater-start-download',
  UPDATE_INSTALL: 'updater-install-update',
  UPDATE_IGNORE_VERSION: 'updater-ignore-version',
  UPDATE_UNIGNORE_VERSION: 'updater-unignore-version',
  UPDATE_GET_IGNORED_VERSIONS: 'updater-get-ignored-versions',
  UPDATE_DOWNLOAD_SPECIFIC_VERSION: 'updater-download-specific-version',
  UPDATE_DOWNLOAD_STARTED: 'updater-download-started',

  // 主进程发送给渲染进程的事件
  UPDATE_AVAILABLE_INFO: 'update-available-info',
  UPDATE_NOT_AVAILABLE: 'update-not-available',
  UPDATE_DOWNLOAD_PROGRESS: 'update-download-progress',
  UPDATE_DOWNLOADED: 'update-downloaded',
  UPDATE_ERROR: 'update-error'
};

// 偏好设置键名常量
const PREFERENCE_KEYS = {
  IGNORED_VERSIONS: 'updater.ignoredVersions' // 多版本忽略存储
};

// 默认配置
const DEFAULT_CONFIG = {
  autoDownload: false,
  checkInterval: 24 * 60 * 60 * 1000, // 24小时
  timeout: 30000 // 30秒
};

// 端口配置 (与packages/core/src/config/ports.ts保持一致)
// 从环境变量读取，提供默认值
const WEB_DEV_PORT = parseInt(process.env.VITE_WEB_PORT, 10) || 18181;

const PORTS = {
  web: {
    dev: WEB_DEV_PORT,
  }
};

// 超时配置 (与packages/core/src/config/timeouts.ts保持一致)
const TIMEOUTS = {
  // 默认超时
  default: 30000,
  short: 5000,
  medium: 10000,
  long: 60000,

  // 服务特定超时
  service: {
    saveOperation: 5000,
    emergencyExit: 10000,
  }
};

// 最大保存时间和应急退出时间
const MAX_SAVE_TIME = TIMEOUTS.service.saveOperation;
const EMERGENCY_EXIT_TIME = TIMEOUTS.service.emergencyExit;

module.exports = {
  IPC_EVENTS,
  PREFERENCE_KEYS,
  DEFAULT_CONFIG,
  PORTS,
  TIMEOUTS,
  MAX_SAVE_TIME,
  EMERGENCY_EXIT_TIME
};
