<template>
  <Transition name="tool-call-fade" appear>
    <div v-if="toolCalls && toolCalls.length > 0" class="tool-call-display">
      <NCollapse v-model:expanded-names="expandedNames">
        <NCollapseItem name="tool-calls">
          <template #header>
            <NSpace align="center" :size="8">
              <NIcon :size="16" class="tool-call-header-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </NIcon>
              <NText>{{ t('toolCall.title') }}</NText>
              <NTag :size="size" type="info" class="tool-call-count-tag">
                {{ t('toolCall.count', { count: toolCalls.length }) }}
              </NTag>
            </NSpace>
          </template>

          <TransitionGroup name="tool-call-item" tag="div" class="tool-call-items-container">
            <div
              v-for="(toolCall, index) in toolCalls"
              :key="`tool-call-${toolCall.toolCall.id || index}`"
              class="tool-call-item"
              :class="{ 'tool-call-item--new': isNewItem(index) }"
            >
              <NCard :size="cardSize" embedded class="tool-call-card">
                <template #header>
                  <NSpace justify="space-between" align="center">
                    <NSpace align="center" :size="8">
                      <NText strong class="tool-call-name">{{
                        toolCall.toolCall.function.name
                      }}</NText>
                      <NTag
                        :size="tagSize"
                        :type="getStatusTagType(toolCall.status)"
                        class="tool-call-status-tag"
                      >
                        {{ t(`toolCall.status.${toolCall.status}`) }}
                      </NTag>
                    </NSpace>
                  </NSpace>
                </template>

                <!-- 工具参数 -->
                <div v-if="toolCall.toolCall.function.arguments" class="tool-arguments">
                  <NText depth="3" :size="textSize" class="section-title">
                    {{ t('toolCall.arguments') }}
                  </NText>
                  <NCode
                    :code="formatArguments(toolCall.toolCall.function.arguments)"
                    language="json"
                    :word-wrap="true"
                    class="mt-2"
                  />
                </div>

                <!-- 工具结果 -->
                <div v-if="toolCall.result" class="tool-result mt-3">
                  <NText depth="3" :size="textSize" class="section-title">
                    {{ t('toolCall.result') }}
                  </NText>
                  <NCode
                    :code="formatResult(toolCall.result)"
                    language="json"
                    :word-wrap="true"
                    class="mt-2"
                  />
                </div>

                <!-- 错误信息 -->
                <div v-if="toolCall.error" class="tool-error mt-3">
                  <NText depth="3" :size="textSize" class="section-title">
                    {{ t('toolCall.error') }}
                  </NText>
                  <NAlert type="error" :size="size" class="mt-2">
                    {{ toolCall.error }}
                  </NAlert>
                </div>
              </NCard>
            </div>
          </TransitionGroup>
        </NCollapseItem>
      </NCollapse>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useI18n } from 'vue-i18n'
import {
  NCollapse,
  NCollapseItem,
  NSpace,
  NIcon,
  NText,
  NTag,
  NCard,
  NCode,
  NAlert,
} from 'naive-ui'
import type { ToolCallResult } from '@prompt-optimizer/core'

const { t } = useI18n()

interface Props {
  /** 工具调用结果列表 */
  toolCalls?: ToolCallResult[]
  /** 组件尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 卡片尺寸 */
  cardSize?: 'small' | 'medium' | 'large'
  /** 默认是否展开 */
  defaultExpanded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'small',
  cardSize: 'small',
  defaultExpanded: true,
})

// 展开状态管理
const expandedNames = ref<string[]>([])

// Track seen tool call IDs for animation
const seenToolCallIds = ref<Set<string>>(new Set())

// Check if item is new (for animation)
const isNewItem = (index: number) => {
  const toolCall = props.toolCalls?.[index]
  if (!toolCall?.toolCall.id) return false
  return !seenToolCallIds.value.has(toolCall.toolCall.id)
}

