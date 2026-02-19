<template>
  <!-- 🎨 Palette: Enhanced UpdaterIcon with improved accessibility and micro-interactions -->
  <div v-if="isElectronEnvironment" class="relative">
    <NTooltip :placement="tooltipPlacement" :delay="300" :disabled="showModal">
      <template #trigger>
        <NBadge :show="state.hasUpdate" dot processing>
          <NButton
            @click="toggleModal"
            :aria-label="buttonAriaLabel"
            :title="buttonTitle"
            quaternary
            circle
            size="small"
            class="update-button"
            :class="{
              'has-update': state.hasUpdate,
              'is-checking': state.isCheckingUpdate,
              'is-downloading': state.isDownloading,
            }"
          >
            <template #icon>
              <!-- 🎨 Palette: Icon wrapper with enhanced states -->
              <div
                class="update-icon-wrapper"
                :class="{
                  'pulse-animation': state.hasUpdate && !state.isDownloading,
                  'spin-animation': state.isCheckingUpdate,
                  'bounce-animation': state.isDownloaded,
                }"
              >
                <!-- 🎨 Palette: Dynamic icon based on state -->
                <svg
                  v-if="state.isDownloaded"
                  class="w-5 h-5 update-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <svg
                  v-else
                  class="w-5 h-5 update-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>

                <!-- 🎨 Palette: Download progress indicator -->
                <svg
                  v-if="state.isDownloading && (state.downloadProgress?.percent ?? 0) > 0"
                  class="progress-ring"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="progress-ring-circle"
                    :stroke-dasharray="circumference"
                    :stroke-dashoffset="progressOffset"
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                </svg>
              </div>
            </template>
          </NButton>
        </NBadge>
      </template>

      <!-- 🎨 Palette: Informative tooltip content -->
      <div class="update-tooltip">
        <div class="update-tooltip-title">{{ tooltipTitle }}</div>
        <div v-if="tooltipSubtitle" class="update-tooltip-subtitle">{{ tooltipSubtitle }}</div>
        <div v-if="state.hasUpdate && !state.isDownloaded" class="update-tooltip-hint">
          {{ t('updater.clickToView') }}
        </div>
      </div>
    </NTooltip>

    <!-- 更新模态框 -->
    <UpdaterModal v-model="showModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

import { useI18n } from 'vue-i18n'
import { NButton, NBadge, NTooltip } from 'naive-ui'
import { isRunningInElectron } from '@prompt-optimizer/core'
import { useUpdater } from '../composables/system/useUpdater'
import UpdaterModal from './UpdaterModal.vue'

const { t } = useI18n()

// 环境检测
const isElectronEnvironment = isRunningInElectron()

// 只获取状态用于图标显示，不调用任何方法
const { state } = useUpdater()

// 模态框显示状态
const showModal = ref(false)

// 🎨 Palette: Tooltip placement
const tooltipPlacement = computed(() => 'bottom' as const)

// 🎨 Palette: Dynamic ARIA labels for accessibility
const buttonAriaLabel = computed(() => {
  if (state.isCheckingUpdate) return t('updater.checkingAriaLabel', '正在检查更新')
  if (state.isDownloading)
    return t(
      'updater.downloadingAriaLabel',
      { progress: state.downloadProgress?.percent ?? 0 },
      '正在下载更新 {progress}%'
    )
  if (state.isDownloaded) return t('updater.readyToInstallAriaLabel', '更新已下载，点击安装')
  if (state.hasUpdate) return t('updater.updateAvailableAriaLabel', '有新版本可用')
  return t('updater.checkForUpdatesAriaLabel', '检查更新')
})

// 🎨 Palette: Dynamic button title
const buttonTitle = computed(() => {
  if (state.isCheckingUpdate) return t('updater.checking', '正在检查...')
  if (state.isDownloading)
    return t(
      'updater.downloading',
      { progress: state.downloadProgress?.percent ?? 0 },
      '下载中 {progress}%'
    )
  if (state.isDownloaded) return t('updater.readyToInstall', '点击安装更新')
  if (state.hasUpdate) return t('updater.newVersionAvailable', '新版本可用！')
  return t('updater.checkForUpdates', '检查更新')
})

