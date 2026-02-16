<template>
  <Modal :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <template #title>
      {{ t('updater.title') }}
    </template>

    <NSpace vertical :size="16">
      <NCard size="small" embedded>
        <template #header>
          <NText depth="3">{{ t('updater.currentVersion') }}</NText>
        </template>
        <div class="flex items-center justify-between">
          <NText v-if="state.currentVersion" strong>v{{ state.currentVersion }}</NText>
          <NText v-else type="error">{{ t('updater.versionLoadFailed') }}</NText>
        </div>
      </NCard>

      <NCard v-if="state.stableVersion" size="small" embedded>
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2 min-w-0">
              <NText>{{ t('updater.latestStableVersion') }}</NText>
              <NTag type="success" size="small">{{ t('updater.stable') }}</NTag>
            </div>
            <NTag v-if="state.isStableVersionIgnored" size="small">
              {{ t('updater.ignored') }}
            </NTag>
            <NTag v-else-if="state.hasStableUpdate" type="error" size="small">
              {{ t('updater.hasUpdate') }}
            </NTag>
          </div>
        </template>

        <div class="flex items-center justify-between gap-3">
          <NText strong>v{{ state.stableVersion }}</NText>
          <NSpace :size="8" align="center" justify="end">
            <NButton
              v-if="state.stableReleaseUrl"
              size="small"
              tertiary
              @click="openStableReleaseUrl"
            >
              {{ t('updater.details') }}
            </NButton>

            <NButton
              v-if="state.hasStableUpdate && !state.isStableVersionIgnored"
              size="small"
              tertiary
              @click="handleIgnoreStableUpdate"
            >
              {{ t('updater.ignore') }}
            </NButton>

            <NButton
              v-if="state.isStableVersionIgnored"
              size="small"
              tertiary
              @click="handleUnignoreStableUpdate"
            >
              {{ t('updater.unignore') }}
            </NButton>

            <NButton
              v-if="state.hasStableUpdate"
              size="small"
              type="success"
              :disabled="state.isDownloading || state.isCheckingUpdate"
              :loading="state.isDownloadingStable"
              @click="handleDownloadStable"
            >
              {{
                state.isDownloadingStable ? t('updater.downloadingShort') : t('updater.download')
              }}
            </NButton>
          </NSpace>
        </div>
      </NCard>

      <NCard v-if="state.prereleaseVersion" size="small" embedded>
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2 min-w-0">
              <NText>{{ t('updater.latestPrereleaseVersion') }}</NText>
              <NTag type="warning" size="small">{{ t('updater.prerelease') }}</NTag>
            </div>
            <NTag v-if="state.isPrereleaseVersionIgnored" size="small">
              {{ t('updater.ignored') }}
            </NTag>
            <NTag v-else-if="state.hasPrereleaseUpdate" type="error" size="small">
              {{ t('updater.hasUpdate') }}
            </NTag>
          </div>
        </template>

        <div class="flex items-center justify-between gap-3">
          <NText strong>v{{ state.prereleaseVersion }}</NText>
          <NSpace :size="8" align="center" justify="end">
            <NButton
              v-if="state.prereleaseReleaseUrl"
              size="small"
              tertiary
              @click="openPrereleaseReleaseUrl"
            >
              {{ t('updater.details') }}
            </NButton>

            <NButton
              v-if="state.hasPrereleaseUpdate && !state.isPrereleaseVersionIgnored"
              size="small"
              tertiary
              @click="handleIgnorePrereleaseUpdate"
            >
              {{ t('updater.ignore') }}
            </NButton>

            <NButton
              v-if="state.isPrereleaseVersionIgnored"
              size="small"
              tertiary
              @click="handleUnignorePrereleaseUpdate"
            >
              {{ t('updater.unignore') }}
            </NButton>

            <NButton
              v-if="state.hasPrereleaseUpdate"
              size="small"
              type="warning"
              :disabled="state.isDownloading || state.isCheckingUpdate"
              :loading="state.isDownloadingPrerelease"
              @click="handleDownloadPrerelease"
            >
              {{
                state.isDownloadingPrerelease
                  ? t('updater.downloadingShort')
                  : t('updater.download')
              }}
            </NButton>
          </NSpace>
        </div>
      </NCard>

      <NCard v-else-if="!state.isCheckingUpdate && state.stableVersion" size="small" embedded>
        <template #header>
          <div class="flex items-center gap-2">
            <NText>{{ t('updater.latestPrereleaseVersion') }}</NText>
            <NTag type="warning" size="small">{{ t('updater.prerelease') }}</NTag>
          </div>
        </template>
        <NSpace vertical :size="4">
          <NText depth="3">{{ t('updater.noPrereleaseAvailable') }}</NText>
          <NText depth="3">{{ t('updater.latestIsStable') }}</NText>
        </NSpace>
      </NCard>

      <NAlert v-if="state.lastCheckResult === 'dev-disabled'" type="info" :show-icon="true">
        {{ t('updater.devEnvironment') }}
      </NAlert>

      <NAlert
        v-if="state.lastCheckMessage && state.lastCheckResult === 'error'"
        type="error"
        :show-icon="true"
      >
        <div class="flex flex-col gap-2">
          <NText strong>{{ t('updater.checkFailed') }}</NText>
          <div class="whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
            {{ state.lastCheckMessage }}
          </div>
        </div>
      </NAlert>

      <NAlert
        v-if="state.downloadMessage"
        :type="downloadMessageAlertType"
        :show-icon="true"
        closable
        @close="state.downloadMessage = null"
      >
        <div class="flex flex-col gap-2">
          <NText strong>{{ downloadMessageTitle }}</NText>
          <div class="whitespace-pre-wrap break-words">
            {{ state.downloadMessage.content }}
          </div>
        </div>
      </NAlert>

      <NSpin v-if="state.isCheckingUpdate" size="small">
        <template #description>
          {{ t('updater.checkingForUpdates') }}
        </template>
      </NSpin>

      <div v-if="state.isDownloading" class="space-y-2">
        <NText depth="3">{{ t('updater.downloading') }}</NText>
        <div v-if="state.downloadProgress" class="space-y-2">
          <NProgress
            :percentage="Math.round(state.downloadProgress.percent)"
            status="info"
            :show-indicator="false"
            :height="8"
          />
          <NText depth="3" class="text-sm">
            {{ Math.round(state.downloadProgress.percent) }}% ({{
              formatBytes(state.downloadProgress.transferred)
            }}
            / {{ formatBytes(state.downloadProgress.total) }})
          </NText>
        </div>
      </div>

      <NAlert v-if="state.isDownloaded" type="success" :show-icon="true">
        <div class="flex flex-col gap-2">
          <NText strong>{{ t('updater.downloadComplete') }}</NText>
          <NText depth="3">{{ t('updater.clickInstallToRestart') }}</NText>
          <div class="pt-2">
            <NButton type="primary" @click="handleInstallUpdate">
              {{ t('updater.installAndRestart') }}
            </NButton>
          </div>
        </div>
      </NAlert>
    </NSpace>

    <template #footer>
      <div class="flex justify-between w-full">
        <NButton @click="$emit('update:modelValue', false)" type="default" size="medium">
          {{ t('common.close') }}
        </NButton>
        <NButton
          @click="handleCheckUpdate"
          :disabled="state.isCheckingUpdate"
          :loading="state.isCheckingUpdate"
          type="primary"
          size="medium"
        >
          {{ state.isCheckingUpdate ? t('updater.checking') : t('updater.checkNow') }}
        </NButton>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
