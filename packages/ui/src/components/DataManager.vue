<template>
  <NModal
    :show="show"
    preset="card"
    :style="{ width: '90vw', maxWidth: '500px' }"
    :title="$t('dataManager.title')"
    size="large"
    :bordered="false"
    :segmented="true"
    @update:show="(value: boolean) => !value && close()"
  >
    <NSpace vertical :size="24">
      <!-- Desktop Storage Info -->
      <div v-if="isRunningInElectron() && storageInfo">
        <NText tag="h3" :depth="1" strong style="font-size: 18px; margin-bottom: 12px;">
          {{ $t('dataManager.storage.title') }}
        </NText>
        <NCard size="small" :bordered="true">
          <NSpace vertical :size="12">
            <div>
              <NText depth="3" style="font-size: 12px">{{ $t('dataManager.storage.path') }}</NText>
              <div style="word-break: break-all; font-family: monospace; font-size: 12px; margin-top: 4px;">
                {{ storageInfo.userDataPath }}
              </div>
            </div>
            
            <NGrid :cols="3" :x-gap="12">
              <NGridItem>
                <NStatistic :label="$t('dataManager.storage.mainData')" :value="formatFileSize(storageInfo.mainSizeBytes)">
                </NStatistic>
              </NGridItem>
              <NGridItem>
                <NStatistic :label="$t('dataManager.storage.backup')" :value="formatFileSize(storageInfo.backupSizeBytes)">
                </NStatistic>
              </NGridItem>
              <NGridItem>
                <NStatistic :label="$t('dataManager.storage.total')" :value="formatFileSize(storageInfo.totalBytes)">
                </NStatistic>
              </NGridItem>
            </NGrid>

            <NSpace>
              <NButton size="small" @click="openStorageDir">
                {{ $t('dataManager.storage.openDir') }}
              </NButton>
              <NButton size="small" @click="refreshStorageInfo" :loading="isRefreshingStorage">
                {{ $t('dataManager.storage.refresh') }}
              </NButton>
            </NSpace>
          </NSpace>
        </NCard>
      </div>

      <!-- 导出功能 -->
      <div>
        <NText tag="h3" :depth="1" strong style="font-size: 18px; margin-bottom: 12px;">
          {{ $t('dataManager.export.title') }}
        </NText>
        <NText :depth="3" style="display: block; margin-bottom: 16px;">
          {{ $t('dataManager.export.description') }}
        </NText>
        <NButton
          @click="handleExport"
          :disabled="isExporting"
          type="primary"
          :loading="isExporting"
          block
        >
          <template #icon>
            <span>📥</span>
          </template>
          {{ isExporting ? $t('common.exporting') : $t('dataManager.export.button') }}
        </NButton>
      </div>

      <!-- 导入功能 -->
      <div>
        <NText tag="h3" :depth="1" strong style="font-size: 18px; margin-bottom: 12px;">
          {{ $t('dataManager.import.title') }}
        </NText>
        <NText :depth="3" style="display: block; margin-bottom: 16px;">
          {{ $t('dataManager.import.description') }}
        </NText>
        
        <!-- 文件选择区域 -->
        <!-- 🎨 Palette: Enhanced drag-and-drop with visual feedback -->
        <div
          class="upload-wrapper"
          :class="{
            'is-drag-over': isDragOver,
            'has-file': selectedFile
          }"
          @dragenter="handleDragEnter"
          @dragleave="handleDragLeave"
          @drop="handleDrop"
        >
          <NUpload
            :file-list="selectedFile ? [selectedFile] : []"
            accept=".json"
            :show-file-list="false"
            @change="handleFileChange"
            :custom-request="() => {}"
          >
            <NUploadDragger class="palette-upload-dragger">
              <div v-if="!selectedFile" class="upload-placeholder">
                <div class="upload-icon-wrapper" :class="{ 'is-bouncing': isDragOver }">
                  <NIcon size="48" :depth="3" class="upload-icon">
                    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </NIcon>
                  <span v-if="isDragOver" class="drop-hint" aria-live="polite">
                    {{ $t('dataManager.import.dropHint', '释放以上传文件') }}
                  </span>
                </div>
                <NText :depth="3" class="upload-text">
                  {{ isDragOver ? '' : $t('dataManager.import.selectFile') }}
                </NText>
                <NText v-if="!isDragOver" depth="3" class="upload-hint">
                  {{ $t('dataManager.import.dragHint', '或将文件拖放到此处') }}
                </NText>
              </div>

              <div v-else class="upload-file-selected">
                <div class="file-icon-wrapper">
                  <NIcon size="32" class="file-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <polyline points="14 2 14 8 20 8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M9 15l2 2 4-4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="check-path"/>
                    </svg>
                  </NIcon>
                </div>
                <NText strong class="file-name">
                  {{ selectedFile.name }}
                </NText>
                <NText depth="3" class="file-size">
                  {{ formatFileSize(selectedFile.file?.size ?? 0) }}
                </NText>
                <NSpace class="file-actions">
                  <NButton text size="small" @click.stop="clearSelectedFile" class="clear-file-btn">
                    <template #icon>
                      <span>✕</span>
                    </template>
                    {{ $t('common.clear') }}
                  </NButton>
                </NSpace>
              </div>
            </NUploadDragger>
          </NUpload>
        </div>

        <!-- 导入按钮 -->
        <NButton
          @click="handleImport"
          :disabled="!selectedFile || isImporting"
          type="success"
          :loading="isImporting"
          block
          style="margin-top: 16px;"
        >
          <template #icon>
            <span>📤</span>
          </template>
          {{ isImporting ? $t('common.importing') : $t('dataManager.import.button') }}
        </NButton>
      </div>

      <!-- 上下文导入导出功能 -->
      <div>
        <NText tag="h3" :depth="1" strong style="font-size: 18px; margin-bottom: 12px;">
          {{ $t('dataManager.contexts.title') }}
        </NText>
        <NText :depth="3" style="display: block; margin-bottom: 16px;">
          {{ $t('dataManager.contexts.description') }}
        </NText>
        
        <NSpace vertical :size="12">
          <!-- 上下文导出 -->
          <NButton
            @click="handleContextExportToFile"
            :disabled="isContextExporting"
            type="default"
            :loading="isContextExporting"
            block
          >
            <template #icon>
              <span>💾</span>
            </template>
            {{ isContextExporting ? $t('common.exporting') : $t('dataManager.contexts.exportFile') }}
          </NButton>
          
          <NButton
            @click="handleContextExportToClipboard"
            :disabled="isContextExporting"
            type="default"
            :loading="isContextExporting"
            block
          >
            <template #icon>
              <span>📋</span>
            </template>
            {{ isContextExporting ? $t('common.exporting') : $t('dataManager.contexts.exportClipboard') }}
          </NButton>
          
          <!-- 上下文导入 -->
          <!-- 文件导入 -->
          <NUpload
            class="context-upload"
            :file-list="[]"
            accept=".json"
            :show-file-list="false"
            @change="handleContextFileChange"
            :custom-request="() => {}"
            :disabled="isContextImporting"
            style="width: 100%;"
          >
            <NButton
              :disabled="isContextImporting"
              type="default"
              :loading="isContextImporting && isContextImportingFromFile"
              block
            >
              <template #icon>
                <span>📁</span>
              </template>
              {{ (isContextImporting && isContextImportingFromFile) ? $t('common.importing') : $t('dataManager.contexts.importFile') }}
            </NButton>
          </NUpload>
          
          <!-- 剪贴板导入 -->
          <NButton
            @click="handleContextImportFromClipboard"
            :disabled="isContextImporting"
            type="default"
            :loading="isContextImporting && !isContextImportingFromFile"
            block
          >
            <template #icon>
              <span>📝</span>
            </template>
            {{ (isContextImporting && !isContextImportingFromFile) ? $t('common.importing') : $t('dataManager.contexts.importClipboard') }}
          </NButton>
        </NSpace>
      </div>

      <!-- 警告信息 -->
      <NAlert type="warning" :show-icon="true">
        {{ $t('dataManager.warning') }}
      </NAlert>
    </NSpace>
  </NModal>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted, onUnmounted, type Ref } from 'vue'

