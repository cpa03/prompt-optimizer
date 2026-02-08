<template>
  <NButton
    :type="buttonType"
    :size="buttonSize"
    :loading="loading"
    :loading-text="loadingText || t('common.loading')"
    :disabled="loading"
    @click="handleClick"
    class="action-button"
    :class="{ 'is-pressed': isPressed }"
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
  round: true
})

const emit = defineEmits<{
  (e: 'click'): void
}>()

// 动态计算按钮类型和尺寸，保持与主题的一致性
const buttonType = computed(() => props.type)
const buttonSize = computed(() => props.size)

// 按下状态管理 - 用于视觉反馈
const isPressed = ref(false)
const pressTimeout = ref<number | null>(null)

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
}
</style>