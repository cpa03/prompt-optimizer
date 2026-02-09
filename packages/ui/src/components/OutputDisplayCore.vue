<template>
  <NCard
    :bordered="false"
    class="output-display-core h-full  max-height: 100% "
    content-style="padding: 0; height: 100%; max-height: 100%; display: flex; flex-direction: column; overflow: hidden;"
    :data-testid="testId"
  >
    <NFlex vertical style="height: 100%; min-height: 0; overflow: hidden;">
      <!-- 统一顶层工具栏 -->
      <NFlex v-if="hasToolbar" justify="space-between" align="center" style="flex: 0 0 auto;">
        <!-- 左侧：视图控制按钮组 -->
        <NButtonGroup class="toolbar-button-group">
          <div class="toolbar-btn-wrapper">
            <NButton 
              @click="internalViewMode = 'render'"
              :disabled="internalViewMode === 'render'"
              size="small"
              :type="internalViewMode === 'render' ? 'primary' : 'default'"
              :title="t('common.render') + ' (Ctrl+1)'"
              @mouseenter="showShortcutHint('ctrl+1', true)"
              @mouseleave="showShortcutHint('ctrl+1', false)"
              @focus="showShortcutHint('ctrl+1', true)"
              @blur="showShortcutHint('ctrl+1', false)"
            >
              {{ t('common.render') }}
            </NButton>
            <!-- 🎨 Palette: Keyboard shortcut hint overlay -->
            <Transition name="shortcut-hint">
              <div v-if="shortcutHints['ctrl+1']" class="keyboard-shortcut-hint" role="tooltip">
                <span class="shortcut-key">Ctrl+1</span>
              </div>
            </Transition>
          </div>
          <div class="toolbar-btn-wrapper">
            <NButton 
              @click="internalViewMode = 'source'"
              :disabled="internalViewMode === 'source'"
              size="small"
              :type="internalViewMode === 'source' ? 'primary' : 'default'"
              :title="t('common.source') + ' (Ctrl+2)'"
              @mouseenter="showShortcutHint('ctrl+2', true)"
              @mouseleave="showShortcutHint('ctrl+2', false)"
              @focus="showShortcutHint('ctrl+2', true)"
              @blur="showShortcutHint('ctrl+2', false)"
            >
              {{ t('common.source') }}
            </NButton>
            <!-- 🎨 Palette: Keyboard shortcut hint overlay -->
            <Transition name="shortcut-hint">
              <div v-if="shortcutHints['ctrl+2']" class="keyboard-shortcut-hint" role="tooltip">
                <span class="shortcut-key">Ctrl+2</span>
              </div>
            </Transition>
          </div>
          <div v-if="isActionEnabled('diff') && originalContent" class="toolbar-btn-wrapper">
            <NButton 
              @click="internalViewMode = 'diff'"
              :disabled="internalViewMode === 'diff' || !originalContent"
              size="small"
              :type="internalViewMode === 'diff' ? 'primary' : 'default'"
              :title="t('common.compare') + ' (Ctrl+3)'"
              @mouseenter="showShortcutHint('ctrl+3', true)"
              @mouseleave="showShortcutHint('ctrl+3', false)"
              @focus="showShortcutHint('ctrl+3', true)"
              @blur="showShortcutHint('ctrl+3', false)"
            >
              {{ t('common.compare') }}
            </NButton>
            <!-- 🎨 Palette: Keyboard shortcut hint overlay -->
            <Transition name="shortcut-hint">
              <div v-if="shortcutHints['ctrl+3']" class="keyboard-shortcut-hint" role="tooltip">
                <span class="shortcut-key">Ctrl+3</span>
              </div>
            </Transition>
          </div>
        </NButtonGroup>
        
        <!-- 右侧：操作按钮 -->
        <NFlex align="center" :size="8" :wrap="false">
          <slot name="toolbar-right-extra"></slot>
          <NButtonGroup class="toolbar-button-group">
          <div v-if="isActionEnabled('favorite')" class="toolbar-btn-wrapper">
            <NButton
              @click="handleFavorite"
              size="small"
              quaternary
              circle
              :title="t('common.addToFavorites') + ' (Ctrl+S)'"
              :aria-label="t('common.addToFavorites')"
              @mouseenter="showShortcutHint('ctrl+s', true)"
              @mouseleave="showShortcutHint('ctrl+s', false)"
              @focus="showShortcutHint('ctrl+s', true)"
              @blur="showShortcutHint('ctrl+s', false)"
            >
              <template #icon>
                <NIcon>
                  <Star />
                </NIcon>
              </template>
            </NButton>
            <!-- 🎨 Palette: Keyboard shortcut hint overlay -->
            <Transition name="shortcut-hint">
              <div v-if="shortcutHints['ctrl+s']" class="keyboard-shortcut-hint" role="tooltip">
                <span class="shortcut-key">Ctrl+S</span>
              </div>
            </Transition>
          </div>
          <div v-if="isActionEnabled('copy')" class="toolbar-btn-wrapper">
            <NButton
              @click="handleCopy('content')"
              size="small"
              quaternary
              circle
              :title="(copySuccess ? t('common.copied') : t('common.copy')) + ' (Ctrl+C)'"
              :aria-label="copySuccess ? t('common.copied') : t('common.copy')"
              :class="{ 'copy-success': copySuccess, 'copy-button-pulse': copySuccess }"
              @mouseenter="showShortcutHint('ctrl+c', true)"
              @mouseleave="showShortcutHint('ctrl+c', false)"
              @focus="showShortcutHint('ctrl+c', true)"
              @blur="showShortcutHint('ctrl+c', false)"
            >
              <template #icon>
                <div class="copy-icon-container">
                  <Transition name="icon-morph" mode="out-in">
                    <NIcon v-if="copySuccess" key="check" class="check-icon">
                      <Check />
                    </NIcon>
                    <NIcon v-else key="copy" class="copy-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.03 1.125 0 1.13.094 1.976 1.057 1.976 2.192V7.5M8.25 7.5h7.5M8.25 7.5h-1.5a1.5 1.5 0 00-1.5 1.5v11.25c0 .828.672 1.5 1.5 1.5h10.5a1.5 1.5 0 001.5-1.5V9a1.5 1.5 0 00-1.5-1.5h-1.5" />
                      </svg>
                    </NIcon>
                  </Transition>
                  <span v-if="copySuccess" class="success-ring" aria-hidden="true"></span>
                </div>
              </template>
            </NButton>
            <!-- 🎨 Palette: Keyboard shortcut hint overlay -->
            <Transition name="shortcut-hint">
              <div v-if="shortcutHints['ctrl+c']" class="keyboard-shortcut-hint" role="tooltip">
                <span class="shortcut-key">Ctrl+C</span>
              </div>
            </Transition>
          </div>
          <div v-if="isActionEnabled('fullscreen')" class="toolbar-btn-wrapper">
            <NButton
              @click="handleFullscreen"
              size="small"
              quaternary
              circle
              :title="t('common.fullscreen') + ' (Ctrl+Enter)'"
              :aria-label="t('common.fullscreen')"
              @mouseenter="showShortcutHint('ctrl+enter', true)"
              @mouseleave="showShortcutHint('ctrl+enter', false)"
              @focus="showShortcutHint('ctrl+enter', true)"
              @blur="showShortcutHint('ctrl+enter', false)"
            >
              <template #icon>
                <NIcon>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </NIcon>
              </template>
            </NButton>
            <!-- 🎨 Palette: Keyboard shortcut hint overlay -->
            <Transition name="shortcut-hint">
              <div v-if="shortcutHints['ctrl+enter']" class="keyboard-shortcut-hint" role="tooltip">
                <span class="shortcut-key">Ctrl+Enter</span>
              </div>
            </Transition>
          </div>
          </NButtonGroup>
        </NFlex>
      </NFlex>

      <!-- 推理内容区域 -->
      <NFlex v-if="shouldShowReasoning" style="flex: 0 0 auto;">
        <NCollapse v-model:expanded-names="reasoningExpandedNames" style="width: 100%;">
          <NCollapseItem name="reasoning">
            <template #header>
              <NFlex justify="space-between" align="center" style="width: 100%;">
                <NText class="text-sm font-medium">
                  {{ t('common.reasoning') }}
                </NText>
                <NFlex v-if="isReasoningStreaming" align="center" :size="4">
                  <NSpin :size="12" />
                  <NText class="text-xs">{{ t('common.generating') }}</NText>
                </NFlex>
              </NFlex>
            </template>
            
            <NScrollbar class="reasoning-content" ref="reasoningContentRef" style="max-height: clamp(160px, 28vh, 360px); overflow: auto;">
              <MarkdownRenderer
                v-if="displayReasoning"
                :content="displayReasoning"
                :streaming="streaming"
                :disableInternalScroll="true"
                class="prose-sm max-w-none px-3 py-2"
              />
              <NSpace v-else-if="streaming" class="text-gray-500 text-sm italic px-3 py-2">
                <NText>{{ t('common.generatingReasoning') }}</NText>
              </NSpace>
            </NScrollbar>
          </NCollapseItem>
        </NCollapse>
      </NFlex>
      <!-- 主要内容区域 -->
      <NFlex vertical style="flex: 1; min-height: 0; max-height: 100%; overflow: hidden;">
        <!-- 对比模式 -->
        <TextDiffUI v-if="internalViewMode === 'diff' && content && originalContent"
          :originalText="originalContent"
          :optimizedText="content"
          :compareResult="compareResult"
          class="w-full"
          style="height: 100%; min-height: 0; overflow: auto;"
        />

        <!-- 原文模式 -->
        <template v-if="internalViewMode === 'source'">
          <!-- 🆕 Pro 模式：使用变量感知输入框 -->
          <VariableAwareInput
            v-if="shouldEnableVariables && variableData"
            :model-value="content"
            @update:model-value="handleSourceInput"
            :readonly="mode !== 'editable' || streaming"
            :placeholder="placeholder"
            :autosize="true"
            v-bind="variableData"
            @variable-extracted="handleVariableExtracted"
            @add-missing-variable="handleAddMissingVariable"
            style="height: 100%; min-height: 0;"
          />

          <!-- Basic/Image 模式：使用普通输入框 -->
          <NInput
            v-else
            :value="content"
            @input="handleSourceInput"
            :readonly="mode !== 'editable' || streaming"
            type="textarea"
            :placeholder="placeholder"
            :autosize="{ minRows: 10 }"
            style="height: 100%; min-height: 0;"
          />
        </template>

        <!-- 渲染模式（默认） -->
        <NFlex v-else
          vertical
          :align="displayContent ? 'stretch' : 'center'"
          :justify="displayContent ? 'start' : 'center'"
          style="flex: 1; min-height: 0; overflow: hidden;"
        >
          <MarkdownRenderer
            v-if="displayContent"
            :content="displayContent"
            :streaming="streaming"
            style="flex: 1; min-height: 0; overflow: auto;"
          />
          <!-- 🎨 Palette: Enhanced empty state with contextual guidance and animation -->
          <div
            v-else-if="!loading && !streaming"
            class="enhanced-empty-state flex flex-col items-center justify-center h-full px-6"
          >
            <div class="empty-state-illustration">
              <NIcon :size="ICON_SIZES.XXL" class="empty-state-icon text-gray-300 dark:text-gray-600">
                <FileText />
              </NIcon>
              <div class="empty-state-decoration" aria-hidden="true"></div>
            </div>
            <NText class="empty-state-title text-lg font-medium mt-4 text-gray-600 dark:text-gray-400">
              {{ placeholder || t('common.noContent') }}
            </NText>
            <NText class="empty-state-hint text-sm mt-2 text-gray-400 dark:text-gray-500 text-center max-w-md">
              {{ t('common.getStartedHint') }}
            </NText>
          </div>
          <!-- 🎨 Palette: Enhanced skeleton loader with shimmer effect -->
          <div v-else class="skeleton-loader">
            <div class="skeleton-header">
              <div class="skeleton-line skeleton-line--title"></div>
            </div>
            <div class="skeleton-content">
              <div class="skeleton-line skeleton-line--long"></div>
              <div class="skeleton-line skeleton-line--medium"></div>
              <div class="skeleton-line skeleton-line--short"></div>
              <div class="skeleton-line skeleton-line--long"></div>
              <div class="skeleton-line skeleton-line--medium"></div>
            </div>
            <div class="skeleton-footer">
              <NText class="skeleton-text">{{ placeholder || t('common.loading') }}</NText>
              <div class="skeleton-pulse-indicator"></div>
            </div>
          </div>
        </NFlex>
      </NFlex>
  
    </NFlex>
  </NCard>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, inject, type Ref } from 'vue'

