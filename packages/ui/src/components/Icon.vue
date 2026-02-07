<!-- 简化的Icon组件，用于显示常用图标 -->
<template>
  <!-- Refresh Icon with optional spin animation -->
  <svg
    v-if="name === 'refresh'"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    :class="[size, { 'animate-spin': spinning }]"
    :aria-label="ariaLabel || t('icon.refresh')"
    role="img"
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
    <path d="M21 3v5h-5"/>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
    <path d="M3 21v-5h5"/>
  </svg>

  <!-- Check Icon -->
  <svg
    v-else-if="name === 'check'"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    :class="size"
    :aria-label="ariaLabel || t('icon.check')"
    role="img"
  >
    <path d="M20 6L9 17l-5-5"/>
  </svg>

  <!-- Copy Icon -->
  <svg
    v-else-if="name === 'copy'"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    :class="size"
    :aria-label="ariaLabel || t('icon.copy')"
    role="img"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>

  <!-- Edit Icon -->
  <svg
    v-else-if="name === 'edit'"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    :class="size"
    :aria-label="ariaLabel || t('icon.edit')"
    role="img"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>

  <!-- Delete Icon -->
  <svg
    v-else-if="name === 'delete'"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    :class="size"
    :aria-label="ariaLabel || t('icon.delete')"
    role="img"
  >
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>

  <!-- Loading Icon (spinner) -->
  <svg
    v-else-if="name === 'loading' || name === 'spinner'"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    :class="[size, 'animate-spin']"
    :aria-label="ariaLabel || t('icon.loading')"
    role="img"
  >
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>

  <!-- Fallback: display emoji/icon text -->
  <span v-else :class="size" role="img" :aria-label="ariaLabel">{{ name }}</span>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  name: string
  size?: string
  spinning?: boolean
  ariaLabel?: string
}

withDefaults(defineProps<Props>(), {
  size: 'w-4 h-4',
  spinning: false,
  ariaLabel: ''
})
</script>

<style scoped>
.w-4 {
  width: 1rem;
}

.h-4 {
  height: 1rem;
}

.w-5 {
  width: 1.25rem;
}

.h-5 {
  height: 1.25rem;
}

.w-6 {
  width: 1.5rem;
}

.h-6 {
  height: 1.5rem;
}

/* Spin animation for loading/refresh states */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Smooth transition for hover states */
svg {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

/* Hover effect for interactive icons */
svg:hover {
  opacity: 0.8;
  transform: scale(1.1);
}

/* Active state for click feedback */
svg:active {
  transform: scale(0.95);
}
</style>