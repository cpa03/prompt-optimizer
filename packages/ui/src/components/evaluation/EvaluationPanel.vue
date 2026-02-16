<template>
  <NDrawer
    :show="show"
    :width="UI_DIMENSIONS.DRAWER_WIDTH"
    placement="right"
    :on-update:show="handleUpdateShow"
  >
    <NDrawerContent :title="panelTitle" closable>
      <!-- 加载状态 -->
      <template v-if="isEvaluating">
        <div class="evaluation-loading">
          <NSpin size="large" />
          <NText depth="3" class="loading-text">{{ t('evaluation.loading') }}</NText>
          <!-- 流式内容预览 -->
          <div v-if="streamContent" class="stream-preview">
            <NText depth="3" class="stream-label">{{ t('evaluation.analyzing') }}</NText>
            <NScrollbar
              ref="streamScrollbarRef"
              :style="{ maxHeight: UI_DIMENSIONS.SCROLLBAR_MAX_HEIGHT_MEDIUM + 'px' }"
            >
              <NText class="stream-content">{{ streamContent }}</NText>
            </NScrollbar>
          </div>
        </div>
      </template>

      <!-- 错误状态 -->
      <template v-else-if="error">
        <NResult status="error" :title="t('evaluation.error.title')">
          <template #default>
            <NText depth="3">{{ error }}</NText>
          </template>
          <template #footer>
            <NButton @click="handleRetry">{{ t('common.retry') }}</NButton>
          </template>
        </NResult>
      </template>

      <!-- 评估结果 -->
      <template v-else-if="result">
        <NScrollbar style="max-height: calc(100vh - 120px)">
          <NSpace vertical :size="20">
            <!-- 总分展示 -->
            <div class="score-section">
              <div class="overall-score" :class="scoreLevelClass">
                <div class="score-value">{{ result.score.overall }}</div>
                <div class="score-label">{{ t('evaluation.overallScore') }}</div>
              </div>
              <NText depth="3" class="score-level-text">
                {{ scoreLevelText }}
              </NText>
            </div>

            <!-- 一句话总结 -->
            <NCard v-if="result.summary" size="small">
              <NText>{{ result.summary }}</NText>
            </NCard>

            <!-- 四维度分数 -->
            <NCard :title="t('evaluation.dimensions')" size="small">
              <NSpace vertical :size="12">
                <div v-for="dim in result.score.dimensions" :key="dim.key" class="dimension-item">
                  <div class="dimension-header">
                    <NText>{{ dim.label }}</NText>
                    <NText :class="getDimensionScoreClass(dim.score)">{{ dim.score }}</NText>
                  </div>
                  <NProgress
                    :percentage="dim.score"
                    :status="getDimensionStatus(dim.score)"
                    :show-indicator="false"
                    :height="8"
                  />
                </div>
              </NSpace>
            </NCard>

            <!-- 精准修复（patchPlan） -->
            <NCard
              v-if="result.patchPlan && result.patchPlan.length > 0"
              :title="t('evaluation.diagnose.title')"
              size="small"
            >
              <NList>
                <NListItem v-for="(op, opIndex) in result.patchPlan" :key="opIndex">
                  <div class="patch-item">
                    <div class="patch-header">
                      <NTag :type="getOperationType(op.op)" size="tiny">
                        {{ getOperationLabel(op.op) }}
                      </NTag>
                      <NText class="patch-instruction">{{ op.instruction }}</NText>
                    </div>
                    <div class="patch-diff-inline">
                      <InlineDiff :old-text="op.oldText" :new-text="op.newText" />
                    </div>
                    <NButton
                      size="tiny"
                      type="primary"
                      class="patch-apply-btn"
                      @click="handleApplyPatchLocal(op)"
                    >
                      {{ t('evaluation.diagnose.replaceNow') }}
                    </NButton>
                  </div>
                </NListItem>
              </NList>
            </NCard>

            <!-- 改进建议 -->
            <NCard
              v-if="result.improvements && result.improvements.length > 0"
              :title="t('evaluation.improvements')"
              size="small"
            >
              <NList>
                <NListItem v-for="(item, index) in result.improvements" :key="index">
                  <div class="improvement-item">
                    <NText type="info" class="improvement-text">{{ item }}</NText>
                    <NButton size="tiny" type="primary" ghost @click="handleApplyImprovement(item)">
                      {{ t('evaluation.applyToIterate') }}
                    </NButton>
                  </div>
                </NListItem>
              </NList>
            </NCard>
          </NSpace>
        </NScrollbar>
      </template>

      <!-- 空状态 -->
      <template v-else>
        <NEmpty :description="t('evaluation.noResult')">
          <template #icon>
            <span :style="{ fontSize: ICON_SIZES.XXL + 'px' }">📊</span>
          </template>
        </NEmpty>
      </template>

      <!-- 底部操作栏 -->
      <template #footer>
        <NSpace justify="space-between" style="width: 100%">
          <NButton v-if="result" @click="handleClear" quaternary>
            {{ t('common.clear') }}
          </NButton>
          <NSpace>
            <NButton
              v-if="result && !isEvaluating"
              type="primary"
              secondary
              @click="handleReEvaluate"
            >
              {{ t('evaluation.reEvaluate') }}
            </NButton>
            <NButton @click="handleClose">
              {{ t('common.close') }}
            </NButton>
          </NSpace>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NDrawer,
  NDrawerContent,
  NSpace,
  NCard,
  NText,
  NButton,
  NProgress,
  NResult,
  NSpin,
  NScrollbar,
  NEmpty,
  NList,
  NListItem,
  NTag,
  type ScrollbarInst,
} from 'naive-ui'
import type { EvaluationResponse, EvaluationType, PatchOperation } from '@prompt-optimizer/core'
import InlineDiff from './InlineDiff.vue'
import {
  EVALUATION_COLORS,
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
  UI_DIMENSIONS,
  ICON_SIZES,
} from '../../config/constants'