import { useI18n } from 'vue-i18n'
import {
  NCard, NButton, NButtonGroup, NIcon, NCollapse, NCollapseItem,
  NInput, NSpin, NScrollbar, NFlex, NText, NSpace
} from 'naive-ui'
import { useToast } from '../composables/ui/useToast'
import { Star, FileText, Check } from '@vicons/tabler'
import { useClipboard } from '../composables/ui/useClipboard'
import MarkdownRenderer from './MarkdownRenderer.vue'
import TextDiffUI from './TextDiff.vue'
import type { CompareResult, ICompareService } from '@prompt-optimizer/core'
import { VariableAwareInput } from './variable-extraction'
import { useTemporaryVariables } from '../composables/variable/useTemporaryVariables'
import { useVariableAwareInputBridge } from '../composables/variable/useVariableAwareInputBridge'
import { useVariableManager } from '../composables/prompt/useVariableManager'
import type { AppServices } from '../types/services'
import { router as routerInstance } from '../router'
import { ANIMATION_CONSTANTS, ICON_SIZES } from '../config/constants'

type ActionName = 'fullscreen' | 'diff' | 'copy' | 'edit' | 'reasoning' | 'favorite'

const { t } = useI18n()
const { copyText } = useClipboard()

const message = useToast()

// 🆕 注入 services（用于变量管理）
const services = inject<Ref<AppServices | null>>('services') ?? ref<AppServices | null>(null)

