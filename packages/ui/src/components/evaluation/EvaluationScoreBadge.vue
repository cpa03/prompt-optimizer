<template>
  <NPopover
    v-model:show="popoverVisible"
    trigger="manual"
    placement="bottom"
    :disabled="loading"
    :delay="200"
    :duration="150"
  >
    <template #trigger>
      <div
        class="evaluation-score-badge"
        :class="[sizeClass, levelClass, { clickable: !loading, loading, 'score-updating': isScoreUpdating }]"
        :data-testid="`score-badge-${type}`"
        :data-eval-type="type"
        @click="handleClick"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      >
        <template v-if="loading">
          <NSpin :size="spinSize" data-testid="score-loading" />
        </template>
        <template v-else-if="score !== null && score !== undefined">
          <span class="score-value" :class="{ 'score-pop': showScorePop }" data-testid="score-value">
            {{ displayScore }}
          </span>
          <span v-if="showScoreChangeIndicator" class="score-change-indicator" :class="scoreChangeDirection">
            {{ scoreChangeSymbol }}
          </span>
        </template>
        <template v-else>
          <span class="score-placeholder">--</span>
        </template>
      </div>
    </template>
    <EvaluationHoverCard
      :result="result"
      :type="type"
      :loading="loading"
      @show-detail="handleShowDetail"
      @evaluate="handleEvaluate"
      @apply-improvement="handleApplyImprovement"
      @apply-patch="handleApplyPatch"
      @mouseenter="handlePopoverMouseEnter"
      @mouseleave="handlePopoverMouseLeave"
    />
  </NPopover>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { NSpin, NPopover } from 'naive-ui'
import EvaluationHoverCard from './EvaluationHoverCard.vue'
import { COMPONENT_CONSTANTS } from '../../config/constants'
import type { EvaluationResponse, EvaluationType, PatchOperation } from '@prompt-optimizer/core'
import type { ScoreLevel } from './types'

// 🎨 Palette: Score animation state
const displayScore = ref<number>(0)
const isScoreUpdating = ref(false)
const showScorePop = ref(false)
const showScoreChangeIndicator = ref(false)
const scoreChangeDirection = ref<'up' | 'down' | null>(null)
const scoreChangeSymbol = computed(() => {
  if (scoreChangeDirection.value === 'up') return '↑'
  if (scoreChangeDirection.value === 'down') return '↓'
  return ''
})
const previousScore = ref<number | null>(null)

const props = withDefaults(
  defineProps<{
    /** 分数值 (0-100) */
    score?: number | null
    /** 评分等级 */
    level?: ScoreLevel | null
    /** 是否正在加载 */
    loading?: boolean
    /** 尺寸 */
    size?: 'small' | 'medium'
    /** 评估结果（用于悬浮预览） */
    result?: EvaluationResponse | null
    /** 评估类型 */
    type?: EvaluationType
  }>(),
  {
    score: null,
    level: null,
    loading: false,
    size: 'small',
    result: null,
    type: 'original',
  }
)

const emit = defineEmits<{
  (e: 'show-detail'): void
  (e: 'evaluate'): void
  (e: 'apply-improvement', payload: { improvement: string; type: EvaluationType }): void
  (e: 'apply-patch', payload: { operation: PatchOperation }): void
}>()

// 🎨 Palette: Score animation utilities
const animateScoreChange = (from: number, to: number) => {
  const duration = 800 // ms
  const startTime = performance.now()
  const diff = to - from
  
  // Determine direction for indicator
  if (diff > 0) {
    scoreChangeDirection.value = 'up'
  } else if (diff < 0) {
    scoreChangeDirection.value = 'down'
  }
  
  // Show change indicator briefly
  if (diff !== 0) {
    showScoreChangeIndicator.value = true
    setTimeout(() => {
      showScoreChangeIndicator.value = false
    }, 2000)
  }
  
  // Start update animation
  isScoreUpdating.value = true
  showScorePop.value = true
  
  const easeOutQuart = (t: number): number => {
    return 1 - Math.pow(1 - t, 4)
  }
  
  const step = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easeOutQuart(progress)
    
    displayScore.value = Math.round(from + diff * easedProgress)
    
    if (progress < 1) {
      requestAnimationFrame(step)
    } else {
      // Animation complete
      displayScore.value = to
      isScoreUpdating.value = false
      setTimeout(() => {
        showScorePop.value = false
      }, 200)
    }
  }
  
  requestAnimationFrame(step)
}

