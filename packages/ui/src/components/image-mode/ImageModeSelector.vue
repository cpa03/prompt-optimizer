<template>
  <NButtonGroup class="image-mode-selector">
    <NButton
      data-testid="image-sub-mode-text2image"
      :type="modelValue === 'text2image' ? 'primary' : 'default'"
      size="small"
      @click="handleModeChange('text2image')"
      :disabled="disabled"
      class="mode-button"
      :class="{ 'mode-active': modelValue === 'text2image' }"
    >
      <template #icon>
        <span class="mode-icon" :class="{ 'icon-active': modelValue === 'text2image' }">🖼️</span>
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
      :class="{ 'mode-active': modelValue === 'image2image' }"
    >
      <template #icon>
        <span class="mode-icon" :class="{ 'icon-active': modelValue === 'image2image' }">📷</span>
      </template>
      {{ t('imageMode.image2image') }}
    </NButton>
  </NButtonGroup>
</template>

<script setup lang="ts">
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
  disabled: false
})

const emit = defineEmits<Emits>()
const { t } = useI18n()

const handleModeChange = (mode: ImageMode) => {
  if (props.disabled || props.modelValue === mode) return

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
}

.mode-button:not(:disabled):hover {
  transform: translateY(-1px);
}

.mode-button:not(:disabled):active {
  transform: scale(0.98) translateY(0);
}

.mode-active {
  font-weight: 500;
}

.mode-icon {
  display: inline-block;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: grayscale(100%);
  opacity: 0.7;
}

.icon-active {
  transform: scale(1.1);
  filter: grayscale(0%);
  opacity: 1;
}

.mode-button:hover .mode-icon {
  transform: scale(1.05);
}

/* Disabled state */
.mode-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>