// 移除收藏状态管理(改由父组件处理)

// 组件 Props
interface Props {
  // 内容相关
  content?: string
  originalContent?: string
  reasoning?: string

  /** E2E/测试定位用的 data-testid（挂在组件根节点） */
  testId?: string
  
  // 显示模式
  mode: 'readonly' | 'editable'
  reasoningMode?: 'show' | 'hide' | 'auto'
  
  // 功能开关
  enabledActions?: ActionName[]
  
  // 样式配置
  height?: string | number
  placeholder?: string
  
  // 状态
  loading?: boolean
  streaming?: boolean
  
  // 服务
  compareService?: ICompareService
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  originalContent: '',
  reasoning: '',
  testId: undefined,
  mode: 'readonly',
  reasoningMode: 'auto',
  enabledActions: () => ['fullscreen', 'diff', 'copy', 'edit', 'reasoning', 'favorite'],
  height: '100%',
  placeholder: ''
})

const testId = computed(() => props.testId || undefined)

// 事件定义
const emit = defineEmits<{
  'update:content': [content: string]
  'update:reasoning': [reasoning: string]
  'copy': [content: string, type: 'content' | 'reasoning' | 'all']
  'fullscreen': []
  'edit-start': []
  'edit-end': []
  'reasoning-toggle': [expanded: boolean]
  'view-change': [mode: 'base' | 'diff']
  'save-favorite': [data: { content: string; originalContent?: string }]
}>()