// Props
const props = defineProps<{
  show: boolean
  isEvaluating: boolean
  currentType: EvaluationType | null
  result: EvaluationResponse | null
  streamContent: string
  error: string | null
  scoreLevel: 'excellent' | 'good' | 'acceptable' | 'poor' | 'very-poor' | null
}>()

// Emits
const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'clear'): void
  (e: 'retry'): void
  (e: 're-evaluate'): void
  (e: 'apply-local-patch', payload: { operation: PatchOperation }): void
  (
    e: 'apply-improvement',
    payload: {
      improvement: string
      type: EvaluationType
    }
  ): void
}>()

const { t } = useI18n()

// 流式内容滚动条引用
const streamScrollbarRef = ref<ScrollbarInst | null>(null)

// 监听流式内容变化，自动滚动到底部
watch(
  () => props.streamContent,
  () => {
    nextTick(() => {
      streamScrollbarRef.value?.scrollTo({ top: 999999, behavior: 'smooth' })
    })
  }
)

const tOr = (key: string, fallback: string): string => {
  const translated = t(key)
  return translated === key ? fallback : translated
}

// 面板标题
const panelTitle = computed(() => {
  switch (props.currentType) {
    case 'original':
      return t('evaluation.title.original')
    case 'optimized':
      return t('evaluation.title.optimized')
    case 'compare':
      return t('evaluation.title.compare')
    case 'prompt-only':
      return t('evaluation.title.promptOnly')
    case 'prompt-iterate':
      return t('evaluation.title.promptIterate')
    default:
      return t('evaluation.title.default')
  }
})

// 评分等级样式类
const scoreLevelClass = computed(() => {
  if (!props.scoreLevel) return ''
  return `score-${props.scoreLevel}`
})