import { useI18n } from 'vue-i18n'
import {
  NModal, NSpace, NText, NButton, NUpload, NUploadDragger,
  NIcon, NAlert, NCard, NStatistic, NGrid, NGridItem, type UploadFileInfo
} from 'naive-ui'
import { isRunningInElectron, type ContextBundle } from '@prompt-optimizer/core'
import { useToast } from '../composables/ui/useToast'
import type { AppServices } from '../types/services'

interface Props {
  show: boolean;
  // dataManager现在通过inject获取，不再需要props
}

interface Emits {
  (e: 'close'): void
  (e: 'imported'): void
  (e: 'update:show', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const toast = useToast()

// 统一使用inject获取services
const services = inject<Ref<AppServices | null>>('services')
if (!services) {
  throw new Error('[DataManager] services未正确注入，请确保在App组件中正确provide了services')
}

const getDataManager = computed(() => {
  const servicesValue = services.value
  if (!servicesValue) {
    throw new Error('[DataManager] services未初始化，请确保应用已正确启动')
  }

  const manager = servicesValue.dataManager
  if (!manager) {
    throw new Error('[DataManager] dataManager未初始化，请确保服务已正确配置')
  }

  return manager
})

const isExporting = ref(false)
const isImporting = ref(false)
const selectedFile = ref<UploadFileInfo | null>(null)

// 🎨 Palette: Drag-and-drop state for enhanced UX
const isDragOver = ref(false)
const dragCounter = ref(0)

// 🎨 Palette: Handle drag enter with counter to prevent flickering
const handleDragEnter = (event: DragEvent) => {
  event.preventDefault()
  dragCounter.value++
  if (dragCounter.value === 1) {
    isDragOver.value = true
  }
}

// 🎨 Palette: Handle drag leave with counter
const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  dragCounter.value--
  if (dragCounter.value <= 0) {
    dragCounter.value = 0
    isDragOver.value = false
  }
}

// 🎨 Palette: Handle drop with animation feedback
const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  dragCounter.value = 0
  isDragOver.value = false
  // The NUpload component will handle the actual file drop
}

