<template>
  <!-- 导入模式 -->
  <NModal
    v-if="mode === 'import'"
    v-model:show="localVisible"
    preset="dialog"
    :title="t('contextEditor.importTitle')"
    :show-icon="false"
    :style="{ width: UI_DIMENSIONS.MODAL_WIDTH_SMALL }"
    :mask-closable="false"
    @update:show="handleVisibilityChange"
  >
    <template #default>
      <!-- 格式选择 -->
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">{{ t('contextEditor.importFormat') }}</label>
        <NSpace size="small" wrap>
          <NButton
            v-for="format in importFormats"
            :key="format.id"
            @click="selectedImportFormat = format.id"
            :type="selectedImportFormat === format.id ? 'primary' : 'default'"
            size="small"
          >
            {{ format.name }}
          </NButton>
        </NSpace>
        <p class="text-xs text-gray-500 mt-2">
          {{ importFormats.find((f) => f.id === selectedImportFormat)?.description }}
        </p>
      </div>

      <!-- 文件上传 -->
      <div class="mb-4">
        <NSpace align="center" :size="8" class="mb-2">
          <input
            type="file"
            ref="fileInputRef"
            accept=".json,.txt"
            @change="handleFileUpload"
            class="hidden"
          />
          <NButton @click="fileInputRef?.click()" secondary size="small">
            <template #icon>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </template>
            {{ t('contextEditor.selectFile') }}
          </NButton>
          <NText depth="3" class="text-sm">
            {{ t('contextEditor.orPasteText') }}
          </NText>
        </NSpace>
      </div>

      <!-- 文本输入区域 -->
      <NInput
        v-model:value="importData"
        type="textarea"
        :placeholder="getImportPlaceholder()"
        :autosize="{ minRows: 12, maxRows: 16 }"
        class="font-mono text-sm"
      />

      <div v-if="importError" class="text-sm text-red-500 mt-2">
        {{ importError }}
      </div>
    </template>

    <template #action>
      <NSpace justify="end">
        <NButton @click="handleClose" size="small">
          {{ t('common.cancel') }}
        </NButton>
        <NButton
          @click="handleImportSubmit"
          :disabled="!importData.trim()"
          type="primary"
          size="small"
          :loading="loading"
        >
          {{ t('contextEditor.import') }}
        </NButton>
      </NSpace>
    </template>
  </NModal>

  <!-- 导出模式 -->
  <NModal
    v-else
    v-model:show="localVisible"
    preset="dialog"
    :title="t('contextEditor.exportTitle')"
    :show-icon="false"
    :style="{ width: UI_DIMENSIONS.MODAL_WIDTH_SMALL }"
    :mask-closable="false"
    @update:show="handleVisibilityChange"
  >
    <template #default>
      <!-- 格式选择 -->
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">{{ t('contextEditor.exportFormat') }}</label>
        <NSpace size="small" wrap>
          <NButton
            v-for="format in exportFormats"
            :key="format.id"
            @click="selectedExportFormat = format.id"
            :type="selectedExportFormat === format.id ? 'primary' : 'default'"
            size="small"
          >
            {{ format.name }}
          </NButton>
        </NSpace>
        <p class="text-xs text-gray-500 mt-2">
          {{ exportFormats.find((f) => f.id === selectedExportFormat)?.description }}
        </p>
      </div>

      <!-- 导出预览 -->
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">{{ t('contextEditor.exportPreview') }}</label>
        <NInput
          :value="exportPreviewData"
          readonly
          type="textarea"
          :autosize="{ minRows: 8, maxRows: 12 }"
          class="font-mono text-sm"
        />
        <div v-if="exportError" class="text-sm text-red-500 mt-2">
          {{ exportError }}
        </div>
      </div>
    </template>

    <template #action>
      <NSpace justify="space-between">
        <NButton @click="handleClose" size="small">
          {{ t('common.cancel') }}
        </NButton>

        <NSpace>
          <NButton @click="handleExportToClipboard" secondary size="small" :loading="loading">
            <template #icon>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </template>
            {{ t('contextEditor.copyToClipboard') }}
          </NButton>
          <NButton @click="handleExportToFile" type="primary" size="small" :loading="loading">
            <template #icon>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                />
              </svg>
            </template>
            {{ t('contextEditor.saveToFile') }}
          </NButton>
        </NSpace>
      </NSpace>
    </template>
  </NModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { NModal, NButton, NSpace, NInput, NText } from 'naive-ui'