// 🆕 变量管理功能（Pro / Image 模式）
// 当前架构以路由为单一真源；不要依赖 legacy 的 Preference-based functionMode。
const routeFunctionMode = computed<'basic' | 'pro' | 'image'>(() => {
  const path = routerInstance.currentRoute.value.path || ''
  if (path.startsWith('/pro')) return 'pro'
  if (path.startsWith('/image')) return 'image'
  return 'basic'
})

const shouldEnableVariables = computed(() => routeFunctionMode.value === 'pro' || routeFunctionMode.value === 'image')

// ==================== 变量管理 Composables ====================
// 临时变量管理器（全局单例）
const tempVars = useTemporaryVariables()

// ✅ 无条件调用，composable 内部会等待 services.preferenceService 准备就绪
const globalVarsManager = useVariableManager(services)

const {
  variableInputData: variableData,
  handleVariableExtracted,
  handleAddMissingVariable,
} = useVariableAwareInputBridge({
  enabled: shouldEnableVariables,
  isReady: globalVarsManager.isReady,
  globalVariables: globalVarsManager.customVariables,
  temporaryVariables: tempVars.temporaryVariables,
  allVariables: globalVarsManager.allVariables,
  saveGlobalVariable: (name, value) => globalVarsManager.addVariable(name, value),
  saveTemporaryVariable: (name, value) => tempVars.setVariable(name, value),
  logPrefix: 'OutputDisplayCore',
})

