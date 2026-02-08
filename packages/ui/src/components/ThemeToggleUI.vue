<template>
  <NDropdown
    :options="dropdownOptions"
    @select="handleThemeSelect"
    placement="bottom-end"
    trigger="click"
  >
    <NButton 
      quaternary 
      size="small"
      class="flex items-center justify-center gap-1 theme-toggle-btn"
    >
      <template #icon>
        <div class="theme-icon-wrapper" :class="{ 'is-animating': isAnimating }">
          <component :is="currentThemeIcon" />
        </div>
      </template>
      <span class="text-sm max-md:hidden truncate">{{ currentThemeLabel }}</span>
    </NButton>
  </NDropdown>
</template>
  
<script setup lang="ts">
import { computed, h, ref, watch } from 'vue'

import { useI18n } from 'vue-i18n'
import { NButton, NDropdown, type DropdownOption } from 'naive-ui'
import { useNaiveTheme } from '../composables/ui/useNaiveTheme'
import { SEMANTIC_COLORS } from '../config/constants'

const { t } = useI18n()

// Theme animation duration in ms
const THEME_ANIMATION_DURATION = 400

// Animation state
const isAnimating = ref(false)
const lastThemeId = ref('')

// 使用新的主题系统
const { 
  themeId, 
  availableThemes, 
  changeTheme 
} = useNaiveTheme()

// 创建更美观的SVG图标组件
const createThemeIcon = (themeId: string, isColored: boolean = false) => {
  const baseClass = 'w-4 h-4'
  
  switch (themeId) {
    case 'light':
      return h('svg', {
        class: `${baseClass}`,
        style: isColored ? `color: ${SEMANTIC_COLORS.THEME_LIGHT};` : undefined,
        viewBox: '0 0 24 24',
        fill: 'currentColor'
      }, [
        h('path', { 
          d: 'M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z'
        })
      ])
    
    case 'dark':
      return h('svg', {
        class: `${baseClass}`,
        style: isColored ? `color: ${SEMANTIC_COLORS.THEME_DARK};` : undefined,
        viewBox: '0 0 24 24',
        fill: 'currentColor'
      }, [
        h('path', {
          'fill-rule': 'evenodd',
          d: 'M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z',
          'clip-rule': 'evenodd'
        })
      ])
    
    case 'blue':
      return h('svg', {
        class: `${baseClass}`,
        style: isColored ? `color: ${SEMANTIC_COLORS.THEME_BLUE};` : undefined,
        viewBox: '0 0 24 24',
        fill: 'currentColor'
      }, [
        h('path', {
          d: 'M12 2L13.09 8.26L19 7L14.74 12L19 17L13.09 15.74L12 22L10.91 15.74L5 17L9.26 12L5 7L10.91 8.26L12 2Z'
        })
      ])

    case 'classic':
      return h('svg', {
        class: `${baseClass}`,
        style: isColored ? `color: ${SEMANTIC_COLORS.THEME_CLASSIC};` : undefined,
        viewBox: '0 0 24 24',
        fill: 'currentColor'
      }, [
        h('path', {
          d: 'M12 3a9 9 0 011.8 17.823l-.3.06a1 1 0 01-.202.017H8.5a4.5 4.5 0 01-4.5-4.5v-3.13a1 1 0 01.21-.617l3.2-3.99A5 5 0 0112 3zm-.45 2.028a3 3 0 00-2.07 1.102l-3.2 3.99a2 2 0 00-.29.508V16.4A2.5 2.5 0 008.5 18.9h4.447A7 7 0 0011.55 5.028z'
        })
      ])

    case 'green':
      return h('svg', {
        class: `${baseClass}`,
        style: isColored ? `color: ${SEMANTIC_COLORS.THEME_GREEN};` : undefined,
        viewBox: '0 0 24 24',
        fill: 'currentColor'
      }, [
        h('path', {
          d: 'M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z'
        })
      ])
      
    case 'purple':
      return h('svg', {
        class: `${baseClass}`,
        style: isColored ? `color: ${SEMANTIC_COLORS.THEME_PURPLE};` : undefined,
        viewBox: '0 0 24 24',
        fill: 'currentColor'
      }, [
        h('path', {
          d: 'M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z'
        })
      ])
    
    default:
      return null
  }
}

// 当前主题的图标
const currentThemeIcon = computed(() => createThemeIcon(themeId.value, true))

// 当前主题的标签（使用国际化）
const currentThemeLabel = computed(() => {
  return t(`theme.${themeId.value}`)
})

// 为Naive UI Dropdown创建选项
const dropdownOptions = computed<DropdownOption[]>(() => {
  return availableThemes.map(theme => ({
    key: theme.id,
    label: t(`theme.${theme.id}`),
    icon: () => createThemeIcon(theme.id, true)
  }))
})

// Handle theme selection with animation
const handleThemeSelect = (key: string) => {
  if (key !== themeId.value) {
    lastThemeId.value = themeId.value
    isAnimating.value = true
    changeTheme(key)
    // Reset animation state after animation completes
    setTimeout(() => {
      isAnimating.value = false
    }, THEME_ANIMATION_DURATION)
  }
}

// Also animate when theme changes from other sources
watch(themeId, (newId, oldId) => {
  if (oldId && newId !== oldId && !isAnimating.value) {
    lastThemeId.value = oldId
    isAnimating.value = true
    setTimeout(() => {
      isAnimating.value = false
    }, THEME_ANIMATION_DURATION)
  }
})
</script>

<style scoped>
.theme-toggle-btn {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-toggle-btn:hover {
  transform: translateY(-1px);
}

.theme-toggle-btn:active {
  transform: scale(0.98);
}

.theme-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-icon-wrapper.is-animating {
  animation: theme-spin 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes theme-spin {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.2);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}
</style>
