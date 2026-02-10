<!--
  🎨 Palette: Enhanced FavoriteCard with micro-UX improvements
  - Copy button with visual success feedback
  - Keyboard shortcut hints on action buttons
  - Enhanced hover/focus states for accessibility
  - Smooth micro-interactions
  - Reduced motion support
-->
<template>
  <NCard
    hoverable
    :class="{ 'is-selected': isSelected }"
    :content-style="{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }"
    :header-style="{ padding: '12px 16px' }"
    :footer-style="{ padding: '12px 16px' }"
    :style="{ minHeight: `${cardHeight}px`, maxHeight: `${cardHeight}px` }"
    @click="$emit('select', favorite)"
  >
    <!-- 卡片头部：确保内容不溢出 -->
    <template #header>
      <NSpace align="center" justify="space-between" :wrap="false" :size="8" style="overflow: hidden;">
        <NEllipsis style="flex: 1; min-width: 0; font-weight: 600; font-size: 14px;">
          {{ favorite.title }}
        </NEllipsis>
        <NSpace :size="4" style="flex-shrink: 1; min-width: 0;" :wrap="false">
          <!-- 功能模式标签 -->
          <NTag
            :type="getFunctionModeTagType(favorite.functionMode)"
            size="small"
            :bordered="false"
            style="flex-shrink: 0;"
          >
            {{ t(`favorites.manager.card.functionMode.${favorite.functionMode}`) }}
          </NTag>

          <!-- 子模式标签 (优化模式或图像模式) -->
          <NTag
            v-if="favorite.optimizationMode || favorite.imageSubMode"
            :type="getSubModeTagType(favorite)"
            size="small"
            :bordered="false"
            style="flex-shrink: 0;"
          >
            {{ getSubModeLabel(favorite) }}
          </NTag>

          <!-- 分类标签：可收缩 -->
          <NTooltip
            v-if="category"
            trigger="hover"
            :overlay-style="tooltipOverlayStyle"
            :content-style="tooltipContentStyle"
            :theme-overrides="tooltipThemeOverrides"
            placement="bottom"
            to="body"
            :flip="true"
          >
            <template #trigger>
              <NTag
                :color="{ color: category.color, textColor: 'white' }"
                size="small"
                :bordered="false"
                style="max-width: 80px; flex-shrink: 1; min-width: 0;"
              >
                <NEllipsis style="max-width: 68px;">
                  {{ category.name }}
                </NEllipsis>
              </NTag>
            </template>
            {{ category.name }}
          </NTooltip>
        </NSpace>
      </NSpace>
    </template>

    <!-- 卡片内容：精确控制区域大小，防止溢出 -->
    <NSpace vertical :size="6" style="flex: 1; min-height: 0; overflow: hidden;">
      <!-- 内容区域：固定2行 -->
      <NTooltip
        trigger="hover"
        :show-arrow="false"
        :overlay-style="tooltipOverlayStyle"
        :content-style="{
          ...tooltipContentStyle,
          ...(contentTooltipMaxHeight
            ? { maxHeight: `${contentTooltipMaxHeight}px` }
            : {})
        }"
        :theme-overrides="tooltipThemeOverrides"
        :placement="contentTooltipPlacement"
        :width="contentTooltipWidth"
        to="body"
        :flip="true"
        scrollable
        @update:show="(value) => value && handleContentTooltipEnter()"
      >
        <template #trigger>
          <div
            ref="contentTriggerRef"
            style="height: 42px; overflow: hidden;"
            @mouseenter="handleContentTooltipEnter"
          >
            <NEllipsis :line-clamp="2" :tooltip="false">
              <NText style="font-size: 13px; line-height: 1.5;">
                {{ favorite.content }}
              </NText>
            </NEllipsis>
          </div>
        </template>
        <NText class="tooltip-text">{{ favorite.content }}</NText>
      </NTooltip>

      <!-- 描述区域：固定1行 -->
      <NTooltip
        v-if="favorite.description"
        trigger="hover"
        :show-arrow="false"
        :overlay-style="tooltipOverlayStyle"
        :content-style="{
          ...tooltipContentStyle,
          ...(descriptionTooltipMaxHeight
            ? { maxHeight: `${descriptionTooltipMaxHeight}px` }
            : {})
        }"
        :theme-overrides="tooltipThemeOverrides"
        :placement="descriptionTooltipPlacement"
        :width="descriptionTooltipWidth"
        to="body"
        :flip="true"
        scrollable
        @update:show="(value) => value && handleDescriptionTooltipEnter()"
      >
        <template #trigger>
          <div
            ref="descriptionTriggerRef"
            style="height: 20px; overflow: hidden;"
            @mouseenter="handleDescriptionTooltipEnter"
          >
            <NEllipsis :line-clamp="1" :tooltip="false">
              <NText depth="3" style="font-size: 12px; line-height: 1.4;">
                {{ favorite.description }}
              </NText>
            </NEllipsis>
          </div>
        </template>
        <NText class="tooltip-text">{{ favorite.description }}</NText>
      </NTooltip>
      <div v-else style="height: 20px; overflow: hidden;"></div>

      <!-- 标签区域：固定高度，最多显示2个标签 -->
      <div style="height: 22px; overflow: hidden;">
        <NSpace v-if="favorite.tags.length > 0" :size="4" :wrap="false">
          <NTag
            v-for="tag in favorite.tags.slice(0, 2)"
            :key="tag"
            size="small"
            type="info"
            :bordered="false"
          >
            {{ tag }}
          </NTag>
          <NTag
            v-if="favorite.tags.length > 2"
            size="small"
            type="default"
            :bordered="false"
          >
            +{{ favorite.tags.length - 2 }}
          </NTag>
        </NSpace>
      </div>
    </NSpace>

    <!-- 卡片底部：使用 NSpace 布局 -->
    <template #footer>
      <NSpace justify="space-between" align="center" :wrap="false">
        <!-- 左侧信息 -->
        <NSpace :size="12" align="center" :wrap="false">
          <NText depth="3" style="font-size: 12px; white-space: nowrap;">
            {{ formatDate(favorite.updatedAt) }}
          </NText>
          <NTooltip
            trigger="hover"
            :overlay-style="tooltipOverlayStyle"
            :content-style="tooltipContentStyle"
            :theme-overrides="tooltipThemeOverrides"
            placement="bottom"
            to="body"
            :flip="true"
          >
            <template #trigger>
              <NSpace :size="4" align="center" style="cursor: help;">
                <NIcon size="14" depth="3"><Eye /></NIcon>
                <NText depth="3" style="font-size: 12px;">{{ favorite.useCount }}</NText>
              </NSpace>
            </template>
            {{ t('favorites.manager.card.useCount') }}
          </NTooltip>
        </NSpace>

        <!-- 🎨 Palette: Enhanced action buttons with feedback and keyboard shortcuts -->
        <NSpace :size="4" class="card-actions">
          <!-- Copy Button with Success Feedback -->
          <NTooltip
            trigger="hover"
            :overlay-style="tooltipOverlayStyle"
            :content-style="tooltipContentStyle"
            :theme-overrides="tooltipThemeOverrides"
            placement="bottom"
            to="body"
            :flip="true"
          >
            <template #trigger>
              <NButton
                size="small"
                quaternary
                circle
                :class="['action-btn', 'copy-btn', { 'copy-success': copySuccess }]"
                :aria-label="t('favorites.manager.card.copyContent')"
                @mouseenter="hoveredAction = 'copy'"
                @mouseleave="hoveredAction = null"
                @focus="focusedAction = 'copy'"
                @blur="focusedAction = null"
                @click.stop="handleCopy"
              >
                <template #icon>
                  <NIcon :class="{ 'success-icon': copySuccess }">
                    <Check v-if="copySuccess" />
                    <Copy v-else />
                  </NIcon>
                </template>
                <!-- Keyboard shortcut hint -->
                <Transition name="shortcut-hint">
                  <span v-if="showShortcutHint('copy')" class="shortcut-hint" aria-hidden="true">
                    {{ modifierKey }}C
                  </span>
                </Transition>
              </NButton>
            </template>
            {{ copySuccess ? t('favorites.manager.card.copied') : t('favorites.manager.card.copyContent') }}
          </NTooltip>

          <!-- Use Button -->
          <NTooltip
            trigger="hover"
            :overlay-style="tooltipOverlayStyle"
            :content-style="tooltipContentStyle"
            :theme-overrides="tooltipThemeOverrides"
            placement="bottom"
            to="body"
            :flip="true"
          >
            <template #trigger>
              <NButton
                size="small"
                quaternary
                circle
                :class="['action-btn', 'use-btn', { 'use-success': useSuccess }]"
                :aria-label="t('favorites.manager.card.useNow')"
                @mouseenter="hoveredAction = 'use'"
                @mouseleave="hoveredAction = null"
                @focus="focusedAction = 'use'"
                @blur="focusedAction = null"
                @click.stop="handleUse"
              >
                <template #icon>
                  <NIcon :class="{ 'success-icon': useSuccess }">
                    <Check v-if="useSuccess" />
                    <PlayerPlay v-else />
                  </NIcon>
                </template>
                <!-- Keyboard shortcut hint -->
                <Transition name="shortcut-hint">
                  <span v-if="showShortcutHint('use')" class="shortcut-hint" aria-hidden="true">
                    {{ modifierKey }}U
                  </span>
                </Transition>
              </NButton>
            </template>
            {{ useSuccess ? t('favorites.manager.card.used') : t('favorites.manager.card.useNow') }}
          </NTooltip>

          <!-- Edit Button -->
          <NTooltip
            trigger="hover"
            :overlay-style="tooltipOverlayStyle"
            :content-style="tooltipContentStyle"
            :theme-overrides="tooltipThemeOverrides"
            placement="bottom"
            to="body"
            :flip="true"
          >
            <template #trigger>
              <NButton
                size="small"
                quaternary
                circle
                class="action-btn edit-btn"
                :aria-label="t('favorites.manager.card.edit')"
                @mouseenter="hoveredAction = 'edit'"
                @mouseleave="hoveredAction = null"
                @focus="focusedAction = 'edit'"
                @blur="focusedAction = null"
                @click.stop="$emit('edit', favorite)"
              >
                <template #icon>
                  <NIcon><Edit /></NIcon>
                </template>
                <!-- Keyboard shortcut hint -->
                <Transition name="shortcut-hint">
                  <span v-if="showShortcutHint('edit')" class="shortcut-hint" aria-hidden="true">
                    {{ modifierKey }}E
                  </span>
                </Transition>
              </NButton>
            </template>
            {{ t('favorites.manager.card.edit') }}
          </NTooltip>

          <!-- Delete Button -->
          <NPopconfirm
            @positive-click="$emit('delete', favorite)"
            :positive-text="t('favorites.manager.card.delete')"
            :negative-text="t('favorites.manager.card.cancel')"
          >
            <template #trigger>
              <NButton
                size="small"
                quaternary
                circle
                type="error"
                class="action-btn delete-btn"
                :aria-label="t('favorites.manager.card.delete')"
                @mouseenter="hoveredAction = 'delete'"
                @mouseleave="hoveredAction = null"
                @focus="focusedAction = 'delete'"
                @blur="focusedAction = null"
                @click.stop
              >
                <template #icon>
                  <NIcon><Trash /></NIcon>
                </template>
                <!-- Keyboard shortcut hint -->
                <Transition name="shortcut-hint">
                  <span v-if="showShortcutHint('delete')" class="shortcut-hint" aria-hidden="true">
                    {{ modifierKey }}⌫
                  </span>
                </Transition>
              </NButton>
            </template>
            {{ t('favorites.manager.card.deleteConfirm', { title: favorite.title }) }}
          </NPopconfirm>
        </NSpace>
      </NSpace>
    </template>
  </NCard>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

