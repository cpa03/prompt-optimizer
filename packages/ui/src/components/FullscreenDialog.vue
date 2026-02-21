<!--
  🎨 Palette: FullscreenDialog Component
  Enhanced with micro-UX improvements for better user experience:
  - Smooth entrance/exit animations
  - Keyboard navigation support
  - Focus-visible states for accessibility
  - Loading state with shimmer effect
  - Reduced motion support for accessibility
-->
<template>
  <NModal
    v-model:show="localVisible"
    preset="card"
    :title="title"
    size="huge"
    :segmented="{ content: true }"
    class="fullscreen-dialog"
    :class="{ 'is-closing': isClosing, 'is-loading': loading }"
    style="width: 90vw; height: 90vh; max-width: 90vw; max-height: 90vh"
    :mask-closable="maskClosable"
    transform-origin="center"
    content-style="height: 100%; display: flex; flex-direction: column; min-height: 0;"
    :trap-focus="true"
    :auto-focus="autoFocus"
    :block-scroll="true"
    :close-on-esc="closeOnEsc"
    role="dialog"
    aria-modal="true"
    :aria-label="title || t('common.dialog')"
    :aria-describedby="description ? 'fullscreen-dialog-description' : undefined"
    @after-leave="handleAfterLeave"
    @keydown="handleKeyDown"
  >
    <!-- Screen reader description -->
    <p v-if="description" id="fullscreen-dialog-description" class="sr-only">
      {{ description }}
    </p>

    <!-- Loading overlay with shimmer effect -->
    <Transition name="fade">
      <div v-if="loading" class="loading-overlay" aria-hidden="true">
        <div class="shimmer-container">
          <div class="shimmer-line shimmer-line--title"></div>
          <div class="shimmer-line shimmer-line--long"></div>
          <div class="shimmer-line shimmer-line--medium"></div>
          <div class="shimmer-line shimmer-line--short"></div>
        </div>
      </div>
    </Transition>

    <NFlex vertical style="height: 100%; min-height: 0; overflow: auto">
      <slot></slot>
    </NFlex>
  </NModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { NModal, NFlex } from 'naive-ui'
import { TIME_CONSTANTS, SPACING } from '../config/constants'

const { t } = useI18n()

interface Props {
  modelValue: boolean
  title?: string
  description?: string
  loading?: boolean
  maskClosable?: boolean
  autoFocus?: boolean
  closeOnEsc?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
  loading: false,
  maskClosable: true,
  autoFocus: true,
  closeOnEsc: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'after-leave': []
}>()

const localVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const isClosing = ref(false)

watch(localVisible, (newVal) => {
  if (!newVal) {
    isClosing.value = true
    setTimeout(() => {
      isClosing.value = false
    }, TIME_CONSTANTS.ANIMATION_DURATION_MS)
  }
})

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.closeOnEsc && localVisible.value) {
    event.preventDefault()
    isClosing.value = true
    setTimeout(() => {
      localVisible.value = false
      isClosing.value = false
    }, TIME_CONSTANTS.PRESS_FEEDBACK_MS)
  }
}

const handleAfterLeave = () => {
  emit('after-leave')
}
</script>

<style scoped>
.fullscreen-dialog {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fullscreen-dialog.is-closing :deep(.n-card) {
  animation: dialog-close-scale 0.2s ease-out forwards;
}

@keyframes dialog-close-scale {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.96);
    opacity: 0.85;
  }
}

.screen-reader-only,
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

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--n-card-color, #fff);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: v-bind('SPACING.XXL + "px"');
}

.shimmer-container {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shimmer-line {
  height: 12px;
  background: linear-gradient(
    90deg,
    var(--n-skeleton-color, rgba(128, 128, 128, 0.12)) 0%,
    var(--n-skeleton-color-highlight, rgba(128, 128, 128, 0.2)) 50%,
    var(--n-skeleton-color, rgba(128, 128, 128, 0.12)) 100%
  );
  background-size: 200% 100%;
  border-radius: 6px;
  animation: shimmer 1.5s ease-in-out infinite;
}

.shimmer-line--title {
  height: 20px;
  width: 60%;
  margin-bottom: 8px;
}

.shimmer-line--long {
  width: 100%;
  animation-delay: 0.1s;
}

.shimmer-line--medium {
  width: 75%;
  animation-delay: 0.2s;
}

.shimmer-line--short {
  width: 40%;
  animation-delay: 0.3s;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

:deep(.n-card) {
  transition:
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.n-card:hover) {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

:deep(.n-button):focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--n-primary-color-rgb, 24, 160, 88), 0.3);
}

.dark .loading-overlay {
  background: var(--n-card-color, #1a1a1a);
}

.dark .shimmer-line {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.08) 0%,
    rgba(255, 255, 255, 0.12) 50%,
    rgba(255, 255, 255, 0.08) 100%
  );
  background-size: 200% 100%;
}

.dark :deep(.n-card:hover) {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
}

@media (prefers-reduced-motion: reduce) {
  .fullscreen-dialog,
  .fullscreen-dialog :deep(.n-card),
  .shimmer-line {
    transition: none !important;
    animation: none !important;
  }

  .fullscreen-dialog.is-closing :deep(.n-card) {
    animation: none;
  }

  .shimmer-line {
    background: var(--n-skeleton-color, rgba(128, 128, 128, 0.12));
  }
}

@media (prefers-contrast: high) {
  :deep(.n-button):focus-visible {
    outline: 2px solid var(--n-primary-color, #18a058);
    outline-offset: 2px;
    box-shadow: none;
  }

  .shimmer-line {
    background: var(--n-text-color-disabled, #999);
  }
}
</style>