const isContextBundle = (data: unknown): data is ContextBundle => {
  if (!data || typeof data !== 'object') return false
  const bundle = data as {
    type?: unknown
    version?: unknown
    currentId?: unknown
    contexts?: unknown
  }
  return (
    bundle.type === 'context-bundle' &&
    bundle.version === '1.0.0' &&
    typeof bundle.currentId === 'string' &&
    Array.isArray(bundle.contexts)
  )
}

// 上下文导入导出状态
const isContextExporting = ref(false)
const isContextImporting = ref(false)
const isContextImportingFromFile = ref(false) // 区分文件和剪贴板导入

// Storage Info State
const storageInfo = ref<{
  userDataPath: string
  mainSizeBytes: number
  backupSizeBytes: number
  totalBytes: number
} | null>(null)
const isRefreshingStorage = ref(false)

const refreshStorageInfo = async () => {
  if (!isRunningInElectron() || !window.electronAPI?.data) return
  try {
    isRefreshingStorage.value = true
    storageInfo.value = await window.electronAPI.data.getStorageInfo()
  } catch (error) {
    console.error('Failed to get storage info:', error)
    toast.error(t('dataManager.storage.refreshFailed'))
  } finally {
    isRefreshingStorage.value = false
  }
}

const openStorageDir = () => {
  if (!isRunningInElectron() || !window.electronAPI?.data) return
  window.electronAPI.data.openStorageDirectory()
}

// 处理文件变化
const handleFileChange = (options: { fileList: UploadFileInfo[] }) => {
  selectedFile.value = options.fileList[0] ?? null
}

