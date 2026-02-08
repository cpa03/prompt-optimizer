<!-- 功能模式选择器组件 - 使用 Naive UI RadioGroup -->
<template>
  <NRadioGroup data-testid="function-mode-selector"
    :value="modelValue"
    @update:value="updateFunctionMode"
    size="small"
    class="function-mode-selector"
  >
    <NRadioButton
      data-testid="function-mode-basic"
      value="basic"
      :title="t('nav.basicMode')"
    >
      {{ t('nav.basicMode') }}
    </NRadioButton>
    <NRadioButton
      data-testid="function-mode-pro"
      value="pro"
      :title="t('nav.contextMode')"
    >
      {{ t('nav.contextMode') }}
    </NRadioButton>
    <NRadioButton
      data-testid="function-mode-image"
      value="image"
      :title="t('nav.imageMode')"
    >
      {{ t('nav.imageMode') }}
    </NRadioButton>
  </NRadioGroup>
</template>

<script setup lang="ts">
import { NRadioGroup, NRadioButton } from 'naive-ui'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  modelValue: 'basic' | 'pro' | 'image'
}

interface Emits {
  (e: 'update:modelValue', value: 'basic' | 'pro' | 'image'): void
  (e: 'change', value: 'basic' | 'pro' | 'image'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * 更新功能模式
 */
const updateFunctionMode = (mode: 'basic' | 'pro' | 'image') => {
  emit('update:modelValue', mode)
  emit('change', mode)
}
</script>

<style scoped>
.function-mode-selector {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced radio button interactions */
.function-mode-selector :deep(.n-radio-button) {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

/* Hover lift effect */
.function-mode-selector :deep(.n-radio-button:not(.n-radio-button--disabled):hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Active/click press effect */
.function-mode-selector :deep(.n-radio-button:not(.n-radio-button--disabled):active) {
  transform: scale(0.98) translateY(0);
}

/* Selected state enhancement */
.function-mode-selector :deep(.n-radio-button.n-radio-button--checked) {
  font-weight: 500;
}

/* Ripple effect on click */
.function-mode-selector :deep(.n-radio-button::after) {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.3s ease-out, height 0.3s ease-out, opacity 0.3s ease-out;
  opacity: 0;
  pointer-events: none;
}

.function-mode-selector :deep(.n-radio-button:active::after) {
  width: 100px;
  height: 100px;
  opacity: 1;
}

/* Focus visible styling for accessibility */
.function-mode-selector :deep(.n-radio-button:focus-visible) {
  outline: 2px solid var(--n-primary-color);
  outline-offset: 2px;
}

/* 响应式设计 - 移动端全宽显示 */
@media (max-width: 640px) {
  .function-mode-selector {
    width: 100%;
  }

  .function-mode-selector :deep(.n-radio-button) {
    flex: 1;
  }
}
</style>