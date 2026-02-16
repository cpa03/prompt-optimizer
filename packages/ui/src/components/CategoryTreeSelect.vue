<template>
  <NTreeSelect
    v-model:value="internalValue"
    :options="treeOptions"
    :placeholder="placeholder || t('favorites.dialog.categoryPlaceholder')"
    :clearable="clearable"
    :consistent-menu-width="consistentMenuWidth"
    :style="computedStyle"
    :loading="isLoading"
    @update:value="handleValueChange"
    :class="{ 'is-loading': isLoading }"
  >
    <template v-if="showManageButton" #action>
      <!-- 🎨 Palette: Enhanced category manage button with keyboard shortcut hint -->
      <div
        class="category-manage-btn-wrapper"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
      >
        <NButton
          text
          block
          class="category-manage-btn"
          :class="{ 'is-hovered': isHovered, 'is-focused': isFocused }"
          @click="handleOpenManager"
          @focus="isFocused = true"
          @blur="isFocused = false"
          :style="{ justifyContent: 'flex-start', padding: `${SPACING.SM}px ${SPACING.MD}px` }"
          :title="manageButtonTitle"
          :aria-label="manageButtonTitle"
        >
          <template #icon>
            <NIcon class="folder-icon" :class="{ 'is-hovered': isHovered }">
              <Folder />
            </NIcon>
          </template>
          <span class="manage-btn-text">{{ t('favorites.manager.categoryManager.title') }}</span>
          <!-- 🎨 Palette: Keyboard shortcut hint (visible on hover/focus) -->
          <Transition name="shortcut-hint">
            <span v-if="showShortcutHint" class="shortcut-hint" aria-hidden="true">
              {{ shortcutDisplay }}
            </span>
          </Transition>
        </NButton>
      </div>
    </template>
  </NTreeSelect>

  <!-- 分类管理对话框 -->
  <NModal
    v-if="showManageButton"
    v-model:show="managerVisible"
    preset="card"
    :title="t('favorites.manager.categoryManager.title')"
    :mask-closable="true"
    :style="UI_DIMENSIONS.MODAL_SIZE_LARGE"
  >
    <CategoryManager @category-updated="handleCategoryUpdated" />
  </NModal>
</template>

<script setup lang="ts">
import { ref, computed, watch, inject, type Ref } from 'vue'

import { NTreeSelect, NButton, NIcon, NModal, type TreeSelectOption } from 'naive-ui'
import { Folder } from '@vicons/tabler'
import { useI18n } from 'vue-i18n'
import CategoryManager from './CategoryManager.vue'
import type { FavoriteCategory } from '@prompt-optimizer/core'
import type { AppServices } from '../types/services'
import { SPACING, UI_DIMENSIONS } from '../config/constants'

const { t } = useI18n()

const services = inject<Ref<AppServices | null> | null>('services', null)

// 🎨 Palette: Interaction states for enhanced UX
const isHovered = ref(false)
const isFocused = ref(false)

// 🎨 Palette: Keyboard shortcut configuration
const modifierKey = computed(() => {
  if (typeof navigator === 'undefined') return 'Ctrl'
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl'
})

const shortcutDisplay = computed(() => `${modifierKey.value}⇧C`)

// 🎨 Palette: Show shortcut hint on hover or focus
const showShortcutHint = computed(() => isHovered.value || isFocused.value)

// 🎨 Palette: Enhanced button title with shortcut
const manageButtonTitle = computed(() => {
  return `${t('favorites.manager.categoryManager.title')} (${shortcutDisplay.value})`
})

// Props definition
interface Props {
  modelValue: string
  placeholder?: string
  clearable?: boolean
  consistentMenuWidth?: boolean
  style?: Record<string, unknown>
  showManageButton?: boolean
  showAllOption?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  clearable: true,
  consistentMenuWidth: true,
  style: () => ({}),
  showManageButton: true,
  showAllOption: false,
})

