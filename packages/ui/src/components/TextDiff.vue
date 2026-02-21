<template>
  <NCard
    class="text-diff"
    :style="{ height: '100%' }"
    :bordered="false"
    content-style="padding: 0; height: 100%; display: flex; flex-direction: column;"
  >
    <!-- 统计信息 -->
    <NFlex
      v-if="compareResult"
      justify="flex-end"
      align="center"
      :size="8"
      class="px-3 py-2 border-b"
      style="flex: 0 0 auto"
      role="status"
      aria-live="polite"
    >
      <NTag v-if="compareResult.summary.additions > 0" type="success" size="small">
        +{{ compareResult.summary.additions }}
      </NTag>
      <NTag v-if="compareResult.summary.deletions > 0" type="error" size="small">
        -{{ compareResult.summary.deletions }}
      </NTag>
    </NFlex>

    <!-- Screen reader summary -->
    <div class="sr-only" aria-live="polite" v-if="compareResult">
      {{
        t('diff.summary', {
          additions: compareResult.summary.additions,
          deletions: compareResult.summary.deletions,
        })
      }}
    </div>

    <!-- 文本内容 -->
    <NScrollbar class="text-diff-content" style="flex: 1; min-height: 0">
      <!-- 对比模式：显示高亮的差异 -->
      <div
        class="diff-text"
        v-if="compareResult"
        role="region"
        :aria-label="t('diff.comparisonLabel')"
      >
        <span
          v-for="fragment in compareResult.fragments"
          :key="fragment.index"
          :class="getFragmentClass(fragment.type)"
          class="text-fragment"
          :aria-label="getFragmentAriaLabel(fragment.type)"
          >{{ fragment.text }}</span
        >
      </div>
    </NScrollbar>
  </NCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useI18n } from 'vue-i18n'
import { NTag, NCard, NFlex, NScrollbar } from 'naive-ui'
import type { CompareResult, ChangeType } from '@prompt-optimizer/core'
import { useNaiveTheme } from '../composables/ui/useNaiveTheme'
import { FONT_SIZES, SPACING, BORDER_RADIUS } from '../config/constants'

const { t } = useI18n()

interface Props {
  /** 原始文本 */
  originalText: string
  /** 优化后的文本 */
  optimizedText: string
  /** 对比结果 */
  compareResult: CompareResult
}

defineProps<Props>()

// 获取当前主题配置
const { themeOverrides } = useNaiveTheme()
const theme = computed(() => themeOverrides.value)

const getFragmentClass = (type: ChangeType): string => {
  switch (type) {
    case 'added':
      return 'diff-added'
    case 'removed':
      return 'diff-removed'
    case 'unchanged':
    default:
      return 'diff-unchanged'
  }
}

const getFragmentAriaLabel = (type: ChangeType): string => {
  switch (type) {
    case 'added':
      return t('diff.added')
    case 'removed':
      return t('diff.removed')
    case 'unchanged':
    default:
      return ''
  }
}
</script>

<style scoped>
.text-diff-content {
  min-height: 200px;
}

/* Screen reader only - visually hidden but accessible to screen readers */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.diff-text,
.normal-text {
  padding: v-bind('`${SPACING.MD}px`') v-bind('`${SPACING.LG}px`');
  line-height: 1.6;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: v-bind('`${FONT_SIZES.BASE}px`');
  white-space: pre-wrap;
  word-break: break-word;
  width: 100%;
  box-sizing: border-box;
  color: var(--n-text-color);
}

.text-fragment {
  position: relative;
  border-radius: v-bind('BORDER_RADIUS.SM');
  padding: 1px 2px;
  animation: fragment-fade-in 0.3s ease-out;
}

@keyframes fragment-fade-in {
  from {
    opacity: 0;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.diff-added {
  background-color: v-bind('theme.common?.successColorSuppl || "rgba(34, 197, 94, 0.15)"');
  color: v-bind('theme.common?.successColor || "#16a34a"');
}

.diff-removed {
  background-color: v-bind('theme.common?.errorColorSuppl || "rgba(239, 68, 68, 0.15)"');
  color: v-bind('theme.common?.errorColor || "#dc2626"');
  text-decoration: line-through;
}

.diff-unchanged {
  color: v-bind('theme.common?.textColor3 || "#6b7280"');
}

/* 响应式设计 */
@media (max-width: 768px) {
  .diff-text,
  .normal-text {
    font-size: v-bind('`${FONT_SIZES.XS}px`');
  }
}
</style>
