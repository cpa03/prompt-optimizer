<template>
  <NCard class="panel-card h-full" :bordered="false" size="small">
    <div class="p-3 sm:p-4 space-y-3 sm:space-y-4 flex flex-col flex-1">
      <slot></slot>
    </div>
  </NCard>
</template>

<script setup lang="ts">
import { NCard } from 'naive-ui'
</script>

<style scoped>
/* Subtle hover lift effect for interactive feel */
.panel-card {
  transition:
    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.panel-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Active state for click feedback */
.panel-card:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

/* Focus-visible ring for keyboard navigation accessibility */
.panel-card:focus-within {
  outline: none;
  box-shadow:
    0 0 0 3px rgba(var(--n-primary-color-rgb, 24, 160, 88), 0.25),
    0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Dark mode adjustments */
.dark .panel-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.dark .panel-card:active {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

/* Respect user motion preferences for accessibility */
@media (prefers-reduced-motion: reduce) {
  .panel-card {
    transition: box-shadow 0.15s ease;
  }

  .panel-card:hover {
    transform: none;
  }
}
</style>
