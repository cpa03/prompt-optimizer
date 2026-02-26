<template>
  <div :class="['template-select-wrapper', { 'just-selected': recentlySelected }]">
    <NSelect
      :value="modelValue?.id || null"
      @update:value="handleTemplateSelect"
      :options="selectOptions"
      :placeholder="t('template.select')"
      :loading="!isReady"
      size="medium"
      @focus="handleFocus"
      filterable
      :aria-label="t('template.select')"
      :aria-busy="!isReady"
    >
      <template #header>
        <NFlex v-if="hasSuggestions && suggestions" align="center" :size="4" class="px-2 py-1">
          <NTag type="info" size="small" :bordered="false">
            <template #icon>✨</template>
            {{ t('template.smartSuggestion') || 'Smart' }}
          </NTag>
          <NText depth="3" class="text-xs">
            {{ suggestions.analysis.detectedType }} · {{ suggestions.analysis.complexity }}
          </NText>
        </NFlex>
      </template>

      <template #empty>
        <NSpace vertical align="center" class="py-4">
          <NText class="text-center text-gray-500">{{ t('template.noAvailableTemplates') }}</NText>
          <NButton
            type="tertiary"
            size="small"
            @click="$emit('manage', props.type)"
            class="w-full mt-2"
            ghost
          >
            <template #icon>
              <NText>📝</NText>
            </template>
            {{ t('template.configure') }}
          </NButton>
        </NSpace>
      </template>
    </NSelect>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, inject, type Ref } from 'vue'

import { useI18n } from 'vue-i18n'
import { NSelect, NButton, NSpace, NText, NTag, NFlex } from 'naive-ui'
import type { OptimizationMode, Template, TemplateMetadata } from '@prompt-optimizer/core'
import type { AppServices } from '../types/services'
import { UI_CONSTANTS } from '../config/constants'
import { useTemplateSuggestion } from '../composables/prompt/useTemplateSuggestion'

const { t, locale } = useI18n()

type TemplateType = TemplateMetadata['templateType']

const props = defineProps({
  modelValue: {
    type: Object as () => Template | null,
    default: null,
  },
  type: {
    type: String as () => TemplateType,
    required: true,
    validator: (value: string): boolean =>
      (
        [
          'optimize',
          'userOptimize',
          'text2imageOptimize',
          'image2imageOptimize',
          'imageIterate',
          'iterate',
          'conversationMessageOptimize',
          'contextUserOptimize',
          'contextIterate',
        ] as string[]
      ).includes(value),
  },
  optimizationMode: {
    type: String as () => OptimizationMode,
    required: true,
  },
  prompt: {
    type: String,
    default: '',
  },
})

const emit = defineEmits<{
  'update:modelValue': [template: Template | null]
  manage: [type: TemplateType]
  select: [template: Template, showToast?: boolean]
}>()

const isReady = ref(false)

// 通过inject获取services，要求不能为null
const services = inject<Ref<AppServices | null>>('services')
if (!services) {
  throw new Error('[TemplateSelect] services未正确注入，请确保在App组件中正确provide了services')
}

// 从services中获取templateManager
const templateManager = computed(() => {
  const servicesValue = services.value
  if (!servicesValue) {
    throw new Error('[TemplateSelect] services未初始化，请确保应用已正确启动')
  }

  const manager = servicesValue.templateManager
  if (!manager) {
    throw new Error('[TemplateSelect] templateManager未初始化，请确保服务已正确配置')
  }

  console.debug('[TemplateSelect] templateManager computed:', {
    hasServices: !!servicesValue,
    hasTemplateManager: !!manager,
    servicesKeys: Object.keys(servicesValue),
  })
  return manager
})

// Template suggestion composable for smart recommendations
const {
  suggestions,
  hasSuggestions,
  analyzePrompt,
  clearSuggestions,
  trackAcceptance,
} = useTemplateSuggestion()

// Analyze prompt when it changes
watch(
  () => props.prompt,
  (newPrompt) => {
    if (newPrompt && newPrompt.trim().length > 0) {
      analyzePrompt(newPrompt, locale.value as 'zh-CN' | 'zh-TW' | 'en-US')
    } else {
      clearSuggestions()
    }
  },
  { immediate: true }
)

