import { z } from 'zod'

/**
 * Variable extraction types
 */
export interface ExtractedVariable {
  name: string
  pattern: string
  context: string
  confidence: number
}

export interface ExtractVariablesRequest {
  prompt: string
  language?: 'zh' | 'en'
}

export interface ExtractVariablesResponse {
  variables: ExtractedVariable[]
  count: number
}

/**
 * Request validation schema
 */
export const extractVariablesSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(10000),
  language: z.enum(['zh', 'en']).optional().default('en'),
})

/**
 * Pattern detection rules for implicit variables
 */
const VARIABLE_PATTERNS = {
  en: [
    {
      pattern: /\b(?:to|for|about|with|on|in)\s+([a-z][a-z0-9_]*)\b/gi,
      context: 'recipient/target',
      examples: ['email to {recipient}', 'message for {name}', 'about {topic}'],
    },
    {
      pattern: /\b(?:write|create|generate|make)\s+(?:a\s+)?(?:email|letter|message|story|article|post)\b/gi,
      context: 'content type',
      examples: ['write an email', 'create a story'],
    },
    {
      pattern: /\b(?:the\s+)?(topic|subject|theme|title|headline)\s+(?:is|of|about)?\s*([a-z][a-z0-9_]*)?/gi,
      context: 'topic/subject',
      examples: ['topic is {topic}', 'subject is {title}'],
    },
    {
      pattern: /\b(?:using|with|via)\s+([a-z][a-z0-9_]*)\b/gi,
      context: 'tool/method',
      examples: ['using {tool}', 'with {method}'],
    },
    {
      pattern: /\b(?:called|named|as)\s+([a-z][a-z0-9_]*)\b/gi,
      context: 'name identifier',
      examples: ['called {name}', 'named {variable}'],
    },
    {
      pattern: /\b(\$[a-z][a-z0-9_]*)\b/gi,
      context: 'variable placeholder',
      examples: ['$variable', '$input'],
    },
  ],
  zh: [
    {
      pattern: /\b(?:给|为|关于|和|用|通过)\s*([\u4e00-\u9fa5][\u4e00-\u9fa5a-z0-9_]*)\b/gi,
      context: '接收者/目标',
      examples: ['给{name}的邮件', '关于{topic}的内容', '用{method}方法'],
    },
    {
      pattern: /\b(?:写|创建|生成|制作)\s*(?:一|一个)?(?:邮件|信|故事|文章|帖子)\b/gi,
      context: '内容类型',
      examples: ['写一封邮件', '创建一个故事'],
    },
    {
      pattern: /\b(?:主题|标题|话题)\s*(?:是|为|关于)?\s*([\u4e00-\u9fa5][\u4e00-\u9fa5a-z0-9_]*)?/gi,
      context: '主题/标题',
      examples: ['主题是{topic}', '标题为{title}'],
    },
    {
      pattern: /\b(?:使用|采用|通过)\s*([\u4e00-\u9fa5][\u4e00-\u9fa5a-z0-9_]*)\b/gi,
      context: '工具/方法',
      examples: ['使用{tool}工具', '采用{method}方法'],
    },
    {
      pattern: /\b(?:叫做|名为|名称为)\s*([\u4e00-\u9fa5][\u4e00-\u9fa5a-z0-9_]*)\b/gi,
      context: '名称标识',
      examples: ['叫做{name}', '名为{variable}'],
    },
    {
      pattern: /\{\{?\s*([\u4e00-\u9fa5a-z][\u4e00-\u9fa5a-z0-9_]*)\s*\}?\}/gi,
      context: '变量占位符',
      examples: ['{variable}', '{输入}'],
    },
  ],
}

/**
 * Common variable name suggestions based on context
 */
const COMMON_VARIABLE_NAMES = {
  en: {
    'recipient/target': ['recipient', 'target', 'name', 'person', 'user'],
    'content type': ['content', 'type', 'format', 'style'],
    'topic/subject': ['topic', 'subject', 'theme', 'title', 'headline'],
    'tool/method': ['tool', 'method', 'approach', 'way', 'technique'],
    'name identifier': ['name', 'title', 'label', 'identifier'],
    'variable placeholder': ['variable', 'input', 'value', 'data'],
  },
  zh: {
    '接收者/目标': ['接收者', '目标', '姓名', '人物', '用户'],
    '内容类型': ['内容', '类型', '格式', '风格'],
    '主题/标题': ['主题', '标题', '话题', '名称'],
    '工具/方法': ['工具', '方法', '方式', '途径'],
    '名称标识': ['名称', '标题', '标签', '标识符'],
    '变量占位符': ['变量', '输入', '值', '数据'],
  },
}