// 🎨 Palette: Micro-UX improvements for UpdaterModal
// - Card hover effects with subtle lift
// - Button micro-interactions with ripple
// - Enhanced progress bar with animated gradient
// - Smooth transitions for state changes
// - Reduced motion support for accessibility
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { NAlert, NButton, NCard, NProgress, NSpace, NSpin, NTag, NText } from 'naive-ui'
import { isRunningInElectron } from '@prompt-optimizer/core'
import { useUpdater } from '../composables/system/useUpdater'
import Modal from './Modal.vue'

const { t } = useI18n()

interface Props {
  modelValue: boolean
}

defineProps<Props>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// 使用 useUpdater 管理所有更新逻辑
const {
  state,
  checkUpdate,
  installUpdate,
  ignoreUpdate,
  unignoreUpdate,
  downloadStableVersion,
  downloadPrereleaseVersion,
} = useUpdater()

const downloadMessageAlertType = computed(() => {
  const type = state.downloadMessage?.type
  if (type === 'error') return 'error'
  if (type === 'warning') return 'warning'
  return 'info'
})

const downloadMessageTitle = computed(() => {
  const type = state.downloadMessage?.type
  if (type === 'error') return t('updater.downloadFailed')
  if (type === 'warning') return t('updater.warning')
  return t('updater.info')
})

// 事件处理器
const handleCheckUpdate = async () => {
  await checkUpdate()
}

const handleInstallUpdate = async () => {
  await installUpdate()
}

