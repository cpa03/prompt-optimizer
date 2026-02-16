<template>
  <div class="action-button-wrapper" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <NButton
      :type="buttonType"
      :size="buttonSize"
      :loading="loading"
      :loading-text="loadingText || t('common.loading')"
      :disabled="loading"
      @click="handleClick"
      @focus="handleFocus"
      @blur="handleBlur"
      class="action-button"
      :class="{ 'is-pressed': isPressed, 'is-loading': loading }"
      :ghost="ghost"
      :round="round"
      :title="title || text"
      :aria-pressed="isPressed"
    >
      <template #icon>
        <slot name="icon">
          <span class="text-base sm:text-lg">{{ icon }}</span>
        </slot>
      </template>
      <span class="text-sm max-md:hidden">{{ text }}</span>
    </NButton>
    <!-- 🎨 Palette: Keyboard shortcut hint overlay -->
    <Transition name="shortcut-hint">
      <div
        v-if="shortcutHint && (isHovered || isFocused) && !loading"
        class="keyboard-shortcut-hint"
        role="tooltip"
      >
        <span class="shortcut-key">{{ shortcutHint }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { useI18n } from 'vue-i18n'
import { NButton } from 'naive-ui'

const { t } = useI18n()

interface Props {
  icon?: string
  text: string
  loading?: boolean
  loadingText?: string
  type?: 'default' | 'tertiary' | 'primary' | 'success' | 'info' | 'warning' | 'error'
  size?: 'tiny' | 'small' | 'medium' | 'large'
  ghost?: boolean
  round?: boolean
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'medium',
  ghost: false,
  round: true,
})

const emit = defineEmits<{
  (e: 'click'): void
}>()

// 动态计算按钮类型和尺寸，保持与主题的一致性
const buttonType = computed(() => props.type)
const buttonSize = computed(() => props.size)

// 🎨 Palette: Extract keyboard shortcut from title prop
// Format: "Button Title (Ctrl+K)" or "Button Title (Cmd+K)"
const shortcutHint = computed(() => {
  if (!props.title) return null
  const match = props.title.match(/\(([^)]+)\)$/)
  return match ? match[1] : null
})

// 按下状态管理 - 用于视觉反馈
const isPressed = ref(false)
const pressTimeout = ref<number | null>(null)

// 🎨 Palette: Hover and focus states for keyboard shortcut hint
const isHovered = ref(false)
const isFocused = ref(false)

// 🎨 Palette: Handle mouse enter/leave for hover state
const handleMouseEnter = () => {
  isHovered.value = true
}

const handleMouseLeave = () => {
  isHovered.value = false
}

// 🎨 Palette: Handle focus events for accessibility
const handleFocus = () => {
  isFocused.value = true
}

const handleBlur = () => {
  isFocused.value = false
}

// 处理点击事件，添加按下状态反馈
const handleClick = () => {
  // 设置按下状态
  isPressed.value = true

  // 清除之前的定时器
  if (pressTimeout.value) {
    clearTimeout(pressTimeout.value)
  }

  // 150ms 后恢复状态，创造微妙的"按下-弹起"视觉效果
  pressTimeout.value = window.setTimeout(() => {
    isPressed.value = false
  }, 150)

  // 触发点击事件
  emit('click')
}

// 🎨 Palette: Expose methods for parent to set hover/focus states
// This allows the wrapper div to control the states
defineExpose({
  setHovered: (value: boolean) => {
    isHovered.value = value
  },
  setFocused: (value: boolean) => {
    isFocused.value = value
  },
})
</script>

<style scoped>
.action-button {
  /* 保持与原有主题系统的兼容性 */
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

/* 键盘导航的焦点环 - 仅在键盘聚焦时显示 */
.action-button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--n-primary-color-rgb, 24, 160, 88), 0.3);
}

/* 悬停效果 - 轻微上浮 */
.action-button:hover {
  transform: translateY(-1px);
}

/* 默认按下效果 */
.action-button:active {
  transform: scale(0.98) translateY(0);
}

/* 程序化按下状态 - 创造更明显的点击反馈 */
.action-button.is-pressed {
  transform: scale(0.96) translateY(1px);
  transition: transform 0.1s ease-out;
}

/* 按钮图标动画 */
.action-button :deep(.n-button__icon) {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-button:hover :deep(.n-button__icon) {
  transform: scale(1.1);
}

.action-button:active :deep(.n-button__icon),
.action-button.is-pressed :deep(.n-button__icon) {
  transform: scale(0.95);
}

/* 禁用状态样式优化 */
.action-button[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.action-button[disabled] :deep(.n-button__icon) {
  transform: none !important;
}

/* 加载状态的微动画 */
.action-button :deep(.n-button__loading) {
  animation: button-loading-spin 1s linear infinite;
}

@keyframes button-loading-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 加载状态的闪烁动画 - 提供视觉反馈 */
.action-button.is-loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
  animation: loading-shimmer 1.5s infinite;
  pointer-events: none;
}

@keyframes loading-shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* 🎨 Palette: Wrapper for positioning context */
.action-button-wrapper {
  position: relative;
  display: inline-flex;
}

/* 🎨 Palette: Keyboard shortcut hint styles */
.keyboard-shortcut-hint {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.85);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  white-space: nowrap;
}

/* Arrow pointing down to the button */
.keyboard-shortcut-hint::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.85);
}

.shortcut-key {
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* Transition animations for the hint */
.shortcut-hint-enter-active,
.shortcut-hint-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.shortcut-hint-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(4px) scale(0.95);
}

.shortcut-hint-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(4px) scale(0.95);
}

.shortcut-hint-enter-to,
.shortcut-hint-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0) scale(1);
}

/* Dark mode adjustments */
.dark .keyboard-shortcut-hint {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.dark .keyboard-shortcut-hint::after {
  border-top-color: rgba(255, 255, 255, 0.9);
}

.dark .shortcut-key {
  color: #1a1a1a;
}

/* Mobile: Hide shortcut hints on small screens */
@media (max-width: 768px) {
  .keyboard-shortcut-hint {
    display: none;
  }
}

/* 尊重用户减少动画的偏好设置 */
@media (prefers-reduced-motion: reduce) {
  .action-button,
  .action-button :deep(.n-button__icon) {
    transition: none !important;
  }

  .action-button.is-pressed {
    transform: none;
  }

  .action-button :deep(.n-button__loading) {
    animation: none;
  }

  .action-button.is-loading::after {
    animation: none;
  }

  /* 🎨 Palette: Disable shortcut hint animations for reduced motion */
  .shortcut-hint-enter-active,
  .shortcut-hint-leave-active {
    transition: opacity 0.1s ease;
  }

  .shortcut-hint-enter-from,
  .shortcut-hint-leave-to {
    transform: translateX(-50%) scale(1);
  }
}
</style>
