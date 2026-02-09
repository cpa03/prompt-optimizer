<template>
  <div class="model-parameter-editor">
    <template v-if="mode === 'text'">
      <NAlert
        v-if="definedEntries.length === 0 && customEntries.length === 0"
        type="info"
        size="small"
        :bordered="false"
        class="empty-state-alert"
      >
        {{ t('modelManager.advancedParameters.noParamsConfigured') }}
      </NAlert>

      <NForm
        v-else
        label-placement="left"
        label-width="auto"
        label-align="right"
        size="small"
        :show-label="true"
        :show-feedback="true"
        class="advanced-form"
      >
        <!-- 已定义的参数（schema中存在） -->
        <TransitionGroup name="param-item">
          <NFormItem
            v-for="entry in definedEntries"
            :key="`defined-${entry.key}`"
            class="advanced-form-item"
            :class="{ 'item-removing': removingKey === entry.key }"
          >
            <template #label>
              <NSpace align="center" :size="8" style="width: 100%;" class="param-label">
                <span class="param-label-text">{{ entry.label }}</span>
                <NButton 
                  size="tiny" 
                  type="error" 
                  quaternary 
                  circle 
                  class="remove-btn"
                  :class="{ 'remove-btn--confirming': removeConfirmKey === entry.key }"
                  @click="handleRemoveWithConfirm(entry.key)"
                  :title="t('common.remove')"
                >
                  <template #icon>
                    <Transition name="icon-swap" mode="out-in">
                      <span v-if="removeConfirmKey === entry.key" key="confirm" class="confirm-icon">?</span>
                      <span v-else key="remove" class="remove-icon">×</span>
                    </Transition>
                  </template>
                </NButton>
              </NSpace>
            </template>

          <template v-if="entry.definition.type === 'boolean'">
            <NCheckbox
              :checked="getDisplayValue(entry.definition, paramOverrides[entry.key]) as boolean"
              size="small"
              class="param-checkbox"
              @update:checked="value => handleValueChange(entry.definition, value)"
            >
              <Transition name="fade-text" mode="out-in">
                <span :key="String(getDisplayValue(entry.definition, paramOverrides[entry.key]))">
                  {{ getDisplayValue(entry.definition, paramOverrides[entry.key]) ? t('common.enabled') : t('common.disabled') }}
                </span>
              </Transition>
            </NCheckbox>
          </template>
          <template v-else-if="entry.definition.allowedValues && entry.definition.allowedValues.length">
            <NSelect
              :value="getDisplayValue(entry.definition, paramOverrides[entry.key]) as string | null"
              :options="getSelectOptions(entry.definition)"
              size="small"
              clearable
              class="advanced-control param-select"
              @update:value="value => handleValueChange(entry.definition, value)"
            />
          </template>
          <template v-else-if="entry.definition.tags?.includes('string-array')">
            <NInput
              type="textarea"
              size="small"
              :autosize="{ minRows: 2, maxRows: 4 }"
              :placeholder="t('modelManager.advancedParameters.stopSequencesPlaceholder')"
              :value="getDisplayValue(entry.definition, paramOverrides[entry.key]) as string"
              class="advanced-control param-input"
              @update:value="value => handleValueChange(entry.definition, value)"
            />
          </template>
          <template v-else-if="entry.definition.type === 'number' || entry.definition.type === 'integer'">
            <NInputNumber
              size="small"
              :value="getDisplayValue(entry.definition, paramOverrides[entry.key]) as number | undefined"
              :min="entry.definition.minValue ?? entry.definition.min"
              :max="entry.definition.maxValue ?? entry.definition.max"
              :step="entry.definition.step ?? (entry.definition.type === 'integer' ? 1 : 0.1)"
              :precision="entry.definition.type === 'integer' ? 0 : undefined"
              class="advanced-control param-number"
              @update:value="value => handleValueChange(entry.definition, value)"
            />
          </template>
          <template v-else>
            <NInput
              size="small"
              :value="getDisplayValue(entry.definition, paramOverrides[entry.key]) as string"
              :placeholder="entry.definition.defaultValue !== undefined ? String(entry.definition.defaultValue) : ''"
              class="advanced-control param-input"
              @update:value="value => handleValueChange(entry.definition, value)"
            />
          </template>

          <template #feedback>
            <NSpace vertical :size="4">
              <NText v-if="entry.description" depth="3" style="font-size: 12px;">
                {{ entry.description }}
              </NText>
              <NText v-if="entry.unitLabel" depth="3" style="font-size: 12px;">
                {{ entry.unitLabel }}
              </NText>
              <NText v-if="entry.helpText" depth="3" style="font-size: 12px;">
                {{ entry.helpText }}
              </NText>
            </NSpace>
          </template>
        </NFormItem>

        <!-- 自定义参数（schema中不存在） -->
        <NFormItem
          v-for="entry in customEntries"
          :key="`custom-${entry.key}`"
          class="advanced-form-item custom-param-item"
          :class="{ 'item-removing': removingKey === entry.key }"
        >
          <template #label>
            <NSpace align="center" :size="8" style="width: 100%;" class="param-label">
              <span class="param-label-text">{{ entry.key }}</span>
              <NTag type="info" size="small" class="custom-param-badge">
                {{ t('modelManager.advancedParameters.customParam') }}
              </NTag>
              <NButton 
                size="tiny" 
                type="error" 
                quaternary 
                circle 
                class="remove-btn"
                :class="{ 'remove-btn--confirming': removeConfirmKey === entry.key }"
                @click="handleRemoveWithConfirm(entry.key)"
                :title="t('common.remove')"
              >
                <template #icon>
                  <Transition name="icon-swap" mode="out-in">
                    <span v-if="removeConfirmKey === entry.key" key="confirm" class="confirm-icon">?</span>
                    <span v-else key="remove" class="remove-icon">×</span>
                  </Transition>
                </template>
              </NButton>
            </NSpace>
          </template>
          <NInput
            type="textarea"
            size="small"
            :autosize="{ minRows: 1, maxRows: 3 }"
            :value="String(paramOverrides[entry.key] ?? '')"
            data-test="custom-param-input"
            class="advanced-control param-input"
            @update:value="value => handleCustomValueChange(entry.key, value)"
          />
        </NFormItem>
        </TransitionGroup>
      </NForm>
    </template>

    <template v-else>
      <NAlert 
        v-if="definedEntries.length === 0 && customEntries.length === 0" 
        type="info" 
        size="small"
        class="empty-state-alert"
      >
        {{ t('image.parameters.noParameters') }}
      </NAlert>
      <NForm
        v-else
        label-placement="left"
        label-width="auto"
        label-align="right"
        size="small"
        :show-label="true"
        :show-feedback="true"
        class="advanced-form"
      >
        <!-- 已定义的参数 -->
        <TransitionGroup name="param-item">
          <NFormItem
            v-for="entry in definedEntries"
            :key="`defined-${entry.key}`"
            class="advanced-form-item"
            :class="{ 'item-removing': removingKey === entry.key }"
          >
            <template #label>
              <NSpace align="center" :size="8" style="width: 100%;" class="param-label">
                <span class="param-label-text">{{ entry.label }}</span>
                <NButton 
                  size="tiny" 
                  type="error" 
                  quaternary 
                  circle 
                  class="remove-btn"
                  :class="{ 'remove-btn--confirming': removeConfirmKey === entry.key }"
                  @click="handleRemoveWithConfirm(entry.key)"
                  :title="t('common.remove')"
                >
                  <template #icon>
                    <Transition name="icon-swap" mode="out-in">
                      <span v-if="removeConfirmKey === entry.key" key="confirm" class="confirm-icon">?</span>
                      <span v-else key="remove" class="remove-icon">×</span>
                    </Transition>
                  </template>
                </NButton>
              </NSpace>
            </template>

            <template v-if="entry.definition.type === 'boolean'">
              <NCheckbox
                :checked="getDisplayValue(entry.definition, paramOverrides[entry.key]) as boolean"
                size="small"
                class="param-checkbox"
                @update:checked="value => handleValueChange(entry.definition, value)"
              >
                <Transition name="fade-text" mode="out-in">
                  <span :key="String(getDisplayValue(entry.definition, paramOverrides[entry.key]))">
                    {{ getDisplayValue(entry.definition, paramOverrides[entry.key]) ? t('common.enabled') : t('common.disabled') }}
                  </span>
                </Transition>
              </NCheckbox>
            </template>
            <template v-else-if="entry.definition.allowedValues && entry.definition.allowedValues.length">
              <NSelect
                :value="getDisplayValue(entry.definition, paramOverrides[entry.key]) as string | null"
                :options="getSelectOptions(entry.definition)"
                size="small"
                clearable
                class="param-select"
                @update:value="value => handleValueChange(entry.definition, value)"
              />
            </template>
            <template v-else-if="entry.definition.tags?.includes('string-array')">
              <NInput
                type="textarea"
                size="small"
                :autosize="{ minRows: 2, maxRows: 6 }"
                :placeholder="t('modelManager.advancedParameters.stopSequencesPlaceholder')"
                :value="getDisplayValue(entry.definition, paramOverrides[entry.key]) as string"
                class="param-input"
                @update:value="value => handleValueChange(entry.definition, value)"
              />
            </template>
            <template v-else-if="entry.definition.type === 'number' || entry.definition.type === 'integer'">
              <NInputNumber
                size="small"
                :value="getDisplayValue(entry.definition, paramOverrides[entry.key]) as number | undefined"
                :min="entry.definition.minValue ?? entry.definition.min"
                :max="entry.definition.maxValue ?? entry.definition.max"
                :step="entry.definition.step ?? (entry.definition.type === 'integer' ? 1 : 0.1)"
                :precision="entry.definition.type === 'integer' ? 0 : undefined"
                class="param-number"
                @update:value="value => handleValueChange(entry.definition, value)"
              />
            </template>
            <template v-else>
              <NInput
                size="small"
                :value="getDisplayValue(entry.definition, paramOverrides[entry.key]) as string"
                :placeholder="entry.definition.defaultValue !== undefined ? String(entry.definition.defaultValue) : ''"
                class="param-input"
                @update:value="value => handleValueChange(entry.definition, value)"
              />
            </template>

            <template #feedback>
              <NSpace vertical :size="4">
                <NText v-if="entry.description" depth="3" style="font-size: 12px;">
                  {{ entry.description }}
                </NText>
                <NText v-if="entry.unitLabel" depth="3" style="font-size: 12px;">
                  {{ entry.unitLabel }}
                </NText>
                <NText v-if="entry.helpText" depth="3" style="font-size: 12px;">
                  {{ entry.helpText }}
                </NText>
              </NSpace>
            </template>
          </NFormItem>

          <!-- 自定义参数（schema中不存在） -->
          <NFormItem
            v-for="entry in customEntries"
            :key="`custom-${entry.key}`"
            class="advanced-form-item custom-param-item"
            :class="{ 'item-removing': removingKey === entry.key }"
          >
            <template #label>
              <NSpace align="center" :size="8" style="width: 100%;" class="param-label">
                <span class="param-label-text">{{ entry.key }}</span>
                <NTag type="info" size="small" class="custom-param-badge">
                  {{ t('modelManager.advancedParameters.customParam') }}
                </NTag>
                <NButton 
                  size="tiny" 
                  type="error" 
                  quaternary 
                  circle 
                  class="remove-btn"
                  :class="{ 'remove-btn--confirming': removeConfirmKey === entry.key }"
                  @click="handleRemoveWithConfirm(entry.key)"
                  :title="t('common.remove')"
                >
                  <template #icon>
                    <Transition name="icon-swap" mode="out-in">
                      <span v-if="removeConfirmKey === entry.key" key="confirm" class="confirm-icon">?</span>
                      <span v-else key="remove" class="remove-icon">×</span>
                    </Transition>
                  </template>
                </NButton>
              </NSpace>
            </template>
            <NInput
              size="small"
              :value="String(paramOverrides[entry.key] ?? '')"
              data-test="custom-param-input"
              class="advanced-control param-input"
              @update:value="value => handleCustomValueChange(entry.key, value)"
            />
          </NFormItem>
        </TransitionGroup>
      </NForm>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type PropType } from 'vue'

