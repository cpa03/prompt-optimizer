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
    configure(presets: string): MarkdownIt
    enable(list: string | string[], strict?: boolean): MarkdownIt
    disable(list: string | string[], strict?: boolean): MarkdownIt
    use(plugin: unknown, ...params: unknown[]): MarkdownIt
  }

  interface MarkdownItConstructor {
    new (options?: MarkdownItOptions): MarkdownIt
    (options?: MarkdownItOptions): MarkdownIt
  }

  const MarkdownIt: MarkdownItConstructor
  export default MarkdownIt
}
