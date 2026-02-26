import { z } from 'zod'

/**
 * Template suggestion types
 */
export interface TemplateSuggestion {
  templateId: string
  templateName: string
  confidence: number
  reason: string
}

export interface SuggestTemplatesRequest {
  prompt: string
  language?: 'zh' | 'en'
}

export interface SuggestTemplatesResponse {
  suggestions: TemplateSuggestion[]
  analysis: {
    detectedType?: 'question' | 'task' | 'creative' | 'analysis' | 'code' | 'translation' | 'summarization' | 'general'
    complexity?: 'simple' | 'moderate' | 'complex'
    hasContext?: boolean
  }
}

/**
 * Request validation schema
 */
export const suggestTemplatesSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(10000),
  language: z.enum(['zh', 'en']).optional().default('en'),
})

/**
 * Pattern analysis keywords
 */
const PATTERN_KEYWORDS = {
  question: ['what', 'how', 'why', 'when', 'where', 'who', '?', '请问', '如何', '为什么', '是什么'],
  task: ['write', 'create', 'make', 'build', 'generate', 'implement', 'develop', '写', '创建', '生成', '开发'],
  creative: ['story', 'poem', 'song', 'art', 'design', 'creative', 'fiction', '故事', '诗歌', '创意', '设计'],
  analysis: ['analyze', 'compare', 'evaluate', 'review', 'explain', '分析', '比较', '评估', '解释'],
  code: ['code', 'function', 'class', 'debug', 'refactor', 'algorithm', '代码', '函数', '调试', '算法'],
  translation: ['translate', 'translation', 'convert', 'into', 'language', '翻译', '转成', '转为', '语言'],
  summarization: ['summarize', 'summary', 'brief', 'extract', 'key points', '概括', '总结', '摘要', '提取要点'],
}

/**
 * Template recommendation rules
 */
const TEMPLATE_RECOMMENDATIONS = {
  question: ['general-optimize', 'user-prompt-basic'],
  task: ['user-prompt-basic', 'user-prompt-professional', 'user-prompt-planning'],
  creative: ['user-prompt-professional', 'general-optimize'],
  analysis: ['user-prompt-professional', 'general-optimize'],
  code: ['user-prompt-basic', 'general-optimize'],
  translation: ['general-optimize', 'user-prompt-basic'],
  summarization: ['general-optimize', 'user-prompt-basic'],
  general: ['general-optimize', 'user-prompt-basic'],
}

/**
 * Analyze prompt patterns
 * @param prompt Prompt text to analyze
 * @param language Language for analysis
 */
export function analyzePromptPattern(prompt: string, _language: 'zh' | 'en'): {
  detectedType: 'question' | 'task' | 'creative' | 'analysis' | 'code' | 'translation' | 'summarization' | 'general'
  complexity: 'simple' | 'moderate' | 'complex'
  hasContext: boolean
} {
  const lowerPrompt = prompt.toLowerCase()

  // Detect type based on keywords with word boundary matching
  let detectedType: 'question' | 'task' | 'creative' | 'analysis' | 'code' | 'translation' | 'summarization' | 'general' = 'general'

  // Order matters: check more specific patterns first
  type DetectedType = 'question' | 'task' | 'creative' | 'analysis' | 'code' | 'translation' | 'summarization' | 'general'
  const typeOrder: Array<{ type: DetectedType; keywords: string[] }> = [
    { type: 'question', keywords: PATTERN_KEYWORDS.question },
    { type: 'task', keywords: PATTERN_KEYWORDS.task },
    { type: 'analysis', keywords: PATTERN_KEYWORDS.analysis },
    { type: 'code', keywords: PATTERN_KEYWORDS.code },
    { type: 'translation', keywords: PATTERN_KEYWORDS.translation },
    { type: 'summarization', keywords: PATTERN_KEYWORDS.summarization },
    { type: 'creative', keywords: PATTERN_KEYWORDS.creative },
  ]

  for (const { type, keywords } of typeOrder) {
    if (keywords.some((keyword) => lowerPrompt.includes(keyword))) {
      detectedType = type as typeof detectedType
      break
    }
  }

  // Detect complexity based on length and structure
  let complexity: 'simple' | 'moderate' | 'complex' = 'simple'
  const wordCount = prompt.split(/\s+/).length
  const sentenceCount = prompt.split(/[.!?。！？]/).filter(Boolean).length

  if (wordCount > 100 || sentenceCount > 5) {
    complexity = 'complex'
  } else if (wordCount > 30 || sentenceCount > 2) {
    complexity = 'moderate'
  }

  // Detect context indicators
  const hasContext = /\b(because|since|therefore|however|although|with|given|under)\b/i.test(prompt) ||
    /因为|所以|但是|由于|给定|在.*情况下/.test(prompt)

  return { detectedType, complexity, hasContext }
}

