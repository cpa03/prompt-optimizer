<template>
  <NFlex align="center" :wrap="false" :size="12">
    <!-- 快捷操作按钮 -->
    <!-- 工具管理 -->
    <NButton
      size="small"
      type="default"
      class="tools-action-btn"
      @click="$emit('open-tool-manager')"
      :title="$t('contextMode.actions.tools')"
    >
      <template #icon>
        <span class="tools-icon">🔧</span>
      </template>
      {{ $t('contextMode.actions.tools') }}
    </NButton>
  </NFlex>
</template>

<script setup lang="ts">
import { NButton, NFlex } from 'naive-ui'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emit = defineEmits<{
  'open-tool-manager': []
}>()
</script>

<style scoped>
/* 工具按钮微交互 */
.tools-action-btn {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.tools-action-btn:hover {
  transform: translateY(-1px);
  background-color: var(--n-color-hover);
}

.tools-action-btn:active {
  transform: scale(0.98);
}

.tools-action-btn:focus-visible {
  outline: 2px solid var(--n-color-focus);
  outline-offset: 2px;
}

/* 工具图标动画 */
.tools-icon {
  display: inline-block;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.tools-action-btn:hover .tools-icon {
  transform: scale(1.15) rotate(15deg);
}
</style>
