import { expect, type Page } from '@playwright/test'
import { TIMEOUTS } from '../constants/timeouts'

/**
 * 等待应用加载完成
 */
export async function waitForAppReady(page: Page): Promise<void> {
  await expect(page.locator('.loading-container')).toHaveCount(0, {
    timeout: TIMEOUTS.NAVIGATION.PAGE_LOAD,
  })
  await expect(page.locator('#app, [id="app"], main')).toBeAttached()
}

/**
 * 导航到指定模式
 * @description 先访问根路径等待应用初始化，再导航到目标路由
 */
export async function navigateToMode(
  page: Page,
  mode: 'basic' | 'pro' | 'image',
  subMode: string
): Promise<void> {
  // 模拟真实用户：从 / 进入，由 RootBootstrapRoute 决定初始工作区，
  // 然后通过顶部 CoreNav 切换到目标模式/子模式。
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await waitForAppReady(page)

  // RootBootstrapRoute 会把 / 重定向到某个 workspace；等到 workspace 出现即可。
  await expect(page.locator('[data-testid="workspace"]').first()).toBeVisible({
    timeout: TIMEOUTS.NAVIGATION.WORKSPACE_VISIBLE,
  })

  await switchModeViaUI(page, mode, subMode)

  // ✅ 验证 URL 正确
  await expect(page).toHaveURL(new RegExp(`\\/#\\/${mode}\\/${subMode}$`), {
    timeout: TIMEOUTS.NAVIGATION.ROUTE_SWITCH,
  })
}

export async function switchModeViaUI(
  page: Page,
  mode: 'basic' | 'pro' | 'image',
  subMode: string
): Promise<void> {
  // 功能模式（basic/pro/image）
  const functionModeSelector = page.getByTestId('function-mode-selector')
  await expect(functionModeSelector).toBeVisible({ timeout: TIMEOUTS.NAVIGATION.WORKSPACE_VISIBLE })

  // 不依赖按钮文案（i18n 会变），直接按 data-testid 点击
  await functionModeSelector.getByTestId(`function-mode-${mode}`).click()

  // 子模式（basic: system/user, pro: multi/variable, image: text2image/image2image）
  // image 子模式使用按钮组，不是 radio-group；分别处理。
  if (mode === 'image') {
    const coreNav = page.getByTestId('core-nav')
    const id = subMode === 'text2image' ? 'image-sub-mode-text2image' : 'image-sub-mode-image2image'
    await coreNav.getByTestId(id).click()
    return
  }

  const subModeSelector = page.getByTestId('optimization-mode-selector')
  await expect(subModeSelector).toBeVisible({ timeout: TIMEOUTS.NAVIGATION.WORKSPACE_VISIBLE })

  // 不依赖按钮文案（i18n 会变），直接按 data-testid 点击
  await subModeSelector.getByTestId(`sub-mode-${subMode}`).click()
}