import { useI18n } from 'vue-i18n'
import { useMessage, createDiscreteApi, NAlert, NButton, NCheckbox, NForm, NFormItem, NInput, NInputNumber, NSelect, NSpace, NTag, NText } from 'naive-ui'
import { parseCustomValue, type UnifiedParameterDefinition } from '@prompt-optimizer/core'

const props = defineProps({
  schema: {
    type: Array as PropType<readonly UnifiedParameterDefinition[]>,
    default: () => []
  },
  paramOverrides: {
    type: Object as PropType<Record<string, unknown>>,
    default: () => ({})
  },
  mode: {
    type: String as PropType<'text' | 'image'>,
    default: 'text'
  },
  allowCustom: {
    type: Boolean,
    default: true
  }
})

// 🎨 Palette: Confirmation state for parameter removal
const removeConfirmKey = ref<string | null>(null)
const removingKey = ref<string | null>(null)
const confirmTimeout = ref<number | null>(null)

// 🎨 Palette: Handle remove with two-step confirmation
const handleRemoveWithConfirm = (key: string) => {
  if (removeConfirmKey.value === key) {
    // Second click - actually remove
    removingKey.value = key
    
    // Clear confirmation timeout
    if (confirmTimeout.value) {
      clearTimeout(confirmTimeout.value)
      confirmTimeout.value = null
    }
    
    // Wait for exit animation then actually remove
    setTimeout(() => {
      handleRemove(key)
      removingKey.value = null
      removeConfirmKey.value = null
    }, 200)
  } else {
    // First click - enter confirmation state
    // Clear any existing confirmation
    if (confirmTimeout.value) {
      clearTimeout(confirmTimeout.value)
    }
    
    removeConfirmKey.value = key
    
    // Auto-cancel confirmation after 3 seconds
    confirmTimeout.value = window.setTimeout(() => {
      if (removeConfirmKey.value === key) {
        removeConfirmKey.value = null
      }
    }, 3000)
  }
}