import { useContextEditor } from '../../composables/context/useContextEditor'
import type { ConversationMessage, ToolDefinition } from '@prompt-optimizer/core'
import type { StandardPromptData } from '../../types'
import { UI_DIMENSIONS } from '../../config/constants'
import {
  IMPORT_FORMAT_OPENAI,
  IMPORT_FORMAT_LANGFUSE,
  IMPORT_FORMAT_CONVERSATION,
  IMPORT_FORMAT_SMART,
  EXPORT_FORMAT_OPENAI,
  EXPORT_FORMAT_STANDARD,
  type ImportFormat,
  type ExportFormat,
} from '../../constants/import-export-formats'

// 类型定义
interface Props {
  visible: boolean
  mode: 'import' | 'export'
  messages: ConversationMessage[]
  tools?: ToolDefinition[]
}

interface ImportSuccessData {
  messages: ConversationMessage[]
  tools?: ToolDefinition[]
}

// Props 和 Events
const props = withDefaults(defineProps<Props>(), {
  tools: () => [],
})

const emit = defineEmits<{
  'update:visible': [visible: boolean]
  'import-success': [data: ImportSuccessData]
  'export-success': []
  'export-error': [message?: string]
}>()

const { t } = useI18n()

// 复用 useContextEditor
const contextEditor = useContextEditor()

// 本地状态
const localVisible = ref(props.visible)
const loading = ref(false)
const importData = ref('')
const importError = ref('')
const exportError = ref('')
const selectedImportFormat = ref<ImportFormat>(IMPORT_FORMAT_OPENAI)
const selectedExportFormat = ref<ExportFormat>(EXPORT_FORMAT_STANDARD)
const fileInputRef = ref<HTMLInputElement | null>(null)

// 同步 visible 状态
watch(
  () => props.visible,
  (newVisible) => {
    localVisible.value = newVisible
    if (newVisible) {
      // 重置状态
      importData.value = ''
      importError.value = ''
      exportError.value = ''
    }
  }
)

// 导入格式选项 - Flexy hates hardcoded! Using constants now
const importFormats = computed(() => [
  {
    id: IMPORT_FORMAT_SMART,
    name: t('contextEditor.importFormats.smart.name'),
    description: t('contextEditor.importFormats.smart.description'),
  },
  {
    id: IMPORT_FORMAT_OPENAI,
    name: t('contextEditor.importFormats.openai.name'),
    description: t('contextEditor.importFormats.openai.description'),
  },
  {
    id: IMPORT_FORMAT_LANGFUSE,
    name: t('contextEditor.importFormats.langfuse.name'),
    description: t('contextEditor.importFormats.langfuse.description'),
  },
  {
    id: IMPORT_FORMAT_CONVERSATION,
    name: t('contextEditor.importFormats.conversation.name'),
    description: t('contextEditor.importFormats.conversation.description'),
  },
])

// 导出格式选项 - Flexy hates hardcoded! Using constants now
const exportFormats = computed(() => [
  {
    id: EXPORT_FORMAT_STANDARD,
    name: t('contextEditor.exportFormats.standard.name'),
    description: t('contextEditor.exportFormats.standard.description'),
  },
  {
    id: EXPORT_FORMAT_OPENAI,
    name: t('contextEditor.exportFormats.openai.name'),
    description: t('contextEditor.exportFormats.openai.description'),
  },
])