// --- Close Logic ---
const close = () => {
  emit('update:show', false)
  emit('close')
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.show) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
  if (isRunningInElectron()) {
    refreshStorageInfo()
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})

// 处理导出
const handleExport = async () => {
  try {
    const dataManager = getDataManager.value
    if (!dataManager) {
      toast.error(t('toast.error.dataManagerNotAvailable'))
      return
    }

    isExporting.value = true
    
    const data = await dataManager.exportAllData()
    
    // 创建下载链接
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `prompt-optimizer-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast.success(t('dataManager.export.success'))
  } catch (error) {
    console.error('导出失败:', error)
    toast.error(t('dataManager.export.failed'))
  } finally {
    isExporting.value = false
  }
}

// 处理文件选择 - 已移除，使用 handleFileChange 代替

// 清除选中的文件
const clearSelectedFile = () => {
  selectedFile.value = null
}

// 处理导入
const handleImport = async () => {
  if (!selectedFile.value) return

  try {
    isImporting.value = true

    const file = selectedFile.value.file ?? null
    if (!file) {
      toast.error(t('dataManager.import.failed'))
      return
    }

    const content = await file.text()
    const dataManager = getDataManager.value
    if (!dataManager) {
      toast.error(t('toast.error.dataManagerNotAvailable'))
      return
    }
    await dataManager.importAllData(content)
    
    toast.success(t('dataManager.import.success'))
    emit('imported')
    emit('close')
    clearSelectedFile()
  } catch (error) {
    console.error('导入失败:', error)
    toast.error(t('dataManager.import.failed') + ': ' + (error as Error).message)
  } finally {
    isImporting.value = false
  }
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 处理上下文导出到文件
const handleContextExportToFile = async () => {
  try {
    const servicesValue = services.value
    if (!servicesValue) {
      toast.error('服务不可用，请稍后重试')
      return
    }

    const contextRepo = servicesValue.contextRepo
    if (!contextRepo) {
      toast.error('上下文服务不可用，请稍后重试')
      return
    }

    isContextExporting.value = true
    
    // 使用 exportAll 获取 ContextBundle 格式
    const contextBundle = await contextRepo.exportAll()
    const exportContent = JSON.stringify(contextBundle, null, 2)
    
    // 创建下载链接
    const blob = new Blob([exportContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `contexts-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast.success(`已导出 ${contextBundle.contexts.length} 个上下文集合到文件`)
  } catch (error) {
    console.error('上下文文件导出失败:', error)
    toast.error('上下文导出失败: ' + (error as Error).message)
  } finally {
    isContextExporting.value = false
  }
}

// 处理上下文导出到剪贴板
const handleContextExportToClipboard = async () => {
  try {
    const servicesValue = services.value
    if (!servicesValue) {
      toast.error('服务不可用，请稍后重试')
      return
    }

    const contextRepo = servicesValue.contextRepo
    if (!contextRepo) {
      toast.error('上下文服务不可用，请稍后重试')
      return
    }

    isContextExporting.value = true
    
    // 使用 exportAll 获取 ContextBundle 格式
    const contextBundle = await contextRepo.exportAll()
    const exportContent = JSON.stringify(contextBundle, null, 2)
    
    // 复制到剪贴板
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(exportContent)
    } else {
      // 降级方案
      const textarea = document.createElement('textarea')
      textarea.value = exportContent
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    
    toast.success(`已导出 ${contextBundle.contexts.length} 个上下文集合到剪贴板`)
  } catch (error) {
    console.error('上下文剪贴板导出失败:', error)
    toast.error('上下文导出失败: ' + (error as Error).message)
  } finally {
    isContextExporting.value = false
  }
}

// 处理上下文文件选择和导入
const handleContextFileChange = async (options: { fileList: UploadFileInfo[] }) => {
  if (options.fileList.length === 0 || !options.fileList[0].file) return

  const file = options.fileList[0].file
  if (!file) return
  await handleContextImportFromFile(file)
}

