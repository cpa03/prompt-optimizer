# E2E 测试 VCR 集成指南

## 问题分析

当前 E2E 测试每次都发送真实的 LLM 请求：

- ⏱️ 测试速度慢（等待 LLM 响应 20-60 秒）
- 💰 费用问题（API 调用成本）
- ⚠️ 不稳定（网络问题、API 限流）

## 解决方案

### 方案 A：Playwright 网络拦截（推荐）

使用 Playwright 的 `route` 功能拦截 LLM API 请求，返回预设的响应。

#### 实施步骤

**1. 创建 VCR fixtures 目录**

```bash
mkdir -p tests/e2e/fixtures/llm-responses
```

**2. 创建 Playwright VCR 辅助工具**

创建文件：`tests/e2e/helpers/vcr.ts`

```typescript
import { type Page, type Route } from '@playwright/test'

/**
 * LLM API 响应 fixture
 */
interface LLMResponseFixture {
  scenarioName: string
  response: {
    content: string
    score?: number
    level?: string
    [key: string]: any
  }
}

/**
 * VCR 模式
 */
type VCRMode = 'auto' | 'record' | 'replay' | 'live'

/**
 * 为 E2E 测试启用 VCR
 *
 * @param page Playwright Page 对象
 * @param options VCR 选项
 */
export async function setupE2EVCR(
  page: Page,
  options: {
    mode?: VCRMode
    fixtureDir?: string
  } = {}
) {
  const {
    mode = (process.env.E2E_VCR_MODE as VCRMode) || 'auto',
    fixtureDir = 'tests/e2e/fixtures/llm-responses',
  } = options

  // 在 replay 模式下拦截 API 请求
  if (mode === 'replay' || mode === 'auto') {
    await page.route('**/api/**/evaluate', async (route: Route) => {
      const fixtureName = getFixtureNameFromRequest(route.request())

      try {
        // 尝试读取 fixture
        const response = await loadFixture(fixtureName, fixtureDir)

        if (response) {
          console.log(`[VCR] Replaying fixture: ${fixtureName}`)
          // 返回 mock 响应
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(response),
          })
        } else if (mode === 'auto') {
          // auto 模式：fixture 不存在时调用真实 API
          console.log(`[VCR] Fixture not found: ${fixtureName}, calling real API`)
          await route.continue()
        } else {
          // replay 模式：fixture 不存在时失败
          throw new Error(
            `Fixture not found: ${fixtureName}\n` + `Run with E2E_VCR_MODE=record to create it.`
          )
        }
      } catch (error) {
        console.error(`[VCR] Error loading fixture: ${fixtureName}`, error)
        await route.continue()
      }
    })
  }

  // 在 record 模式下记录响应
  if (mode === 'record') {
    await page.route('**/api/**/evaluate', async (route: Route) => {
      // 调用真实 API
      const response = await route.fetch()

      // 保存响应
      const fixtureName = getFixtureNameFromRequest(route.request())
      const responseData = await response.json()

      await saveFixture(fixtureName, responseData, fixtureDir)
      console.log(`[VCR] Recorded fixture: ${fixtureName}`)

      // 返回真实响应
      await route.fulfill({
        status: response.status(),
        contentType: response.headers()['content-type'],
        body: JSON.stringify(responseData),
      })
    })
  }

  // live 模式：直接调用真实 API（不拦截）
  if (mode === 'live') {
    console.log('[VCR] Live mode: calling real API')
  }
}

/**
 * 从请求生成 fixture 名称
 */
function getFixtureNameFromRequest(request: any): string {
  const url = new URL(request.url())
  const pathname = url.pathname

  // 解析路径，例如：/api/evaluate/basic-system/prompt-only
  const parts = pathname.split('/')
  const mode = parts[3] // basic-system
  const type = parts[4] // prompt-only

  return `${mode}-${type}.json`
}

/**
 * 加载 fixture
 */
async function loadFixture(fixtureName: string, fixtureDir: string): Promise<any | null> {
  const fs = await import('fs/promises')
  const path = await import('path')

  const fixturePath = path.join(fixtureDir, fixtureName)

  try {
    const content = await fs.readFile(fixturePath, 'utf-8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

/**
 * 保存 fixture
 */
async function saveFixture(fixtureName: string, data: any, fixtureDir: string): Promise<void> {
  const fs = await import('fs/promises')
  const path = await import('path')

  const fixturePath = path.join(fixtureDir, fixtureName)

  // 确保目录存在
  await fs.mkdir(path.dirname(fixturePath), { recursive: true })

  // 保存 fixture
  await fs.writeFile(fixturePath, JSON.stringify(data, null, 2), 'utf-8')
}
```

