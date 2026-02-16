<template>
  <NFlex vertical :style="{ height: mode === 'full' ? '100%' : 'auto', gap: '12px' }">
    <TemporaryVariablesPanel :manager="variableManager" />

    <template v-if="mode === 'full'">
      <!-- 控制工具栏 -->
      <NCard :style="{ flexShrink: 0 }" size="small">
        <TestControlBar
          :model-label="t('test.model')"
          :model-name="modelName"
          :show-compare-toggle="enableCompareMode"
          :is-compare-mode="isCompareMode"
          @compare-toggle="handleCompareToggle"
          :primary-action-text="primaryActionText"
          :primary-action-disabled="primaryActionDisabled"
          :primary-action-loading="isTestRunning"
          :button-size="adaptiveButtonSize"
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

      <!-- 测试结果区域（支持对比模式）-->
      <TestResultSection
        :is-compare-mode="isCompareMode"
        :vertical-layout="adaptiveResultVerticalLayout"
        :show-original="isCompareMode"
        :original-result-title="t('test.originalResult')"
        :optimized-result-title="t('test.optimizedResult')"
        :single-result-title="singleResultTitle"
        :original-result="originalTestResult"
        :optimized-result="optimizedTestResult"
        :single-result="testResult"
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
        @evaluate-original="emit('evaluate-original')"
        @evaluate-optimized="emit('evaluate-optimized')"
        @show-original-detail="emit('show-original-detail')"
        @show-optimized-detail="emit('show-optimized-detail')"
        @apply-improvement="emit('apply-improvement', $event)"
      >
        <!-- 🆕 对比模式：原始结果 -->
        <template #original-result>
          <div class="result-container">
            <!-- 工具调用显示 -->
            <ToolCallDisplay
              v-if="originalToolCalls.length > 0"
              :tool-calls="originalToolCalls"
              :size="adaptiveButtonSize === 'small' ? 'small' : 'medium'"
              class="tool-calls-section"
            />

            <div class="result-body">
              <slot name="original-result"></slot>
            </div>
          </div>
        </template>

        <!-- 🆕 对比模式：优化结果 -->
        <template #optimized-result>
          <div class="result-container">
            <!-- 工具调用显示 -->
            <ToolCallDisplay
              v-if="optimizedToolCalls.length > 0"
              :tool-calls="optimizedToolCalls"
              :size="adaptiveButtonSize === 'small' ? 'small' : 'medium'"
              class="tool-calls-section"
            />

            <div class="result-body">
              <slot name="optimized-result"></slot>
            </div>
          </div>
        </template>

        <!-- 单一结果模式 -->
        <template #single-result>
          <div class="result-container">
            <!-- 工具调用显示 -->
            <ToolCallDisplay
              v-if="toolCalls.length > 0"
              :tool-calls="toolCalls"
              :size="adaptiveButtonSize === 'small' ? 'small' : 'medium'"
              class="tool-calls-section"
            />

            <div class="result-body">
              <slot name="single-result"></slot>
            </div>
          </div>
        </template>
      </TestResultSection>
    </template>
  </NFlex>
</template>

<script setup lang="ts">
import { computed, ref, onUnmounted, toRef } from 'vue'

import { useI18n } from 'vue-i18n'
import { NFlex, NCard } from 'naive-ui'
import {
  type OptimizationMode,
  type AdvancedTestResult,
  type ToolCallResult,
  type EvaluationResponse,
  type EvaluationType,
  TIMEOUTS,
} from '@prompt-optimizer/core'
import type { ScoreLevel } from '../../composables/prompt/useEvaluation'
import { useResponsive } from '../../composables/ui/useResponsive'
import { usePerformanceMonitor } from '../../composables/performance/usePerformanceMonitor'
import { useDebounceThrottle } from '../../composables/performance/useDebounceThrottle'
import TestControlBar from '../TestControlBar.vue'
import TestResultSection from '../TestResultSection.vue'
import ToolCallDisplay from '../ToolCallDisplay.vue'
import TemporaryVariablesPanel from '../variable/TemporaryVariablesPanel.vue'
import { useTestVariableManager } from '../../composables/variable/useTestVariableManager'

