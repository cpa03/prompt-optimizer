<!--
  🎨 Palette: ContentCard Component
  Enhanced with micro-UX improvements for better user experience:
  - Subtle hover lift effect for interactivity
  - Smooth transitions for state changes
  - Focus ring for keyboard navigation
  - Loading state shimmer animation
  - Empty state guidance
  - Accessibility improvements
-->
<template>
  <NCard 
    class="content-card h-full" 
    :class="{ 
      'content-card--loading': loading,
      'content-card--interactive': interactive,
      'content-card--empty': isEmpty,
      'content-card--hovered': isHovered
    }"
    :bordered="false" 
    size="small"
    content-style="max-height: 100%"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
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

    <!-- Empty state with guidance -->
    <Transition name="fade-scale">
      <div v-if="isEmpty && !loading" class="empty-state">
        <NIcon :size="ICON_SIZES.XL" class="empty-icon">
          <component :is="emptyIcon || BoxIcon" />
        </NIcon>
        <NText class="empty-title">{{ emptyTitle || t('common.empty') }}</NText>
        <NText class="empty-hint" depth="3">{{ emptyHint || t('common.emptyHint') }}</NText>
      </div>
    </Transition>

    <!-- Main content -->
    <NSpace 
      v-show="!isEmpty || loading"
      vertical 
      :size="SPACING.LG"
      style="height: 100%; max-height: 100%"
    >
      <slot></slot>
    </NSpace>
  </NCard>
</template>

<script setup lang="ts">
import { computed, ref, useSlots, h, type Component } from 'vue'
import { useI18n } from 'vue-i18n'
import { NCard, NSpace, NIcon, NText } from 'naive-ui'
import { SPACING, ICON_SIZES, ANIMATION_CONSTANTS } from '../config/constants'

const { t } = useI18n()

// Simple box icon for empty state
const BoxIcon = {
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': 1.5,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    }, [
      h('path', { d: 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z' }),
      h('path', { d: 'm3.3 7 8.7 5 8.7-5' }),
      h('path', { d: 'M12 22V12' }),
    ])
  }
}

interface Props {
  /** Loading state with shimmer animation */
  loading?: boolean
  /** Enable hover effects and cursor pointer */
  interactive?: boolean
  /** Custom empty state icon component */
  emptyIcon?: Component
  /** Empty state title text */
  emptyTitle?: string
  /** Empty state hint text */
  emptyHint?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  interactive: false,
  emptyIcon: null,
  emptyTitle: '',
  emptyHint: ''
})

const slots = useSlots()
const isHovered = ref(false)

// Animation constants for CSS v-bind
const animDurationNormal = ANIMATION_CONSTANTS.ANIMATION_DURATION_NORMAL_S
const animDelayFast = ANIMATION_CONSTANTS.ANIMATION_DELAY_FAST
const animDelayNormal = ANIMATION_CONSTANTS.ANIMATION_DELAY_NORMAL
const animDelaySlow = ANIMATION_CONSTANTS.ANIMATION_DELAY_SLOW
const transitionDurationMs = ANIMATION_CONSTANTS.TRANSITION_DURATION_MS + 'ms'
const hoverTransitionMs = ANIMATION_CONSTANTS.HOVER_TRANSITION_MS + 'ms'
const feedbackAnimationMs = ANIMATION_CONSTANTS.FEEDBACK_ANIMATION_MS + 'ms'

// Check if slot content is empty
const isEmpty = computed(() => {
  if (props.loading) return false
  const defaultSlot = slots.default?.()
  if (!defaultSlot) return true
  // Check if slot has any content
  return defaultSlot.length === 0 || 
    (defaultSlot.length === 1 && !defaultSlot[0].children && !defaultSlot[0].type)
})

// Handle hover states for interactive mode
const handleMouseEnter = () => {
  if (props.interactive) {
    isHovered.value = true
  }
}

const handleMouseLeave = () => {
  isHovered.value = false
}
</script>

<style scoped>
/* 🎨 Palette: Base card styles with smooth transitions */
.content-card {
  transition:
    transform v-bind('feedbackAnimationMs') cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow v-bind('feedbackAnimationMs') cubic-bezier(0.4, 0, 0.2, 1),
    border-color v-bind('hoverTransitionMs') ease;
  position: relative;
  overflow: hidden;
}

/* 🎨 Palette: Interactive hover effects */
.content-card.content-card--interactive {
  cursor: pointer;
}

.content-card.content-card--interactive:hover,
.content-card.content-card--hovered {
  transform: translateY(-2px);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 2px 4px rgba(0, 0, 0, 0.04);
}

.content-card.content-card--interactive:active {
  transform: translateY(0) scale(0.995);
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.06),
    0 1px 2px rgba(0, 0, 0, 0.04);
  transition-duration: v-bind('transitionDurationMs');
}

/* 🎨 Palette: Focus ring for keyboard navigation */
.content-card:focus-within {
  outline: none;
  box-shadow: 
    0 0 0 3px rgba(var(--n-primary-color-rgb, 24, 160, 88), 0.25),
    0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 🎨 Palette: Loading shimmer effect */
.content-card.content-card--loading {
  pointer-events: none;
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
  animation: shimmer v-bind('animDurationNormal') ease-in-out infinite;
}

.shimmer-line--title {
  height: 20px;
  width: 60%;
  margin-bottom: 8px;
}

.shimmer-line--long {
  width: 100%;
  animation-delay: v-bind('animDelayFast');
}

.shimmer-line--medium {
  width: 75%;
  animation-delay: v-bind('animDelayNormal');
}

.shimmer-line--short {
  width: 40%;
  animation-delay: v-bind('animDelaySlow');
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 🎨 Palette: Empty state with animations */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
  padding: 32px 24px;
  text-align: center;
}

.empty-icon {
  color: var(--n-text-color-disabled, #ccc);
  margin-bottom: 16px;
  animation: emptyFloat 3s ease-in-out infinite;
}

.empty-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--n-text-color-2, #666);
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 13px;
  max-width: 280px;
  line-height: 1.5;
}

@keyframes emptyFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

/* 🎨 Palette: Transition animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-scale-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-scale-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

/* 🎨 Palette: Dark mode adjustments */
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

.dark .content-card.content-card--interactive:hover,
.dark .content-card.content-card--hovered {
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.2),
    0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 🎨 Palette: Reduced motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .content-card {
    transition: box-shadow 0.2s ease, border-color 0.2s ease;
  }
  
  .content-card.content-card--interactive:hover,
  .content-card.content-card--hovered {
    transform: none;
  }
  
  .content-card.content-card--interactive:active {
    transform: scale(0.99);
  }
  
  .shimmer-line {
    animation: none;
    background: var(--n-skeleton-color, rgba(128, 128, 128, 0.12));
  }
  
  .empty-icon {
    animation: none;
  }
  
  .fade-enter-active,
  .fade-leave-active,
  .fade-scale-enter-active,
  .fade-scale-leave-active {
    transition: opacity 0.15s ease;
  }
  
  .fade-scale-enter-from {
    transform: none;
  }
}

/* 🎨 Palette: High contrast mode support */
@media (prefers-contrast: high) {
  .content-card:focus-within {
    outline: 2px solid var(--n-primary-color, #18a058);
    outline-offset: 2px;
    box-shadow: none;
  }
  
  .shimmer-line {
    background: var(--n-text-color-disabled, #999);
  }
}
</style>