// 内部状态
type ScrollbarLike = {
  scrollTo: (options: { top: number; behavior?: ScrollBehavior }) => void
}

const reasoningContentRef = ref<ScrollbarLike | null>(null)
const userHasManuallyToggledReasoning = ref(false)

// Copy feedback state
const copySuccess = ref(false)
const copySuccessTimeout = ref<number | null>(null)

// 🎨 Palette: Keyboard shortcut hint visibility state
const shortcutHints = ref<Record<string, boolean>>({
  'ctrl+1': false,
  'ctrl+2': false,
  'ctrl+3': false,
  'ctrl+s': false,
  'ctrl+c': false,
  'ctrl+enter': false
})

// 🎨 Palette: Show/hide keyboard shortcut hint with debounce for better UX
const shortcutHintTimeouts = ref<Record<string, number | null>>({})

const showShortcutHint = (key: string, show: boolean) => {
  // Clear existing timeout for this key
  if (shortcutHintTimeouts.value[key]) {
    clearTimeout(shortcutHintTimeouts.value[key]!)
    shortcutHintTimeouts.value[key] = null
  }
  
  if (show) {
    // Small delay before showing to avoid flickering on quick mouse passes
    shortcutHintTimeouts.value[key] = window.setTimeout(() => {
      shortcutHints.value[key] = true
    }, 100)
  } else {
    // Immediate hide when mouse leaves
    shortcutHints.value[key] = false
  }
}

// 新的视图状态机
const internalViewMode = ref<'render' | 'source' | 'diff'>('render')
const EMPTY_COMPARE_RESULT: CompareResult = {
  fragments: [],
  summary: { additions: 0, deletions: 0, unchanged: 0 },
}
const compareResult = ref<CompareResult>(EMPTY_COMPARE_RESULT)

// 推理折叠面板状态
const reasoningExpandedNames = ref<string[]>([])

const isActionEnabled = (action: ActionName) => props.enabledActions.includes(action)

const hasToolbar = computed(() =>
  ['diff', 'copy', 'fullscreen', 'edit'].some(action => isActionEnabled(action as ActionName))
)

// 计算属性
const displayContent = computed(() => (props.content || '').trim())
const displayReasoning = computed(() => (props.reasoning || '').trim())

const hasContent = computed(() => !!displayContent.value)
const hasReasoning = computed(() => !!displayReasoning.value)

const isReasoningStreaming = computed(() => {
  return props.streaming && hasReasoning.value && !hasContent.value
})

const shouldShowReasoning = computed(() => {
  if (!isActionEnabled('reasoning')) return false
  if (props.reasoningMode === 'hide') return false
  if (props.reasoningMode === 'show') return true
  return hasReasoning.value
})

// 推理展开/折叠状态的计算属性
const isReasoningExpanded = computed({
  get: () => reasoningExpandedNames.value.includes('reasoning'),
  set: (expanded: boolean) => {
    if (expanded) {
      reasoningExpandedNames.value = ['reasoning']
    } else {
      reasoningExpandedNames.value = []
    }
    emit('reasoning-toggle', expanded)
  }
})

// 处理原文模式输入
const handleSourceInput = (value: string) => {
  emit('update:content', value)
}

