import { ref, computed, onMounted, onUnmounted } from 'vue'

import type { ResponsiveConfig } from '../../types/components'
import { BREAKPOINTS, SPACING, TIME_CONSTANTS } from '../../config/constants'

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const GRID_CONFIG_MAP: Record<Breakpoint, { cols: number; xGap: number; yGap: number }> = {
  xs: { cols: 1, xGap: SPACING.SM, yGap: SPACING.SM },
  sm: { cols: 1, xGap: SPACING.MD, yGap: SPACING.MD },
  md: { cols: 2, xGap: SPACING.LG, yGap: SPACING.LG },
  lg: { cols: 2, xGap: SPACING.XL, yGap: SPACING.XL },
  xl: { cols: 3, xGap: SPACING.XXL, yGap: SPACING.XXL },
}

const SPACE_SIZE_MAP: Record<Breakpoint, 'small' | 'medium' | 'large'> = {
  xs: 'small',
  sm: 'small',
  md: 'medium',
  lg: 'medium',
  xl: 'large',
}

const BUTTON_SIZE_MAP: Record<Breakpoint, 'small' | 'medium'> = {
  xs: 'small',
  sm: 'small',
  md: 'medium',
  lg: 'medium',
  xl: 'medium',
}

const INPUT_SIZE_MAP: Record<Breakpoint, 'small' | 'medium'> = {
  xs: 'small',
  sm: 'medium',
  md: 'medium',
  lg: 'medium',
  xl: 'medium',
}

const MODAL_WIDTH_MAP: Record<Breakpoint, string> = {
  xs: '95vw',
  sm: '90vw',
  md: '80vw',
  lg: '70vw',
  xl: '60vw',
}

const CARD_PADDING_MAP: Record<Breakpoint, string> = {
  xs: '12px',
  sm: '16px',
  md: '20px',
  lg: '20px',
  xl: '20px',
}

const FONT_SIZE_MAP: Record<Breakpoint, { small: string; medium: string; large: string }> = {
  xs: { small: '12px', medium: '14px', large: '16px' },
  sm: { small: '13px', medium: '15px', large: '17px' },
  md: { small: '14px', medium: '16px', large: '18px' },
  lg: { small: '14px', medium: '16px', large: '18px' },
  xl: { small: '14px', medium: '16px', large: '18px' },
}

/**
 * 响应式布局 Composable
 * 提供断点检测和响应式配置
 * Flexy loves modularity! All breakpoints and spacing use centralized constants
 */
export function useResponsive() {
  const windowWidth = ref(window.innerWidth)

  const breakpoints = {
    xs: 0,
    sm: BREAKPOINTS.MOBILE,
    md: BREAKPOINTS.TABLET,
    lg: BREAKPOINTS.DESKTOP,
    xl: BREAKPOINTS.LARGE,
  }

  let resizeTimeoutId: number | null = null

  const updateWidth = () => {
    windowWidth.value = window.innerWidth
  }

  const debouncedUpdateWidth = () => {
    if (resizeTimeoutId !== null) {
      clearTimeout(resizeTimeoutId)
    }
    resizeTimeoutId = window.setTimeout(() => {
      updateWidth()
      resizeTimeoutId = null
    }, TIME_CONSTANTS.DEFAULT_DEBOUNCE_MS)
  }

  const currentBreakpoint = computed((): Breakpoint => {
    const width = windowWidth.value
    if (width >= breakpoints.xl) return 'xl'
    if (width >= breakpoints.lg) return 'lg'
    if (width >= breakpoints.md) return 'md'
    if (width >= breakpoints.sm) return 'sm'
    return 'xs'
  })

  const isMobile = computed(() => currentBreakpoint.value === 'xs')
  const isTablet = computed(() => currentBreakpoint.value === 'sm')
  const isDesktop = computed(() => ['md', 'lg', 'xl'].includes(currentBreakpoint.value))

  const responsiveConfig = computed(
    (): ResponsiveConfig => ({
      breakpoints,
      currentBreakpoint: currentBreakpoint.value,
      isMobile: isMobile.value,
      isTablet: isTablet.value,
      isDesktop: isDesktop.value,
    })
  )

  const gridConfig = computed(() => GRID_CONFIG_MAP[currentBreakpoint.value])
  const spaceSize = computed(() => SPACE_SIZE_MAP[currentBreakpoint.value])
  const buttonSize = computed(() => BUTTON_SIZE_MAP[currentBreakpoint.value])
  const inputSize = computed(() => INPUT_SIZE_MAP[currentBreakpoint.value])
  const modalWidth = computed(() => MODAL_WIDTH_MAP[currentBreakpoint.value])
  const cardPadding = computed(() => CARD_PADDING_MAP[currentBreakpoint.value])
  const fontSize = computed(() => FONT_SIZE_MAP[currentBreakpoint.value])
  const shouldUseVerticalLayout = computed(() => isMobile.value || isTablet.value)
  const shouldUseCompactMode = computed(() => isMobile.value)

  onMounted(() => {
    window.addEventListener('resize', debouncedUpdateWidth)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', debouncedUpdateWidth)
    if (resizeTimeoutId !== null) {
      clearTimeout(resizeTimeoutId)
    }
  })

  return {
    windowWidth,
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    responsiveConfig,
    gridConfig,
    spaceSize,
    buttonSize,
    inputSize,
    modalWidth,
    cardPadding,
    fontSize,
    shouldUseVerticalLayout,
    shouldUseCompactMode,
    breakpoints,
  }
}
