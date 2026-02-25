<!--
  🎨 Palette: FunctionModeSelector Component
  Enhanced with micro-UX improvements for better user experience:
  - Smooth hover lift effects with subtle shadows
  - Click ripple animation for tactile feedback
  - Focus-visible rings for keyboard navigation accessibility
  - Reduced motion support for users with motion sensitivity
  - Selected state visual enhancement
-->
<template>
  <NRadioGroup
    data-testid="function-mode-selector"
    :value="modelValue"
    @update:value="updateFunctionMode"
    size="small"
    class="function-mode-selector"
  >
    <NRadioButton data-testid="function-mode-basic" value="basic" :title="t('nav.basicMode')">
      {{ t('nav.basicMode') }}
    </NRadioButton>
    <NRadioButton data-testid="function-mode-pro" value="pro" :title="t('nav.contextMode')">
      {{ t('nav.contextMode') }}
    </NRadioButton>
    <NRadioButton data-testid="function-mode-image" value="image" :title="t('nav.imageMode')">
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

/* 🎨 Palette: Enhanced radio button interactions with smooth animations */
.function-mode-selector :deep(.n-radio-button) {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

/* 🎨 Palette: Hover lift effect for tactile feedback */
.function-mode-selector :deep(.n-radio-button:not(.n-radio-button--disabled):hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 🎨 Palette: Active/click press effect */
.function-mode-selector :deep(.n-radio-button:not(.n-radio-button--disabled):active) {
  transform: scale(0.98) translateY(0);
}

/* 🎨 Palette: Selected state enhancement with subtle glow */
.function-mode-selector :deep(.n-radio-button.n-radio-button--checked) {
  font-weight: 500;
}

/* 🎨 Palette: Hover glow effect for selected state */
.function-mode-selector
  :deep(.n-radio-button.n-radio-button--checked:not(.n-radio-button--disabled):hover) {
  box-shadow: 0 2px 12px rgba(var(--n-primary-color-rgb, 24, 160, 88), 0.25);
}

/* 🎨 Palette: Ripple effect on click for tactile feedback */
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
  transition:
    width 0.3s ease-out,
    height 0.3s ease-out,
    opacity 0.3s ease-out;
  opacity: 0;
  pointer-events: none;
}

.function-mode-selector :deep(.n-radio-button:active::after) {
  width: 100px;
  height: 100px;
  opacity: 1;
}

/* 🎨 Palette: Focus-visible rings for keyboard navigation accessibility */
.function-mode-selector :deep(.n-radio-button:focus-visible) {
  outline: 2px solid var(--n-primary-color);
  outline-offset: 2px;
}

/* 🎨 Palette: Dark mode adjustments */
.dark .function-mode-selector :deep(.n-radio-button:not(.n-radio-button--disabled):hover) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.dark
  .function-mode-selector
  :deep(.n-radio-button.n-radio-button--checked:not(.n-radio-button--disabled):hover) {
  box-shadow: 0 2px 12px rgba(var(--n-primary-color-rgb, 24, 160, 88), 0.35);
}

/* 🎨 Palette: Respect reduced motion preference for accessibility */
@media (prefers-reduced-motion: reduce) {
  .function-mode-selector,
  .function-mode-selector :deep(.n-radio-button),
  .function-mode-selector :deep(.n-radio-button::after) {
    transition: none !important;
    animation: none !important;
  }

  .function-mode-selector :deep(.n-radio-button:not(.n-radio-button--disabled):hover) {
    transform: none;
    box-shadow: none;
  }

  .function-mode-selector :deep(.n-radio-button:not(.n-radio-button--disabled):active) {
    transform: none;
  }

  .function-mode-selector
    :deep(.n-radio-button.n-radio-button--checked:not(.n-radio-button--disabled):hover) {
    box-shadow: none;
  }
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
