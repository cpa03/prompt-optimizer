<template>
  <slot v-if="!hasError" />
  <div v-else class="error-boundary">
    <n-result status="error" title="出现了一些问题" :description="errorMessage">
      <template #footer>
        <n-space justify="center">
          <n-button @click="handleRetry">重试</n-button>
          <n-button v-if="showReset" @click="handleReset">重置组件</n-button>
        </n-space>
      </template>
    </n-result>
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { NResult, NButton, NSpace } from 'naive-ui'

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

  // 触发自定义错误回调
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