import { useDebounceFn } from '@vueuse/core';
import {
  NCard,
  NEllipsis,
  NTag,
  NText,
  NIcon,
  NButton,
  NSpace,
  NTooltip,
  NPopconfirm
} from 'naive-ui';
import {
  Copy,
  PlayerPlay,
  Eye,
  Edit,
  Trash,
  Check
} from '@vicons/tabler';
import { useI18n } from 'vue-i18n';
import type { FavoritePrompt, FavoriteCategory } from '@prompt-optimizer/core';
import { useTooltipTheme } from '../composables/ui/useTooltipTheme';

const { t } = useI18n();

interface Props {
  favorite: FavoritePrompt;
  category?: FavoriteCategory;
  isSelected?: boolean;
  cardHeight?: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'select': [favorite: FavoritePrompt];
  'edit': [favorite: FavoritePrompt];
  'copy': [favorite: FavoritePrompt];
  'delete': [favorite: FavoritePrompt];
  'use': [favorite: FavoritePrompt];
}>();

type TooltipPlacement =
  | 'bottom-start'
  | 'bottom-end'
  | 'bottom'
  | 'top-start'
  | 'top-end'
  | 'top';

const VIEWPORT_MARGIN = 16;
const TOOLTIP_GUTTER = 12;
const TOTAL_MARGIN = VIEWPORT_MARGIN + TOOLTIP_GUTTER;
const MIN_TOOLTIP_HEIGHT = 160;
const CONTENT_TOOLTIP_WIDTH = 440;
const CONTENT_TOOLTIP_MIN_WIDTH = 240;
const DESCRIPTION_TOOLTIP_WIDTH = 360;
const DESCRIPTION_TOOLTIP_MIN_WIDTH = 200;

