<template>
  <div class="tcb-root">
    <!-- 左侧：标签 + 模型下拉 + 可选 tags（tags 断点隐藏，且不允许挤压右侧控件） -->
    <NSpace class="tcb-left" align="center" :size="12" :wrap="false">
      <NText :depth="2" strong class="tcb-label">
        {{ modelLabel }}：
      </NText>
      <div class="tcb-model-select">
        <slot name="model-select"></slot>
      </div>
      <NTag
        v-if="modelName"
        class="tcb-tags"
        size="small"
        type="primary"
        :bordered="false"
      >
        <NEllipsis :style="{ maxWidth: '180px' }">
          {{ modelName }}
        </NEllipsis>
      </NTag>
    </NSpace>

    <!-- 右侧：强约束控件（必须始终可用、不可被遮挡） -->
    <NSpace class="tcb-right" align="center" justify="end" :size="12" :wrap="false">
      <NSpace v-if="showCompareToggle" align="center" :size="8" :wrap="false">
        <NSwitch
          :value="isCompareMode"
          @update:value="handleCompareToggle"
          :size="buttonSize === 'large' ? 'medium' : 'small'"
          :data-testid="compareToggleTestId"
          :aria-label="t('test.compareMode')"
          :title="isCompareMode ? t('test.disableCompareMode') : t('test.enableCompareMode')"
        />
        <NText
          :depth="3"
          tag="span"
          class="tcb-compare-label"
          role="button"
          tabindex="0"
          :aria-pressed="isCompareMode"
          @click="handleCompareToggle"
          @keydown.enter="handleCompareToggle"
          @keydown.space="handleCompareToggle"
          :title="t('test.clickToToggle')"
        >
          {{ t('test.compareMode') }}
        </NText>
      </NSpace>

      <slot name="secondary-controls"></slot>

      <NButton
        @click="handlePrimaryAction"
        :disabled="primaryActionDisabled"
        :loading="primaryActionLoading"
        type="primary"
        :size="buttonSize"
        :data-testid="primaryActionTestId"
      >
        {{ primaryActionText }}
      </NButton>

      <slot name="custom-actions"></slot>
    </NSpace>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { NSpace, NText, NButton, NSwitch, NTag, NEllipsis } from 'naive-ui'

const { t } = useI18n()

interface Props {
  // 模型选择相关
  modelLabel: string
  modelName?: string

  // 对比模式控制
  showCompareToggle?: boolean
  isCompareMode?: boolean

  // 主要操作按钮
  primaryActionText: string
  primaryActionDisabled?: boolean
  primaryActionLoading?: boolean

  // 布局配置
  buttonSize?: 'small' | 'medium' | 'large'

  /** E2E: stable selector for compare toggle */
  compareToggleTestId?: string

  /** E2E: stable selector for primary action button */
  primaryActionTestId?: string
}

withDefaults(defineProps<Props>(), {
  showCompareToggle: true,
  isCompareMode: false,
  primaryActionDisabled: false,
  primaryActionLoading: false,
  buttonSize: 'medium',
  compareToggleTestId: undefined,
  primaryActionTestId: undefined
})

const emit = defineEmits<{
  'compare-toggle': []
  'primary-action': []
}>()

const handleCompareToggle = () => {
  emit('compare-toggle')
}

const handlePrimaryAction = () => {
  emit('primary-action')
}
</script>

<style scoped>
.tcb-root {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  column-gap: 12px;
  align-items: center;
  width: 100%;
}

.tcb-left {
  min-width: 0;
  overflow: hidden;
}

.tcb-label {
  white-space: nowrap;
}

.tcb-model-select {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
}

.tcb-tags {
  flex-shrink: 1;
  min-width: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.tcb-tags:hover {
  transform: scale(1.02);
}

.tcb-right {
  flex-shrink: 0;
}

.tcb-compare-label {
  white-space: nowrap;
}

/* Enhanced switch interaction */
:deep(.tcb-right .n-switch) {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.tcb-right .n-switch:hover:not(.n-switch--disabled)) {
  transform: scale(1.05);
}

:deep(.tcb-right .n-switch:active:not(.n-switch--disabled)) {
  transform: scale(0.95);
}

/* Enhanced primary action button micro-interactions */
:deep(.tcb-right .n-button--primary-type) {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

:deep(.tcb-right .n-button--primary-type:hover:not(:disabled):not(.n-button--loading)) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 160, 88, 0.35);
}

:deep(.tcb-right .n-button--primary-type:active:not(:disabled):not(.n-button--loading)) {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2px 6px rgba(24, 160, 88, 0.3);
}

/* Loading shimmer animation */
:deep(.tcb-right .n-button--loading.n-button--primary-type::after) {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.25),
    transparent
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* 断点隐藏：空间不足时优先隐藏 tags，保证右侧控件可用 */
@media (max-width: 900px) {
  .tcb-tags {
    display: none;
  }
}

/* 极窄屏：右侧控件换到下一行，避免任何遮挡 */
@media (max-width: 640px) {
  .tcb-root {
    grid-template-columns: 1fr;
    row-gap: 8px;
  }
}
</style>