const emit = defineEmits<{
  (e: 'update:paramOverrides', value: Record<string, unknown>): void
}>()

const { t } = useI18n()
const message = resolveMessageApi()

const schemaMap = computed(() => {
  const map = new Map<string, UnifiedParameterDefinition>()
  for (const def of props.schema) {
    map.set(def.name, def)
  }
  return map
})

// 区分已定义参数和自定义参数
const definedEntries = computed(() => {
  const entries: Array<{
    key: string
    definition: UnifiedParameterDefinition
    label: string
    description?: string
    unitLabel?: string
    helpText?: string
  }> = []

  for (const def of props.schema) {
    if (Object.prototype.hasOwnProperty.call(props.paramOverrides, def.name)) {
      entries.push({
        key: def.name,
        definition: def,
        label: translateLabel(def),
        description: translateDescription(def),
        unitLabel: getUnitLabel(def),
        helpText: def.tags?.includes('string-array') ? t('modelManager.advancedParameters.stopSequencesPlaceholder') : undefined
      })
    }
  }

  return entries
})

const customEntries = computed(() => {
  const entries: Array<{ key: string }> = []

  for (const key of Object.keys(props.paramOverrides)) {
    // 不在 schema 中的就是自定义参数
    if (!schemaMap.value.has(key)) {
      entries.push({ key })
    }
  }

  return entries
})

