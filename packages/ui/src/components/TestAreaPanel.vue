<template>
  <NFlex vertical :style="{ height: '100%', gap: `${SPACING.MD}px` }">
    <!-- 测试输入区域 (仅在系统提示词优化模式下显示) -->
    <NCard v-if="showTestInput" :style="{ flexShrink: 0 }" size="small">
      <TestInputSection
        v-model="testContentProxy"
        :label="t('test.content')"
        :placeholder="t('test.placeholder')"
        :help-text="t('test.simpleMode.help')"
        :disabled="isTestRunning"
        :mode="adaptiveInputMode"
        :size="inputSize"
        :enable-fullscreen="enableFullscreen"
        :test-id="props.testIdPrefix ? `${props.testIdPrefix}-test-input` : undefined"
      />
    </NCard>

    <!-- 控制工具栏 -->
    <NCard :style="{ flexShrink: 0 }" size="small">
      <TestControlBar
        :model-label="t('test.model')"
        :model-name="props.modelName"
        :show-compare-toggle="enableCompareMode"
        :is-compare-mode="props.isCompareMode"
        :primary-action-text="primaryActionText"
        :primary-action-disabled="primaryActionDisabled"
        :primary-action-loading="isTestRunning"
        :button-size="adaptiveButtonSize"
        :compare-toggle-test-id="
          props.testIdPrefix ? `${props.testIdPrefix}-test-compare-toggle` : undefined
        "
        :primary-action-test-id="props.testIdPrefix ? `${props.testIdPrefix}-test-run` : undefined"
        @compare-toggle="handleCompareToggle"
        @primary-action="handleTest"
      >
        <template #model-select>
          <slot name="model-select"></slot>
        </template>
        <template #secondary-controls>
          <slot name="secondary-controls"></slot>
        </template>
        <template #custom-actions>
          <slot name="custom-actions"></slot>
        </template>
      </TestControlBar>
    </NCard>

    <!-- 测试结果区域 -->
    <TestResultSection
      :is-compare-mode="props.isCompareMode && enableCompareMode"
      :vertical-layout="adaptiveResultVerticalLayout"
      :show-original="showOriginalResult"
      :original-title="originalResultTitle"
      :optimized-title="optimizedResultTitle"
      :single-result-title="singleResultTitle"
      :original-result="originalResult"
      :optimized-result="optimizedResult"
      :single-result="singleResult"
      :size="adaptiveButtonSize"
      :style="{ flex: 1, minHeight: 0 }"
      :show-evaluation="showEvaluation"
      :has-original-result="hasOriginalResult"
      :has-optimized-result="hasOptimizedResult"
      :is-evaluating-original="isEvaluatingOriginal"
      :is-evaluating-optimized="isEvaluatingOptimized"
      :original-score="originalScore"
      :optimized-score="optimizedScore"
      :has-original-evaluation="hasOriginalEvaluation"
      :has-optimized-evaluation="hasOptimizedEvaluation"
      :original-evaluation-result="originalEvaluationResult"
      :optimized-evaluation-result="optimizedEvaluationResult"
      :original-score-level="originalScoreLevel"
      :optimized-score-level="optimizedScoreLevel"
      @evaluate-original="handleEvaluateOriginal"
      @evaluate-optimized="handleEvaluateOptimized"
      @show-original-detail="handleShowOriginalDetail"
      @show-optimized-detail="handleShowOptimizedDetail"
      @apply-improvement="handleApplyImprovement"
      @apply-patch="handleApplyPatch"
    >
      <template #original-result>
        <div class="result-container">
          <!-- 原始结果的工具调用显示 - 移到正文之前 -->
          <ToolCallDisplay
            v-if="originalToolCalls.length > 0"
            :tool-calls="originalToolCalls"
            :size="adaptiveButtonSize === 'large' ? 'medium' : 'small'"
            class="tool-calls-section"
          />

          <div class="result-body">
            <slot name="original-result"></slot>
          </div>
        </div>
      </template>
      <template #optimized-result>
        <div class="result-container">
          <!-- 优化结果的工具调用显示 - 移到正文之前 -->
          <ToolCallDisplay
            v-if="optimizedToolCalls.length > 0"
            :tool-calls="optimizedToolCalls"
            :size="adaptiveButtonSize === 'large' ? 'medium' : 'small'"
            class="tool-calls-section"
          />

          <div class="result-body">
            <slot name="optimized-result"></slot>
          </div>
        </div>
      </template>
      <template #single-result>
        <div class="result-container">
          <!-- 单一结果的工具调用显示 - 移到正文之前（使用优化结果的数据） -->
          <ToolCallDisplay
            v-if="optimizedToolCalls.length > 0"
            :tool-calls="optimizedToolCalls"
            :size="adaptiveButtonSize === 'large' ? 'medium' : 'small'"
            class="tool-calls-section"
          />

          <div class="result-body">
            <slot name="single-result"></slot>
          </div>
        </div>
      </template>
    </TestResultSection>
  </NFlex>
