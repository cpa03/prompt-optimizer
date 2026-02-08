<template>
  <div ref="componentRef" class="relative" role="combobox" :aria-expanded="isOpen" aria-haspopup="listbox">
    <NInput
      ref="inputRef"
      :value="modelValue"
      @update:value="handleInput"
      @keydown="handleKeydown"
      :type="type"
      :placeholder="placeholder"
      :loading="isLoading"
      :aria-activedescendant="isOpen && highlightedIndex >= 0 ? `option-${filteredOptions[highlightedIndex]?.value}` : undefined"
      clearable
    >
      <template #suffix>
        <NButton
          quaternary
          circle
          size="small"
          @click="toggleDropdown"
          :loading="isLoading"
          :aria-label="isOpen ? 'Close dropdown' : 'Open dropdown'"
        >
          <template #icon>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 transition-transform duration-200"
              :class="{ 'rotate-180': isOpen }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </template>
        </NButton>
      </template>
    </NInput>
    
    <!-- 提示文本 -->
    <transition name="fade">
      <div v-if="!isOpen && !isLoading && showHint" 
          class="absolute right-12 top-0 bottom-0 min-w-[120px] flex items-center text-xs text-gray-500 pointer-events-none">
        {{ hintText }}
      </div>
    </transition>
    
    <!-- Dropdown Menu with smooth animation -->
    <transition name="dropdown">
      <NCard
        v-if="isOpen"
        size="small"
        class="dropdown-menu absolute z-10 mt-1 w-full shadow-lg max-h-60 overflow-auto"
        :bordered="true"
        role="listbox"
        :aria-label="placeholder || 'Options'"
      >
      <NEmpty v-if="isLoading" size="small" :description="loadingText" />
      <NEmpty v-else-if="filteredOptions.length === 0" size="small" :description="noOptionsText" />
      <NSpace v-else vertical size="small">
        <div
          v-for="(option, index) in filteredOptions"
          :key="option.value"
          :id="`option-${option.value}`"
          @click="selectOption(option)"
          @mouseenter="highlightedIndex = index"
          class="cursor-pointer px-2 py-1.5 rounded transition-all duration-150"
          :class="{
            'bg-blue-100 dark:bg-blue-900 font-medium': modelValue === option.value,
            'bg-gray-100 dark:bg-gray-700 ring-1 ring-gray-300 dark:ring-gray-600': highlightedIndex === index && modelValue !== option.value
          }"
          :role="'option'"
          :aria-selected="modelValue === option.value"
          :aria-current="highlightedIndex === index ? 'true' : undefined"
          :ref="el => { if (el && highlightedIndex === index) highlightedElement = el }"
        >
          {{ option.label }}
        </div>
      </NSpace>
      </NCard>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'

import { NInput, NButton, NCard, NEmpty, NSpace } from 'naive-ui';

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  options: {
    type: Array,
    default: () => []
  },
  type: {
    type: String,
    default: 'text'
  },
  required: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: ''
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: 'Loading...'
  },
  noOptionsText: {
    type: String,
    default: 'No options available'
  },
  fetchOptions: {
    type: Function,
    default: null
  },
  showHint: {
    type: Boolean,
    default: true
  },
  hintText: {
    type: String,
    default: 'Click to fetch options'
  }
});

const emit = defineEmits(['update:modelValue', 'select', 'fetchOptions']);

const isOpen = ref(false);
const inputRef = ref(null);
const searchText = ref('');
const highlightedIndex = ref(-1);
const highlightedElement = ref(null);

// Watch for highlighted index changes and scroll into view
watch(highlightedIndex, (newIndex) => {
  if (newIndex >= 0 && highlightedElement.value) {
    nextTick(() => {
      highlightedElement.value?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    });
  }
});

// 根据输入内容筛选选项
const filteredOptions = computed(() => {
  if (!searchText.value) return props.options;
  return props.options.filter(option => 
    option.label.toLowerCase().includes(searchText.value.toLowerCase()) ||
    option.value.toLowerCase().includes(searchText.value.toLowerCase())
  );
});

// 处理输入事件
const handleInput = (value) => {
  emit('update:modelValue', value);
  searchText.value = value;
};

// Toggle dropdown visibility
const toggleDropdown = async () => {
  isOpen.value = !isOpen.value;
  
  // 如果打开下拉菜单，聚焦到输入框
  if (isOpen.value) {
    highlightedIndex.value = -1;
    emit('fetchOptions');
    // 等待DOM更新后聚焦
    setTimeout(() => {
      if (inputRef.value && inputRef.value.focus) {
        inputRef.value.focus();
      }
    }, 10);
  } else {
    highlightedIndex.value = -1;
  }
};

// Handle option selection
const selectOption = (option) => {
  emit('update:modelValue', option.value);
  emit('select', option);
  isOpen.value = false;
  searchText.value = '';
  highlightedIndex.value = -1;
};

// Handle keyboard navigation
const handleKeydown = (event) => {
  if (!isOpen.value) {
    // Open dropdown on ArrowDown or ArrowUp when closed
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      toggleDropdown();
    }
    return;
  }

  const options = filteredOptions.value;
  if (options.length === 0) return;

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      highlightedIndex.value = (highlightedIndex.value + 1) % options.length;
      break;
    case 'ArrowUp':
      event.preventDefault();
      highlightedIndex.value = highlightedIndex.value <= 0 
        ? options.length - 1 
        : highlightedIndex.value - 1;
      break;
    case 'Enter':
      event.preventDefault();
      if (highlightedIndex.value >= 0 && highlightedIndex.value < options.length) {
        selectOption(options[highlightedIndex.value]);
      }
      break;
    case 'Escape':
      event.preventDefault();
      isOpen.value = false;
      highlightedIndex.value = -1;
      break;
    case 'Tab':
      // Close dropdown when Tab is pressed to move to next field
      if (isOpen.value) {
        isOpen.value = false;
        highlightedIndex.value = -1;
      }
      break;
  }
};

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  // 只有在下拉菜单打开且点击的是组件外部时才关闭下拉菜单
  if (isOpen.value && componentRef.value && !componentRef.value.contains(event.target)) {
    isOpen.value = false;
    searchText.value = '';
    highlightedIndex.value = -1;
  }
};

// 组件引用
const componentRef = ref(null);

// Add and remove event listener
onMounted(() => {
  if (typeof document !== 'undefined') {
    // 使用捕获阶段以确保事件能够被正确捕获
    document.addEventListener('mousedown', handleClickOutside, true);
  }
});

onUnmounted(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('mousedown', handleClickOutside, true);
  }
});
</script>

<style scoped>
/* 提示文本的淡入淡出效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Dropdown menu smooth animation */
.dropdown-menu {
  transform-origin: top center;
}

.dropdown-enter-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-leave-active {
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from {
  opacity: 0;
  transform: scaleY(0.95) translateY(-8px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: scaleY(0.95) translateY(-4px);
}

/* Option selection animation */
.dropdown-menu :deep(.n-space > div) {
  transition: transform 0.15s ease, background-color 0.15s ease;
}

.dropdown-menu :deep(.n-space > div:active) {
  transform: scale(0.98);
}

/* Chevron icon smooth animation */
.rotate-180 {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Respect reduced motion preference for accessibility */
@media (prefers-reduced-motion: reduce) {
  .dropdown-enter-active,
  .dropdown-leave-active {
    transition: none;
  }
  
  .dropdown-menu :deep(.n-space > div) {
    transition: none;
  }
  
  .rotate-180 {
    transition: none;
  }
  
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}
</style>