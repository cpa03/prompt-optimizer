declare module 'markdown-it' {
  interface Options {
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
    set(options: Options): MarkdownIt
    configure(presets: string): MarkdownIt
    enable(rules: string | string[], strict?: boolean): MarkdownIt
    disable(rules: string | string[], strict?: boolean): MarkdownIt
    use(plugin: unknown, ...params: unknown[]): MarkdownIt
  }

  interface MarkdownItConstructor {
    new (options?: Options): MarkdownIt
    (options?: Options): MarkdownIt
    prototype: MarkdownIt
  }

  const MarkdownIt: MarkdownItConstructor
  export = MarkdownIt
}