</template>

<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue'

import { useI18n } from 'vue-i18n'
import { NFlex, NCard } from 'naive-ui'
import {
  TIMEOUTS,
  type OptimizationMode,
  type AdvancedTestResult,
  type ToolCallResult,
  type ConversationMessage,
  type EvaluationResponse,
  type EvaluationType,
  type PatchOperation,
} from '@prompt-optimizer/core'
import type { ScoreLevel } from './evaluation/types'
import { useResponsive } from '../composables/ui/useResponsive'
import { usePerformanceMonitor } from '../composables/performance/usePerformanceMonitor'
import { useDebounceThrottle } from '../composables/performance/useDebounceThrottle'
import { SPACING } from '../config/constants'
import TestInputSection from './TestInputSection.vue'
import TestControlBar from './TestControlBar.vue'
import TestResultSection from './TestResultSection.vue'
import ToolCallDisplay from './ToolCallDisplay.vue'

const { t } = useI18n()

// 性能监控
const {
  recordUpdate,
  getPerformanceReport,
  // performanceGrade  // 保留用于性能监控
} = usePerformanceMonitor('TestAreaPanel')

// 防抖节流
const { debounce, throttle } = useDebounceThrottle()

// 响应式配置
const {
  shouldUseVerticalLayout,
  shouldUseCompactMode,
  // spaceSize,  // 保留用于响应式布局
  buttonSize,
  inputSize,
  // gridConfig  // 保留用于网格布局
} = useResponsive()

interface Props {
  // 核心状态
  optimizationMode: OptimizationMode
  isTestRunning?: boolean

  // 测试内容
  testContent?: string
  optimizedPrompt?: string // 优化后的提示词（用于变量检测）
  isCompareMode?: boolean

  // 模型信息（用于显示标签）
  modelName?: string

  // 功能开关
  enableCompareMode?: boolean
  enableFullscreen?: boolean

  // 布局配置
  inputMode?: 'compact' | 'normal'
  buttonSize?: 'small' | 'medium' | 'large'

  // 结果显示配置
  showOriginalResult?: boolean
  resultVerticalLayout?: boolean
  originalResultTitle?: string
  optimizedResultTitle?: string
  singleResultTitle?: string

  // 高级功能：测试结果数据（支持工具调用显示）
  originalResult?: AdvancedTestResult
  optimizedResult?: AdvancedTestResult
  singleResult?: AdvancedTestResult

  // 评估功能配置
  showEvaluation?: boolean
  hasOriginalResult?: boolean
  hasOptimizedResult?: boolean
  isEvaluatingOriginal?: boolean
  isEvaluatingOptimized?: boolean
  originalScore?: number | null
  optimizedScore?: number | null
  hasOriginalEvaluation?: boolean
  hasOptimizedEvaluation?: boolean
  // 新增：评估结果和等级，用于悬浮预览
  originalEvaluationResult?: EvaluationResponse | null
  optimizedEvaluationResult?: EvaluationResponse | null
  originalScoreLevel?: ScoreLevel | null
  optimizedScoreLevel?: ScoreLevel | null

  /** E2E: stable selector prefix, e.g. "basic-system" */
  testIdPrefix?: string
}

const props = withDefaults(defineProps<Props>(), {
  isTestRunning: false,
  testContent: '',
  isCompareMode: true,
  enableCompareMode: true,
  enableFullscreen: true,
  inputMode: 'normal',
  buttonSize: 'medium',
  showOriginalResult: true,
  resultVerticalLayout: false,
  originalResultTitle: '',
  optimizedResultTitle: '',
  singleResultTitle: '',
  // 评估默认值
  showEvaluation: false,
  hasOriginalResult: false,
  hasOptimizedResult: false,
  isEvaluatingOriginal: false,
  isEvaluatingOptimized: false,
  originalScore: null,
  optimizedScore: null,
  hasOriginalEvaluation: false,
  hasOptimizedEvaluation: false,
  originalEvaluationResult: null,
  optimizedEvaluationResult: null,
  originalScoreLevel: null,
  optimizedScoreLevel: null,
  testIdPrefix: undefined,
})

const emit = defineEmits<{
  'update:testContent': [value: string]
  'update:isCompareMode': [value: boolean]
  test: [] // 🆕 传递测试变量
  'compare-toggle': []
  // 高级功能事件
  'open-variable-manager': []
  'open-context-editor': []
  'context-change': [messages: ConversationMessage[], variables: Record<string, string>]
  // 工具调用事件
  'tool-call': [toolCall: ToolCallResult, testType: 'original' | 'optimized']
  'tool-calls-updated': [toolCalls: ToolCallResult[], testType: 'original' | 'optimized']
  // 评估事件
  'evaluate-original': []
  'evaluate-optimized': []
  'show-original-detail': []
  'show-optimized-detail': []
  'apply-improvement': [payload: { improvement: string; type: EvaluationType }]
  'apply-patch': [payload: { operation: PatchOperation }]
}>()