const handleAddDefinition = (name: string) => {
  const definition = schemaMap.value.get(name)
  if (!definition) {
    message.error(withFallback('modelManager.advancedParameters.validation.unknownParam', '参数定义不存在'))
    return
  }

  if (Object.prototype.hasOwnProperty.call(props.paramOverrides, name)) {
    message.warning(withFallback('modelManager.advancedParameters.validation.duplicateParam', '参数已存在'))
    return
  }

  const next = {
    ...props.paramOverrides,
    [definition.name]: cloneDefaultValue(definition)
  }
  emit('update:paramOverrides', next)
}

const handleValueChange = (definition: UnifiedParameterDefinition, rawValue: unknown) => {
  const value = normalizeValue(definition, rawValue)
  const next = { ...props.paramOverrides }
  const shouldRemove =
    value === undefined ||
    (definition.type === 'string' && typeof value === 'string' && value.trim() === '') ||
    (definition.tags?.includes('string-array') && Array.isArray(value) && value.length === 0)

  if (shouldRemove) {
    delete next[definition.name]
  } else {
    next[definition.name] = value
  }
  emit('update:paramOverrides', next)
}

const handleRemove = (key: string) => {
  const next = { ...props.paramOverrides }
  delete next[key]
  emit('update:paramOverrides', next)
}