const { t } = useI18n()

// 性能监控
const { recordUpdate, getPerformanceReport } = usePerformanceMonitor('ConversationTestPanel')

// 防抖节流
const { debounce, throttle } = useDebounceThrottle()

// 响应式配置
const { shouldUseVerticalLayout, buttonSize: responsiveButtonSize } = useResponsive()

interface Props {
  /**
   * 渲染模式：
   * - full: 变量表单 + 测试控制栏 + 结果区（历史行为）
   * - variables-only: 仅变量表单（供 Workspace 自行渲染多列 variants 测试区）
   */
  mode?: 'full' | 'variables-only'

  // 核心状态
  optimizationMode: OptimizationMode
  isTestRunning?: boolean

  // 🆕 对比模式
  isCompareMode?: boolean
  enableCompareMode?: boolean

  // 模型信息（用于显示标签）
  modelName?: string

  // 变量管理
  globalVariables?: Record<string, string>
  predefinedVariables?: Record<string, string>
  temporaryVariables?: Record<string, string>

  // 布局配置
  inputMode?: 'compact' | 'normal'
  buttonSize?: 'small' | 'medium' | 'large'
  resultVerticalLayout?: boolean

  // 结果显示配置
  singleResultTitle?: string

  // 🆕 测试结果数据（支持对比模式）
  testResult?: AdvancedTestResult
  originalTestResult?: AdvancedTestResult
  optimizedTestResult?: AdvancedTestResult

  // 🆕 评估功能配置
  showEvaluation?: boolean
  // 是否有测试结果（用于显示评估按钮）
  hasOriginalResult?: boolean
  hasOptimizedResult?: boolean
  // 评估状态
  isEvaluatingOriginal?: boolean
  isEvaluatingOptimized?: boolean
  // 评估分数
  originalScore?: number | null
  optimizedScore?: number | null
  // 是否有评估结果
  hasOriginalEvaluation?: boolean
  hasOptimizedEvaluation?: boolean
  // 评估结果和等级（用于悬浮预览）
  originalEvaluationResult?: EvaluationResponse | null
  optimizedEvaluationResult?: EvaluationResponse | null
  originalScoreLevel?: ScoreLevel | null
  optimizedScoreLevel?: ScoreLevel | null
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'full',
  isTestRunning: false,
  isCompareMode: false,
  enableCompareMode: true,
  inputMode: 'normal',
  buttonSize: 'medium',
  resultVerticalLayout: false,
  singleResultTitle: '',
  globalVariables: () => ({}),
  predefinedVariables: () => ({}),
  temporaryVariables: () => ({}),
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
})

const emit = defineEmits<{
  test: [testVariables: Record<string, string>]
  'update:isCompareMode': [value: boolean]
  'compare-toggle': []
  'open-variable-manager': []
  'variable-change': [name: string, value: string]
  'save-to-global': [name: string, value: string]
  'tool-call': [toolCall: ToolCallResult]
  'tool-calls-updated': [toolCalls: ToolCallResult[]]
  'temporary-variable-remove': [name: string]
  'temporary-variables-clear': []
  // 🆕 评估相关事件
  'evaluate-original': []
  'evaluate-optimized': []
  'show-original-detail': []
  'show-optimized-detail': []
  'apply-improvement': [payload: { improvement: string; type: EvaluationType }]
}>()

// 🆕 工具调用状态管理（支持对比模式）
const toolCalls = ref<ToolCallResult[]>([])
const originalToolCalls = ref<ToolCallResult[]>([])
const optimizedToolCalls = ref<ToolCallResult[]>([])

// 🆕 处理对比模式切换
const handleCompareToggle = () => {
  emit('update:isCompareMode', !props.isCompareMode)
  emit('compare-toggle')
  recordUpdate()
}

