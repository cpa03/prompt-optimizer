<template>
  <NCard
    class="panel-card h-full"
    :class="{ 'panel-card--loading': loading }"
    :bordered="false"
    size="small"
    :role="title ? 'region' : undefined"
    :aria-label="title || undefined"
  >
    <!-- Loading overlay with shimmer effect -->
    <Transition name="fade">
      <div v-if="loading" class="loading-overlay" aria-hidden="true">
        <div class="shimmer-container">
          <div class="shimmer-line shimmer-line--title"></div>
          <div class="shimmer-line shimmer-line--long"></div>
          <div class="shimmer-line shimmer-line--medium"></div>
        </div>
      </div>
    </Transition>

    <!-- Title section -->
    <div v-if="title" class="panel-title">
      {{ title }}
    </div>

    <div class="p-3 sm:p-4 space-y-3 sm:space-y-4 flex flex-col flex-1">
      <slot></slot>
    </div>
  </NCard>
</template>

<script setup lang="ts">
import { NCard } from 'naive-ui'

interface Props {
  title?: string
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '',
  loading: false,
})
</script>

<style scoped>
.panel-card {
  transition:
    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.panel-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.panel-card:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.panel-card:focus-within {
  outline: none;
  box-shadow:
    0 0 0 3px rgba(var(--n-primary-color-rgb, 24, 160, 88), 0.25),
    0 4px 12px rgba(0, 0, 0, 0.08);
}

.panel-card--loading {
  pointer-events: none;
}

.panel-title {
  font-size: 14px;
  font-weight: 500;
  padding: 12px 16px 0;
  color: var(--n-text-color-1);
  border-bottom: 1px solid var(--n-border-color);
  margin-bottom: 8px;
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
  padding: 24px;
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
  height: 16px;
  width: 50%;
}

.shimmer-line--long {
  width: 100%;
  animation-delay: 0.1s;
}

.shimmer-line--medium {
  width: 70%;
  animation-delay: 0.2s;
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

.dark .panel-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.dark .panel-card:active {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
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

@media (prefers-reduced-motion: reduce) {
  .panel-card {
    transition: box-shadow 0.15s ease;
  }

  .panel-card:hover,
  .panel-card:active {
    transform: none;
  }

  .shimmer-line {
    animation: none;
    background: var(--n-skeleton-color, rgba(128, 128, 128, 0.12));
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.15s ease;
  }
}

@media (prefers-contrast: high) {
  .panel-card:focus-within {
    outline: 2px solid var(--n-primary-color, #18a058);
    outline-offset: 2px;
    box-shadow: none;
  }

  .shimmer-line {
    background: var(--n-text-color-disabled, #999);
  }
}
</style>