// 复制功能
const handleCopy = (type: 'content' | 'reasoning' | 'all') => {
  let textToCopy = ''
  const emitType: 'content' | 'reasoning' | 'all' = type

  switch (type) {
    case 'content':
      textToCopy = displayContent.value
      break
    case 'reasoning':
      textToCopy = displayReasoning.value
      break
    case 'all':
      textToCopy = [
        displayReasoning.value && `推理过程：\n${displayReasoning.value}`,
        `主要内容：\n${displayContent.value}`
      ].filter(Boolean).join('\n\n')
      break
  }

  if (textToCopy) {
    copyText(textToCopy)
    emit('copy', textToCopy, emitType)

    // Visual feedback: show checkmark temporarily
    copySuccess.value = true
    if (copySuccessTimeout.value) {
      clearTimeout(copySuccessTimeout.value)
    }
    copySuccessTimeout.value = window.setTimeout(() => {
      copySuccess.value = false
    }, ANIMATION_CONSTANTS.COPY_SUCCESS_DURATION_MS)
  }
}

// 全屏功能
const handleFullscreen = () => {
  emit('fullscreen')
}

const scrollReasoningToBottom = () => {
  if (reasoningContentRef.value) {
    nextTick(() => {
      if (reasoningContentRef.value) {
        reasoningContentRef.value.scrollTo({
          top: 999999, // 滚动到底部
          behavior: 'smooth'
        })
      }
    })
  }
}

// 对比功能
const updateCompareResult = async () => {
  if (internalViewMode.value === 'diff' && props.originalContent && props.content) {
    try {
      const compareService = props.compareService ?? services.value?.compareService
      if (!compareService) throw new Error('CompareService not available')

      compareResult.value = await compareService.compareTexts(
        props.originalContent,
        props.content
      )
    } catch (error) {
      console.error('[OutputDisplayCore] Error calculating diff:', error)
      message.warning(t('toast.warning.compareFailed'))
      compareResult.value = EMPTY_COMPARE_RESULT
    }
  } else {
    compareResult.value = EMPTY_COMPARE_RESULT
  }
}

// 智能自动切换逻辑
const previousViewMode = ref<'render' | 'source' | 'diff' | null>(null)

watch(() => props.streaming, (isStreaming, wasStreaming) => {
  if (isStreaming && !wasStreaming) {
    // 新任务开始，重置用户记忆
    userHasManuallyToggledReasoning.value = false
  } else if (!isStreaming && wasStreaming) {
    // 任务结束，如果用户未干预且思考区域仍然展开，自动折叠
    if (!userHasManuallyToggledReasoning.value && isReasoningExpanded.value) {
      isReasoningExpanded.value = false
    }
  }

  if (isStreaming) {
    // 记住当前模式，并强制切换到原文模式
    if (internalViewMode.value !== 'source') {
      previousViewMode.value = internalViewMode.value
      internalViewMode.value = 'source'
    }
  } else {
    // 流式结束后，恢复之前的模式
    if (previousViewMode.value) {
      internalViewMode.value = previousViewMode.value
      previousViewMode.value = null
    }
  }
})

watch(internalViewMode, updateCompareResult, { immediate: true })
watch(() => [props.content, props.originalContent], () => {
  if (internalViewMode.value === 'diff') {
    updateCompareResult()
  }
})

watch(() => props.reasoning, (newReasoning, oldReasoning) => {
  // 当推理内容从无到有，且用户未手动干预时，自动展开
  if (newReasoning && !oldReasoning && !userHasManuallyToggledReasoning.value) {
    isReasoningExpanded.value = true
  }
  
  // 如果思考过程已展开且有新内容，滚动到底部
  if (isReasoningExpanded.value && newReasoning) {
    scrollReasoningToBottom()
  }
}, { flush: 'post' })

watch(() => props.content, (newContent, oldContent) => {
  // 当主要内容开始流式输出时，如果用户未干预，自动折叠思考过程
  const mainContentJustStarted = newContent && !oldContent
  if (props.streaming && mainContentJustStarted && !userHasManuallyToggledReasoning.value) {
    isReasoningExpanded.value = false
  }
})

// 监听推理折叠状态变化
watch(reasoningExpandedNames, (newNames) => {
  const expanded = newNames.includes('reasoning')
  if (expanded !== isReasoningExpanded.value) {
    userHasManuallyToggledReasoning.value = true
  }
})

// 暴露方法给父组件
const resetReasoningState = (initialState: boolean) => {
  isReasoningExpanded.value = initialState
  userHasManuallyToggledReasoning.value = false
}

