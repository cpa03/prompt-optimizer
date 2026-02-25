/**
 * Document utilities for web and extension apps
 */

import { watch } from 'vue'

type I18nInstance = {
  global: {
    t: (key: string) => string
    locale: { value: string }
  }
}

/**
 * Synchronizes document title and lang attribute with i18n locale
 *
 * This utility function:
 * 1. Sets the document title to the translated app name
 * 2. Updates the html lang attribute based on current locale
 * 3. Sets up a watcher to keep them synchronized when locale changes
 *
 * @param i18n - The i18n instance to sync with
 */
export function setupDocumentTitleSync(i18n: I18nInstance): void {
  if (typeof document === 'undefined') return

  const syncDocumentTitle = () => {
    document.title = i18n.global.t('common.appName')
    const currentLocale = String(i18n.global.locale.value || '')
    const htmlLang = currentLocale.startsWith('zh') ? 'zh' : 'en'
    document.documentElement.setAttribute('lang', htmlLang)
  }

  syncDocumentTitle()
  watch(() => i18n.global.locale.value, syncDocumentTitle)
}