// 监听工具调用变化，自动展开并跟踪新项
watch(
  () => props.toolCalls,
  (newToolCalls) => {
    if (newToolCalls && newToolCalls.length > 0 && props.defaultExpanded) {
      // 有新工具调用时自动展开
      if (!expandedNames.value.includes('tool-calls')) {
        expandedNames.value = ['tool-calls']
      }
    }

    // Track new tool calls for animation
    if (newToolCalls) {
      newToolCalls.forEach((tc, index) => {
        const id = tc.toolCall.id || `index-${index}`
        if (!seenToolCallIds.value.has(id)) {
          // Mark as seen after animation duration
          setTimeout(() => {
            seenToolCallIds.value.add(id)
          }, 600)
        }
      })
    }
  },
  { immediate: true }
)

// 计算属性
const tagSize = computed(() => {
  const sizeMap = { small: 'small', medium: 'small', large: 'medium' } as const
  return sizeMap[props.size] || 'small'
})

const textSize = computed(() => {
  const sizeMap = { small: 'small', medium: 'medium', large: 'large' } as const
  return sizeMap[props.size] || 'small'
})

// 工具函数
const getStatusTagType = (status: string) => {
  switch (status) {
    case 'success':
      return 'success'
    case 'error':
      return 'error'
    case 'pending':
      return 'warning'
    default:
      return 'default'
  }
}

const formatArguments = (args: string | object) => {
  if (typeof args === 'string') {
    try {
      const parsed = JSON.parse(args)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return args
    }
  }
  return JSON.stringify(args, null, 2)
}

const formatResult = (result: string | Record<string, unknown> | Array<unknown>) => {
  if (typeof result === 'string') {
    return result
  }
  return JSON.stringify(result, null, 2)
}
</script>

<style scoped>
.tool-call-display {
  margin-top: 12px;
}

/* Tool call header icon animation */
.tool-call-header-icon {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tool-call-display:hover .tool-call-header-icon {
  transform: rotate(15deg);
}

/* Tool call count tag pulse animation */
.tool-call-count-tag {
  transition: all 0.2s ease;
}

.tool-call-display:hover .tool-call-count-tag {
  transform: scale(1.05);
}

/* Individual tool call card */
.tool-call-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tool-call-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.tool-call-name {
  transition: color 0.2s ease;
}

.tool-call-card:hover .tool-call-name {
  color: var(--n-primary-color);
}

.tool-call-status-tag {
  transition: all 0.2s ease;
}

.tool-call-card:hover .tool-call-status-tag {
  transform: scale(1.05);
}

/* Tool call items container */
.tool-call-items-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.tool-arguments,
.tool-result,
.tool-error {
  border-left: 2px solid var(--n-border-color);
  padding-left: 12px;
  transition: border-color 0.2s ease;
}

.tool-call-card:hover .tool-arguments,
.tool-call-card:hover .tool-result,
.tool-call-card:hover .tool-error {
  border-color: var(--n-primary-color);
}

/* ============================================
   ANIMATION TRANSITIONS
   ============================================ */

/* Fade transition for the entire component */
.tool-call-fade-enter-active,
.tool-call-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.tool-call-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.tool-call-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* List item transitions */
.tool-call-item-move,
.tool-call-item-enter-active,
.tool-call-item-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.tool-call-item-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.tool-call-item-leave-to {
  opacity: 0;
  transform: translateX(-20px) scale(0.95);
}

.tool-call-item-leave-active {
  position: absolute;
}

/* New item highlight animation */
.tool-call-item--new .tool-call-card {
  animation: newItemPulse 0.6s ease-out;
}

@keyframes newItemPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--n-primary-color-rgb, 24, 160, 88), 0.4);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(var(--n-primary-color-rgb, 24, 160, 88), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--n-primary-color-rgb, 24, 160, 88), 0);
  }
}

/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .tool-call-fade-enter-active,
  .tool-call-fade-leave-active,
  .tool-call-item-move,
  .tool-call-item-enter-active,
  .tool-call-item-leave-active,
  .tool-call-card,
  .tool-call-header-icon,
  .tool-call-count-tag,
  .tool-call-name,
  .tool-call-status-tag {
    transition: none !important;
    animation: none !important;
  }

  .tool-call-item--new .tool-call-card {
    animation: none !important;
  }
}
</style>