const openStableReleaseUrl = async () => {
  if (!state.stableReleaseUrl || !isRunningInElectron() || !window.electronAPI?.shell) return

  try {
    await window.electronAPI.shell.openExternal(state.stableReleaseUrl)
  } catch (error) {
    console.error('[UpdaterModal] Open stable release URL error:', error)
  }
}

const openPrereleaseReleaseUrl = async () => {
  if (!state.prereleaseReleaseUrl || !isRunningInElectron() || !window.electronAPI?.shell) return

  try {
    await window.electronAPI.shell.openExternal(state.prereleaseReleaseUrl)
  } catch (error) {
    console.error('[UpdaterModal] Open prerelease release URL error:', error)
  }
}

const handleDownloadStable = async () => {
  await downloadStableVersion()
}

const handleDownloadPrerelease = async () => {
  await downloadPrereleaseVersion()
}

const handleIgnoreStableUpdate = async () => {
  if (state.stableVersion) {
    await ignoreUpdate(state.stableVersion, 'stable')
  }
}

const handleIgnorePrereleaseUpdate = async () => {
  if (state.prereleaseVersion) {
    await ignoreUpdate(state.prereleaseVersion, 'prerelease')
  }
}

const handleUnignoreStableUpdate = async () => {
  await unignoreUpdate('stable')
}

const handleUnignorePrereleaseUpdate = async () => {
  await unignoreUpdate('prerelease')
}

// 格式化字节数
const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
/* 🎨 Palette: Card hover effects with subtle lift and shadow */
:deep(.n-card) {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.n-card:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

:deep(.n-card:active) {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

/* 🎨 Palette: Enhanced button micro-interactions */
:deep(.n-button) {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

/* Primary button hover glow effect */
:deep(.n-button--primary-type:not(:disabled):hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--n-primary-color-rgb, 24, 160, 88), 0.35);
}

:deep(.n-button--primary-type:not(:disabled):active) {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2px 6px rgba(var(--n-primary-color-rgb, 24, 160, 88), 0.3);
}

/* Tertiary button hover */
:deep(.n-button--tertiary-type:not(:disabled):hover) {
  transform: translateY(-1px);
}

:deep(.n-button--tertiary-type:not(:disabled):active) {
  transform: translateY(0) scale(0.98);
}

/* Button loading shimmer effect */
:deep(.n-button--loading::after) {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
  animation: button-loading-shimmer 1.5s infinite;
  pointer-events: none;
}

@keyframes button-loading-shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* 🎨 Palette: Enhanced progress bar with animated gradient */
:deep(.n-progress .n-progress-graph .n-progress-graph-fill) {
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(
    90deg,
    var(--n-progress-fill-color, #18a058) 0%,
    #36d17a 50%,
    var(--n-progress-fill-color, #18a058) 100%
  );
  background-size: 200% 100%;
  animation: progress-gradient-flow 2s linear infinite;
}

@keyframes progress-gradient-flow {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 🎨 Palette: Alert entrance animations */
:deep(.n-alert) {
  animation: alert-entrance 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes alert-entrance {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 🎨 Palette: Tag hover effects */
:deep(.n-tag) {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.n-tag:hover) {
  transform: scale(1.05);
}

/* 🎨 Palette: Focus-visible rings for keyboard accessibility */
:deep(.n-button):focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--n-primary-color-rgb, 24, 160, 88), 0.3);
}

/* 🎨 Palette: Dark mode adjustments */
.dark :deep(.n-card:hover) {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.dark :deep(.n-button--primary-type:not(:disabled):hover) {
  box-shadow: 0 4px 16px rgba(var(--n-primary-color-rgb, 24, 160, 88), 0.4);
}

/* 🎨 Palette: Respect reduced motion preference for accessibility */
@media (prefers-reduced-motion: reduce) {
  :deep(.n-card),
  :deep(.n-button),
  :deep(.n-tag) {
    transition: none !important;
    animation: none !important;
  }

  :deep(.n-card:hover) {
    transform: none;
    box-shadow: none;
  }

  :deep(.n-button--loading::after) {
    animation: none;
  }

  :deep(.n-progress .n-progress-graph .n-progress-graph-fill) {
    animation: none;
    background: var(--n-progress-fill-color, #18a058);
  }

  :deep(.n-alert) {
    animation: none;
  }

  :deep(.n-button--primary-type:not(:disabled):hover),
  :deep(.n-button--primary-type:not(:disabled):active) {
    transform: none;
    box-shadow: none;
  }
}
</style>
