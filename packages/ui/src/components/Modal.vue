<template>
  <NModal
    v-model:show="isVisible"
    :mask-closable="maskClosable"
    :closable="closable"
    :auto-focus="autoFocus"
    :trap-focus="trapFocus"
    preset="card"
    :style="modalStyle"
    :class="modalClass"
    @after-leave="handleAfterLeave"
    @keydown="handleKeyDown"
    role="dialog"
    aria-modal="true"
    :aria-label="title || t('common.title')"
    :aria-describedby="description ? 'modal-description' : undefined"
  >
    <template #header>
      <slot name="title">{{ title || t('common.title') }}</slot>
    </template>

    <template #default>
      <div class="modal-content">
        <p v-if="description" id="modal-description" class="sr-only">
          {{ description }}
        </p>
        <slot></slot>
      </div>
    </template>

    <template #footer>
      <div class="modal-footer">
        <slot name="footer">
          <div class="flex justify-end gap-3">
            <NButton
              type="tertiary"
              @click="handleCancel"
              @keydown.enter.stop="handleCancel"
              @keydown.space.stop="handleCancel"
              class="modal-btn"
            >
              <span>{{ t('common.cancel') }}</span>
              <kbd class="kbd-hint kbd-hint--cancel" v-if="showKeyboardHints">Esc</kbd>
            </NButton>
            <NButton
              type="primary"
              @click="handleConfirm"
              @keydown.enter.stop="handleConfirm"
              @keydown.space.stop="handleConfirm"
              class="modal-btn"
            >
              <span>{{ t('common.confirm') }}</span>
              <kbd class="kbd-hint kbd-hint--confirm" v-if="showKeyboardHints">Enter</kbd>
            </NButton>
          </div>
        </slot>
      </div>
    </template>
  </NModal>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'

import { useI18n } from 'vue-i18n'
import { NModal, NButton } from 'naive-ui'
import { UI_DIMENSIONS, TIME_CONSTANTS, BREAKPOINTS } from '../config/constants'

const { t } = useI18n()

interface Props {
  modelValue: boolean
  title?: string
  description?: string
  maskClosable?: boolean
  closable?: boolean
  autoFocus?: boolean
  trapFocus?: boolean
  width?: number | string
  maxWidth?: number | string
  closeOnEscape?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maskClosable: true,
  closable: true,
  autoFocus: true,
  trapFocus: true,
  width: UI_DIMENSIONS.MODAL_WIDTH_VW,
  maxWidth: UI_DIMENSIONS.MODAL_WIDTH_SMALL,
  closeOnEscape: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
  'after-leave': []
}>()

// 内部显示状态
const isVisible = ref(props.modelValue)

// 监听外部变化
watch(
  () => props.modelValue,
  (newVal) => {
    isVisible.value = newVal
  }
)

// 监听内部变化，同步到外部
watch(isVisible, (newVal) => {
  emit('update:modelValue', newVal)
})

// 模态框样式
const modalStyle = computed(() => ({
  width: props.width,
  maxWidth: props.maxWidth,
}))

const modalClass = computed(() => ['modern-modal', { 'modal-closing': isClosing.value }])

// 键盘事件处理
const handleKeyDown = (event: KeyboardEvent) => {
  // ESC键关闭模态框
  if (event.key === 'Escape' && props.closeOnEscape && isVisible.value) {
    event.preventDefault()
    event.stopPropagation()
    handleCancel()
  }
  // Enter键确认（仅当没有焦点在输入框或按钮上时）
  if (event.key === 'Enter' && isVisible.value && !event.defaultPrevented) {
    const activeElement = document.activeElement
    const isInputFocused =
      activeElement instanceof HTMLInputElement ||
      activeElement instanceof HTMLTextAreaElement ||
      activeElement?.getAttribute('contenteditable') === 'true'
    if (!isInputFocused) {
      event.preventDefault()
      handleConfirm()
    }
  }
}

// 在桌面端显示键盘提示（移动端隐藏）
const showKeyboardHints = computed(() => {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= BREAKPOINTS.TABLET
})

// 添加全局键盘监听
onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeyDown)
  }
})

// 事件处理
const handleConfirm = () => {
  // 触发关闭动画
  isClosing.value = true
  // 短暂延迟后触发确认，让动画完成
  setTimeout(() => {
    isVisible.value = false
    isClosing.value = false
    emit('confirm')
  }, TIME_CONSTANTS.PRESS_FEEDBACK_MS)
}

// 添加关闭动画状态
const isClosing = ref(false)

const handleCancel = () => {
  // 触发关闭动画
  isClosing.value = true
  // 短暂延迟后实际关闭，让动画完成
  setTimeout(() => {
    isVisible.value = false
    isClosing.value = false
    emit('cancel')
  }, TIME_CONSTANTS.PRESS_FEEDBACK_MS)
}

const handleAfterLeave = () => {
  emit('after-leave')
}
</script>

<style scoped>
.modern-modal {
  /* 自定义模态框样式 */
}

.modal-content {
  min-height: 100px;
  padding: 4px 0;
}

.modal-footer {
  padding-top: 16px;
  border-top: 1px solid var(--n-divider-color);
}

/* Modal button styles */
.modal-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

/* Keyboard shortcut hints */
.kbd-hint {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 18px;
  padding: 0 5px;
  margin-left: 4px;
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.kbd-hint--cancel {
  color: var(--n-text-color-3, rgba(0, 0, 0, 0.6));
  background: rgba(0, 0, 0, 0.06);
}

.dark .kbd-hint--cancel {
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
}

.modal-btn:hover .kbd-hint {
  opacity: 1;
}

.modal-btn:focus-visible .kbd-hint {
  opacity: 1;
}

/* Screen reader only - visually hidden but accessible to screen readers */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* 关闭动画效果 */
.modal-closing :deep(.n-card) {
  animation: modal-close-scale 0.15s ease-out forwards;
}

@keyframes modal-close-scale {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.96);
    opacity: 0.8;
  }
}

/* 键盘导航的焦点环 - 仅在键盘聚焦时显示 */
:deep(.n-button):focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--n-primary-color-rgb, 24, 160, 88), 0.3);
}

/* 尊重用户减少动画的偏好设置 - 无障碍访问 */
@media (prefers-reduced-motion: reduce) {
  /* 禁用关闭动画 */
  .modal-closing :deep(.n-card) {
    animation: none;
  }

  /* 禁用所有过渡效果 */
  .modern-modal,
  .modern-modal :deep(*),
  :deep(.n-button),
  :deep(.n-card) {
    transition: none !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }

  /* 保持模态框即时显示，无动画 */
  :deep(.n-modal-mask) {
    transition: opacity 0s !important;
  }

  :deep(.n-card) {
    transition:
      transform 0s,
      opacity 0s !important;
  }

  /* 禁用键盘提示过渡 */
  .kbd-hint {
    transition: none;
  }
}

/* Hide keyboard hints on mobile devices */
@media (max-width: 767px) {
  .kbd-hint {
    display: none;
  }
}
</style>
