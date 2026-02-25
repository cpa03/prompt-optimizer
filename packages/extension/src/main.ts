import { createApp } from 'vue'
import {
  installI18nOnly,
  installPinia,
  i18n,
  router,
  setupDocumentTitleSync,
} from '@prompt-optimizer/ui'
import App from './App.vue'

import './style.css'
import '@prompt-optimizer/ui/dist/style.css'

const app = createApp(App)
// 只安装i18n插件，语言初始化将在App.vue中服务准备好后进行
installI18nOnly(app)
installPinia(app)
app.use(router)

// 同步文档标题和语言属性
setupDocumentTitleSync(i18n)

// 等待 router 完成首航解析（Hash URL -> route），避免初始化逻辑在短暂的 "/" 状态下误重定向
// ⚠️ Extension 环境也可能通过 hash 直接进入工作区路由（例如 E2E/开发调试）
void router.isReady().then(() => {
  app.mount('#app')
})
