import { ref, computed, inject, type Ref } from 'vue'

import type { AppServices } from '../../types/services'
import { TagTypeConverter } from '@prompt-optimizer/core'

export interface TagSuggestion {
  label: string
  value: string
  count: number
}

/**
 * 标签建议 Composable
 * 提供标签自动完成功能，基于现有收藏中的标签使用情况
 */
export function useTagSuggestions() {
  const services = inject<Ref<AppServices | null>>('services')
  const allTags = ref<TagSuggestion[]>([])
  const loading = ref(false)

  /**
   * 加载所有标签统计数据
   */
  const loadTags = async () => {
    if (!services?.value?.favoriteManager) {
      return
    }

    loading.value = true
    try {
      const tagStats = await services.value.favoriteManager.getAllTags()
      // 使用统一的类型转换器转换为自动完成选项格式
      allTags.value = TagTypeConverter.toAutoCompleteOptions(tagStats)
    } catch (error) {
      console.error('Failed to load tags:', error)
      allTags.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * 根据输入查询过滤标签建议
   * @param query 查询字符串
   * @param excludeTags 需要排除的标签(已选中的标签)
   * @returns 过滤后的标签建议列表
   */
  const filterTags = (query: string, excludeTags: string[] = []): TagSuggestion[] => {
    const excludeSet = new Set(excludeTags.map((t) => t.toLowerCase()))

    if (!query) {
      return sortedByCount.value.filter((tag) => !excludeSet.has(tag.value.toLowerCase()))
    }

    const lowerQuery = query.toLowerCase()
    const lowerQueryLen = lowerQuery.length

    return allTags.value
      .filter((tag) => {
        const lowerValue = tag.value.toLowerCase()
        return !excludeSet.has(lowerValue) && lowerValue.includes(lowerQuery)
      })
      .sort((a, b) => {
        const aLower = a.value.toLowerCase()
        const bLower = b.value.toLowerCase()
        const aStartsWith = aLower.slice(0, lowerQueryLen) === lowerQuery
        const bStartsWith = bLower.slice(0, lowerQueryLen) === lowerQuery
        if (aStartsWith !== bStartsWith) return aStartsWith ? -1 : 1
        return b.count - a.count
      })
  }

  /**
   * 获取热门标签(使用次数最多的前N个)
   * @param limit 返回数量限制
   * @param excludeTags 需要排除的标签
   */
  const sortedByCount = computed(() => [...allTags.value].sort((a, b) => b.count - a.count))

  const getPopularTags = computed(() => {
    return (limit = 10, excludeTags: string[] = []): TagSuggestion[] => {
      const excludeSet = new Set(excludeTags.map((t) => t.toLowerCase()))
      return sortedByCount.value
        .filter((tag) => !excludeSet.has(tag.value.toLowerCase()))
        .slice(0, limit)
    }
  })

  const getRecentTags = (limit = 10, excludeTags: string[] = []): TagSuggestion[] => {
    return getPopularTags.value(limit, excludeTags)
  }

  return {
    allTags,
    loading,
    loadTags,
    filterTags,
    getPopularTags,
    getRecentTags,
  }
}