// Watch for score changes
watch(() => props.score, (newScore, oldScore) => {
  if (newScore !== null && newScore !== undefined) {
    if (previousScore.value === null) {
      // First render - just set the value
      displayScore.value = newScore
    } else if (oldScore !== newScore) {
      // Score changed - animate
      animateScoreChange(previousScore.value ?? oldScore ?? 0, newScore)
    }
    previousScore.value = newScore
  }
}, { immediate: true })

// Popover 显示状态
const popoverVisible = ref(false)
const isHoveringBadge = ref(false)
const isHoveringPopover = ref(false)

// 计算等级（如果未提供则根据分数计算）
const computedLevel = computed<ScoreLevel | null>(() => {
  if (props.level) return props.level
  if (props.score === null || props.score === undefined) return null
  if (props.score >= 90) return 'excellent'
  if (props.score >= 80) return 'good'
  if (props.score >= 60) return 'acceptable'
  if (props.score >= 40) return 'poor'
  return 'very-poor'
})

// 尺寸类
const sizeClass = computed(() => `size-${props.size}`)

// 等级颜色类
const levelClass = computed(() => {
  if (!computedLevel.value) return ''
  return `level-${computedLevel.value}`
})

// 加载图标尺寸
const spinSize = computed(() => (props.size === 'small' ? 12 : 16))

// 点击处理 - 显示/隐藏悬浮预览
const handleClick = () => {
  if (!props.loading) {
    popoverVisible.value = !popoverVisible.value
  }
}

// 鼠标进入徽章
const handleMouseEnter = () => {
  if (!props.loading) {
    isHoveringBadge.value = true
    popoverVisible.value = true
  }
}

// 鼠标离开徽章
const handleMouseLeave = () => {
  isHoveringBadge.value = false
  // 延迟检查，给用户时间移动到 popover
  setTimeout(() => {
    if (!isHoveringBadge.value && !isHoveringPopover.value) {
      popoverVisible.value = false
    }
  }, 100)
}

// 鼠标进入 popover
const handlePopoverMouseEnter = () => {
  isHoveringPopover.value = true
}

// 鼠标离开 popover
const handlePopoverMouseLeave = () => {
  isHoveringPopover.value = false
  // 延迟检查
  setTimeout(() => {
    if (!isHoveringBadge.value && !isHoveringPopover.value) {
      popoverVisible.value = false
    }
  }, 100)
}

// 查看详情处理 - 关闭悬浮预览并打开详情面板
const handleShowDetail = () => {
  popoverVisible.value = false
  emit('show-detail')
}

// 评估处理 - 关闭悬浮预览并触发评估
const handleEvaluate = () => {
  popoverVisible.value = false
  emit('evaluate')
}

// 应用改进建议处理 - 关闭悬浮预览并转发事件
const handleApplyImprovement = (payload: { improvement: string; type: EvaluationType }) => {
  popoverVisible.value = false
  emit('apply-improvement', payload)
}

// 应用补丁处理 - 关闭悬浮预览并转发事件
const handleApplyPatch = (payload: { operation: PatchOperation }) => {
  popoverVisible.value = false
  emit('apply-patch', payload)
}
</script>

<style scoped>
.evaluation-score-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-weight: 600;
  transition: all 0.2s ease;
  user-select: none;
}

/* 尺寸 - using centralized constants */
.size-small {
  min-width: v-bind('COMPONENT_CONSTANTS.EVALUATION_SCORE_BADGE.SMALL.MIN_WIDTH')px;
  height: v-bind('COMPONENT_CONSTANTS.EVALUATION_SCORE_BADGE.SMALL.HEIGHT')px;
  padding: 0 v-bind('COMPONENT_CONSTANTS.EVALUATION_SCORE_BADGE.SMALL.PADDING_HORIZONTAL')px;
  font-size: v-bind('COMPONENT_CONSTANTS.EVALUATION_SCORE_BADGE.SMALL.FONT_SIZE')px;
}