const handleCustomValueChange = (key: string, value: string) => {
  const trimmed = value.trim()
  const next = { ...props.paramOverrides }
  if (trimmed === '') {
    delete next[key]
  } else {
    next[key] = parseCustomValue(trimmed)
  }
  emit('update:paramOverrides', next)
}

defineExpose({
  handleAddDefinition,
  handleValueChange,
  handleCustomValueChange
})

function normalizeValue(definition: UnifiedParameterDefinition, rawValue: unknown): unknown {
  if (definition.tags?.includes('string-array')) {
    if (Array.isArray(rawValue)) {
      return rawValue
        .map((item) => (typeof item === 'string' ? item.trim() : item))
        .filter((item) => typeof item === 'string' && item.length > 0)
    }
    if (typeof rawValue === 'string') {
      return rawValue
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
    }
    return []
  }

  if (definition.type === 'boolean') {
    return Boolean(rawValue)
  }

  if (definition.type === 'number' || definition.type === 'integer') {
    if (rawValue === '' || rawValue === null || rawValue === undefined) return undefined
    const num = typeof rawValue === 'number' ? rawValue : Number(rawValue)
    return Number.isFinite(num) ? num : undefined
  }

  if (rawValue === null || rawValue === undefined) return ''
  return String(rawValue).trim()
}

function getDisplayValue(definition: UnifiedParameterDefinition, rawValue: unknown): unknown {
  if (definition.tags?.includes('string-array')) {
    if (Array.isArray(rawValue)) return rawValue.join('\n')
    if (typeof rawValue === 'string') return rawValue
    return ''
  }

  if (definition.type === 'boolean') {
    return Boolean(rawValue)
  }

  if (definition.type === 'number' || definition.type === 'integer') {
    if (typeof rawValue === 'number') return rawValue
    if (rawValue === undefined || rawValue === null || rawValue === '') return undefined
    const num = Number(rawValue)
    return Number.isFinite(num) ? num : undefined
  }

  if (rawValue === undefined || rawValue === null) return ''
  return String(rawValue)
}

function translateLabel(definition: UnifiedParameterDefinition): string {
  if (definition.labelKey) {
    const result = t(definition.labelKey)
    return result === definition.labelKey ? definition.name : result
  }
  return definition.name
}

function translateDescription(definition: UnifiedParameterDefinition): string {
  if (definition.descriptionKey) {
    const result = t(definition.descriptionKey)
    if (result !== definition.descriptionKey) return result
  }
  return definition.description ?? ''
}

function getUnitLabel(definition: UnifiedParameterDefinition): string | undefined {
  if (definition.unitKey) {
    const result = t(definition.unitKey)
    return result === definition.unitKey ? definition.unit : result
  }
  return definition.unit
}