const {
  tooltipThemeOverrides,
  tooltipOverlayStyle,
  tooltipContentStyle
} = useTooltipTheme({
  maxWidth: `calc(100vw - ${TOTAL_MARGIN * 2}px)`,
  maxHeight: `calc(100vh - ${TOTAL_MARGIN * 2}px)`
}); // 统一 tooltip 背景并限制整体尺寸

const contentTooltipPlacement = ref<TooltipPlacement>('bottom-start');
const contentTooltipWidth = ref<number>(CONTENT_TOOLTIP_WIDTH);
const contentTooltipMaxHeight = ref<number>(0);
const descriptionTooltipPlacement = ref<TooltipPlacement>('bottom-start');
const descriptionTooltipWidth = ref<number>(DESCRIPTION_TOOLTIP_WIDTH);
const descriptionTooltipMaxHeight = ref<number>(0);
const contentTriggerRef = ref<HTMLElement | null>(null);
const descriptionTriggerRef = ref<HTMLElement | null>(null);

// 缓存 rect 结果，避免频繁计算
const cachedContentRect = ref<DOMRect | null>(null);
const cachedDescriptionRect = ref<DOMRect | null>(null);

const getViewportWidth = () => {
  if (typeof window !== 'undefined') {
    return window.innerWidth;
  }
  return 1440;
};

