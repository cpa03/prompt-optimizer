<template>
  <slot v-if="!hasError" />
  <div v-else class="error-boundary">
    <n-result :status="resultStatus" :title="errorTitle" :description="errorMessage">
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
import { ref, computed, onErrorCaptured } from 'vue'
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

  /**
   * 错误日志记录回调，用于集成外部日志服务
   */
  onLogError?: (error: Error, errorInfo: ErrorInfo) => void
}

export interface ErrorInfo {
  type: string
  timestamp: string
  componentStack?: string
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
const errorType = ref<string>('Error')

interface ErrorTypeConfig {
  status: 'error' | 'warning' | 'info' | 'success' | 403 | 404 | 500 | 503
  title: string
}

const errorTypeConfigs: Record<string, ErrorTypeConfig> = {
  Error: { status: 'error', title: 'errorBoundary.title' },
  TypeError: { status: 'error', title: 'errorBoundary.typeError' },
  ReferenceError: { status: 'error', title: 'errorBoundary.referenceError' },
  SyntaxError: { status: 'error', title: 'errorBoundary.syntaxError' },
  RangeError: { status: 'error', title: 'errorBoundary.rangeError' },
  DOMException: { status: 'error', title: 'errorBoundary.domError' },
  NetworkError: { status: 503, title: 'errorBoundary.networkError' },
  FetchError: { status: 503, title: 'errorBoundary.networkError' },
  TimeoutError: { status: 503, title: 'errorBoundary.timeoutError' },
}

function detectErrorType(error: Error): string {
  const name = error.constructor.name
  const message = error.message.toLowerCase()

  if (name === 'Error') {
    if (message.includes('network') || message.includes('fetch')) return 'NetworkError'
    if (message.includes('timeout')) return 'TimeoutError'
  }

  return name
}

const resultStatus = computed(() => {
  const config = errorTypeConfigs[errorType.value]
  return config?.status || 'error'
})

const errorTitle = computed(() => {
  const config = errorTypeConfigs[errorType.value]
  return config?.title ? t(config.title) : t('errorBoundary.title')
})

function formatErrorForLog(error: Error, info: string): ErrorInfo {
  return {
    type: error.constructor.name,
    timestamp: new Date().toISOString(),
    componentStack: info,
  }
}

onErrorCaptured((err: Error, _instance: unknown, _info: string) => {
  hasError.value = true
  errorType.value = detectErrorType(err)
  errorMessage.value = err.message || '未知错误'

  const errorInfo = formatErrorForLog(err, _info)

  console.error('[ErrorBoundary] Caught error:', {
    type: errorInfo.type,
    message: errorMessage.value,
    timestamp: errorInfo.timestamp,
    stack: err.stack,
  })

  if (props.onError) {
    props.onError(err)
  }

  if (props.onLogError) {
    props.onLogError(err, errorInfo)
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
