<template>
  <NScrollbar
    v-if="!disableInternalScroll"
    style="height: 100%; max-height: 100%"
    :bordered="false"
  >
    <div ref="markdownContainer" class="markdown-content markdown-content--scrollable"></div>
  </NScrollbar>
  <div
    v-else
    ref="markdownContainer"
    class="markdown-content"
    style="height: 100%; max-height: 100%; overflow-y: auto"
  ></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { NScrollbar } from 'naive-ui'

import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import { useClipboard } from '../composables/ui/useClipboard'
import { useToast } from '../composables/ui/useToast'

interface Props {
  content?: string
  streaming?: boolean
  disableInternalScroll?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  streaming: false,
  disableInternalScroll: false,
})

const markdownContainer = ref<HTMLElement | null>(null)
const renderError = ref<string | null>(null)

// Clipboard functionality for code blocks
const { copyText } = useClipboard()
const message = useToast()

// Track which code blocks have copy success state
const copySuccessStates = ref(new Map<string, boolean>())

/**
 * Copy code block content to clipboard
 */
const copyCodeBlock = async (codeElement: HTMLElement | null, preWrapper: HTMLElement) => {
  if (!codeElement) return

  const code = codeElement.textContent || ''
  const codeId = preWrapper.dataset.codeId ?? ''

  if (!codeId) return

  try {
    await copyText(code)

    // Show success feedback
    copySuccessStates.value.set(codeId, true)
    updateCopyButtonVisualState(preWrapper, true)

    // Show toast notification
    message.success('代码已复制')

    // Reset after 2 seconds
    setTimeout(() => {
      copySuccessStates.value.set(codeId, false)
      updateCopyButtonVisualState(preWrapper, false)
    }, 2000)
  } catch {
    message.error('复制失败，请手动复制')
  }
}

/**
 * Update copy button visual state
 */
const updateCopyButtonVisualState = (preWrapper: HTMLElement, isSuccess: boolean) => {
  const copyBtn = preWrapper.querySelector<HTMLElement>('.code-copy-button')
  const copyIcon = preWrapper.querySelector<HTMLElement>('.copy-icon-default')
  const successIcon = preWrapper.querySelector<HTMLElement>('.copy-icon-success')

  if (!copyBtn) return

  if (isSuccess) {
    copyBtn.classList.add('copy-success')
    if (copyIcon) copyIcon.style.display = 'none'
    if (successIcon) successIcon.style.display = 'block'
  } else {
    copyBtn.classList.remove('copy-success')
    if (copyIcon) copyIcon.style.display = 'block'
    if (successIcon) successIcon.style.display = 'none'
  }
}

// 通用防抖函数
const debounce = <T extends unknown[]>(fn: (...args: T) => void, delay: number) => {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: T) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// 统一错误处理
const handleError = (error: unknown, context = '') => {
  console.error(`Markdown ${context} error:`, error)
  renderError.value = error instanceof Error ? error.message : String(error)
  return ''
}

// 创建 markdown-it 实例并配置插件
const md = new MarkdownIt({
  html: true,
  breaks: false,
  linkify: true,
  typographer: true,
  highlight: function (str: string, lang: string) {
    if (!lang || !hljs.getLanguage(lang)) return str

    try {
      return hljs.highlight(str, { language: lang }).value
    } catch (error) {
      handleError(error, 'syntax highlighting')
      return str
    }
  },
})

// 预处理Markdown内容，移除多余空行
const removeExtraEmptyLines = (content: string): string => {
  if (!content) return ''
  return content.replace(/\n\s*\n\s*(\n\s*)+/g, '\n\n')
}

// 代码块ID计数器
let codeBlockIdCounter = 0

/**
 * Create copy button HTML element
 */
const createCopyButton = (codeId: string): HTMLButtonElement => {
  const button = document.createElement('button')
  button.className = 'code-copy-button'
  button.setAttribute('data-code-id', codeId)
  button.setAttribute('title', '复制代码')
  button.setAttribute('aria-label', '复制代码')

  // Default copy icon
  const copyIcon = document.createElement('span')
  copyIcon.className = 'copy-icon-default'
  copyIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>`

  // Success checkmark icon
  const successIcon = document.createElement('span')
  successIcon.className = 'copy-icon-success'
  successIcon.style.display = 'none'
  successIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`

  button.appendChild(copyIcon)
  button.appendChild(successIcon)

  return button
}