// 评分等级文本
const scoreLevelText = computed(() => {
  switch (props.scoreLevel) {
    case 'excellent':
      return t('evaluation.level.excellent')
    case 'good':
      return t('evaluation.level.good')
    case 'acceptable':
      return t('evaluation.level.acceptable')
    case 'poor':
      return t('evaluation.level.poor')
    case 'very-poor':
      return t('evaluation.level.veryPoor')
    default:
      return ''
  }
})

// 获取维度分数样式类
const getDimensionScoreClass = (score: number): string => {
  if (score >= 90) return 'score-excellent'
  if (score >= 80) return 'score-good'
  if (score >= 60) return 'score-acceptable'
  if (score >= 40) return 'score-poor'
  return 'score-very-poor'
}

// 获取进度条状态
const getDimensionStatus = (score: number): 'success' | 'warning' | 'error' | 'default' => {
  if (score >= 80) return 'success'
  if (score >= 60) return 'warning'
  return 'error'
}

// 处理显示更新
const handleUpdateShow = (value: boolean) => {
  emit('update:show', value)
}

// 关闭面板
const handleClose = () => {
  emit('update:show', false)
}

// 清除结果
const handleClear = () => {
  emit('clear')
}

// 重试评估
const handleRetry = () => {
  emit('retry')
}

// 重新评估
const handleReEvaluate = () => {
  emit('re-evaluate')
}

// 应用改进建议到迭代
const handleApplyImprovement = (improvement: string) => {
  emit('apply-improvement', {
    improvement,
    type: props.currentType || 'optimized',
  })
}

// ===== patchPlan 相关逻辑 =====

// 获取操作类型样式
const getOperationType = (op: string): 'success' | 'warning' | 'error' | 'info' => {
  switch (op) {
    case 'insert':
      return 'success'
    case 'replace':
      return 'warning'
    case 'delete':
      return 'error'
    default:
      return 'info'
  }
}

const getOperationLabel = (op: string): string => {
  return tOr(`evaluation.diagnose.operation.${op}`, op)
}

const handleApplyPatchLocal = (operation: PatchOperation) => {
  emit('apply-local-patch', { operation })
}
</script>

<style scoped>
/* ===== Micro-UX Animations & Interactions ===== */

/* Loading state with subtle pulse */
.evaluation-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: v-bind('SPACING.XXL + "px"') v-bind('SPACING.XL + "px"');
  gap: v-bind('SPACING.LG + "px"');
}

.loading-text {
  font-size: v-bind('FONT_SIZES.BASE + "px"');
  animation: loading-pulse 2s ease-in-out infinite;
}

