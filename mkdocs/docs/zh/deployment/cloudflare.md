# Cloudflare Pages 部署指南

本文档介绍如何将 Prompt Optimizer 部署到 Cloudflare Pages。

## 为什么选择 Cloudflare Pages

- 🚀 **全球边缘网络**：全球 300+ 数据中心，低延迟访问
- 💰 **慷慨的免费额度**：每月 100,000 次免费请求
- 🔒 **内置安全功能**：DDoS 防护、WAF、SSL/TLS
- 🔄 **自动 CI/CD**：连接 GitHub 自动部署

## 部署方式

### 方式一：通过 Cloudflare Dashboard（推荐）

1. **Fork 项目**
   - Fork 本项目到您的 GitHub 账号

2. **登录 Cloudflare**
   - 访问 [Cloudflare Dashboard](https://dash.cloudflare.com)
   - 进入 Pages 页面，点击 "Create a project"

3. **连接 GitHub**
   - 选择 "Connect to Git"
   - 授权并选择您 Fork 的仓库

4. **配置构建设置**
   - **Framework preset**: None
   - **Build command**: `pnpm install && pnpm build`
   - **Build output directory**: `packages/web/dist`
   - **Root directory**: `/` (保持默认)

5. **添加环境变量**（可选）
   - `ACCESS_PASSWORD`: 设置访问密码
   - `VITE_OPENAI_API_KEY`: OpenAI API Key
   - `VITE_GEMINI_API_KEY`: Gemini API Key
   - 其他 API 密钥...

6. **点击 "Save and Deploy"**

### 方式二：使用 Wrangler CLI

```bash
# 1. 安装 Wrangler
npm install -g wrangler

# 2. 登录 Cloudflare
wrangler login

# 3. 克隆项目
git clone https://github.com/YOUR_USERNAME/prompt-optimizer.git
cd prompt-optimizer

# 4. 安装依赖
pnpm install

# 5. 构建项目
pnpm build

# 6. 部署到 Cloudflare Pages
wrangler pages deploy packages/web/dist --project-name=prompt-optimizer
```

## 环境变量配置

在 Cloudflare Dashboard 中配置以下环境变量：

| 变量名                     | 说明                | 必需 |
| -------------------------- | ------------------- | ---- |
| `ACCESS_PASSWORD`          | 访问密码保护        | 可选 |
| `VITE_OPENAI_API_KEY`      | OpenAI API Key      | 可选 |
| `VITE_GEMINI_API_KEY`      | Gemini API Key      | 可选 |
| `VITE_DEEPSEEK_API_KEY`    | DeepSeek API Key    | 可选 |
| `VITE_ZHIPU_API_KEY`       | 智谱 API Key        | 可选 |
| `VITE_SILICONFLOW_API_KEY` | SiliconFlow API Key | 可选 |

### 配置步骤

1. 进入 Cloudflare Dashboard > Pages > 您的项目
2. 点击 "Settings" > "Environment variables"
3. 点击 "Add variable" 添加环境变量
4. 选择 "Production" 和/或 "Preview" 环境
5. 保存后重新部署生效

## 访问认证

项目支持密码保护功能：

- 设置 `ACCESS_PASSWORD` 环境变量启用密码保护
- 用户需要输入正确密码才能访问应用
- 支持登录/登出功能
- 使用 HttpOnly Cookie 保证安全

## 自定义域名

1. 进入 Cloudflare Dashboard > Pages > 您的项目
2. 点击 "Custom domains" > "Set up a custom domain"
3. 输入您的域名并按照指引配置 DNS

Cloudflare 会自动配置 SSL 证书。

## 注意事项

### 与 Vercel 部署的差异

1. **Cookie 名称不同**：
   - Vercel: `vercel_access_token`
   - Cloudflare: `cf_access_token`

2. **环境变量**：
   - 都支持在 Dashboard 中配置
   - 格式和用法相同

3. **函数运行时**：
   - Vercel: Node.js Runtime
   - Cloudflare: Edge Runtime (V8 isolates)

### 限制

- Cloudflare Pages Functions 单次请求限制 50ms CPU 时间（免费版）
- 请求体大小限制 100MB
- 响应体大小限制 25MB

## 故障排除

### 构建失败

1. 确认使用正确的 Node.js 版本（18/20/22）
2. 检查构建日志中的错误信息
3. 确保 `pnpm-lock.yaml` 文件存在

### 环境变量不生效

1. 确认变量名拼写正确（区分大小写）
2. 确认已添加到正确的环境（Production/Preview）
3. 重新部署后生效

### API 连接问题

Cloudflare Pages 运行在边缘网络，不受浏览器 CORS 限制。但如果从浏览器端直接调用 API，仍需注意：

- 推荐使用桌面应用避免 CORS 问题
- 或配置自定义 API 代理服务

## 相关链接

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
