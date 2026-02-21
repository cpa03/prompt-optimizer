// Naive UI 主题管理 Composable
import { computed } from 'vue'

import {
  currentThemeId,
  currentThemeConfig,
  currentNaiveTheme,
  currentThemeOverrides,
  availableThemes,
  switchTheme,
  initializeNaiveTheme,
  isDarkTheme,
  getCurrentThemeId,
  getThemeConfig,
} from '../../config/naive-theme'

/**
 * Naive UI 主题管理 Composable
 * 提供统一的主题管理接口
 */
export function useNaiveTheme() {
  const isLightTheme = computed(() => currentThemeId.value === 'light')
  const isDarkThemeActive = computed(() => currentThemeId.value === 'dark')
  const isBlueTheme = computed(() => currentThemeId.value === 'blue')
  const isGreenTheme = computed(() => currentThemeId.value === 'green')
  const isPurpleTheme = computed(() => currentThemeId.value === 'purple')

  const currentThemeName = computed(() => currentThemeConfig.value.name)

  // 主题切换函数
  const changeTheme = (newThemeId: string): boolean => {
    return switchTheme(newThemeId)
  }

  // 获取下一个主题（用于循环切换）
  const getNextThemeId = (): string => {
    const themeIds = availableThemes.map((t) => t.id)
    const currentIndex = themeIds.indexOf(currentThemeId.value)
    const nextIndex = (currentIndex + 1) % themeIds.length
    return themeIds[nextIndex]
  }

  // 循环切换到下一个主题
  const switchToNextTheme = (): boolean => {
    const nextThemeId = getNextThemeId()
    return changeTheme(nextThemeId)
  }

  // 切换到特定类型的主题
  const switchToLightTheme = () => changeTheme('light')
  const switchToDarkTheme = () => changeTheme('dark')
  const switchToBlueTheme = () => changeTheme('blue')
  const switchToGreenTheme = () => changeTheme('green')
  const switchToPurpleTheme = () => changeTheme('purple')

  // 初始化主题
  const initTheme = () => {
    initializeNaiveTheme()
  }

  return {
    // 响应式状态 - return original refs directly to avoid unnecessary computed wrappers
    themeId: currentThemeId,
    themeConfig: currentThemeConfig,
    naiveTheme: currentNaiveTheme,
    themeOverrides: currentThemeOverrides,
    currentThemeName,
    availableThemes,
    isCurrentThemeDark: isDarkTheme,

    // 主题检查
    isLightTheme,
    isDarkThemeActive,
    isBlueTheme,
    isGreenTheme,
    isPurpleTheme,

    // 主题切换方法
    changeTheme,
    switchToNextTheme,
    switchToLightTheme,
    switchToDarkTheme,
    switchToBlueTheme,
    switchToGreenTheme,
    switchToPurpleTheme,

    // 工具方法
    initTheme,
    getCurrentThemeId,
    getThemeConfig,
    getNextThemeId,
  }
}

// 默认导出，方便使用
export default useNaiveTheme