function getSelectOptions(definition: UnifiedParameterDefinition) {
  if (!definition.allowedValues) return []
  return definition.allowedValues.map((value, index) => ({
    label: definition.allowedValueLabelKeys?.[index]
      ? t(definition.allowedValueLabelKeys[index])
      : value,
    value
  }))
}

function withFallback(key: string, fallback: string): string {
  const translated = t(key)
  return translated === key ? fallback : translated
}

function cloneDefaultValue(definition: UnifiedParameterDefinition): unknown {
  const base = definition.defaultValue ?? definition.default
  if (Array.isArray(base)) return [...base]
  if (base && typeof base === 'object') return { ...(base as Record<string, unknown>) }
  if (base !== undefined) return base

  if (definition.tags?.includes('string-array')) return []

  switch (definition.type) {
    case 'boolean':
      return false
    case 'number':
    case 'integer':
      return definition.minValue ?? definition.min ?? 0
    default:
      return ''
  }
}

function resolveMessageApi(): ReturnType<typeof useMessage> {
  try {
    return useMessage()
  } catch (error) {
    console.warn('[ModelParameterEditor] useMessage fallback: message provider missing.', error)
    if (typeof window !== 'undefined') {
      const { message } = createDiscreteApi(['message'])
      return message as ReturnType<typeof useMessage>
    }
    const stub = () => ({
      destroy: () => {}
    })
    return {
      create: (...args: unknown[]) => {
        console.info('[Message]', ...args)
        return stub()
      },
      info: (...args: unknown[]) => {
        console.info(...args)
        return stub()
      },
      success: (...args: unknown[]) => {
        console.log(...args)
        return stub()
      },
      warning: (...args: unknown[]) => {
        console.warn(...args)
        return stub()
      },
      error: (...args: unknown[]) => {
        console.error(...args)
        return stub()
      },
      loading: (...args: unknown[]) => {
        console.log(...args)
        return stub()
      },
      destroyAll: () => {}
    } as ReturnType<typeof useMessage>
  }
}

</script>

<style scoped>
.model-parameter-editor {
  width: 100%;
}

/* 🎨 Palette: Empty state with subtle pulse animation */
.empty-state-alert {
  animation: empty-pulse 3s ease-in-out infinite;
}

@keyframes empty-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.85;
  }
}

.advanced-form :deep(.n-form-item) {
  margin-bottom: 8px;
  align-items: center;
  --n-label-text-align: right;
  --n-label-font-weight: 500;
}

/* 🎨 Palette: Parameter form items with hover lift effect */
.advanced-form-item {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
  padding: 4px 8px;
  margin-left: -8px;
  margin-right: -8px;
}

.advanced-form-item:hover {
  background-color: rgba(var(--n-primary-color-rgb, 24, 160, 88), 0.04);
  transform: translateX(2px);
}

/* 🎨 Palette: Custom parameter styling with accent */
.custom-param-item {
  position: relative;
}

.custom-param-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: linear-gradient(180deg, var(--n-info-color, #2080f0), var(--n-primary-color, #18a058));
  border-radius: 0 2px 2px 0;
  transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.custom-param-item:hover::before {
  height: 60%;
}

.custom-param-badge {
  animation: badge-pulse 2s ease-in-out infinite;
}

@keyframes badge-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(var(--n-info-color-rgb, 32, 128, 240), 0.4);
  }
  50% {
    box-shadow: 0 0 0 3px rgba(var(--n-info-color-rgb, 32, 128, 240), 0);
  }
}

/* 🎨 Palette: Parameter label with interactive elements */
.param-label {
  transition: all 0.2s ease;
}

.param-label-text {
  font-weight: 500;
  transition: color 0.2s ease;
}