**3. 更新测试 fixture**

修改 `tests/e2e/fixtures.ts`：

```typescript
import { test as base, expect, type ConsoleMessage, type Page } from '@playwright/test'
import { setupE2EVCR } from './helpers/vcr'

export const test = base.extend<{ page: Page }>({
  page: async ({ page }, use, testInfo) => {
    // ... 现有的 console/page error 监听代码 ...

    // 🔧 设置 VCR
    await setupE2EVCR(page, {
      mode: (process.env.E2E_VCR_MODE as any) || 'auto',
    })

    try {
      await use(page)
    } finally {
      // ... 清理代码 ...
    }
  },
})
```

**4. 创建示例 fixtures**

创建文件：`tests/e2e/fixtures/llm-responses/basic-system-prompt-only.json`

```json
{
  "scenarioName": "basic-system-prompt-only",
  "response": {
    "score": 45,
    "level": "poor",
    "result": {
      "overall": {
        "score": 45,
        "level": "poor",
        "summary": "提示词结构简单，缺少具体要求",
        "dimensions": [
          {
            "name": "Clarity",
            "score": 50,
            "feedback": "表达不够清晰"
          },
          {
            "name": "Specificity",
            "score": 40,
            "feedback": "缺少具体细节"
          }
        ]
      }
    }
  }
}
```

创建文件：`tests/e2e/fixtures/llm-responses/basic-user-prompt-only.json`

```json
{
  "scenarioName": "basic-user-prompt-only",
  "response": {
    "score": 65,
    "level": "acceptable",
    "result": {
      "overall": {
        "score": 65,
        "level": "acceptable",
        "summary": "提示词结构基本合理",
        "dimensions": [
          {
            "name": "Clarity",
            "score": 70,
            "feedback": "表达较清晰"
          },
          {
            "name": "Completeness",
            "score": 60,
            "feedback": "包含基本要素"
          }
        ]
      }
    }
  }
}
```

**5. 使用方法**

```bash
# 首次运行：录制模式（创建 fixtures）
E2E_VCR_MODE=record pnpm exec playwright test tests/e2e/analysis/basic-system.spec.ts

# 后续运行：回放模式（使用 fixtures，快速）
E2E_VCR_MODE=replay pnpm exec playwright test tests/e2e/analysis/basic-system.spec.ts

# 自动模式（有 fixture 则回放，无则录制）
E2E_VCR_MODE=auto pnpm exec playwright test tests/e2e/analysis/basic-system.spec.ts

# Live 模式（始终调用真实 API）
E2E_VCR_MODE=live pnpm exec playwright test tests/e2e/analysis/basic-system.spec.ts
```

---

### 方案 B：Mock Service Worker（更强大，但更复杂）

使用 MSW (Mock Service Worker) 在浏览器端拦截请求。

**优点**：

- 更强大的 mock 能力
- 支持 fixture 管理
- 可以模拟网络延迟、错误等

**缺点**：

- 需要额外依赖
- 配置更复杂

**如果需要，可以后续实施。**

---

## 推荐实施顺序

1. ✅ **Phase 1**: 创建 `tests/e2e/helpers/vcr.ts`
2. ✅ **Phase 2**: 更新 `tests/e2e/fixtures.ts` 集成 VCR
3. ✅ **Phase 3**: 创建示例 fixtures
4. ⏸️ **Phase 4**: 在 `.env.local` 或 CI 配置中添加 `E2E_VCR_MODE=auto`
5. ⏸️ **Phase 5**: 运行测试验证

---

## 测试速度对比

| 模式          | 单个测试时长 | 4 个测试总时长 | API 调用次数          |
| ------------- | ------------ | -------------- | --------------------- |
| Live (当前)   | ~20s         | ~80s           | 4 次                  |
| Replay (VCR)  | ~3s          | ~12s           | 0 次                  |
| Record (首次) | ~20s         | ~80s           | 4 次（创建 fixtures） |

**使用 VCR 后，测试速度提升 6-7 倍！**
