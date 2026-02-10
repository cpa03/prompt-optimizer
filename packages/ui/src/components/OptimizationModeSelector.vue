<!-- 优化模式选择器组件 - 使用 Naive UI RadioGroup -->
<template>
  <NRadioGroup data-testid="optimization-mode-selector"
    :value="modelValue"
    @update:value="updateOptimizationMode"
    size="small"
    class="optimization-mode-selector"
  >
    <!-- 基础模式：系统 | 用户 -->
    <template v-if="functionMode !== 'pro'">
      <NRadioButton
        v-if="!hideSystemOption"
        data-testid="sub-mode-system"
        value="system"
        :title="systemHelp"
      >
        {{ systemLabel }}
      </NRadioButton>
      <NRadioButton
        data-testid="sub-mode-user"
        value="user"
        :title="userHelp"
      >
        {{ userLabel }}
      </NRadioButton>
    </template>
    <!-- Pro 模式：变量 | 多对话 -->
    <template v-else>
      <NRadioButton
        data-testid="sub-mode-variable"
        value="variable"
        :title="userHelp"
      >
        {{ userLabel }}
      </NRadioButton>
      <NRadioButton
        v-if="!hideSystemOption"
        data-testid="sub-mode-multi"
        value="multi"
        :title="systemHelp"
      >
        {{ systemLabel }}
      </NRadioButton>
    </template>
  </NRadioGroup>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NRadioGroup, NRadioButton } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import type { BasicSubMode, ProSubMode } from '@prompt-optimizer/core'
import type { FunctionMode } from '../composables/mode'

const { t } = useI18n()

type SubMode = BasicSubMode | ProSubMode

interface Props {
  modelValue: SubMode
  /** 是否隐藏系统提示词选项（用于临时禁用功能） */
  hideSystemOption?: boolean
  /** 当前功能模式，用于决定显示文案 */
  functionMode?: FunctionMode
}

interface Emits {
  (e: 'update:modelValue', value: SubMode): void
  (e: 'change', value: SubMode): void
}

const props = withDefaults(defineProps<Props>(), {
  hideSystemOption: false,
  functionMode: 'basic',
})
const emit = defineEmits<Emits>()

// 根据功能模式动态获取按钮文本
const systemLabel = computed(() => {
  return props.functionMode === 'pro'
    ? t('contextMode.optimizationMode.message')
    : t('promptOptimizer.systemPrompt')
})

const userLabel = computed(() => {
  return props.functionMode === 'pro'
    ? t('contextMode.optimizationMode.variable')
    : t('promptOptimizer.userPrompt')
})

const systemHelp = computed(() => {
  return props.functionMode === 'pro'
    ? t('contextMode.system.tooltip')
    : t('promptOptimizer.systemPromptHelp')
})

const userHelp = computed(() => {
  return props.functionMode === 'pro'
    ? t('contextMode.user.tooltip')
    : t('promptOptimizer.userPromptHelp')
})

/**
 * 更新优化模式
 */
const updateOptimizationMode = (mode: SubMode) => {
  emit('update:modelValue', mode)
  emit('change', mode)
}
</script>

<style scoped>
.optimization-mode-selector {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced radio button interactions - 🎨 Palette: Micro-UX improvements */
.optimization-mode-selector :deep(.n-radio-button) {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

/* Hover lift effect */
.optimization-mode-selector :deep(.n-radio-button:not(.n-radio-button--disabled):hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Active/click press effect */
.optimization-mode-selector :deep(.n-radio-button:not(.n-radio-button--disabled):active) {
  transform: scale(0.98) translateY(0);
}

/* Selected state enhancement */
.optimization-mode-selector :deep(.n-radio-button.n-radio-button--checked) {
  font-weight: 500;
}

/* Ripple effect on click */
.optimization-mode-selector :deep(.n-radio-button::after) {
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

.optimization-mode-selector :deep(.n-radio-button:active::after) {
  width: 100px;
  height: 100px;
  opacity: 1;
}

/* Focus visible styling for accessibility */
.optimization-mode-selector :deep(.n-radio-button:focus-visible) {
  outline: 2px solid var(--n-primary-color);
  outline-offset: 2px;
}

/* 响应式设计 - 移动端全宽显示 */
@media (max-width: 640px) {
  .optimization-mode-selector {
    width: 100%;
  }

  .optimization-mode-selector :deep(.n-radio-button) {
    flex: 1;
  }
}

/* Respect reduced motion preference for accessibility */
@media (prefers-reduced-motion: reduce) {
  .optimization-mode-selector,
  .optimization-mode-selector :deep(.n-radio-button),
  .optimization-mode-selector :deep(.n-radio-button::after) {
    transition: none !important;
    animation: none !important;
  }
  
  .optimization-mode-selector :deep(.n-radio-button:not(.n-radio-button--disabled):hover) {
    transform: none;
    box-shadow: none;
  }
  
  .optimization-mode-selector :deep(.n-radio-button:not(.n-radio-button--disabled):active) {
    transform: none;
  }
}
</style>