.advanced-form-item:hover .param-label-text {
  color: var(--n-primary-color, #18a058);
}

/* 🎨 Palette: Enhanced remove button with confirmation state */
.remove-btn {
  opacity: 0.5;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  transform: scale(0.9);
}

.advanced-form-item:hover .remove-btn {
  opacity: 1;
  transform: scale(1);
}

.remove-btn:hover {
  background-color: rgba(var(--n-error-color-rgb, 240, 56, 56), 0.1) !important;
  transform: scale(1.15) !important;
}

.remove-btn:active {
  transform: scale(0.95) !important;
}

/* Confirmation state styling */
.remove-btn--confirming {
  opacity: 1 !important;
  background-color: rgba(var(--n-error-color-rgb, 240, 56, 56), 0.15) !important;
  animation: confirm-pulse 1s ease-in-out infinite;
}

.remove-btn--confirming .confirm-icon {
  color: var(--n-error-color, #f03838);
  font-weight: bold;
}

@keyframes confirm-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(var(--n-error-color-rgb, 240, 56, 56), 0.4);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(var(--n-error-color-rgb, 240, 56, 56), 0);
  }
}

/* Icon styling */
.remove-icon,
.confirm-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  line-height: 1;
}

.confirm-icon {
  font-size: 12px;
}

/* Icon swap transition */
.icon-swap-enter-active,
.icon-swap-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.icon-swap-enter-from {
  opacity: 0;
  transform: scale(0.5) rotate(-90deg);
}

.icon-swap-leave-to {
  opacity: 0;
  transform: scale(0.5) rotate(90deg);
}

/* 🎨 Palette: Input controls with focus transitions */
.param-input,
.param-select,
.param-number {
  transition: all 0.2s ease;
}

.param-input:hover,
.param-select:hover,
.param-number:hover {
  transform: translateY(-1px);
}

.param-input:focus-within,
.param-select:focus-within,
.param-number:focus-within {
  transform: translateY(-2px);
}

/* 🎨 Palette: Checkbox with smooth state transition */
.param-checkbox {
  transition: all 0.2s ease;
}

.param-checkbox:hover {
  transform: translateX(2px);
}

/* Text fade transition for checkbox */
.fade-text-enter-active,
.fade-text-leave-active {
  transition: all 0.2s ease;
}

.fade-text-enter-from,
.fade-text-leave-to {
  opacity: 0;
  transform: translateY(-2px);
}

/* 🎨 Palette: Parameter item list transitions */
.param-item-move,
.param-item-enter-active,
.param-item-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.param-item-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.param-item-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.param-item-leave-active {
  position: absolute;
}

/* Removal animation state */
.item-removing {
  opacity: 0;
  transform: translateX(30px) scale(0.95);
  pointer-events: none;
}

.advanced-control {
  min-width: 180px;
  max-width: 320px;
  width: 100%;
}

/* 🎨 Palette: Focus visible ring for accessibility */
.advanced-form-item:focus-within {
  outline: none;
  box-shadow: 0 0 0 2px rgba(var(--n-primary-color-rgb, 24, 160, 88), 0.2);
  border-radius: 8px;
}

/* 🎨 Palette: Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  .empty-state-alert {
    animation: none;
  }
  
  .advanced-form-item,
  .advanced-form-item:hover {
    transition: none;
    transform: none;
  }
  
  .custom-param-item::before {
    transition: none;
  }
  
  .custom-param-badge {
    animation: none;
  }
  
  .param-label,
  .param-label-text,
  .remove-btn {
    transition: none;
  }
  
  .remove-btn--confirming {
    animation: none;
  }
  
  .param-input,
  .param-select,
  .param-number,
  .param-checkbox {
    transition: none;
  }
  
  .param-input:hover,
  .param-select:hover,
  .param-number:hover,
  .param-input:focus-within,
  .param-select:focus-within,
  .param-number:focus-within {
    transform: none;
  }
  
  .icon-swap-enter-active,
  .icon-swap-leave-active,
  .fade-text-enter-active,
  .fade-text-leave-active,
  .param-item-move,
  .param-item-enter-active,
  .param-item-leave-active {
    transition: opacity 0.1s ease;
  }
  
  .param-item-enter-from,
  .param-item-leave-to {
    transform: none;
  }
  
  .item-removing {
    transform: none;
  }
}
</style>