// 处理从文件导入上下文
const handleContextImportFromFile = async (file: File) => {
  try {
    const servicesValue = services.value
    if (!servicesValue) {
      toast.error('服务不可用，请稍后重试')
      return
    }

    const contextRepo = servicesValue.contextRepo
    if (!contextRepo) {
      toast.error('上下文服务不可用，请稍后重试')
      return
    }

    isContextImporting.value = true
    isContextImportingFromFile.value = true
    
    // 读取文件内容
    const content = await file.text()
    
    // 解析JSON数据
    let importData: unknown
    try {
      importData = JSON.parse(content)
    } catch (_parseError) {
      toast.error('无效的JSON格式，请检查文件内容')
      return
    }
    
    // 使用 importAll 并获取详细统计
    if (!isContextBundle(importData)) {
      toast.error(t('dataManager.context.invalidContextBundle'))
      return
    }

    const result = await contextRepo.importAll(importData, 'replace')
    
    // 显示详细的导入统计
    const stats = []
    if (result.imported > 0) stats.push(`导入 ${result.imported} 个上下文`)
    if (result.skipped > 0) stats.push(`跳过 ${result.skipped} 个`)
    if (result.predefinedVariablesRemoved > 0) stats.push(`剔除 ${result.predefinedVariablesRemoved} 个预定义变量覆盖`)
    
    const message = stats.length > 0 ? `成功：${stats.join('，')}` : '导入完成'
    toast.success(message)
    emit('imported') // 触发父组件的导入成功事件
  } catch (error) {
    console.error('上下文文件导入失败:', error)
    toast.error('上下文导入失败: ' + (error as Error).message)
  } finally {
    isContextImporting.value = false
    isContextImportingFromFile.value = false
  }
}

// 处理从剪贴板导入上下文（修正版本）
const handleContextImportFromClipboard = async () => {
  try {
    const servicesValue = services.value
    if (!servicesValue) {
      toast.error('服务不可用，请稍后重试')
      return
    }

    const contextRepo = servicesValue.contextRepo
    if (!contextRepo) {
      toast.error('上下文服务不可用，请稍后重试')
      return
    }

    isContextImporting.value = true
    isContextImportingFromFile.value = false
    
    // 从剪贴板读取内容
    let clipboardContent = ''
    if (navigator.clipboard) {
      clipboardContent = await navigator.clipboard.readText()
    } else {
      // 如果无法访问剪贴板，提示用户手动粘贴
      clipboardContent = prompt('请粘贴要导入的上下文数据:') || ''
    }
    
    if (!clipboardContent.trim()) {
      toast.warning('剪贴板内容为空，请先复制要导入的数据')
      return
    }
    
    // 解析JSON数据
    let importData: unknown
    try {
      importData = JSON.parse(clipboardContent)
    } catch (_parseError) {
      toast.error('无效的JSON格式，请检查数据格式')
      return
    }
    
    // 使用 importAll 并获取详细统计
    if (!isContextBundle(importData)) {
      toast.error(t('dataManager.context.invalidContextBundle'))
      return
    }

    const result = await contextRepo.importAll(importData, 'replace')
    
    // 显示详细的导入统计
    const stats = []
    if (result.imported > 0) stats.push(`导入 ${result.imported} 个上下文`)
    if (result.skipped > 0) stats.push(`跳过 ${result.skipped} 个`)
    if (result.predefinedVariablesRemoved > 0) stats.push(`剔除 ${result.predefinedVariablesRemoved} 个预定义变量覆盖`)
    
    const message = stats.length > 0 ? `成功：${stats.join('，')}` : '导入完成'
    toast.success(message)
    emit('imported') // 触发父组件的导入成功事件
  } catch (error) {
    console.error('上下文剪贴板导入失败:', error)
    toast.error('上下文导入失败: ' + (error as Error).message)
  } finally {
    isContextImporting.value = false
    isContextImportingFromFile.value = false
  }
}
</script>