/**
 * Filter out common words that shouldn't be variables
 */
const COMMON_WORDS: Record<'en' | 'zh', string[]> = {
  en: ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or', 'because', 'until', 'while', 'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their', 'what', 'which', 'who', 'whom', 'about', 'write', 'create', 'generate', 'make', 'email', 'message', 'story', 'article', 'post', 'called', 'named', 'using', 'with', 'via'],
  zh: ['的', '是', '在', '和', '与', '或', '了', '着', '过', '把', '被', '给', '为', '从', '到', '向', '对', '关于', '通过', '使用', '采用', '一个', '一封', '一个', '写', '创建', '生成', '制作', '叫做', '名为', '名称', '主题', '标题', '话题'],
}

/**
 * Extract implicit variables from prompt text using pattern matching
 * @param prompt Prompt text to analyze
 * @param language Language for analysis
 */
export function extractVariables(
  prompt: string,
  language: 'zh' | 'en' = 'en'
): ExtractVariablesResponse {
  const variables: ExtractedVariable[] = []
  const seenNames = new Set<string>()
  const patterns = VARIABLE_PATTERNS[language]

  for (const { pattern, context, examples } of patterns) {
    const regex = new RegExp(pattern.source, pattern.flags)
    let match

    while ((match = regex.exec(prompt)) !== null) {
      let name = match[1] || match[2] || ''

      if (!name) continue

      name = name.trim().toLowerCase()

      if (name.length < 2 || name.length > 30) continue
      if (seenNames.has(name)) continue

      const commonWords = COMMON_WORDS[language] as string[]
      if (commonWords.includes(name)) continue

      if (!/^[a-z\u4e00-\u9fa5][a-z0-9\u4e00-\u9fa5_]*$/i.test(name)) continue

      const confidence = calculateConfidence(name, context, examples, language)

      if (confidence > 0.3) {
        variables.push({
          name,
          pattern: context,
          context: getContextDescription(context, language),
          confidence,
        })
        seenNames.add(name)
      }
    }
  }

  const sortedVariables = variables.sort((a, b) => b.confidence - a.confidence).slice(0, 10)

  return {
    variables: sortedVariables,
    count: sortedVariables.length,
  }
}

/**
 * Calculate confidence score for a detected variable
 */
function calculateConfidence(
  name: string,
  context: string,
  examples: string[],
  language: 'zh' | 'en'
): number {
  let confidence = 0.5

  const commonVars = COMMON_VARIABLE_NAMES[language][context as keyof typeof COMMON_VARIABLE_NAMES[typeof language]]
  if (commonVars && commonVars.includes(name.toLowerCase())) {
    confidence += 0.3
  }

  if (name.length >= 3 && name.length <= 15) {
    confidence += 0.1
  }

  if (/^[a-z]{3,}$/i.test(name) || /^[\u4e00-\u9fa5]{2,}$/.test(name)) {
    confidence += 0.1
  }

  return Math.min(confidence, 1.0)
}

/**
 * Get human-readable context description
 */
function getContextDescription(context: string, language: 'zh' | 'en'): string {
  const descriptions: Record<string, Record<'zh' | 'en', string>> = {
    'recipient/target': {
      zh: '接收者/目标',
      en: 'Recipient/Target',
    },
    'content type': {
      zh: '内容类型',
      en: 'Content Type',
    },
    'topic/subject': {
      zh: '主题/标题',
      en: 'Topic/Subject',
    },
    'tool/method': {
      zh: '工具/方法',
      en: 'Tool/Method',
    },
    'name identifier': {
      zh: '名称标识',
      en: 'Name Identifier',
    },
    'variable placeholder': {
      zh: '变量占位符',
      en: 'Variable Placeholder',
    },
  }

  return descriptions[context]?.[language] || context
}