const getViewportHeight = () => {
  if (typeof window !== 'undefined') {
    return window.innerHeight;
  }
  return 900;
};

interface TooltipLayoutResult {
  placement: TooltipPlacement;
  width: number;
  maxHeight: number;
}

const calculateTooltipLayout = (rect: DOMRect, desiredWidth: number, minWidth: number): TooltipLayoutResult => {
  const viewportWidth = getViewportWidth();
  const viewportHeight = getViewportHeight();
  const safeAreaWidth = Math.max(viewportWidth - TOTAL_MARGIN * 2, minWidth);
  const safeAreaHeight = Math.max(viewportHeight - TOTAL_MARGIN * 2, MIN_TOOLTIP_HEIGHT);
  const targetWidth = Math.min(desiredWidth, safeAreaWidth);

  // 修复空间计算：正确计算左右可用空间
  // spaceRight: 元素右边缘到视口右边缘的距离
  // spaceLeft: 元素左边缘到视口左边缘的距离
  const spaceRight = Math.max(0, viewportWidth - rect.right - TOTAL_MARGIN);
  const spaceLeft = Math.max(0, rect.left - TOTAL_MARGIN);
  const spaceDown = Math.max(0, viewportHeight - rect.bottom - TOTAL_MARGIN);
  const spaceUp = Math.max(0, rect.top - TOTAL_MARGIN);

  if (spaceRight <= 0 && spaceLeft <= 0) {
    return {
      placement: spaceDown >= spaceUp ? 'bottom' : 'top',
      width: targetWidth,
      maxHeight: safeAreaHeight
    };
  }

  let verticalPlacement: 'bottom' | 'top' = spaceDown >= spaceUp ? 'bottom' : 'top';
  let availableVertical = verticalPlacement === 'bottom' ? spaceDown : spaceUp;

  const oppositeVertical = verticalPlacement === 'bottom' ? spaceUp : spaceDown;
  if (availableVertical < MIN_TOOLTIP_HEIGHT && oppositeVertical > availableVertical) {
    verticalPlacement = verticalPlacement === 'bottom' ? 'top' : 'bottom';
    availableVertical = oppositeVertical;
  }

  if (availableVertical <= 0) {
    availableVertical = safeAreaHeight;
  }

  let placement: TooltipPlacement = verticalPlacement === 'bottom' ? 'bottom-start' : 'top-start';
  let available = placement.endsWith('end') ? spaceLeft : spaceRight;
  if (spaceLeft > spaceRight) {
    placement = verticalPlacement === 'bottom' ? 'bottom-end' : 'top-end';
    available = spaceLeft;
  }

  let width = Math.min(targetWidth, available);

  const oppositeAvailable = placement.endsWith('start') ? spaceLeft : spaceRight;
  if (width < Math.min(minWidth, targetWidth) && oppositeAvailable > available) {
    placement = placement.endsWith('start')
      ? (verticalPlacement === 'bottom' ? 'bottom-end' : 'top-end')
      : (verticalPlacement === 'bottom' ? 'bottom-start' : 'top-start');
    available = oppositeAvailable;
    width = Math.min(targetWidth, available);
  }

  const minRequired = Math.min(minWidth, targetWidth, available);
  if (minRequired > 0 && width < minRequired) {
    width = minRequired;
  }

  if (width <= 0) {
    placement = verticalPlacement;
    width = targetWidth;
    available = safeAreaWidth;
  }

  const finalWidth = placement === 'bottom'
    ? Math.min(width, safeAreaWidth)
    : Math.min(width, available, safeAreaWidth);

  const maxHeight = Math.max(
    Math.min(safeAreaHeight, availableVertical),
    Math.min(safeAreaHeight, MIN_TOOLTIP_HEIGHT)
  );

  return {
    placement,
    width: Math.max(
      finalWidth,
      Math.min(safeAreaWidth, minWidth, finalWidth || targetWidth)
    ),
    maxHeight
  };
};