// 🆕 处理工具调用的方法（支持对比模式）
const handleToolCall = (toolCall: ToolCallResult, testType?: 'original' | 'optimized') => {
  if (props.isCompareMode && testType) {
    // 对比模式：根据 testType 添加到对应数组
    if (testType === 'original') {
      originalToolCalls.value.push(toolCall)
    } else {
      optimizedToolCalls.value.push(toolCall)
    }
  } else {
    // 单一模式：添加到统一数组
    toolCalls.value.push(toolCall)
  }
  emit('tool-call', toolCall)
  emit('tool-calls-updated', toolCalls.value)
  recordUpdate()
}

// 🆕 清除工具调用数据的方法（支持对比模式）
const clearToolCalls = (testType?: 'original' | 'optimized' | 'both') => {
  if (!testType || testType === 'both') {
    // 清除所有
    toolCalls.value = []
    originalToolCalls.value = []
    optimizedToolCalls.value = []
  } else if (testType === 'original') {
    originalToolCalls.value = []
  } else if (testType === 'optimized') {
    optimizedToolCalls.value = []
  }
}

// 响应式布局配置
const adaptiveButtonSize = computed(() => {
  return props.buttonSize ?? responsiveButtonSize.value
})

const adaptiveResultVerticalLayout = computed(() => {
  return shouldUseVerticalLayout.value || props.resultVerticalLayout
})

// 主要操作按钮文本
const primaryActionText = computed(() => {
  if (props.isTestRunning) {
    return t('test.testing')
  }
  return t('test.startTest')
})

// 主要操作按钮禁用状态
const primaryActionDisabled = computed(() => {
  return props.isTestRunning
})

const handleTest = throttle(
  () => {
    // 获取并传递测试变量
    const testVars = getVariableValues()
    emit('test', testVars)
    recordUpdate()
  },
  200,
  'handleTest'
)

// ========== 变量管理 ==========

const variableManager = useTestVariableManager({
  globalVariables: toRef(props, 'globalVariables'),
  predefinedVariables: toRef(props, 'predefinedVariables'),
  temporaryVariables: toRef(props, 'temporaryVariables'),
  onVariableChange: (name, value) => {
    emit('variable-change', name, value)
    recordUpdate()
  },
  onSaveToGlobal: (name, value) => {
    emit('save-to-global', name, value)
    recordUpdate()
  },
  onVariableRemove: (name) => {
    emit('temporary-variable-remove', name)
    recordUpdate()
  },
  onVariablesClear: () => {
    emit('temporary-variables-clear')
    recordUpdate()
  },
})

const getVariableValues = () => {
  return variableManager.getVariableValues()
}

const setVariableValues = (values: Record<string, string>) => {
  variableManager.setVariableValues(values)
}

// 开发环境下的性能调试
if (import.meta.env.DEV) {
  const logPerformance = debounce(
    () => {
      const report = getPerformanceReport()
      if (report.grade.grade === 'F') {
        console.warn('ConversationTestPanel 性能较差:', report)
      }
    },
    TIMEOUTS.network.short, // 使用配置的短网络超时
    false,
    'performanceLog'
  )

  const timer = setInterval(logPerformance, TIMEOUTS.medium) // 使用配置的中等超时
  onUnmounted(() => clearInterval(timer))
}

// 暴露方法供父组件调用（兼容 TestAreaPanelInstance 接口）
defineExpose({
  handleToolCall,
  clearToolCalls,
  // 🆕 支持对比模式的工具调用数据
  getToolCalls: () => ({
    original: props.isCompareMode ? originalToolCalls.value : [],
    optimized: props.isCompareMode ? optimizedToolCalls.value : toolCalls.value,
  }),
  getVariableValues,
  setVariableValues,
  // 预览功能占位符（兼容接口）
  showPreview: () => {},
  hidePreview: () => {},
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

.result-container:has(.tool-call-display) :deep(.n-empty) {
  display: none;
}
</style>
