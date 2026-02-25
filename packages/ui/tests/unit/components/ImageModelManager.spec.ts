import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ImageModelManager from '../../../src/components/ImageModelManager.vue'

vi.mock('@prompt-optimizer/core', () => ({
  getEnvInt: vi.fn((key: string, defaultValue: number) => defaultValue),
  getEnvString: vi.fn((key: string, defaultValue: string) => defaultValue),
  getEnvBoolean: vi.fn((key: string, defaultValue: boolean) => defaultValue),
  isRunningInElectron: vi.fn(() => false),
}))

vi.mock('vue-i18n', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-i18n')>()
  return {
    ...actual,
    useI18n: () => ({
      t: (key: string) => key,
    }),
  }
})

vi.mock('naive-ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('naive-ui')>()
  return {
    ...actual,
    useDialog: () => ({
      warning: vi.fn(),
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    }),
  }
})

vi.mock('../../../src/composables/model/useImageModelManager', () => ({
  useImageModelManager: () => ({
    providers: ref([]),
    configs: ref([]),
    models: ref([]),
    isLoading: ref(false),
    error: ref(null),
    initialize: vi.fn().mockResolvedValue(undefined),
    loadConfigs: vi.fn().mockResolvedValue(undefined),
    updateConfig: vi.fn().mockResolvedValue(undefined),
    deleteConfig: vi.fn().mockResolvedValue(undefined),
    testConnection: vi.fn().mockResolvedValue({ success: true }),
    enableModel: vi.fn().mockResolvedValue(undefined),
    disableModel: vi.fn().mockResolvedValue(undefined),
  }),
}))

describe('ImageModelManager', () => {
  const mockImageService = {
    testConnection: vi.fn().mockResolvedValue({ success: true, images: [] }),
  }

  const createWrapper = (props = {}) => {
    return mount(ImageModelManager, {
      props: {
        ...props,
      },
      global: {
        provide: {
          imageService: mockImageService,
        },
        stubs: {
          'n-card': {
            template:
              '<div class="n-card"><slot name="header" /><slot /><slot name="header-extra" /></div>',
          },
          'n-space': { template: '<div class="n-space"><slot /></div>' },
          'n-button': {
            template: '<button class="n-button"><slot /><slot name="icon" /></button>',
          },
          'n-text': { template: '<span class="n-text"><slot /></span>' },
          'n-tag': { template: '<span class="n-tag"><slot /></span>' },
          'n-empty': { template: '<div class="n-empty"><slot name="extra" /></div>' },
          'n-image': { template: '<img class="n-image" />' },
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    })
  }

  describe('组件挂载', () => {
    it('应该正确挂载组件', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('应该渲染空状态当没有配置时', async () => {
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      const emptyState = wrapper.find('.n-empty')
      expect(emptyState.exists()).toBe(true)
    })
  })

  describe('组件方法', () => {
    it('应该暴露 refresh 方法', async () => {
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      expect(typeof wrapper.vm.refresh).toBe('function')
    })

    it('refresh 方法应该返回 Promise', async () => {
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      const result = wrapper.vm.refresh()
      expect(result).toBeInstanceOf(Promise)
    })
  })

  describe('emit 事件', () => {
    it('应该能够触发 add 事件', async () => {
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      wrapper.vm.openAddModal()
      expect(wrapper.emitted('add')).toBeTruthy()
    })

    it('应该能够触发 edit 事件', async () => {
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      wrapper.vm.editConfig('test-config-id')
      expect(wrapper.emitted('edit')).toBeTruthy()
      expect(wrapper.emitted('edit')[0]).toEqual(['test-config-id'])
    })
  })
})
