# Electron API 最佳实践指南

## 🎯 核心原则

**保持简单，直接调用，通过类型定义解决 IDE 警告**

## 📝 正确的实现方式

### 1. 完善类型定义

在 `packages/ui/src/types/electron.d.ts` 中定义完整的 API 类型：

```typescript
declare global {
  interface Window {
    electronAPI: {
      updater: {
        checkAllVersions(): Promise<{
          currentVersion: string
          stable?: {
            remoteVersion?: string
            hasUpdate?: boolean
            message?: string
            releaseDate?: string
            releaseNotes?: string
            remoteReleaseUrl?: string
          }
          prerelease?: {
            remoteVersion?: string
            hasUpdate?: boolean
            message?: string
            releaseDate?: string
            releaseNotes?: string
            remoteReleaseUrl?: string
          }
        }>
        installUpdate(): Promise<void>
        ignoreVersion(version: string, versionType?: 'stable' | 'prerelease'): Promise<void>
        downloadSpecificVersion(versionType: 'stable' | 'prerelease'): Promise<{
          hasUpdate: boolean
          message: string
          version?: string
          reason?: 'ignored' | 'latest' | 'error'
        }>
      }
      shell: {
        openExternal(url: string): Promise<void>
        showItemInFolder(path: string): Promise<void>
      }
      on: (event: string, callback: Function) => void
      off: (event: string, callback: Function) => void
    }
  }
}
```

### 2. 直接使用 API

在业务代码中直接调用，无需包装：

```typescript
// ✅ 正确的使用方式
export function useUpdater() {
  const checkBothVersions = async () => {
    try {
      // 直接调用，类型安全，无 IDE 警告
      const results = await window.electronAPI!.updater.checkAllVersions()

      // 直接使用返回的数据
      console.log('Current version:', results.currentVersion)
      if (results.stable?.hasUpdate) {
        console.log('Stable update available:', results.stable.remoteVersion)
      }

      return results
    } catch (error) {
      console.error('Version check failed:', error)
      throw error
    }
  }

  const installUpdate = async () => {
    try {
      await window.electronAPI!.updater.installUpdate()
      console.log('Update installation initiated')
    } catch (error) {
      console.error('Install failed:', error)
    }
  }

  const openReleaseUrl = async (url: string) => {
    try {
      await window.electronAPI!.shell.openExternal(url)
    } catch (error) {
      console.error('Failed to open URL:', error)
    }
  }

  return {
    checkBothVersions,
    installUpdate,
    openReleaseUrl,
  }
}
```

### 3. 事件监听

```typescript
// ✅ 正确的事件监听
const setupEventListeners = () => {
  if (!window.electronAPI?.on) return

  const updateAvailableListener = (info: any) => {
    console.log('Update available:', info)
  }

  window.electronAPI.on('update-available-info', updateAvailableListener)

  // 清理函数
  return () => {
    if (window.electronAPI?.off) {
      window.electronAPI.off('update-available-info', updateAvailableListener)
    }
  }
}
```

## ❌ 避免的反模式

### 1. 过度抽象

```typescript
// ❌ 错误：不必要的包装层
const useElectronAPI = () => {
  const safeCall = async (apiCall) => {
    try {
      const data = await apiCall()
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  return {
    updater: {
      checkAllVersions: () => safeCall(() => window.electronAPI.updater.checkAllVersions()),
    },
  }
}
```

### 2. 复杂的响应格式

```typescript
// ❌ 错误：引入不必要的包装格式
const response = await electronAPI.updater.checkAllVersions()
if (!response.success) {
  // 增加了复杂性
  throw new Error(response.error)
}
const data = response.data // 多余的解包
```

## 🔧 preload.js 最佳实践

保持 preload.js 的简洁性：

```javascript
// ✅ 正确：简单直接
const electronAPI = {
  updater: {
    checkAllVersions: async () => {
      const result = await ipcRenderer.invoke('update-check-all-versions')
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data // 直接返回数据
    },

    installUpdate: async () => {
      const result = await ipcRenderer.invoke('update-install')
      if (!result.success) {
        throw new Error(result.error)
      }
      // void 返回，无需返回数据
    },
  },

  shell: {
    openExternal: async (url) => {
      const result = await ipcRenderer.invoke('shell-open-external', url)
      if (!result.success) {
        throw new Error(result.error)
      }
      // void 返回
    },
  },

  on: (event, callback) => ipcRenderer.on(event, callback),
  off: (event, callback) => ipcRenderer.off(event, callback),
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
```

## 🎯 关键要点

1. **类型安全通过类型定义实现**，而非运行时包装
2. **保持 API 调用的直接性**，减少抽象层
3. **错误处理在业务层进行**，而非在 API 层包装
4. **preload.js 只负责暴露 API**，不做复杂逻辑
5. **优先解决核心问题**，避免过度工程化

## 🚀 优势

- **性能更好**：无额外的函数调用开销
- **调试简单**：问题直接定位到源头
- **代码清晰**：意图明确，易于理解
- **维护简单**：减少抽象层的维护负担
- **类型安全**：完整的 TypeScript 支持

---

**记住**: 最好的抽象就是没有抽象。只在真正需要时才引入复杂性。