const forceExitEditing = () => {
  // In Pro/Image (variable-enabled) workspaces, keep source view as the default
  // to preserve variable highlighting instead of flipping back to Markdown.
  if (shouldEnableVariables.value) return

  internalViewMode.value = 'render'
}

const forceRefreshContent = () => {
  // V2版本中这个方法不再需要，但保留以确保向后兼容
}

// 收藏相关方法 - 触发保存对话框而不是直接保存
const handleFavorite = () => {
  if (!props.content) {
    message.warning('没有内容可以收藏');
    return;
  }

  // 触发保存收藏事件,由父组件打开保存对话框
  emit('save-favorite', {
    content: props.content,
    originalContent: props.originalContent
  });
};

// 组件挂载时设置初始视图模式
onMounted(() => {
  // ⚠️ 不在此处初始化 functionMode
  // 原因：useFunctionMode 是全局单例，不应由单个组件控制初始化时机
  // - 如果 services 未就绪，初始化会失败但仍标记为已完成，导致永久卡在 'basic'
  // - 应该在应用级别统一初始化（如 App.vue）
  // - functionMode 有默认值 'basic'，可以正常工作

  // 如果是可编辑模式，默认显示原文
  if (props.mode === 'editable') {
    internalViewMode.value = 'source';
  }
});

// 监听 mode 变化，自动切换视图模式
watch(() => props.mode, (newMode) => {
  if (newMode === 'editable' && internalViewMode.value === 'render') {
    internalViewMode.value = 'source';
  } else if (newMode === 'readonly' && internalViewMode.value === 'source') {
    internalViewMode.value = 'render';
  }
});

defineExpose({ resetReasoningState, forceRefreshContent, forceExitEditing })
</script>

<style scoped>
/* Copy button success animation - Enhanced micro-UX */
.copy-success {
  color: var(--success-color, #18a058);
}

/* Icon container for positioning */
.copy-icon-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
}

/* Icon morph transition */
.icon-morph-enter-active,
.icon-morph-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.icon-morph-enter-from {
  opacity: 0;
  transform: scale(0.5) rotate(-45deg);
}

.icon-morph-leave-to {
  opacity: 0;
  transform: scale(0.5) rotate(45deg);
}