// JSON snippets for import formats - Flexy hates hardcoded keys!
const IMPORT_JSON_SNIPPETS: Record<ImportFormat, string> = {
  [IMPORT_FORMAT_OPENAI]: `{
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "Explain quantum entanglement."
    }
  ],
  "model": "gpt-4o"
}`,
  [IMPORT_FORMAT_LANGFUSE]: `{
  "input": {
    "messages": [
      {"role": "system", "content": "system prompt"},
      {"role": "user", "content": "user prompt"}
    ]
  },
  "metadata": {
    "traceId": "abc123"
  }
}`,
  [IMPORT_FORMAT_CONVERSATION]: `{
  "messages": [
    {"role": "system", "content": "System message"},
    {"role": "user", "content": "User request"}
  ],
  "tools": []
}`,
  [IMPORT_FORMAT_SMART]: ``,
}

// 导出预览数据
const buildExportPayload = (): StandardPromptData => ({
  messages: props.messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
    ...(msg.name && { name: msg.name }),
    ...(msg.tool_calls && { tool_calls: msg.tool_calls }),
    ...(msg.tool_call_id && { tool_call_id: msg.tool_call_id }),
  })),
  tools: props.tools,
  metadata: {
    exportTime: new Date().toISOString(),
    version: '1.0',
    source: 'manual',
    origin: 'import_export_dialog',
  },
})

const exportPreviewData = computed(() => {
  const basePayload = buildExportPayload()
  // Flexy hates hardcoded! Using EXPORT_FORMAT_OPENAI constant
  if (selectedExportFormat.value === EXPORT_FORMAT_OPENAI) {
    const converter = contextEditor.services?.converter
    if (converter) {
      const result = converter.toOpenAI(basePayload)
      if (result.success && result.data) {
        return JSON.stringify(result.data, null, 2)
      }
      console.error(result.error || 'Failed to build OpenAI preview payload')
    }
  }
  return JSON.stringify(basePayload, null, 2)
})

// 事件处理
const handleVisibilityChange = (visible: boolean) => {
  localVisible.value = visible
  if (!visible) {
    importError.value = ''
    exportError.value = ''
  }
  emit('update:visible', visible)
}

const handleClose = () => {
  handleVisibilityChange(false)
}

// 消息规范化
const normalizeMessage = (msg: Partial<ConversationMessage>): ConversationMessage => {
  const normalizedRole = (msg.role ?? 'user') as ConversationMessage['role']

  let content = ''
  if (typeof msg.content === 'string') {
    content = msg.content
  } else if (msg.content != null) {
    try {
      content = typeof msg.content === 'object' ? JSON.stringify(msg.content) : String(msg.content)
    } catch {
      content = String(msg.content)
    }
  }

  const normalized: ConversationMessage = {
    role: normalizedRole,
    content,
  }

  if (typeof msg.name === 'string') normalized.name = msg.name
  if (Array.isArray(msg.tool_calls)) {
    normalized.tool_calls = msg.tool_calls as ConversationMessage['tool_calls']
  }
  if (typeof msg.tool_call_id === 'string') normalized.tool_call_id = msg.tool_call_id

  return normalized
}

// 文件上传处理
const handleFileUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  try {
    loading.value = true
    importError.value = ''

    const success = await contextEditor.importFromFile(file)

    if (success && contextEditor.currentData.value) {
      const data = contextEditor.currentData.value
      emit('import-success', {
        messages: (data.messages || []).map((msg) => normalizeMessage(msg)),
        tools: data.tools || [],
      })
      handleClose()
    } else {
      importError.value = t('contextEditor.importFailed')
    }
  } catch (err) {
    console.error('File upload error:', err)
    const errorMsg = err instanceof Error ? err.message : t('contextEditor.importFailed')
    importError.value = errorMsg
  } finally {
    loading.value = false
  }
}