// 选择框选项
const selectOptions = computed(() => {
  const options: Array<{
    label: string
    value: string
    type: 'template' | 'config' | 'suggestion'
    template?: Template
    description?: string
    isBuiltin?: boolean
  }> = []

  // 添加智能建议chips（如果有）
  if (hasSuggestions.value && suggestions.value) {
    const suggestionOptions = suggestions.value.suggestions.map((s) => ({
      label: `✨ ${s.templateName}`,
      value: `__suggestion_${s.templateId}__`,
      type: 'suggestion' as const,
      templateId: s.templateId,
      description: s.reason,
      confidence: s.confidence,
    }))
    options.push(...suggestionOptions)
  }

  const templateOptions = templates.value.map((template) => ({
    label: template.name,
    value: template.id,
    template: template,
    isBuiltin: template.isBuiltin,
    description: template.metadata.description || t('template.noDescription'),
    type: 'template' as const,
  }))

  // 如果没有模板，返回空数组让placeholder显示
  if (templateOptions.length === 0) {
    return options.length > 0 ? options : []
  }

  // 添加配置按钮选项
  const configOption = {
    label: '📝' + t('template.configure'),
    value: '__config__',
    type: 'config' as const,
  }

  return [...options, ...templateOptions, configOption]
})

// 跟踪最近选择的模板以提供视觉反馈
const recentlySelected = ref<string | null>(null)
const recentlySelectedTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

// 处理模板选择
const handleTemplateSelect = (value: string | null) => {
  // 如果选择的是配置选项，不更新值，直接触发配置事件
  if (value === '__config__') {
    emit('manage', props.type)
    return
  }

  // 如果选择的是建议选项，提取templateId并查找对应模板
  if (value && value.startsWith('__suggestion_') && value.endsWith('__')) {
    const templateId = value.replace('__suggestion_', '').replace('__', '')
    const template = templates.value.find((t) => t.id === templateId) || null
    if (template && template.id !== props.modelValue?.id) {
      recentlySelected.value = template.id
      if (recentlySelectedTimeout.value) {
        clearTimeout(recentlySelectedTimeout.value)
      }
      recentlySelectedTimeout.value = setTimeout(() => {
        recentlySelected.value = null
      }, UI_CONSTANTS.FEEDBACK_DURATION_MS)

      // Track suggestion acceptance for analytics
      const detectedType = suggestions.value?.analysis?.detectedType
      const language = locale.value === 'zh-CN' || locale.value === 'zh-TW' ? 'zh' : 'en'
      trackAcceptance(templateId, detectedType, language)

      emit('update:modelValue', template)
      emit('select', template, true)
    }
    return
  }

  const template = templates.value.find((t) => t.id === value) || null
  if (template && template.id !== props.modelValue?.id) {
    // 提供视觉反馈：短暂高亮选中的模板
    recentlySelected.value = template.id
    if (recentlySelectedTimeout.value) {
      clearTimeout(recentlySelectedTimeout.value)
    }
    recentlySelectedTimeout.value = setTimeout(() => {
      recentlySelected.value = null
    }, UI_CONSTANTS.FEEDBACK_DURATION_MS)

    emit('update:modelValue', template)
    emit('select', template, true)
  }
}

// 处理焦点事件
const handleFocus = async () => {
  if (!isReady.value) {
    await ensureTemplateManagerReady()
    await loadTemplatesByType()
  }
}

// 确保模板管理器已准备就绪
const ensureTemplateManagerReady = async () => {
  // templateManager的检查已经在computed中进行，这里直接使用
  isReady.value = true
  console.debug('[TemplateSelect] 模板管理器已就绪')
  return true
}

// 改为响应式数据，因为需要异步加载
const templates = ref<Template[]>([])

// 异步加载模板列表
const loadTemplatesByType = async () => {
  if (!isReady.value || !templateManager.value) {
    throw new Error('Template manager is not ready or not available')
  }

  // 统一使用异步方法，立即抛错不静默处理
  const typeTemplates = await templateManager.value.listTemplatesByType(props.type)
  templates.value.splice(0, templates.value.length, ...typeTemplates)
}

// 添加对services变化的监听
watch(
  () => services.value?.templateManager,
  async (newTemplateManager) => {
    if (newTemplateManager) {
      console.debug('[TemplateSelect] 检测到模板管理器变化，开始初始化...')
      await ensureTemplateManagerReady()
      await loadTemplatesByType()
    } else {
      // 立即抛错，不静默处理
      isReady.value = false
      templates.value.splice(0, templates.value.length)
      throw new Error('[TemplateSelect] Template manager is not available')
    }
  },
  { immediate: true, deep: true }
)

// 监听props.type变化，重新加载模板
watch(
  () => props.type,
  async () => {
    if (isReady.value) {
      await loadTemplatesByType()
    } else {
      throw new Error('[TemplateSelect] Cannot load templates: manager not ready')
    }
  }
)

