<template>
  <NCard 
    class="content-card h-full max-height: 100%" 
    :class="{ 
      'content-card--loading': loading,
      'content-card--empty': isEmpty,
      'content-card--error': hasError 
    }"
    :bordered="false" 
    size="small"
    content-style="max-height: 100%"
  >
    <!-- Loading State -->
    <template v-if="loading">
      <div class="content-card__loading" role="status" aria-live="polite">
        <div class="skeleton-loader">
          <div class="skeleton skeleton--title"></div>
          <div class="skeleton skeleton--line"></div>
          <div class="skeleton skeleton--line" style="width: 80%"></div>
          <div class="skeleton skeleton--line" style="width: 60%"></div>
        </div>
        <span class="sr-only">{{ loadingText || t('common.loading', 'Loading...') }}</span>
      </div>
    </template>

    <!-- Error State -->
    <template v-else-if="hasError">
      <div class="content-card__error" role="alert" aria-live="assertive">
        <div class="error-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p class="error-message">{{ errorMessage || t('common.error', 'Something went wrong') }}</p>
        <NButton v-if="showRetry" size="small" @click="handleRetry">
          {{ retryText || t('common.retry', 'Retry') }}
        </NButton>
      </div>
    </template>

    <!-- Empty State -->
    <template v-else-if="isEmpty">
      <div class="content-card__empty" role="status" aria-live="polite">
        <div class="empty-icon" aria-hidden="true">
          <slot name="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </slot>
        </div>
        <p class="empty-title">{{ emptyTitle || t('common.empty', 'No content') }}</p>
        <p v-if="emptyDescription" class="empty-description">{{ emptyDescription }}</p>
        <slot name="empty-action"></slot>
      </div>
    </template>

    <!-- Content State -->
    <NSpace 
      v-else
      vertical 
      :size="SPACING.LG"
      style="height: 100%; max-height: 100%"
    >
      <slot></slot>
    </NSpace>
  </NCard>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { useI18n } from 'vue-i18n'
import { NCard, NSpace, NButton } from 'naive-ui'
import { SPACING } from '../config/constants'

const { t } = useI18n()
const slots = useSlots()

interface Props {
  /** Whether the card is in loading state */
  loading?: boolean
  /** Custom loading text for screen readers */
  loadingText?: string
  /** Whether the card has an error */
  error?: boolean
  /** Error message to display */
  errorMessage?: string
  /** Whether to show retry button */
  showRetry?: boolean
  /** Text for retry button */
  retryText?: string
  /** Whether the content is empty */
  empty?: boolean
  /** Title for empty state */
  emptyTitle?: string
  /** Description for empty state */
  emptyDescription?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  loadingText: '',
  error: false,
  errorMessage: '',
  showRetry: false,
  retryText: '',
  empty: false,
  emptyTitle: '',
  emptyDescription: ''
})

const emit = defineEmits<{
  'retry': []
}>()

const hasError = computed(() => props.error)
const isEmpty = computed(() => props.empty || !slots.default)

const handleRetry = () => {
  emit('retry')
}
</script>

<style scoped>
.content-card {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.content-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

/* Loading State Styles */
.content-card__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 120px;
  padding: 24px;
}

.skeleton-loader {
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton {
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.06) 25%,
    rgba(0, 0, 0, 0.1) 50%,
    rgba(0, 0, 0, 0.06) 75%
  );
  background-size: 200% 100%;
  border-radius: 4px;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton--title {
  height: 20px;
  width: 60%;
  margin-bottom: 8px;
}

.skeleton--line {
  height: 12px;
  width: 100%;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Empty State Styles */
.content-card__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 150px;
  padding: 32px 24px;
  text-align: center;
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  color: var(--n-text-color-disabled, #ccc);
  opacity: 0.6;
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--n-text-color-base, #333);
  margin: 0 0 4px 0;
}

.empty-description {
  font-size: 13px;
  color: var(--n-text-color-disabled, #999);
  margin: 0;
  max-width: 280px;
}

/* Error State Styles */
.content-card__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 150px;
  padding: 32px 24px;
  text-align: center;
}

.error-icon {
  width: 40px;
  height: 40px;
  margin-bottom: 12px;
  color: var(--n-error-color, #d03050);
}

.error-icon svg {
  width: 100%;
  height: 100%;
}

.error-message {
  font-size: 14px;
  color: var(--n-text-color-base, #333);
  margin: 0 0 16px 0;
  max-width: 280px;
}

/* Screen reader only text */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Dark mode adjustments */
.dark .skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.06) 25%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.06) 75%
  );
  background-size: 200% 100%;
}

.dark .empty-icon {
  color: var(--n-text-color-disabled, #666);
}

/* Reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .content-card {
    transition: none;
  }
  
  .content-card:hover {
    transform: none;
  }
  
  .skeleton {
    animation: none;
    background: rgba(0, 0, 0, 0.08);
  }
  
  .dark .skeleton {
    background: rgba(255, 255, 255, 0.08);
  }
}
</style>