@keyframes loading-pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.stream-preview {
  width: 100%;
  margin-top: v-bind('SPACING.LG + "px"');
  padding: v-bind('SPACING.MD + "px"');
  background: var(--n-color-embedded);
  border-radius: v-bind('BORDER_RADIUS.MD + "px"');
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stream-preview:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.stream-label {
  display: block;
  margin-bottom: v-bind('SPACING.SM + "px"');
  font-size: v-bind('FONT_SIZES.XS + "px"');
}

.stream-content {
  font-size: v-bind('FONT_SIZES.XS + "px"');
  white-space: pre-wrap;
  word-break: break-all;
}

/* Score section with enhanced animations */
.score-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: v-bind('SPACING.XL + "px"');
  background: var(--n-color-embedded);
  border-radius: v-bind('BORDER_RADIUS.LG + "px"');
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.score-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.overall-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid currentColor;
  margin-bottom: v-bind('SPACING.MD + "px"');
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: score-appear 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes score-appear {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.overall-score:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.score-value {
  font-size: v-bind('FONT_SIZES.XXXXL + "px"');
  font-weight: bold;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.overall-score:hover .score-value {
  transform: scale(1.1);
}

.score-label {
  font-size: v-bind('FONT_SIZES.XS + "px"');
  opacity: 0.8;
}

.score-level-text {
  font-size: v-bind('FONT_SIZES.BASE + "px"');
  animation: fade-in-up 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
}

@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 评分等级颜色 - 使用CSS变量从centralized constants */
.score-excellent {
  color: v-bind('EVALUATION_COLORS.EXCELLENT');
}

.score-good {
  color: v-bind('EVALUATION_COLORS.GOOD');
}

.score-acceptable {
  color: v-bind('EVALUATION_COLORS.AVERAGE');
}

.score-poor {
  color: v-bind('EVALUATION_COLORS.POOR');
}

.score-very-poor {
  color: v-bind('EVALUATION_COLORS.CRITICAL');
}

/* Dimension items with hover effects */
.dimension-item {
  width: 100%;
  padding: v-bind('SPACING.SM + "px"');
  border-radius: v-bind('BORDER_RADIUS.SM + "px"');
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dimension-item:hover {
  background: var(--n-color-embedded);
  transform: translateX(4px);
}

.dimension-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: v-bind('SPACING.XS + "px"');
}

.analysis-text {
  white-space: pre-wrap;
  line-height: 1.6;
}

/* 改进建议项 with enhanced interactions */
.improvement-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: v-bind('SPACING.SM + "px"');
  border-radius: v-bind('BORDER_RADIUS.SM + "px"');
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.improvement-item:hover {
  background: var(--n-color-embedded);
  transform: translateX(4px);
}

.improvement-text {
  flex: 1;
  word-break: break-word;
}

/* patchPlan 相关样式 with micro-interactions */
.patch-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  padding: v-bind('SPACING.SM + "px"');
  border-radius: v-bind('BORDER_RADIUS.MD + "px"');
  background: var(--n-color-embedded);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.patch-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.patch-header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.patch-instruction {
  flex: 1;
  word-break: break-word;
  font-size: v-bind('FONT_SIZES.SM + "px"');
}

.patch-diff-inline {
  background: var(--n-color-embedded);
  border-radius: v-bind('BORDER_RADIUS.SM + "px"');
  padding: v-bind('SPACING.SM + "px"') 10px;
  font-size: v-bind('FONT_SIZES.XS + "px"');
  border: 1px solid transparent;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.patch-item:hover .patch-diff-inline {
  border-color: var(--n-border-color);
}

.patch-apply-btn {
  align-self: flex-end;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.patch-apply-btn:hover {
  transform: scale(1.05);
}

.patch-apply-btn:active {
  transform: scale(0.98);
}

/* Card hover effects */
:deep(.n-card) {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.n-card:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* Button micro-interactions */
:deep(.n-button) {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.n-button:not(:disabled):hover) {
  transform: translateY(-1px);
}

:deep(.n-button:not(:disabled):active) {
  transform: scale(0.98) translateY(0);
}

:deep(.n-button--primary-type:not(:disabled):hover) {
  box-shadow: 0 4px 12px rgba(24, 160, 88, 0.3);
}

/* Focus visible rings for accessibility */
:deep(.n-button:focus-visible) {
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--n-primary-color-rgb, 24, 160, 88), 0.3);
}

/* List item hover effects */
:deep(.n-list-item) {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.n-list-item:hover) {
  background: var(--n-color-embedded);
}

/* Empty state animation */
:deep(.n-empty) {
  animation: fade-in-up 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Respect user motion preferences - Accessibility */
@media (prefers-reduced-motion: reduce) {
  .loading-text,
  .overall-score,
  .score-value,
  .score-level-text,
  .dimension-item,
  .improvement-item,
  .patch-item,
  :deep(.n-card),
  :deep(.n-button),
  :deep(.n-list-item),
  :deep(.n-empty) {
    animation: none !important;
    transition: none !important;
    transform: none !important;
  }

  .score-section:hover,
  .overall-score:hover,
  .dimension-item:hover,
  .improvement-item:hover,
  .patch-item:hover,
  :deep(.n-card:hover),
  :deep(.n-button:not(:disabled):hover) {
    transform: none !important;
    box-shadow: none !important;
  }
}
</style>