const updateContentTooltipLayout = (rect: DOMRect) => {
  const { placement, width, maxHeight } = calculateTooltipLayout(
    rect,
    CONTENT_TOOLTIP_WIDTH,
    CONTENT_TOOLTIP_MIN_WIDTH
  );
  contentTooltipPlacement.value = placement;
  contentTooltipWidth.value = width;
  contentTooltipMaxHeight.value = maxHeight;
};

const updateDescriptionTooltipLayout = (rect: DOMRect) => {
  const { placement, width, maxHeight } = calculateTooltipLayout(
    rect,
    DESCRIPTION_TOOLTIP_WIDTH,
    DESCRIPTION_TOOLTIP_MIN_WIDTH
  );
  descriptionTooltipPlacement.value = placement;
  descriptionTooltipWidth.value = width;
  descriptionTooltipMaxHeight.value = maxHeight;
};

const handleContentTooltipEnter = () => {
  const target = contentTriggerRef.value;
  if (!target) return;

  // 使用缓存的 rect，避免重复计算
  if (!cachedContentRect.value) {
    cachedContentRect.value = target.getBoundingClientRect();
  }
  updateContentTooltipLayout(cachedContentRect.value);
};

const handleDescriptionTooltipEnter = () => {
  const target = descriptionTriggerRef.value;
  if (!target) return;

  // 使用缓存的 rect，避免重复计算
  if (!cachedDescriptionRect.value) {
    cachedDescriptionRect.value = target.getBoundingClientRect();
  }
  updateDescriptionTooltipLayout(cachedDescriptionRect.value);
};