<style scoped>
:deep(.context-upload .n-upload-trigger) {
  width: 100%;
  display: block;
}

/* 🎨 Palette: Enhanced upload area with drag-and-drop animations */
.upload-wrapper {
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
}

/* Drag over state - visual feedback */
.upload-wrapper.is-drag-over {
  transform: scale(1.02);
}

.upload-wrapper.is-drag-over :deep(.n-upload-dragger) {
  border-color: var(--n-primary-color, #18a058) !important;
  background: rgba(24, 160, 88, 0.08) !important;
  box-shadow: 0 0 0 4px rgba(24, 160, 88, 0.15),
              0 8px 24px rgba(24, 160, 88, 0.15) !important;
}

/* File selected state */
.upload-wrapper.has-file :deep(.n-upload-dragger) {
  border-color: var(--n-success-color, #18a058) !important;
  background: rgba(24, 160, 88, 0.04) !important;
}

/* Upload dragger base styles */
.palette-upload-dragger {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Upload placeholder styles */
.upload-placeholder {
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-icon-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.upload-icon-wrapper.is-bouncing {
  animation: upload-icon-bounce 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes upload-icon-bounce {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  25% {
    transform: translateY(-8px) scale(1.1);
  }
  50% {
    transform: translateY(4px) scale(0.95);
  }
  75% {
    transform: translateY(-4px) scale(1.05);
  }
}

.upload-icon {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--n-text-color-3, #999);
}

.upload-wrapper.is-drag-over .upload-icon {
  color: var(--n-primary-color, #18a058);
  transform: scale(1.15);
}

/* Drop hint text */
.drop-hint {
  font-size: 14px;
  font-weight: 600;
  color: var(--n-primary-color, #18a058);
  background: rgba(24, 160, 88, 0.1);
  padding: 6px 16px;
  border-radius: 20px;
  animation: drop-hint-appear 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes drop-hint-appear {
  0% {
    opacity: 0;
    transform: translateY(-10px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Upload text styles */
.upload-text {
  font-size: 14px;
  transition: opacity 0.2s ease;
}

.upload-hint {
  font-size: 12px;
  opacity: 0.7;
}

/* File selected state styles */
.upload-file-selected {
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  animation: file-selected-appear 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes file-selected-appear {
  0% {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.file-icon-wrapper {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(24, 160, 88, 0.1);
  border-radius: 50%;
  margin-bottom: 4px;
  animation: file-icon-pulse 2s ease-in-out infinite;
}

@keyframes file-icon-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(24, 160, 88, 0.3);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(24, 160, 88, 0);
  }
}

.file-icon {
  color: var(--n-success-color, #18a058);
}

.file-icon .check-path {
  stroke-dasharray: 20;
  stroke-dashoffset: 20;
  animation: check-draw 0.6s ease forwards;
  animation-delay: 0.2s;
}

@keyframes check-draw {
  to {
    stroke-dashoffset: 0;
  }
}

.file-name {
  font-size: 14px;
  text-align: center;
  word-break: break-all;
  max-width: 100%;
}

.file-size {
  font-size: 12px;
}

.file-actions {
  margin-top: 4px;
}

/* Clear file button micro-interaction */
.clear-file-btn {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.clear-file-btn:hover {
  color: #d03050 !important;
  background: rgba(208, 48, 80, 0.1) !important;
}

/* Reduced motion support for accessibility */
@media (prefers-reduced-motion: reduce) {
  .upload-wrapper,
  .upload-wrapper.is-drag-over,
  .palette-upload-dragger,
  .upload-icon-wrapper,
  .upload-icon,
  .drop-hint,
  .upload-text,
  .upload-file-selected,
  .file-icon-wrapper,
  .file-icon .check-path,
  .clear-file-btn {
    transition: none !important;
    animation: none !important;
  }

  .upload-wrapper.is-drag-over {
    transform: none;
  }

  .file-icon-wrapper {
    box-shadow: none;
  }

  .file-icon .check-path {
    stroke-dashoffset: 0;
  }
}
</style>
