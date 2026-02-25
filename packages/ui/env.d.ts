/// <reference types="vite/client" />

declare module '*.vue' {
  import { type DefineComponent } from 'vue'

  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'markdown-it' {
  interface MarkdownItOptions {
    html?: boolean
    xhtmlOut?: boolean
    breaks?: boolean
    langPrefix?: string
    linkify?: boolean
    typographer?: boolean
    quotes?: string
    highlight?: (str: string, lang: string) => string
  }

  interface MarkdownIt {
    render(src: string, env?: unknown): string
    parse(src: string, env?: unknown): unknown[]
    parseInline(src: string, env?: unknown): unknown[]
    renderInline(src: string, env?: unknown): string
    set(options: MarkdownItOptions): MarkdownIt
    configure(presets: string | unknown): MarkdownIt
    enable(list: string | string[], strict?: boolean): MarkdownIt
    disable(list: string | string[], strict?: boolean): MarkdownIt
    use(plugin: unknown, ...params: unknown[]): MarkdownIt
  }

  const MarkdownIt: {
    new (options?: MarkdownItOptions, presets?: unknown): MarkdownIt
    (options?: MarkdownItOptions, presets?: unknown): MarkdownIt
  }
  export default MarkdownIt
}

// Vite 已经通过 /// <reference types="vite/client" /> 提供了内置的环境变量类型

// E2E: 注入到 window 的测试辅助变量 - moved to src/types/window.d.ts

// 引入 Electron 类型定义
/// <reference path="./src/types/electron.d.ts" />
/// <reference path="./src/types/window.d.ts" />
