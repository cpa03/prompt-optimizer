import { useI18n } from 'vue-i18n'
import type { IFavoriteManager } from '@prompt-optimizer/core'
import { DEFAULT_CATEGORY_COLORS } from '../../config/constants'

/**
 * 收藏功能初始化器
 * 负责创建国际化的默认分类
 */
export function useFavoriteInitializer(manager: IFavoriteManager) {
  const { t } = useI18n()

  /**
   * 确保默认分类存在(仅首次使用时创建)
   */
  const ensureDefaultCategories = async () => {
    const defaultCategories = [
      {
        name: t('favorites.categories.default.uncategorized'),
        description: t('favorites.categories.default.uncategorizedDesc'),
        color: DEFAULT_CATEGORY_COLORS.UNCATEGORIZED,
      },
      {
        name: t('favorites.categories.default.creativeWriting'),
        description: t('favorites.categories.default.creativeWritingDesc'),
        color: DEFAULT_CATEGORY_COLORS.CREATIVE_WRITING,
      },
      {
        name: t('favorites.categories.default.programming'),
        description: t('favorites.categories.default.programmingDesc'),
        color: DEFAULT_CATEGORY_COLORS.PROGRAMMING,
      },
      {
        name: t('favorites.categories.default.businessAnalysis'),
        description: t('favorites.categories.default.businessAnalysisDesc'),
        color: DEFAULT_CATEGORY_COLORS.BUSINESS_ANALYSIS,
      },
      {
        name: t('favorites.categories.default.learning'),
        description: t('favorites.categories.default.learningDesc'),
        color: DEFAULT_CATEGORY_COLORS.LEARNING,
      },
      {
        name: t('favorites.categories.default.dailyAssistant'),
        description: t('favorites.categories.default.dailyAssistantDesc'),
        color: DEFAULT_CATEGORY_COLORS.DAILY_ASSISTANT,
      },
    ]

    await manager.ensureDefaultCategories(defaultCategories)
  }

  return {
    ensureDefaultCategories,
  }
}