// 为代码块添加语言标签和复制按钮的高效实现
const addLanguageLabels = () => {
  if (!markdownContainer.value) return

  try {
    // 批量操作避免频繁重排
    const preElements = markdownContainer.value.querySelectorAll<HTMLPreElement>('pre')
    if (!preElements.length) return

    const processedPres = new Set<HTMLPreElement>()

    preElements.forEach((pre) => {
      // 如果已经处理过，跳过
      if (processedPres.has(pre)) return
      processedPres.add(pre)

      // 查找代码元素和语言类
      const codeEl = pre.querySelector<HTMLElement>('code')
      const langMatch = codeEl?.className?.match(/language-(\w+)/)
      const language = langMatch ? langMatch[1] : ''

      // 如果pre已经在pre-wrapper中，只更新标签内容
      if (
        pre.parentNode instanceof HTMLElement &&
        pre.parentNode.classList.contains('pre-wrapper')
      ) {
        const wrapper = pre.parentNode
        const existingLabel = wrapper.querySelector<HTMLElement>('.code-language-label')
        if (existingLabel && language) {
          existingLabel.textContent = language
        }
        return
      }

      // 创建包装容器
      const wrapper = document.createElement('div')
      wrapper.className = 'pre-wrapper'

      // Generate unique ID for this code block
      const codeId = `code-block-${codeBlockIdCounter++}`
      wrapper.dataset.codeId = codeId

      // 创建语言标签（如果有）
      if (language) {
        const label = document.createElement('div')
        label.className = 'code-language-label'
        label.textContent = language
        wrapper.appendChild(label)
      }

      // 创建复制按钮
      const copyButton = createCopyButton(codeId)
      copyButton.addEventListener('click', (e) => {
        e.stopPropagation()
        copyCodeBlock(codeEl, wrapper)
      })
      wrapper.appendChild(copyButton)

      // 获取pre的父元素和位置
      const parent = pre.parentNode
      const nextSibling = pre.nextSibling

      // 构建DOM结构
      wrapper.appendChild(pre.cloneNode(true))

      // 替换原始pre
      if (nextSibling && parent) {
        parent.insertBefore(wrapper, nextSibling)
      } else if (parent) {
        parent.appendChild(wrapper)
      }

      // 移除原始pre（因为我们已经克隆并添加到wrapper）
      if (parent) parent.removeChild(pre)
    })
  } catch (error) {
    handleError(error, 'language label processing')
  }
}

// 优化的HTML处理函数
const processHTML = (html: string): string => {
  if (!html) return ''

  try {
    // 先将代码块提取出来保存，避免处理
    const codeBlocks: string[] = []
    let processedHtml = html.replace(/<pre\b[^>]*>([\s\S]*?)<\/pre>/g, (match) => {
      const id = `CODE_BLOCK_${codeBlocks.length}`
      codeBlocks.push(match)
      return id
    })

    // 处理非代码块部分的HTML
    const parser = new DOMParser()
    const doc = parser.parseFromString(processedHtml, 'text/html')

    // 判断是否解析成功
    const parseError = doc.querySelector('parsererror')
    if (parseError) {
      throw new Error('HTML parsing error')
    }

    const fragment = doc.body

    // 删除空节点处理函数 - 保持不变
    const processNode = (node: Node) => {
      const preserveElements = ['HR', 'BR']
      if (
        node.nodeType !== Node.ELEMENT_NODE ||
        !(node instanceof Element) ||
        preserveElements.includes(node.tagName)
      ) {
        return
      }

      const children = Array.from(node.childNodes)

      for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i]

        if (child.nodeType === Node.TEXT_NODE) {
          if (!child.textContent?.trim()) {
            node.removeChild(child)
          } else if (child.textContent) {
            child.textContent = child.textContent.replace(/\s{2,}/g, ' ')
          }
          continue
        }

        if (child.nodeType === Node.ELEMENT_NODE && child instanceof Element) {
          processNode(child)

          if (
            child.tagName === 'P' &&
            !child.textContent?.trim() &&
            !child.querySelector('img, br')
          ) {
            node.removeChild(child)
          }
        }
      }
    }

    // 处理整个文档
    processNode(fragment)

    // 获取处理后的HTML
    processedHtml = fragment.innerHTML

    // 将代码块放回原处
    codeBlocks.forEach((block, i) => {
      processedHtml = processedHtml.replace(`CODE_BLOCK_${i}`, block)
    })

    return processedHtml
  } catch (error) {
    return handleError(error, 'HTML processing')
  }
}

