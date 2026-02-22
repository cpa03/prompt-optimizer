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
  installI18nOnly,
  installPinia,
  i18n,
  router,
  setupDocumentTitleSync,
} from '@prompt-optimizer/ui'
import '@prompt-optimizer/ui/dist/style.css'
import App from './App.vue'

const app = createApp(App)
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

// 只在Vercel环境中加载Analytics和Speed Insights
// 当环境变量VITE_VERCEL_DEPLOYMENT为true时才尝试加载
if (import.meta.env.VITE_VERCEL_DEPLOYMENT === 'true') {
  // 使用完全运行时方式加载Vercel Analytics
  const loadAnalytics = () => {
    const script = document.createElement('script')
    script.src = '/_vercel/insights/script.js'
    script.defer = true
    script.onload = () => console.log('Vercel Analytics 已加载')
    script.onerror = () => console.warn('Vercel Analytics 加载失败')
    document.head.appendChild(script)
  }

  // 使用完全运行时方式加载Vercel Speed Insights
  const loadSpeedInsights = () => {
    const script = document.createElement('script')
    script.src = '/_vercel/speed-insights/script.js'
    script.defer = true
    script.onload = () => console.log('Vercel Speed Insights 已加载')
    script.onerror = () => console.warn('Vercel Speed Insights 加载失败')
    document.head.appendChild(script)
  }

  // 延迟执行以确保DOM已完全加载
  window.addEventListener('DOMContentLoaded', () => {
    loadAnalytics()
    loadSpeedInsights()
  })
} else if (import.meta.env.DEV) {
  // 只在开发环境显示日志
  console.log('Vercel Analytics 未加载')
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
