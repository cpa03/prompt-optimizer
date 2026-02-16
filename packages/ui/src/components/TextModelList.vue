<template>
  <NSpace vertical :size="12">
    <NCard
      v-for="model in models"
      :key="model.id"
      hoverable
      :style="{ opacity: model.enabled ? 1 : 0.6 }"
    >
      <template #header>
        <NSpace justify="space-between" align="center">
          <NSpace vertical :size="2">
            <NSpace align="center">
              <NText strong>{{ model.name }}</NText>
              <NTag v-if="!model.enabled" type="warning" size="small">
                {{ t('modelManager.disabled') }}
              </NTag>
            </NSpace>

            <NSpace :size="6">
              <NTag size="small" type="info" :bordered="false">
                {{ model.providerMeta?.name || model.providerMeta?.id }}
              </NTag>
              <NTag size="small" type="primary" :bordered="false">
                {{ model.modelMeta?.name || model.modelMeta?.id }}
              </NTag>
              <NTag
                v-if="model.providerMeta?.corsRestricted && !isElectronEnv"
                size="small"
                type="error"
                :bordered="false"
              >
                {{ t('modelManager.corsRestrictedTag') }}
              </NTag>
              <NTag
                v-if="model.modelMeta?.capabilities?.supportsTools"
                size="small"
                type="success"
                :bordered="false"
              >
                {{ t('modelManager.capabilities.tools') }}
              </NTag>
              <NTag
                v-if="model.modelMeta?.capabilities?.supportsReasoning"
                size="small"
                type="warning"
                :bordered="false"
              >
                {{ t('modelManager.capabilities.reasoning') }}
              </NTag>
            </NSpace>
          </NSpace>
        </NSpace>
      </template>

      <template #header-extra>
        <NSpace @click.stop>
          <NButton
            @click="emit('test', model.id)"
            size="small"
            quaternary
            :disabled="isTestingConnectionFor(model.id)"
            :loading="isTestingConnectionFor(model.id)"
          >
            <template #icon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-4 w-4"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </template>
            <span class="hidden md:inline">{{ t('modelManager.testConnection') }}</span>
          </NButton>

          <NButton @click="emit('edit', model.id)" size="small" quaternary>
            <template #icon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="h-4 w-4"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
            </template>
            <span class="hidden md:inline">{{ t('modelManager.editModel') }}</span>
          </NButton>

          <NButton
            @click="emit(model.enabled ? 'disable' : 'enable', model.id)"
            size="small"
            :type="model.enabled ? 'warning' : 'success'"
            quaternary
          >
            <template #icon>
              <svg
                v-if="model.enabled"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-4 w-4"
              >
                <path d="M12 6v.343" />
                <path d="M18.218 18.218A7 7 0 0 1 5 15V9a7 7 0 0 1 .782-3.218" />
                <path d="M19 13.343V9A7 7 0 0 0 8.56 2.902" />
                <path d="M22 22 2 2" />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-4 w-4"
              >
                <rect x="5" y="2" width="14" height="20" rx="7" />
                <path d="M12 6v4" />
              </svg>
            </template>
            <span class="hidden md:inline">
              {{ model.enabled ? t('common.disable') : t('common.enable') }}
            </span>
          </NButton>

          <NButton
            v-if="!isDefaultModel(model.id)"
            @click="emit('delete', model.id)"
            size="small"
            type="error"
            quaternary
          >
            <template #icon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="h-4 w-4"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
            </template>
            <span class="hidden md:inline">{{ t('common.delete') }}</span>
          </NButton>
        </NSpace>
      </template>
    </NCard>
  </NSpace>
</template>

<script setup lang="ts">
import { type PropType } from 'vue'

import { useI18n } from 'vue-i18n'
import { NButton, NCard, NTag, NText, NSpace } from 'naive-ui'
import { isRunningInElectron, type TextModelConfig } from '@prompt-optimizer/core'

const { models, isTestingConnectionFor, isDefaultModel } = defineProps({
  models: {
    type: Array as PropType<TextModelConfig[]>,
    default: () => [],
  },
  isTestingConnectionFor: {
    type: Function as PropType<(id: string) => boolean>,
    required: true,
  },
  isDefaultModel: {
    type: Function as PropType<(id: string) => boolean>,
    required: true,
  },
})

const emit = defineEmits(['test', 'edit', 'enable', 'disable', 'delete'])

const { t } = useI18n()

const isElectronEnv = isRunningInElectron()
</script>

<style scoped>
/* 🎨 Palette: Micro-UX improvements for TextModelList */

/* Card hover effects */
.n-card {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.n-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Button micro-interactions */
.n-button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.n-button:not(:disabled):hover {
  transform: translateY(-1px);
}

.n-button:not(:disabled):active {
  transform: scale(0.96) translateY(0);
}

/* Test connection button - blue accent */
.n-button[quaternary]:not(.n-button--error-type):not(.n-button--success-type):not(
    .n-button--warning-type
  ):hover {
  color: #2080f0;
  background-color: rgba(32, 128, 240, 0.1);
}

/* Enable button - green accent */
.n-button--success-type:hover {
  box-shadow: 0 4px 12px rgba(24, 160, 88, 0.3);
}

/* Disable button - yellow accent */
.n-button--warning-type:hover {
  box-shadow: 0 4px 12px rgba(240, 160, 32, 0.3);
}

/* Delete button - red accent */
.n-button--error-type:hover {
  box-shadow: 0 4px 12px rgba(208, 48, 80, 0.3);
}

/* Icon animations within buttons */
.n-button svg {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.n-button:not(:disabled):hover svg {
  transform: scale(1.15);
}

.n-button:not(:disabled):active svg {
  transform: scale(0.95);
}

/* Focus visible rings for accessibility */
.n-button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--n-primary-color-rgb, 24, 160, 88), 0.3);
}

/* Tag hover effects */
.n-tag {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.n-tag:hover {
  transform: scale(1.05);
}

/* Reduced motion support for accessibility */
@media (prefers-reduced-motion: reduce) {
  .n-card,
  .n-button,
  .n-tag,
  .n-button svg {
    transition: none !important;
    animation: none !important;
  }

  .n-card:hover,
  .n-button:not(:disabled):hover,
  .n-tag:hover {
    transform: none !important;
    box-shadow: none !important;
  }

  .n-button:not(:disabled):hover svg {
    transform: none !important;
  }
}
</style>