.size-medium {
  min-width: v-bind('COMPONENT_CONSTANTS.EVALUATION_SCORE_BADGE.MEDIUM.MIN_WIDTH')px;
  height: v-bind('COMPONENT_CONSTANTS.EVALUATION_SCORE_BADGE.MEDIUM.HEIGHT')px;
  padding: 0 v-bind('COMPONENT_CONSTANTS.EVALUATION_SCORE_BADGE.MEDIUM.PADDING_HORIZONTAL')px;
  font-size: v-bind('COMPONENT_CONSTANTS.EVALUATION_SCORE_BADGE.MEDIUM.FONT_SIZE')px;
}

/* 可点击状态 */
.clickable:not(.loading) {
  cursor: pointer;
}

.clickable:not(.loading):hover {
  opacity: 0.85;
  transform: scale(1.05);
}

/* 加载状态 */
.loading {
  background: var(--n-color-embedded, #f5f5f5);
  color: var(--n-text-color-3, #999);
}

/* 等级颜色 */
.level-excellent {
  background: rgba(24, 160, 88, 0.15);
  color: #18a058;
}

.level-good {
  background: rgba(32, 128, 240, 0.15);
  color: #2080f0;
}

.level-acceptable {
  background: rgba(240, 160, 32, 0.15);
  color: #f0a020;
}

.level-poor {
  background: rgba(208, 48, 80, 0.15);
  color: #d03050;
}

.level-very-poor {
  background: rgba(208, 48, 80, 0.2);
  color: #d03050;
}

/* 占位符样式 */
.score-placeholder {
  color: var(--n-text-color-3, #999);
}

/* 无等级时的默认样式 */
.evaluation-score-badge:not([class*='level-']):not(.loading) {
  background: var(--n-color-embedded, #f5f5f5);
}

/* 🎨 Palette: Score value with pop animation */
.score-value {
  display: inline-block;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.score-value.score-pop {
  animation: score-pop-bounce 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes score-pop-bounce {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.3);
  }
  60% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
}

/* 🎨 Palette: Score updating state with subtle glow */
.evaluation-score-badge.score-updating {
  animation: score-glow-pulse 0.8s ease-out;
}

@keyframes score-glow-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--n-primary-color-rgb, 24, 160, 88), 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(var(--n-primary-color-rgb, 24, 160, 88), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--n-primary-color-rgb, 24, 160, 88), 0);
  }
}

/* 🎨 Palette: Score change indicator */
.score-change-indicator {
  position: absolute;
  top: -4px;
  right: -4px;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 3px;
  border-radius: 3px;
  animation: indicator-fade-in 0.3s ease-out;
  pointer-events: none;
}

.score-change-indicator.up {
  background: rgba(24, 160, 88, 0.9);
  color: white;
  animation: indicator-float-up 2s ease-out forwards;
}

.score-change-indicator.down {
  background: rgba(208, 48, 80, 0.9);
  color: white;
  animation: indicator-float-down 2s ease-out forwards;
}

@keyframes indicator-fade-in {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes indicator-float-up {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  20% {
    transform: translateY(-8px);
  }
  100% {
    opacity: 0;
    transform: translateY(-16px);
  }
}

@keyframes indicator-float-down {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  20% {
    transform: translateY(8px);
  }
  100% {
    opacity: 0;
    transform: translateY(16px);
  }
}

/* Ensure badge has relative positioning for indicator */
.evaluation-score-badge {
  position: relative;
}

/* 🎨 Palette: Reduced motion support for accessibility */
@media (prefers-reduced-motion: reduce) {
  .score-value,
  .score-value.score-pop {
    animation: none;
    transform: none;
  }
  
  .evaluation-score-badge.score-updating {
    animation: none;
    box-shadow: none;
  }
  
  .score-change-indicator,
  .score-change-indicator.up,
  .score-change-indicator.down {
    animation: none;
    opacity: 0.8;
    transform: none;
  }
}
</style>