/**
 * Get template suggestions based on prompt analysis
 * @param prompt Prompt text to analyze
 * @param language Language preference
 */
export function getTemplateSuggestions(
  prompt: string,
  language: 'zh' | 'en' = 'en'
): SuggestTemplatesResponse {
  const analysis = analyzePromptPattern(prompt, language)

  const recommendedTemplateIds = TEMPLATE_RECOMMENDATIONS[analysis.detectedType] || TEMPLATE_RECOMMENDATIONS.general

  // Build suggestions with confidence scores
  const suggestions: TemplateSuggestion[] = recommendedTemplateIds.map((templateId, index) => {
    const confidence = 1 - (index * 0.15) //递减 confidence

    let reason = ''
    switch (analysis.detectedType) {
      case 'question':
        reason = language === 'zh'
          ? '检测到问题格式，建议使用通用优化模板'
          : 'Question format detected, general optimization template recommended'
        break
      case 'task':
        reason = language === 'zh'
          ? '检测到任务请求，建议使用专业提示词模板'
          : 'Task request detected, professional prompt template recommended'
        break
      case 'creative':
        reason = language === 'zh'
          ? '检测到创意内容，建议使用专业模板以提升质量'
          : 'Creative content detected, professional template recommended for quality'
        break
      case 'analysis':
        reason = language === 'zh'
          ? '检测到分析需求，建议使用专业模板'
          : 'Analysis request detected, professional template recommended'
        break
      case 'code':
        reason = language === 'zh'
          ? '检测到代码相关请求，建议使用基础优化模板'
          : 'Code-related request detected, basic optimization template recommended'
        break
      case 'translation':
        reason = language === 'zh'
          ? '检测到翻译请求，建议使用通用优化模板'
          : 'Translation request detected, general optimization template recommended'
        break
      case 'summarization':
        reason = language === 'zh'
          ? '检测到摘要请求，建议使用通用优化模板'
          : 'Summarization request detected, general optimization template recommended'
        break
      default:
        reason = language === 'zh'
          ? '根据提示词内容推荐'
          : 'Recommended based on prompt content'
    }

    // Add complexity factor to reason
    if (analysis.complexity === 'complex') {
      reason += language === 'zh' ? '（复杂内容）' : ' (complex content)'
    }

    return {
      templateId,
      templateName: getTemplateDisplayName(templateId, language),
      confidence: Math.max(confidence, 0.5),
      reason,
    }
  })

  return { suggestions, analysis }
}

/**
 * Get display name for template ID
 */
function getTemplateDisplayName(templateId: string, language: 'zh' | 'en'): string {
  const names: Record<string, { zh: string; en: string }> = {
    'general-optimize': { zh: '通用优化', en: 'General Optimization' },
    'user-prompt-basic': { zh: '基础用户提示词', en: 'Basic User Prompt' },
    'user-prompt-professional': { zh: '专业用户提示词', en: 'Professional User Prompt' },
    'user-prompt-planning': { zh: '规划提示词', en: 'Planning Prompt' },
  }

  return names[templateId]?.[language] || templateId
}