// 🎨 Palette: Tooltip content
const tooltipTitle = computed(() => {
  if (state.isCheckingUpdate) return t('updater.checkingTooltip', '正在检查更新...')
  if (state.isDownloading) return t('updater.downloadingTooltip', '正在下载更新')
  if (state.isDownloaded) return t('updater.readyTooltip', '更新已准备就绪！')
  if (state.hasUpdate)
    return t(
      'updater.availableTooltip',
      { version: state.updateInfo?.version ?? '' },
      '发现新版本 {version}'
    )
  return t('updater.upToDateTooltip', '已是最新版本')
})

// 🎨 Palette: Tooltip subtitle
const tooltipSubtitle = computed(() => {
  if (state.isDownloading && (state.downloadProgress?.percent ?? 0) > 0) {
    return `${state.downloadProgress?.percent}%`
  }
  if (state.hasUpdate && state.updateInfo?.version) {
    return state.updateInfo.version
  }
  return ''
})

// 🎨 Palette: Progress ring calculations
const circumference = 2 * Math.PI * 10 // r=10
const progressOffset = computed(() => {
  const progress = state.downloadProgress?.percent ?? 0
  if (!state.isDownloading || progress <= 0) return circumference
  return circumference - (progress / 100) * circumference
})

// 切换模态框显示
const toggleModal = () => {
  showModal.value = !showModal.value
}
</script>

<style scoped>
/* 🎨 Palette: Enhanced UpdaterIcon with micro-UX improvements */

/* Update button base styles */
.update-button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.update-button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--n-primary-color-rgb, 24, 160, 88), 0.3);
}

/* 🎨 Palette: Icon wrapper for better positioning and animations */
.update-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.update-icon {
  width: 20px;
  height: 20px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 🎨 Palette: Pulse animation for update available state */
.pulse-animation {
  animation: icon-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes icon-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.85;
    transform: scale(1.12);
  }
}

/* 🎨 Palette: Spin animation for checking state */
.spin-animation {
  animation: icon-spin 1s linear infinite;
}

@keyframes icon-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 🎨 Palette: Bounce animation for downloaded state */
.bounce-animation {
  animation: icon-bounce 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes icon-bounce {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.25);
  }
}

/* 🎨 Palette: Progress ring for download state */
.progress-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 24px;
  height: 24px;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.progress-ring-circle {
  transform: rotate(-90deg);
  transform-origin: center;
  transition: stroke-dashoffset 0.3s ease;
  opacity: 0.7;
}

/* 🎨 Palette: Hover effects based on state */
.update-button:hover .update-icon-wrapper {
  transform: scale(1.1);
}

.update-button:active .update-icon-wrapper {
  transform: scale(0.95);
}

/* Special hover for update available state */
.has-update:hover .pulse-animation {
  animation: none;
}

.has-update:hover .update-icon {
  color: var(--n-primary-color, #18a058);
}

/* Downloading state styling */
.is-downloading .update-icon {
  opacity: 0.5;
}

/* Downloaded state styling */
.is-downloaded .update-icon {
  color: var(--n-success-color, #18a058);
}

/* 🎨 Palette: Tooltip styles */
.update-tooltip {
  text-align: center;
  min-width: 120px;
}

.update-tooltip-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.update-tooltip-subtitle {
  font-size: 12px;
  opacity: 0.8;
  color: var(--n-primary-color, #18a058);
  margin-bottom: 4px;
}

.update-tooltip-hint {
  font-size: 11px;
  opacity: 0.7;
  font-style: italic;
}

/* 🎨 Palette: Badge enhancement */
:deep(.n-badge-sup) {
  animation: badge-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes badge-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(var(--n-error-color-rgb, 240, 72, 72), 0.4);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(var(--n-error-color-rgb, 240, 72, 72), 0);
  }
}

/* 🎨 Palette: Reduced motion support for accessibility */
@media (prefers-reduced-motion: reduce) {
  .update-icon-wrapper,
  .update-icon {
    transition: none;
  }

  .pulse-animation {
    animation: none;
  }

  .spin-animation {
    animation: none;
  }

  .bounce-animation {
    animation: none;
  }

  .progress-ring-circle {
    transition: none;
  }

  :deep(.n-badge-sup) {
    animation: none;
  }
}
</style>