// 渲染Markdown内容
const renderMarkdown = () => {
  renderError.value = null

  if (!props.content) {
    if (markdownContainer.value) {
      markdownContainer.value.innerHTML = ''
    }
    return
  }

  try {
    // 预处理内容
    const processedContent = removeExtraEmptyLines(props.content)

    // 使用markdown-it将Markdown转为HTML
    const rawHtml = md.render(processedContent)

    // 处理HTML
    const processedHtml = processHTML(rawHtml)

    // 使用DOMPurify清理HTML
    const cleanHtml = DOMPurify.sanitize(processedHtml)

    if (markdownContainer.value) {
      markdownContainer.value.innerHTML = cleanHtml

      // 使用requestAnimationFrame提高渲染性能
      requestAnimationFrame(() => {
        addLanguageLabels()
      })
    }
  } catch (error) {
    handleError(error, 'rendering')
    if (markdownContainer.value) {
      const errorEl = document.createElement('p')
      errorEl.className = 'text-red-500'
      errorEl.textContent = `Error rendering markdown: ${renderError.value}`
      markdownContainer.value.innerHTML = ''
      markdownContainer.value.appendChild(errorEl)
    }
  }
}

// 使用防抖处理内容变化，但对流式场景优化
const debouncedRenderMarkdown = debounce(renderMarkdown, 10) // 从50ms降低到10ms
const streamingRenderMarkdown = debounce(renderMarkdown, 5) // 流式模式使用更短的延迟

// 监听content变化时重新渲染
watch(
  () => props.content,
  (newContent) => {
    if (!newContent || newContent.trim() === '') {
      // 对于空内容，立即渲染，不使用防抖
      renderMarkdown()
      return
    }

    // 根据是否在流式模式选择不同的渲染策略
    if (props.streaming) {
      // 流式模式：使用更短的防抖延迟以获得更快的响应
      streamingRenderMarkdown()
    } else {
      // 普通模式：使用标准防抖
      debouncedRenderMarkdown()
    }
  },
  { immediate: true }
)

// 组件挂载时渲染
onMounted(renderMarkdown)
</script>

<style>
/* 基本布局和非颜色样式 */
.markdown-content {
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  /* Pure Naive UI theme - remove custom CSS variables */
  padding: 0.75rem; /* 提供合适的内边距，与其他组件保持一致 */
}