// 内部状态
const internalValue = ref(props.modelValue)
const categories = ref<FavoriteCategory[]>([])
const managerVisible = ref(false)
const isLoading = ref(false)

// 计算树状分类选项
const treeOptions = computed<TreeSelectOption[]>(() => {
  const buildTree = (parentId?: string): TreeSelectOption[] => {
    return categories.value
      .filter((cat) => cat.parentId === parentId)
      .map((cat) => ({
        label: cat.name,
        key: cat.id,
        children: buildTree(cat.id),
      }))
  }

  const tree = buildTree(undefined)

  // 如果是筛选模式,添加"全部分类"选项
  if (props.showAllOption) {
    return [{ label: t('favorites.manager.allCategories'), key: '' }, ...tree]
  }

  return tree
})

// 计算样式
const computedStyle = computed(() => props.style)

// 加载分类数据
const loadCategories = async () => {
  const servicesValue = services?.value
  if (!servicesValue?.favoriteManager) {
    console.warn('收藏管理器未初始化,跳过分类加载')
    return
  }

  isLoading.value = true
  try {
    categories.value = await servicesValue.favoriteManager.getCategories()
  } catch (error) {
    console.error('加载分类失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 处理值变化
const handleValueChange = (value: string) => {
  internalValue.value = value
  emit('update:modelValue', value)
  emit('change', value)
}

// 打开分类管理器
const handleOpenManager = () => {
  managerVisible.value = true
}

// 分类更新后刷新数据
const handleCategoryUpdated = async () => {
  await loadCategories()
  emit('category-updated')
}

// 监听外部值变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== internalValue.value) {
      internalValue.value = newValue
    }
  }
)

// 监听服务初始化
watch(
  () => services?.value?.favoriteManager,
  (favoriteManager) => {
    if (favoriteManager) {
      loadCategories()
    }
  },
  { immediate: true }
)

// 暴露方法
defineExpose({
  reloadCategories: loadCategories,
})
</script>

<style scoped>
/* 🎨 Palette: Wrapper for positioning context */
.category-manage-btn-wrapper {
  position: relative;
}

/* 🎨 Palette: Base button styles with enhanced transitions */
.category-manage-btn {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: visible;
}

/* 🎨 Palette: Enhanced hover state */
.category-manage-btn:hover,
.category-manage-btn.is-hovered {
  background-color: rgba(64, 128, 128, 0.1);
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(64, 128, 128, 0.15);
}

/* 🎨 Palette: Focus-visible state for keyboard navigation */
.category-manage-btn:focus-visible,
.category-manage-btn.is-focused {
  outline: none;
  background-color: rgba(64, 128, 128, 0.12);
  box-shadow:
    0 0 0 2px rgba(var(--n-primary-color-rgb, 24, 160, 88), 0.3),
    0 2px 8px rgba(64, 128, 128, 0.15);
  transform: translateX(4px);
}