// 内部状态管理 - 去除防抖，保证输入即时响应
const testContentProxy = computed({
  get: () => props.testContent,
  set: (value: string) => {
    emit('update:testContent', value)
    recordUpdate()
  },
})

// 工具调用状态管理
const originalToolCalls = ref<ToolCallResult[]>([])
const optimizedToolCalls = ref<ToolCallResult[]>([])

// 处理工具调用的方法
const handleToolCall = (toolCall: ToolCallResult, testType: 'original' | 'optimized') => {
  if (testType === 'original') {
    originalToolCalls.value.push(toolCall)
  } else {
    optimizedToolCalls.value.push(toolCall)
  }

  emit('tool-call', toolCall, testType)
  emit(
    'tool-calls-updated',
    testType === 'original' ? originalToolCalls.value : optimizedToolCalls.value,
    testType
  )
  recordUpdate()
}

// 清除工具调用数据的方法
const clearToolCalls = (testType: 'original' | 'optimized' | 'both' = 'both') => {
  if (testType === 'original' || testType === 'both') {
    originalToolCalls.value = []
  }
  if (testType === 'optimized' || testType === 'both') {
    optimizedToolCalls.value = []
  }
}

// 移除结果缓存与相关节流逻辑，避免不必要的复杂度

// 关键计算属性：showTestInput 取决于优化模式
// 基础模式：仅在系统提示词优化时需要测试内容输入
const showTestInput = computed(() => {
  return props.optimizationMode === 'system'
})

// 响应式布局配置
const adaptiveInputMode = computed(() => {
  if (shouldUseCompactMode.value) return 'compact'
  return props.inputMode || 'normal'
})

const adaptiveButtonSize = computed<'small' | 'medium' | 'large'>(() => {
  return props.buttonSize || buttonSize.value
})

const adaptiveResultVerticalLayout = computed(() => {
  return shouldUseVerticalLayout.value || props.resultVerticalLayout
})

// 主要操作按钮文本
const primaryActionText = computed(() => {
  if (props.isTestRunning) {
    return t('test.testing')
  }
  return props.isCompareMode && props.enableCompareMode
    ? t('test.startCompare')
    : t('test.startTest')
})

// 主要操作按钮禁用状态
const primaryActionDisabled = computed(() => {
  if (props.isTestRunning) return true

  // 系统提示词模式需要测试内容
  if (props.optimizationMode === 'system' && !props.testContent.trim()) {
    return true
  }

  return false
})

// 事件处理 - 立即切换对比模式，避免点击延迟
const handleCompareToggle = () => {
  const newValue = !props.isCompareMode
  emit('update:isCompareMode', newValue)
  emit('compare-toggle')
  recordUpdate()
}

const handleTest = throttle(
  () => {
    emit('test')
    recordUpdate()
  },
  200,
  'handleTest'
)

// ========== 评估事件处理 ==========
const handleEvaluateOriginal = () => {
  emit('evaluate-original')
}

const handleEvaluateOptimized = () => {
  emit('evaluate-optimized')
}

const handleShowOriginalDetail = () => {
  emit('show-original-detail')
}

const handleShowOptimizedDetail = () => {
  emit('show-optimized-detail')
}

// 应用改进建议处理
const handleApplyImprovement = (payload: { improvement: string; type: EvaluationType }) => {
  emit('apply-improvement', payload)
}

// 应用补丁处理
const handleApplyPatch = (payload: { operation: PatchOperation }) => {
  emit('apply-patch', payload)
}

// ========== 变量管理 ==========

// 🆕 添加变量对话框状态

// 开发环境下的性能调试
if (import.meta.env.DEV) {
  const logPerformance = debounce(
    () => {
      const report = getPerformanceReport()
      if (report.grade.grade === 'F') {
        console.warn('TestAreaPanel 性能较差:', report)
      }
    },
    TIMEOUTS.network.short, // 使用配置的短网络超时
    false,
    'performanceLog'
  )

  // 定期检查性能
  const timer = setInterval(logPerformance, TIMEOUTS.medium) // 使用配置的中等超时
  onUnmounted(() => clearInterval(timer))
}

// 暴露方法供父组件调用
defineExpose({
  handleToolCall,
  clearToolCalls,
  // 获取当前工具调用状态
  getToolCalls: () => ({
    original: originalToolCalls.value,
    optimized: optimizedToolCalls.value,
  }),
})
</script>

<style scoped>
.result-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.result-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.tool-calls-section {
  flex: 0 0 auto;
}

/* 当存在工具调用列表时，隐藏结果区中的空内容占位 */
/* 依赖同级容器存在 .tool-call-display 时，隐藏 Naive UI 的 NEmpty */
.result-container:has(.tool-call-display) :deep(.n-empty) {
  display: none;
}
</style>
