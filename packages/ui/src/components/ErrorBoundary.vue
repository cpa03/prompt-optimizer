<template>
  <slot v-if="!hasError" />
  <div v-else class="error-boundary">
    <n-result status="error" :title="t('errorBoundary.title')" :description="errorMessage">
      <template #footer>
        <n-space justify="center">
          <n-button @click="handleRetry">{{ t('errorBoundary.retry') }}</n-button>
          <n-button v-if="showReset" @click="handleReset">{{ t('errorBoundary.reset') }}</n-button>
        </n-space>
      </template>
    </n-result>
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { useI18n } from 'vue-i18n'
import { NResult, NButton, NSpace } from 'naive-ui'

const { t } = useI18n()

export interface ErrorBoundaryProps {
  /**
   * 是否显示重置按钮
   * @default true
   */
  showReset?: boolean

  /**
   * 自定义错误处理回调
   */
  onError?: (error: Error) => void
}

const props = withDefaults(defineProps<ErrorBoundaryProps>(), {
  showReset: true,
})

const emit = defineEmits<{
  error: [error: Error]
  retry: []
}>()

const hasError = ref(false)
const errorMessage = ref('')

onErrorCaptured((err: Error, _instance: unknown, _info: string) => {
  hasError.value = true
  errorMessage.value = err.message || '未知错误'

  // Log error for debugging and monitoring
  console.error('[ErrorBoundary] Caught error:', err)
  if (props.onError) {
    props.onError(err)
  }

  emit('error', err)

  // 返回 false 阻止错误继续传播
  return false
})

function handleRetry() {
  hasError.value = false
  errorMessage.value = ''
  emit('retry')
}

function handleReset() {
  hasError.value = false
  errorMessage.value = ''
}
</script>

<style scoped>
.error-boundary {
  width: 100%;
  padding: 16px;
}
</style>