.icon-morph-enter-to,
.icon-morph-leave-from {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

/* Checkmark icon with draw animation */
.check-icon {
  animation: checkmarkDraw 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes checkmarkDraw {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Success ring animation */
.success-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 24px;
  height: 24px;
  border: 2px solid var(--success-color, #18a058);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0.8);
  opacity: 0;
  pointer-events: none;
  animation: successRingExpand 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes successRingExpand {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0.8;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

/* Button pulse effect - simulates haptic feedback visually */
.copy-button-pulse {
  animation: buttonPulse 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes buttonPulse {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(0.95);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

/* Copy icon subtle hover state */
.copy-icon {
  transition: transform 0.2s ease;
}

.copy-icon:hover {
  transform: scale(1.1);
}

/* Reduced motion support for accessibility */
@media (prefers-reduced-motion: reduce) {
  .icon-morph-enter-active,
  .icon-morph-leave-active {
    transition: opacity 0.1s ease;
  }
  
  .icon-morph-enter-from,
  .icon-morph-leave-to {
    transform: none;
  }
  
  .check-icon {
    animation: none;
  }
  
  .success-ring {
    animation: none;
    display: none;
  }
  
  .copy-button-pulse {
    animation: none;
  }
  
  .copy-icon {
    transition: none;
  }
}

/* 🎨 Palette: Skeleton loader with shimmer effect */
.skeleton-loader {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.skeleton-header {
  margin-bottom: 0.5rem;
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
  min-height: 0;
}

.skeleton-line {
  height: 0.875rem;
  background: linear-gradient(
    90deg,
    var(--n-skeleton-color, rgba(128, 128, 128, 0.12)) 0%,
    var(--n-skeleton-color-highlight, rgba(128, 128, 128, 0.2)) 50%,
    var(--n-skeleton-color, rgba(128, 128, 128, 0.12)) 100%
  );
  background-size: 200% 100%;
  border-radius: 0.25rem;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

.skeleton-line--title {
  height: 1.5rem;
  width: 40%;
  animation-delay: 0s;
}

.skeleton-line--long {
  width: 100%;
  animation-delay: 0.1s;
}

.skeleton-line--medium {
  width: 75%;
  animation-delay: 0.2s;
}

.skeleton-line--short {
  width: 50%;
  animation-delay: 0.3s;
}

.skeleton-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 1rem;
}

.skeleton-text {
  font-size: 0.875rem;
  color: var(--n-text-color-3, #999);
  font-style: italic;
}

.skeleton-pulse-indicator {
  width: 0.5rem;
  height: 0.5rem;
  background: var(--n-primary-color, #18a058);
  border-radius: 50%;
  animation: skeleton-pulse 1s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@keyframes skeleton-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

/* Dark mode adjustments */
.dark .skeleton-line {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.08) 0%,
    rgba(255, 255, 255, 0.12) 50%,
    rgba(255, 255, 255, 0.08) 100%
  );
  background-size: 200% 100%;
}

.dark .skeleton-text {
  color: rgba(255, 255, 255, 0.4);
}

/* 🎨 Palette: Enhanced empty state styles */
.enhanced-empty-state {
  animation: emptyStateFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes emptyStateFadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty-state-illustration {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state-icon {
  animation: emptyStateFloat 3s ease-in-out infinite;
  transition: color 0.3s ease;
}

@keyframes emptyStateFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

.empty-state-decoration {
  position: absolute;
  bottom: -4px;
  width: 48px;
  height: 6px;
  background: linear-gradient(90deg, transparent, rgba(128, 128, 128, 0.15), transparent);
  border-radius: 50%;
  animation: emptyStateShadow 3s ease-in-out infinite;
}

@keyframes emptyStateShadow {
  0%, 100% {
    transform: scaleX(1);
    opacity: 1;
  }
  50% {
    transform: scaleX(0.85);
    opacity: 0.6;
  }
}

.empty-state-title {
  transition: color 0.3s ease;
}

.empty-state-hint {
  line-height: 1.5;
}

/* Dark mode adjustments */
.dark .empty-state-decoration {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
}

/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  .skeleton-line {
    animation: none;
    background: var(--n-skeleton-color, rgba(128, 128, 128, 0.12));
  }

  .skeleton-pulse-indicator {
    animation: none;
  }

  .enhanced-empty-state {
    animation: none;
  }

  .empty-state-icon {
    animation: none;
  }

  .empty-state-decoration {
    animation: none;
  }
}

/* 🎨 Palette: Toolbar button wrapper for positioning context */
.toolbar-button-group {
  display: flex;
  gap: 0;
}

.toolbar-btn-wrapper {
  position: relative;
  display: inline-flex;
}

/* 🎨 Palette: Keyboard shortcut hint styles */
.keyboard-shortcut-hint {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.85);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  white-space: nowrap;
}

/* Arrow pointing down to the button */
.keyboard-shortcut-hint::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.85);
}

.shortcut-key {
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* Transition animations for the hint */
.shortcut-hint-enter-active,
.shortcut-hint-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.shortcut-hint-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(4px) scale(0.95);
}

.shortcut-hint-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(4px) scale(0.95);
}

.shortcut-hint-enter-to,
.shortcut-hint-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0) scale(1);
}

/* Dark mode adjustments */
.dark .keyboard-shortcut-hint {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.dark .keyboard-shortcut-hint::after {
  border-top-color: rgba(255, 255, 255, 0.9);
}

.dark .shortcut-key {
  color: #1a1a1a;
}

/* Mobile: Hide shortcut hints on small screens */
@media (max-width: 768px) {
  .keyboard-shortcut-hint {
    display: none;
  }
}

/* Respect user motion preferences for accessibility */
@media (prefers-reduced-motion: reduce) {
  .shortcut-hint-enter-active,
  .shortcut-hint-leave-active {
    transition: opacity 0.1s ease;
  }

  .shortcut-hint-enter-from,
  .shortcut-hint-leave-to {
    transform: translateX(-50%) scale(1);
  }
}
</style>
