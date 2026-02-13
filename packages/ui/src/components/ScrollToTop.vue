<template>
  <Teleport to="body" :disabled="!teleport">
    <Transition name="scroll-to-top">
      <NButton
        v-show="isVisible"
        @click="scrollToTop"
        size="small"
        circle
        secondary
        class="scroll-to-top-btn"
        :class="{ 'is-fixed': !container, 'is-absolute': !!container }"
        :aria-label="t('common.scrollToTop')"
        :title="t('common.scrollToTop')"
      >
        <template #icon>
          <NIcon class="scroll-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 19V5" />
              <path d="M5 12l7-7 7 7" />
            </svg>
          </NIcon>
        </template>
      </NButton>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { NButton, NIcon } from 'naive-ui'

const { t } = useI18n()

interface Props {
  /** The scrollable container element or selector */
  container?: string | HTMLElement
  /** Threshold in pixels before showing the button (default: 200) */
  threshold?: number
  /** Smooth scroll behavior (default: true) */
  smooth?: boolean
  /** Teleport to body (default: true) - disable for modal containers */
  teleport?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  threshold: 200,
  smooth: true,
  teleport: true,
})

const isVisible = ref(false)
let scrollContainer: HTMLElement | Window = window

/**
 * Get the scrollable container element
 */
const getScrollContainer = (): HTMLElement | Window => {
  if (!props.container) return window
  
  if (typeof props.container === 'string') {
    const element = document.querySelector(props.container) as HTMLElement
    return element || window
  }
  
  return props.container
}

/**
 * Get current scroll position
 */
const getScrollPosition = (): number => {
  if (scrollContainer === window) {
    return window.scrollY || document.documentElement.scrollTop
  }
  return (scrollContainer as HTMLElement).scrollTop
}

/**
 * Check scroll position and toggle visibility
 */
const handleScroll = () => {
  const scrollPosition = getScrollPosition()
  isVisible.value = scrollPosition > props.threshold
}

/**
 * Scroll to top with optional smooth behavior
 */
const scrollToTop = () => {
  const behavior = props.smooth ? 'smooth' : 'auto'
  
  if (scrollContainer === window) {
    window.scrollTo({ top: 0, behavior })
  } else {
    (scrollContainer as HTMLElement).scrollTo({ top: 0, behavior })
  }
}

/**
 * Initialize scroll listener
 */
const initScrollListener = () => {
  scrollContainer = getScrollContainer()
  scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
  // Check initial position
  handleScroll()
}

/**
 * Cleanup scroll listener
 */
const cleanupScrollListener = () => {
  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', handleScroll)
  }
}

onMounted(() => {
  // Delay initialization to ensure DOM is ready
  setTimeout(initScrollListener, 100)
})

onUnmounted(() => {
  cleanupScrollListener()
})
</script>

<style scoped>
/* 🎨 Palette: Scroll-to-top button with micro-animations */
.scroll-to-top-btn {
  z-index: 100;
  width: 44px;
  height: 44px;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Fixed positioning for window scroll */
.scroll-to-top-btn.is-fixed {
  position: fixed;
  bottom: 24px;
  right: 24px;
}

/* Absolute positioning for container scroll */
.scroll-to-top-btn.is-absolute {
  position: absolute;
  bottom: 16px;
  right: 16px;
}

.scroll-to-top-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.2),
    0 4px 8px rgba(0, 0, 0, 0.15);
}

.scroll-to-top-btn:active {
  transform: translateY(0) scale(0.95);
}

/* Icon animation on hover */
.scroll-icon {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.scroll-to-top-btn:hover .scroll-icon {
  animation: bounce-up 0.6s ease infinite;
}

@keyframes bounce-up {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

/* Transition animations */
.scroll-to-top-enter-active,
.scroll-to-top-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.scroll-to-top-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

.scroll-to-top-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.9);
}

.scroll-to-top-enter-to,
.scroll-to-top-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Focus visible styles for accessibility */
.scroll-to-top-btn:focus-visible {
  outline: none;
  box-shadow: 
    0 0 0 3px rgba(var(--n-primary-color-rgb, 24, 160, 88), 0.3),
    0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Dark mode adjustments */
.dark .scroll-to-top-btn {
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.3);
}

.dark .scroll-to-top-btn:hover {
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.5),
    0 4px 8px rgba(0, 0, 0, 0.4);
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .scroll-to-top-btn {
    bottom: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
  }
}

/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  .scroll-to-top-btn {
    transition: opacity 0.2s ease;
  }
  
  .scroll-to-top-btn:hover {
    transform: none;
  }
  
  .scroll-icon {
    transition: none;
  }
  
  .scroll-to-top-btn:hover .scroll-icon {
    animation: none;
  }
  
  .scroll-to-top-enter-active,
  .scroll-to-top-leave-active {
    transition: opacity 0.2s ease;
  }
  
  .scroll-to-top-enter-from,
  .scroll-to-top-leave-to {
    transform: none;
  }
}
</style>