const handleResize = () => {
  // resize 时清除缓存并重新计算
  cachedContentRect.value = null;
  cachedDescriptionRect.value = null;

  if (contentTriggerRef.value) {
    cachedContentRect.value = contentTriggerRef.value.getBoundingClientRect();
    updateContentTooltipLayout(cachedContentRect.value);
  }
  if (descriptionTriggerRef.value) {
    cachedDescriptionRect.value = descriptionTriggerRef.value.getBoundingClientRect();
    updateDescriptionTooltipLayout(cachedDescriptionRect.value);
  }
};

// 节流处理 resize 事件，避免频繁计算
const debouncedResize = useDebounceFn(handleResize, 150);

onMounted(() => {
  handleResize();
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', debouncedResize);
  }
});

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', debouncedResize);
  }
});

// 功能模式标签类型映射
const getFunctionModeTagType = (mode: string): 'default' | 'info' | 'success' => {
  const typeMap: Record<string, 'default' | 'info' | 'success'> = {
    basic: 'default',
    context: 'info',
    image: 'success'
  };
  return typeMap[mode] || 'default';
};

// 子模式标签类型映射
const getSubModeTagType = (favorite: FavoritePrompt): 'warning' | 'error' | 'success' | 'info' | 'default' => {
  if (favorite.optimizationMode) {
    return favorite.optimizationMode === 'system' ? 'warning' : 'error';
  }
  if (favorite.imageSubMode) {
    return favorite.imageSubMode === 'text2image' ? 'success' : 'info';
  }
  return 'default';
};

// 获取子模式标签文本
const getSubModeLabel = (favorite: FavoritePrompt): string => {
  if (favorite.optimizationMode) {
    // 根据功能模式动态返回标签文本
    const isContextMode = favorite.functionMode === 'context';
    if (isContextMode) {
      // 上下文模式：使用新的翻译键
      return favorite.optimizationMode === 'system'
        ? t('contextMode.optimizationMode.message')
        : t('contextMode.optimizationMode.variable');
    } else {
      // 基础模式：使用原有的翻译键
      return t(`favorites.manager.card.optimizationMode.${favorite.optimizationMode}`);
    }
  }
  if (favorite.imageSubMode) {
    return t(`favorites.manager.card.imageSubMode.${favorite.imageSubMode}`);
  }
  return '';
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes <= 1 ? t('favorites.manager.time.justNow') : t('favorites.manager.time.minutesAgo', { minutes });
    }
    return t('favorites.manager.time.hoursAgo', { hours });
  } else if (days === 1) {
    return t('favorites.manager.time.yesterday');
  } else if (days < 7) {
    return t('favorites.manager.time.daysAgo', { days });
  } else {
    return date.toLocaleDateString();
  }
};
</script>