// 添加对optimizationMode变化的监听
watch(
  () => props.optimizationMode,
  (newOptimizationMode, oldOptimizationMode) => {
    if (newOptimizationMode !== oldOptimizationMode) {
      // optimizationMode变化时，静默刷新模板列表（避免重复toast）
      refreshTemplates()
    }
  }
)

// 添加对模板列表变化的监听
watch(
  templates, // 监听模板列表
  (newTemplates) => {
    const currentTemplate = props.modelValue
    // 只有在模板列表真正发生变化，且当前模板不在新列表中时才自动切换
    if (currentTemplate && !newTemplates.find((t) => t.id === currentTemplate.id)) {
      const firstTemplate = newTemplates.find((t) => t.metadata.templateType === props.type) || null
      // 避免重复触发：只在实际发生变化时emit
      if (firstTemplate && firstTemplate.id !== currentTemplate?.id) {
        emit('update:modelValue', firstTemplate)
        // 静默选择，不显示toast
        emit('select', firstTemplate, false)
      }
    }
  },
  { deep: true }
)

/**
 * 深度比较模板内容
 * 支持 string 和 Array<{role: string; content: string}> 两种类型
 * 修复 BugBot 发现的数组引用比较问题
 */
const deepCompareTemplateContent = (
  content1: string | Array<{ role: string; content: string }>,
  content2: string | Array<{ role: string; content: string }>
): boolean => {
  // 类型相同性检查
  if (typeof content1 !== typeof content2) {
    return false
  }

  // 字符串类型直接比较
  if (typeof content1 === 'string') {
    return content1 === content2
  }

  // 数组类型深度比较
  if (Array.isArray(content1) && Array.isArray(content2)) {
    if (content1.length !== content2.length) {
      return false
    }

    return content1.every((item1, index) => {
      const item2 = content2[index]
      return item1.role === item2.role && item1.content === item2.content
    })
  }

  // 其他情况使用 JSON 序列化比较（兜底方案）
  return JSON.stringify(content1) === JSON.stringify(content2)
}

/**
 * 刷新模板列表和当前选中的模板
 * 职责：
 * 1. 刷新模板列表显示
 * 2. 检查当前选中模板是否需要更新（如语言切换）
 * 3. 处理模板不存在的情况（自动选择默认模板）
 */
const refreshTemplates = async () => {
  try {
    // 重新加载模板列表
    await loadTemplatesByType()

    // 检查当前选中的模板是否仍然有效
    const currentTemplate = props.modelValue
    if (currentTemplate && currentTemplate.isBuiltin) {
      // 对于内置模板，需要重新获取以确保语言正确
      try {
        const updatedTemplate = await templateManager.value?.getTemplate(currentTemplate.id)
        if (
          updatedTemplate &&
          deepCompareTemplateContent(updatedTemplate.content, currentTemplate.content) === false
        ) {
          // 模板内容已更新（比如语言切换），通知父组件
          emit('update:modelValue', updatedTemplate)
          emit('select', updatedTemplate, false) // 静默更新，不显示toast
        }
      } catch (error) {
        console.warn('[TemplateSelect] Failed to get updated template:', error)
        // 如果获取失败，尝试选择第一个可用的模板
        const availableTemplates = templates.value.filter(
          (t) => t.metadata.templateType === props.type
        )
        if (availableTemplates.length > 0) {
          emit('update:modelValue', availableTemplates[0])
          emit('select', availableTemplates[0], false) // 静默选择
        }
      }
    }
  } catch (error) {
    console.error('[TemplateSelect] Failed to refresh templates:', error)
  }
}

/**
 * 暴露给父组件的接口
 *
 * refresh(): 当外部状态变化（如语言切换、模板管理操作）时，
 * 父组件可以调用此方法通知子组件刷新数据。
 * 子组件负责检查数据变化并通过 v-model 更新父组件状态。
 *
 * 职责分工：
 * - 父组件：检测需要刷新的时机，调用 refresh()
 * - 子组件：执行具体的刷新逻辑，管理自身状态，通过事件通知父组件
 */
defineExpose({
  refresh: refreshTemplates,
})
</script>

<style scoped>
.template-select-wrapper {
  transition: all 0.3s ease;
}

.template-select-wrapper.just-selected {
  animation: success-pulse 1s ease;
}

.suggestion-chip {
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggestion-chip:hover {
  transform: scale(1.02);
}

@keyframes success-pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(24, 160, 88, 0.4);
  }
  50% {
    transform: scale(1.01);
    box-shadow: 0 0 0 4px rgba(24, 160, 88, 0.1);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(24, 160, 88, 0);
  }
}
</style>