/* 当使用 NScrollbar 时，不需要自己的滚动条 */
.markdown-content--scrollable {
  /* 隐藏滚动条但保持可滚动 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

/* 隐藏 Webkit 滚动条 */
.markdown-content::-webkit-scrollbar {
  display: none;
}

/* 移除第一个子元素的上边距，避免顶部空白 */
.markdown-content > *:first-child {
  margin-top: 0 !important;
}

/* 移除最后一个子元素的下边距，保持底部对齐 */
.markdown-content > *:last-child {
  margin-bottom: 0 !important;
}

/* 使用CSS变量，方便主题切换 */
:root {
  --md-title-spacing: 1em 0;
  --md-spacing-sm: 0.3em 0;
  --md-spacing-md: 0.5em 0;
  --md-spacing-lg: 0.8em 0;
}

/* 标题样式优化 - 使用主题颜色 */
.markdown-content h1 {
  line-height: 1.5;
  font-size: 1.6em;
  margin: var(--md-title-spacing);
  font-weight: 600;
  color: inherit;
}

.markdown-content h2 {
  line-height: 1.5;
  font-size: 1.4em;
  margin: var(--md-spacing-lg);
  font-weight: 600;
  padding-bottom: 0.1em;
  color: inherit;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.markdown-content h3 {
  line-height: 1.5;
  font-size: 1.2em;
  margin: var(--md-spacing-md);
  font-weight: 600;
  color: inherit;
}

.markdown-content h4 {
  line-height: 1.5;
  font-size: 1em;
  margin: var(--md-spacing-sm);
  font-weight: 600;
  color: inherit;
}

/* 段落样式 */
.markdown-content p {
  line-height: 1.6;
  margin: var(--md-spacing-sm);
  white-space: pre-wrap;
  color: inherit;
}

/* 列表样式 */
.markdown-content ul,
.markdown-content ol {
  padding-left: 1.5em;
  margin: var(--md-spacing-sm);
  line-height: 1.5;
  color: inherit;
}

/* 设置列表项为紧凑布局 */
.markdown-content li {
  line-height: 1.5;
  margin: var(--md-spacing-sm);
  color: inherit;
}

/* 嵌套列表优化 */
.markdown-content li > ul,
.markdown-content li > ol {
  margin-top: 0;
  margin-bottom: 0;
}

/* 代码块样式 */
.markdown-content pre {
  border-radius: 6px;
  padding: 0.5em;
  overflow: auto;
  margin-bottom: 0.1em;
  position: relative;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.1);
  /* 添加滚动条样式 */
  scrollbar-width: thin; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

/* Webkit滚动条样式 */
.markdown-content pre::-webkit-scrollbar {
  height: 3px;
}

.markdown-content pre::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.pre-wrapper {
  position: relative;
}

.pre-wrapper .code-language-label {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
  /* 其他样式保持不变 */
}
.code-language-label {
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.2em 0.5em;
  font-size: 0.75em;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  border-bottom-left-radius: 4px;
  user-select: none;
  background-color: #18a058;
  color: white;
}

.markdown-content code {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 0.85em;
  padding: 0.1em;
  margin: 0.3em;
  border-radius: 6px;
  white-space: pre;
  background-color: rgba(0, 0, 0, 0.02);
  color: inherit;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

/* 引用样式 */
.markdown-content blockquote {
  padding: 0.1em 0.5em;
  margin: var(--md-spacing-sm);
  border-left-width: 0.25em;
  border-left-style: solid;
  border-left-color: #18a058;
  background-color: rgba(0, 0, 0, 0.02);
  color: inherit;
}

/* 表格样式 */
.markdown-content table {
  border-collapse: collapse;
  width: 100%;
  margin: var(--md-spacing-sm);
  overflow: auto;
  font-size: 0.9em;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.markdown-content table th,
.markdown-content table td {
  line-height: 1.5;
  padding: 0.3em 0.5em;
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: inherit;
}

.markdown-content table th {
  background-color: rgba(0, 0, 0, 0.02);
  font-weight: 600;
}

/* 响应式表格 */
@media (max-width: 600px) {
  .markdown-content table {
    display: block;
    overflow-x: auto;
  }
}

/* 图片样式 */
.markdown-content img {
  max-width: 100%;
  height: auto; /* 确保保持纵横比 */
  box-sizing: border-box;
  margin: var(--md-spacing-sm);
  /* 增加图片加载中的显示效果 */
  opacity: 1;
  transition: opacity 0.3s ease;
}

.markdown-content img:not([src]) {
  opacity: 0.5;
}

/* 水平线样式 */
.markdown-content hr {
  height: 0.25em;
  border: 1;
  margin: 1em 0;
}

/* 链接样式 */
.markdown-content a {
  text-decoration: none;
  transition: color 0.2s ease; /* 平滑颜色变化 */
  color: #18a058;
}

.markdown-content a:hover {
  text-decoration: underline;
  opacity: 0.8;
}

/* 🎨 Palette: Code block copy button - Micro UX improvement */
.code-copy-button {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 6px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  cursor: pointer;
  opacity: 0;
  transform: translateY(-4px);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.code-copy-button:hover {
  background: #fff;
  border-color: #18a058;
  transform: translateY(0) scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.code-copy-button:active {
  transform: translateY(0) scale(0.95);
}

/* Show button on wrapper hover */
.pre-wrapper:hover .code-copy-button {
  opacity: 1;
  transform: translateY(0);
}

/* Always show button on touch devices */
@media (hover: none) {
  .code-copy-button {
    opacity: 0.8;
    transform: translateY(0);
  }
}

/* Copy button icons */
.code-copy-button svg {
  width: 18px;
  height: 18px;
  color: #666;
  transition: color 0.2s ease;
}

.code-copy-button:hover svg {
  color: #18a058;
}

/* Copy icon containers */
.copy-icon-default,
.copy-icon-success {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Success state */
.code-copy-button.copy-success {
  background: #18a058;
  border-color: #18a058;
  opacity: 1 !important;
  animation: copyButtonSuccess 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.code-copy-button.copy-success svg {
  color: #fff;
}

@keyframes copyButtonSuccess {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(0.9);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* Dark mode adjustments */
.dark .code-copy-button {
  background: rgba(40, 40, 40, 0.95);
  border-color: rgba(255, 255, 255, 0.2);
}

.dark .code-copy-button:hover {
  background: #333;
  border-color: #18a058;
}

.dark .code-copy-button svg {
  color: #ccc;
}

.dark .code-copy-button:hover svg {
  color: #18a058;
}

/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  .code-copy-button {
    transition:
      opacity 0.1s ease,
      background-color 0.1s ease;
    transform: none !important;
  }

  .code-copy-button.copy-success {
    animation: none;
  }
}

/* Adjust language label position when copy button exists */
.pre-wrapper .code-language-label {
  right: 48px; /* Make room for copy button */
}
</style>