<style scoped>
/* 卡片基础样式 */
.n-card {
  transition: all 0.2s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 确保卡片内容区域正确撑满 */
.n-card :deep(.n-card__content) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.n-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.is-selected :deep(.n-card) {
  border-color: rgb(var(--primary-color));
  box-shadow: 0 0 0 2px rgba(var(--primary-color), 0.2);
}

/* 🎨 Palette: Enhanced action buttons */
.card-actions {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.n-card:hover .card-actions {
  opacity: 1;
}

/* 🎨 Palette: Action button base styles */
.action-btn {
  position: relative;
  overflow: visible !important;
}

.action-btn :deep(.n-button__icon) {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 🎨 Palette: Hover effects */
.action-btn:hover :deep(.n-button__icon) {
  transform: scale(1.2);
}

.action-btn:active :deep(.n-button__icon) {
  transform: scale(0.95);
}

/* 🎨 Palette: Focus-visible state for keyboard navigation */
.action-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--n-primary-color-rgb, 24, 160, 88), 0.3);
}

/* 🎨 Palette: Copy button success state */
.copy-btn.copy-success {
  color: var(--n-success-color, #18a058) !important;
}

.copy-btn.copy-success :deep(.n-button__icon) {
  animation: icon-success-pop 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 🎨 Palette: Use button success state */
.use-btn.use-success {
  color: var(--n-success-color, #18a058) !important;
}

.use-btn.use-success :deep(.n-button__icon) {
  animation: icon-success-pop 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 🎨 Palette: Success icon animation */
@keyframes icon-success-pop {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

.success-icon {
  animation: checkmark-appear 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes checkmark-appear {
  0% {
    opacity: 0;
    transform: scale(0) rotate(-45deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.2) rotate(0deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

/* 🎨 Palette: Keyboard shortcut hint badge */
.shortcut-hint {
  position: absolute;
  top: -8px;
  right: -8px;
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 9px;
  font-weight: 600;
  color: #fff;
  background: rgba(0, 0, 0, 0.75);
  padding: 2px 5px;
  border-radius: 4px;
  letter-spacing: 0.3px;
  opacity: 0;
  transform: scale(0.8);
  animation: shortcut-hint-appear 0.2s ease forwards;
  pointer-events: none;
  z-index: 10;
  white-space: nowrap;
}

.dark .shortcut-hint {
  background: rgba(255, 255, 255, 0.85);
  color: #1a1a1a;
}

@keyframes shortcut-hint-appear {
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 🎨 Palette: Shortcut hint transition animations */
.shortcut-hint-enter-active,
.shortcut-hint-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.shortcut-hint-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.shortcut-hint-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* 🎨 Palette: Delete button hover effect */
.delete-btn:hover {
  background-color: rgba(var(--n-error-color-rgb, 240, 72, 72), 0.1) !important;
}

/* 🎨 Palette: Edit button hover effect */
.edit-btn:hover {
  background-color: rgba(var(--n-primary-color-rgb, 24, 160, 88), 0.1) !important;
}

/* 移动端始终显示按钮 */
@media (max-width: 768px) {
  .card-actions {
    opacity: 1;
  }

  /* 🎨 Palette: Hide keyboard shortcuts on mobile */
  .shortcut-hint {
    display: none;
  }
}

.tooltip-text {
  white-space: pre-wrap;
  word-break: break-word;
  display: block;
}

/* 🎨 Palette: Respect reduced motion preferences for accessibility */
@media (prefers-reduced-motion: reduce) {
  .action-btn :deep(.n-button__icon),
  .action-btn:hover :deep(.n-button__icon),
  .action-btn:active :deep(.n-button__icon) {
    transition: none;
    transform: none;
  }

  .copy-btn.copy-success :deep(.n-button__icon),
  .use-btn.use-success :deep(.n-button__icon) {
    animation: none;
  }

  .success-icon {
    animation: none;
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
  .action-btn:focus-visible {
    outline: 2px solid var(--n-primary-color, #18a058);
    outline-offset: 2px;
    box-shadow: none;
  }

  .copy-btn.copy-success,
  .use-btn.use-success {
    outline: 2px solid var(--n-success-color, #18a058);
    outline-offset: 2px;
  }
}
</style>