/* 🎨 Palette: Icon animations */
.category-manage-btn .folder-icon {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.category-manage-btn:hover .folder-icon,
.category-manage-btn.is-hovered .folder-icon {
  color: var(--n-primary-color, #18a058);
  transform: scale(1.15) rotate(-5deg);
}

/* 🎨 Palette: Active/pressed state */
.category-manage-btn:active {
  transform: translateX(2px) scale(0.98);
  transition-duration: 0.1s;
}

/* 🎨 Palette: Text label transition */
.manage-btn-text {
  transition: transform 0.2s ease;
}

.category-manage-btn:hover .manage-btn-text,
.category-manage-btn.is-hovered .manage-btn-text {
  transform: translateX(2px);
}

/* 🎨 Palette: Keyboard shortcut hint badge */
.shortcut-hint {
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 10px;
  font-weight: 600;
  color: var(--n-text-color-3, #999);
  background: rgba(0, 0, 0, 0.06);
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: auto;
  letter-spacing: 0.5px;
  opacity: 0;
  transform: translateX(-4px);
  animation: shortcut-hint-appear 0.2s ease forwards;
}

.dark .shortcut-hint {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
}

@keyframes shortcut-hint-appear {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 🎨 Palette: Shortcut hint transition animations */
.shortcut-hint-enter-active,
.shortcut-hint-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.shortcut-hint-enter-from {
  opacity: 0;
  transform: translateX(-4px) scale(0.95);
}

.shortcut-hint-leave-to {
  opacity: 0;
  transform: translateX(-4px) scale(0.95);
}

.shortcut-hint-enter-to,
.shortcut-hint-leave-from {
  opacity: 1;
  transform: translateX(0) scale(1);
}

/* 🎨 Palette: Dark mode adjustments */
.dark .category-manage-btn:hover,
.dark .category-manage-btn.is-hovered {
  background-color: rgba(64, 128, 128, 0.15);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.dark .category-manage-btn:focus-visible,
.dark .category-manage-btn.is-focused {
  background-color: rgba(64, 128, 128, 0.18);
  box-shadow:
    0 0 0 2px rgba(var(--n-primary-color-rgb, 24, 160, 88), 0.4),
    0 2px 8px rgba(0, 0, 0, 0.2);
}

/* 🎨 Palette: Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  .category-manage-btn,
  .category-manage-btn .folder-icon,
  .manage-btn-text {
    transition: none;
  }

  .category-manage-btn:hover,
  .category-manage-btn.is-hovered,
  .category-manage-btn:focus-visible,
  .category-manage-btn.is-focused {
    transform: none;
  }

  .category-manage-btn:hover .folder-icon,
  .category-manage-btn.is-hovered .folder-icon {
    transform: none;
  }

  .category-manage-btn:hover .manage-btn-text,
  .category-manage-btn.is-hovered .manage-btn-text {
    transform: none;
  }

  .shortcut-hint {
    animation: none;
    opacity: 1;
    transform: none;
  }

  .shortcut-hint-enter-active,
  .shortcut-hint-leave-active {
    transition: opacity 0.1s ease;
  }

  .shortcut-hint-enter-from,
  .shortcut-hint-leave-to {
    transform: none;
  }
}

/* 🎨 Palette: High contrast mode support */
@media (prefers-contrast: high) {
  .category-manage-btn:focus-visible,
  .category-manage-btn.is-focused {
    outline: 2px solid var(--n-primary-color, #18a058);
    outline-offset: 2px;
    box-shadow: none;
  }
}

/* 🎨 Palette: Mobile - hide shortcut hints on small screens */
@media (max-width: 768px) {
  .shortcut-hint {
    display: none;
  }
}

/* 🎨 Palette: Enhanced loading state with smooth animation */
.category-tree-select :deep(.n-base-loading) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.category-tree-select :deep(.n-base-loading .n-base-loading__icon) {
  animation: category-loading-spin 0.8s linear infinite;
}

@keyframes category-loading-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 🎨 Palette: Loading state pulse effect */
.category-tree-select.is-loading :deep(.n-tree-select-trigger) {
  background: linear-gradient(
    90deg,
    rgba(var(--n-primary-color-rgb, 24, 160, 88), 0.05) 0%,
    rgba(var(--n-primary-color-rgb, 24, 160, 88), 0.1) 50%,
    rgba(var(--n-primary-color-rgb, 24, 160, 88), 0.05) 100%
  );
  background-size: 200% 100%;
  animation: loading-pulse 1.5s ease-in-out infinite;
}

@keyframes loading-pulse {
  0%,
  100% {
    background-position: 200% 0;
  }
  50% {
    background-position: -200% 0;
  }
}

/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  .category-tree-select :deep(.n-base-loading .n-base-loading__icon) {
    animation: none;
  }

  .category-tree-select.is-loading :deep(.n-tree-select-trigger) {
    animation: none;
    background: rgba(var(--n-primary-color-rgb, 24, 160, 88), 0.05);
  }
}
</style>
