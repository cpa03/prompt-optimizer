<template>
  <NButtonGroup class="image-mode-selector">
    <NButton
      data-testid="image-sub-mode-text2image"
      :type="modelValue === 'text2image' ? 'primary' : 'default'"
      size="small"
      @click="handleModeChange('text2image')"
      :disabled="disabled"
      class="mode-button"
      :class="{
        'mode-active': modelValue === 'text2image',
        'mode-pressed': pressedMode === 'text2image',
      }"
      :aria-pressed="modelValue === 'text2image'"
      :title="t('imageMode.text2image')"
    >
      <template #icon>
        <span
          class="mode-icon"
          :class="{
            'icon-active': modelValue === 'text2image',
            'icon-bounce': animatingMode === 'text2image',
          }"
          >🖼️</span
        >
      </template>
      {{ t('imageMode.text2image') }}
    </NButton>
    <NButton
      data-testid="image-sub-mode-image2image"
      :type="modelValue === 'image2image' ? 'primary' : 'default'"
      size="small"
      @click="handleModeChange('image2image')"
      :disabled="disabled"
      class="mode-button"
      :class="{
        'mode-active': modelValue === 'image2image',
        'mode-pressed': pressedMode === 'image2image',
      }"
      :aria-pressed="modelValue === 'image2image'"
      :title="t('imageMode.image2image')"
    >
      <template #icon>
        <span
          class="mode-icon"
          :class="{
            'icon-active': modelValue === 'image2image',
            'icon-bounce': animatingMode === 'image2image',
          }"
          >📷</span
        >
      </template>
      {{ t('imageMode.image2image') }}
    </NButton>
  </NButtonGroup>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NButtonGroup, NButton } from 'naive-ui'
import { useI18n } from 'vue-i18n'

export type ImageMode = 'text2image' | 'image2image'

interface Props {
  modelValue: ImageMode
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: ImageMode): void
  (e: 'change', value: ImageMode): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<Emits>()
const { t } = useI18n()

// 🎨 Palette: Animation states for delightful micro-interactions
const pressedMode = ref<ImageMode | null>(null)
const animatingMode = ref<ImageMode | null>(null)

let pressTimeout: number | null = null
let animationTimeout: number | null = null

const handleModeChange = (mode: ImageMode) => {
  if (props.disabled || props.modelValue === mode) return

  // 🎨 Set pressed state for tactile feedback
  pressedMode.value = mode

  // Clear previous timeouts
  if (pressTimeout) clearTimeout(pressTimeout)
  if (animationTimeout) clearTimeout(animationTimeout)

  // Release pressed state after 150ms
  pressTimeout = window.setTimeout(() => {
    pressedMode.value = null
  }, 150)

  // Trigger bounce animation on the icon
  animatingMode.value = mode
  animationTimeout = window.setTimeout(() => {
    animatingMode.value = null
  }, 400)

  emit('update:modelValue', mode)
  emit('change', mode)
}
</script>

<style scoped>
.image-mode-selector {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.mode-button {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

/* 🎨 Enhanced hover effects */
.mode-button:not(:disabled):hover {
  transform: translateY(-1px);
}

.mode-button:not(:disabled):hover :deep(.n-button__icon) {
  transform: scale(1.05);
}

/* 🎨 Pressed state - tactile feedback */
.mode-button:not(:disabled):active,
.mode-button.mode-pressed:not(:disabled) {
  transform: scale(0.96) translateY(1px);
  transition: transform 0.1s ease-out;
}

/* 🎨 Focus-visible ring for keyboard navigation */
.mode-button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--n-primary-color-rgb, 24, 160, 88), 0.3);
}

/* 🎨 Active mode styling */
.mode-active {
  font-weight: 500;
}

/* 🎨 Enhanced icon animations */
.mode-icon {
  display: inline-block;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: grayscale(100%);
  opacity: 0.7;
  will-change: transform;
}

/* Active icon - full color with subtle glow */
.icon-active {
  transform: scale(1.1);
  filter: grayscale(0%);
  opacity: 1;
}

/* 🎨 Bounce animation on selection */
.icon-bounce {
  animation: icon-bounce 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes icon-bounce {
  0% {
    transform: scale(1.1);
  }
  40% {
    transform: scale(1.3) rotate(-5deg);
  }
  60% {
    transform: scale(1.2) rotate(3deg);
  }
  80% {
    transform: scale(1.15) rotate(-2deg);
  }
  100% {
    transform: scale(1.1) rotate(0deg);
  }
}

/* 🎨 Hover effect for icons */
.mode-button:hover .mode-icon:not(.icon-active) {
  filter: grayscale(50%);
  opacity: 0.85;
  transform: scale(1.05);
}

/* 🎨 Disabled state with improved visual feedback */
.mode-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.mode-button:disabled .mode-icon {
  transform: none !important;
  filter: grayscale(100%) !important;
}

/* 🎨 Ripple effect on click */
.mode-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(var(--n-primary-color-rgb, 24, 160, 88), 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition:
    width 0.4s ease-out,
    height 0.4s ease-out,
    opacity 0.4s ease-out;
  opacity: 0;
  pointer-events: none;
}

.mode-button.mode-pressed::after {
  width: 150%;
  height: 300%;
  opacity: 1;
  transition:
    width 0.2s ease-out,
    height 0.2s ease-out,
    opacity 0.2s ease-out;
}

/* 🎨 Respect user motion preferences for accessibility */
@media (prefers-reduced-motion: reduce) {
  .image-mode-selector,
  .mode-button,
  .mode-icon {
    transition: none !important;
    animation: none !important;
  }

  .mode-button:not(:disabled):hover,
  .mode-button:not(:disabled):active,
  .mode-button.mode-pressed:not(:disabled) {
    transform: none;
  }

  .icon-bounce {
    animation: none;
  }

  .mode-button::after {
    display: none;
  }
}
</style>