// 导入提交处理
const handleImportSubmit = async () => {
  if (!importData.value.trim()) {
    importError.value = t('contextEditor.importDataRequired')
    return
  }

  try {
    loading.value = true
    importError.value = ''
    const jsonData = JSON.parse(importData.value)
    let result

    // Flexy hates hardcoded! Using constants for switch cases
    switch (selectedImportFormat.value) {
      case IMPORT_FORMAT_SMART:
        result = contextEditor.smartImport(jsonData)
        break
      case IMPORT_FORMAT_OPENAI:
        result = contextEditor.convertFromOpenAI(jsonData)
        break
      case IMPORT_FORMAT_LANGFUSE:
        result = contextEditor.convertFromLangFuse(jsonData)
        break
      case IMPORT_FORMAT_CONVERSATION:
        // 直接设置为对话格式
        if (Array.isArray(jsonData)) {
          emit('import-success', {
            messages: jsonData.map((msg: Partial<ConversationMessage>) => normalizeMessage(msg)),
          })
        } else if (jsonData.messages && Array.isArray(jsonData.messages)) {
          emit('import-success', {
            messages: jsonData.messages.map((msg: Partial<ConversationMessage>) =>
              normalizeMessage(msg)
            ),
            tools: jsonData.tools || [],
          })
        } else {
          importError.value = t('contextEditor.invalidConversationFormat')
          return
        }
        importError.value = ''
        handleClose()
        return
      default:
        importError.value = t('contextEditor.unsupportedImportFormat')
        return
    }

    // 处理转换结果
    if (result && result.success && contextEditor.currentData.value) {
      const data = contextEditor.currentData.value
      emit('import-success', {
        messages: (data.messages || []).map((msg) => normalizeMessage(msg)),
        tools: data.tools || [],
      })
      importError.value = ''
      handleClose()
    } else {
      importError.value = result?.error || t('contextEditor.importFailed')
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.debug('[ImportExportDialog] import failed', err)
    }
    const errorMsg = err instanceof Error ? err.message : t('contextEditor.invalidJsonFormat')
    importError.value = errorMsg
  } finally {
    loading.value = false
  }
}

// 导出到文件
const notifyExportError = (key: string, err?: unknown) => {
  const baseMessage = t(key)
  const details = err instanceof Error ? err.message : ''
  const composed = details ? `${baseMessage}: ${details}` : baseMessage
  exportError.value = composed
  emit('export-error', composed)
  if (import.meta.env.DEV) {
    console.debug('[ImportExportDialog] export failed', composed, err)
  }
}

const handleExportToFile = () => {
  try {
    loading.value = true
    exportError.value = ''

    const exportData: StandardPromptData = buildExportPayload()
    contextEditor.setData(exportData)

    const success = contextEditor.exportToFile(
      selectedExportFormat.value as ExportFormat,
      `context-export-${Date.now()}`
    )

    if (success) {
      emit('export-success')
      handleClose()
    } else {
      throw new Error(t('contextEditor.exportFailed'))
    }
  } catch (err) {
    notifyExportError('contextEditor.exportFailed', err)
  } finally {
    loading.value = false
  }
}

// 导出到剪贴板
const handleExportToClipboard = async () => {
  try {
    loading.value = true
    exportError.value = ''

    const exportData: StandardPromptData = buildExportPayload()
    contextEditor.setData(exportData)

    const success = await contextEditor.exportToClipboard(
      selectedExportFormat.value as ExportFormat
    )

    if (success) {
      emit('export-success')
      handleClose()
    } else {
      throw new Error(t('contextEditor.copyFailed'))
    }
  } catch (err) {
    notifyExportError('contextEditor.copyFailed', err)
  } finally {
    loading.value = false
  }
}

// 获取导入占位符
const getImportPlaceholder = () => {
  const format = selectedImportFormat.value
  const prefix = t(`contextEditor.importPlaceholders.${format}`)
  const snippet = IMPORT_JSON_SNIPPETS[format] || IMPORT_JSON_SNIPPETS.smart
  return snippet ? `${prefix}\n${snippet}` : prefix
}
</script>

<style scoped>
.hidden {
  display: none;
}
</style>
