/*
 * Prompt Optimizer - AI提示词优化工具
 * Copyright (C) 2025 linshenkx
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { createApp } from 'vue'
import {
  installErrorHandler,
  installI18nOnly,
  installPinia,
  i18n,
  router,
  setupDocumentTitleSync,
} from '@prompt-optimizer/ui'
import '@prompt-optimizer/ui/dist/style.css'
import App from './App.vue'

const app = createApp(App)

// 安装错误处理器
installErrorHandler(app, {
  verbose: import.meta.env.DEV,
  onError: (error, _instance, info) => {
    // 可以在这里添加外部错误追踪服务，如 Sentry
    console.error('Error caught:', error.message, info)
  },
})

// 只安装i18n插件，语言初始化将在App.vue中服务准备好后进行
installI18nOnly(app)
installPinia(app)

// 第1步：安装 router 插件
app.use(router)

// 同步文档标题和语言属性
setupDocumentTitleSync(i18n)

// 等待 router 完成首航解析（Hash URL -> route），避免初始化逻辑在短暂的 "/" 状态下误重定向
void router.isReady().then(() => {
  app.mount('#app')
})

// Platform Analytics Loading
// Vercel: Load Vercel Analytics when VITE_VERCEL_DEPLOYMENT is true
// Cloudflare: Load Cloudflare Web Analytics when VITE_CLOUDFLARE_DEPLOYMENT is true
// Note: Cloudflare also provides server-side analytics via Cloudflare Analytics in dashboard

if (import.meta.env.VITE_VERCEL_DEPLOYMENT === 'true') {
  // Vercel Analytics
  const loadAnalytics = () => {
    const script = document.createElement('script')
    script.src = '/_vercel/insights/script.js'
    script.defer = true
    script.onload = () => console.log('Vercel Analytics 已加载')
    script.onerror = () => console.warn('Vercel Analytics 加载失败')
    document.head.appendChild(script)
  }
  window.addEventListener('DOMContentLoaded', loadAnalytics)
} else if (import.meta.env.VITE_CLOUDFLARE_DEPLOYMENT === 'true') {
  // Cloudflare Web Analytics (client-side)
  // Note: For server-side analytics, use Cloudflare Dashboard Analytics
  // Set VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN in your environment to enable
  const token = import.meta.env.VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN
  if (token) {
    const loadAnalytics = () => {
      const script = document.createElement('script')
      script.defer = true
      script.src = 'https://static.cloudflareinsights.com/beacon.min.js'
      script.dataset.cfBeacon = JSON.stringify({ token })
      script.onload = () => console.log('Cloudflare Web Analytics 已加载')
      script.onerror = () => console.warn('Cloudflare Web Analytics 加载失败')
      document.head.appendChild(script)
    }
    window.addEventListener('DOMContentLoaded', loadAnalytics)
  }
} else if (import.meta.env.DEV) {
  console.log('Platform Analytics 未加载')
}

// 全局错误处理 - 捕获未处理的Promise拒绝和错误
if (typeof window !== 'undefined') {
  // 捕获未处理的Promise拒绝
  window.addEventListener('unhandledrejection', (event) => {
    // 阻止错误冒泡到控制台
    event.preventDefault()
    // 只记录关键错误，避免控制台噪音
    if (import.meta.env.DEV) {
      console.warn('Unhandled promise rejection:', event.reason?.message || event.reason)
    }
  })

  // 捕获全局错误
  window.addEventListener('error', (event) => {
    // 忽略已知的第三方库警告
    if (
      event.message?.includes('currentInstance') ||
      event.message?.includes('ResizeObserver') ||
      event.filename?.includes('chrome-extension')
    ) {
      event.preventDefault()
      return
    }
    // 其他错误正常记录
    if (import.meta.env.DEV) {
      console.error('Global error:', event.message)
    }
  })
}
