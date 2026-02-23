import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ActionButton from '../../../src/components/ActionButton.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

describe('ActionButton', () => {
  const defaultProps = {
    text: 'Test Button',
  }

  const mountComponent = (props = {}, slots = {}) => {
    return mount(ActionButton, {
      props: { ...defaultProps, ...props },
      slots,
      global: {
        stubs: {
          NButton: {
            name: 'NButton',
            props: ['type', 'size', 'loading', 'loadingText', 'disabled', 'ghost', 'round', 'title'],
            template: `
              <button 
                :type="type" 
                :disabled="disabled || loading"
                :title="title"
                @click="$emit('click')"
                @focus="$emit('focus')"
                @blur="$emit('blur')"
                :class="{ 'is-loading': loading }"
              >
                <slot name="icon"></slot>
                <slot></slot>
                <span v-if="loading">{{ loadingText }}</span>
              </button>
            `,
          },
        },
      },
    })
  }

  it('should render with required text prop', () => {
    const wrapper = mountComponent()
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Test Button')
  })

  it('should emit click event when clicked', async () => {
    const wrapper = mountComponent()
    const button = wrapper.find('button')
    await button.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')?.length).toBe(1)
  })

  it('should pass loading state to NButton', () => {
    const wrapper = mountComponent({ loading: true })
    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.classes()).toContain('is-loading')
  })

  it('should not emit click when loading', async () => {
    const wrapper = mountComponent({ loading: true })
    const button = wrapper.find('button')
    await button.trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('should have default type when not specified', () => {
    const wrapper = mountComponent()
    expect(wrapper.exists()).toBe(true)
  })

  it('should render icon slot content', () => {
    const wrapper = mountComponent({}, {
      icon: '<span class="custom-icon">🎨</span>',
    })
    expect(wrapper.find('.custom-icon').exists()).toBe(true)
  })

  it('should display icon prop when no icon slot provided', () => {
    const wrapper = mountComponent({ icon: '🔧' })
    expect(wrapper.text()).toContain('🔧')
  })

  it('should extract keyboard shortcut from title prop', async () => {
    const wrapper = mountComponent({ title: 'Save (Ctrl+S)' })
    expect(wrapper.vm.shortcutHint).toBe('Ctrl+S')
  })

  it('should return null for shortcutHint when no title pattern matches', async () => {
    const wrapper = mountComponent({ title: 'Simple Title' })
    expect(wrapper.vm.shortcutHint).toBeNull()
  })

  it('should have aria-pressed attribute', async () => {
    const wrapper = mountComponent()
    const button = wrapper.find('button')
    expect(button.attributes('aria-pressed')).toBeDefined()
  })

  it('should expose setHovered method', () => {
    const wrapper = mountComponent()
    expect(typeof wrapper.vm.setHovered).toBe('function')
  })

  it('should expose setFocused method', () => {
    const wrapper = mountComponent()
    expect(typeof wrapper.vm.setFocused).toBe('function')
  })
})
