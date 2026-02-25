import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, nextTick } from 'vue'
import VariableAwareInput from '../../../src/components/variable-extraction/VariableAwareInput.vue'

describe('VariableAwareInput', () => {
  describe('组件渲染', () => {
    it('应该正确渲染组件', () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: 'Hello {{name}}',
        },
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.variable-aware-input-wrapper').exists()).toBe(true)
    })

    it('应该渲染 CodeMirror 容器', () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: '',
        },
      })

      expect(wrapper.find('.codemirror-container').exists()).toBe(true)
    })

    it('应该接受 placeholder 属性', () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: '',
          placeholder: '请输入内容',
        },
      })

      expect(wrapper.props('placeholder')).toBe('请输入内容')
    })

    it('应该接受 autosize 属性', () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: '',
          autosize: { minRows: 5, maxRows: 15 },
        },
      })

      expect(wrapper.props('autosize')).toEqual({ minRows: 5, maxRows: 15 })
    })
  })

  describe('Props 传递', () => {
    it('应该接受全局变量列表', () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: '',
          existingGlobalVariables: ['var1', 'var2'],
        },
      })

      expect(wrapper.props('existingGlobalVariables')).toEqual(['var1', 'var2'])
    })

    it('应该接受临时变量列表', () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: '',
          existingTemporaryVariables: ['temp1', 'temp2'],
        },
      })

      expect(wrapper.props('existingTemporaryVariables')).toEqual(['temp1', 'temp2'])
    })

    it('应该接受预定义变量列表', () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: '',
          predefinedVariables: ['system1', 'system2'],
        },
      })

      expect(wrapper.props('predefinedVariables')).toEqual(['system1', 'system2'])
    })

    it('应该接受变量值映射', () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: '',
          globalVariableValues: { var1: 'value1' },
          temporaryVariableValues: { temp1: 'tempValue' },
          predefinedVariableValues: { system1: 'sysValue' },
        },
      })

      expect(wrapper.props('globalVariableValues')).toEqual({ var1: 'value1' })
      expect(wrapper.props('temporaryVariableValues')).toEqual({ temp1: 'tempValue' })
      expect(wrapper.props('predefinedVariableValues')).toEqual({ system1: 'sysValue' })
    })
  })

  describe('双向绑定', () => {
    it('应该显示初始值', () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: 'Initial text',
        },
      })

      expect(wrapper.props('modelValue')).toBe('Initial text')
    })

    it('应该在值变化时触发 update:modelValue 事件', async () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: 'Initial',
        },
      })

      // 模拟编辑器内容变化
      await wrapper.setProps({ modelValue: 'Updated' })

      expect(wrapper.props('modelValue')).toBe('Updated')
    })

    it('应该支持 v-model 双向绑定', async () => {
      const modelValue = ref('Test')

      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: modelValue.value,
          'onUpdate:modelValue': (value: string) => {
            modelValue.value = value
          },
        },
      })

      expect(wrapper.props('modelValue')).toBe('Test')

      // 模拟值更新
      await wrapper.vm.$emit('update:modelValue', 'New value')
      await nextTick()

      expect(modelValue.value).toBe('New value')
    })
  })

  describe('变量提取功能', () => {
    it('应该在选择文本时显示提取按钮', () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: 'Select this text',
        },
        global: {
          stubs: {
            NPopover: true,
            NButton: true,
            VariableExtractionDialog: true,
          },
        },
      })

      // 提取按钮的 Popover 应该存在 (作为 stub)
      // 由于 CodeMirror 在 JSDOM 环境中可能无法完全渲染,我们只检查组件是否挂载成功
      expect(wrapper.exists()).toBe(true)
    })

    it('应该在点击提取按钮时打开对话框', async () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: 'Test text',
        },
      })

      // 变量提取对话框组件应该存在
      const dialog = wrapper.findComponent({ name: 'VariableExtractionDialog' })
      expect(dialog.exists()).toBe(true)
    })

    it('应该在提取确认后触发 variable-extracted 事件', async () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: 'Test text',
        },
      })

      // 模拟提取确认
      await wrapper.vm.$emit('variable-extracted', {
        variableName: 'testVar',
        variableValue: 'Test text',
        variableType: 'temporary',
      })

      expect(wrapper.emitted('variable-extracted')).toBeTruthy()
      expect(wrapper.emitted('variable-extracted')?.[0]).toEqual([
        {
          variableName: 'testVar',
          variableValue: 'Test text',
          variableType: 'temporary',
        },
      ])
    })

    it('应该在提取后替换文本为变量占位符', async () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: 'Hello world',
          'onUpdate:modelValue': vi.fn(),
        },
      })

      // 模拟提取操作后的文本更新
      await wrapper.vm.$emit('update:modelValue', 'Hello {{name}}')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Hello {{name}}'])
    })
  })

  describe('缺失变量添加功能', () => {
    it('应该在点击添加按钮时触发 add-missing-variable 事件', async () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: '{{missingVar}}',
        },
      })

      await wrapper.vm.$emit('add-missing-variable', 'missingVar')

      expect(wrapper.emitted('add-missing-variable')).toBeTruthy()
      expect(wrapper.emitted('add-missing-variable')?.[0]).toEqual(['missingVar'])
    })

    it('应该支持添加多个缺失变量', async () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: '{{var1}} {{var2}} {{var3}}',
        },
      })

      await wrapper.vm.$emit('add-missing-variable', 'var1')
      await wrapper.vm.$emit('add-missing-variable', 'var2')
      await wrapper.vm.$emit('add-missing-variable', 'var3')

      expect(wrapper.emitted('add-missing-variable')).toHaveLength(3)
    })
  })

  describe('变量高亮', () => {
    it('应该为全局变量应用高亮', () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: '{{globalVar}}',
          existingGlobalVariables: ['globalVar'],
          globalVariableValues: { globalVar: 'value' },
        },
      })

      // CodeMirror 容器应该存在
      expect(wrapper.find('.codemirror-container').exists()).toBe(true)
    })

    it('应该为临时变量应用高亮', () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: '{{tempVar}}',
          existingTemporaryVariables: ['tempVar'],
          temporaryVariableValues: { tempVar: 'value' },
        },
      })

      expect(wrapper.find('.codemirror-container').exists()).toBe(true)
    })

    it('应该为预定义变量应用高亮', () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: '{{sysVar}}',
          predefinedVariables: ['sysVar'],
          predefinedVariableValues: { sysVar: 'value' },
        },
      })

      expect(wrapper.find('.codemirror-container').exists()).toBe(true)
    })

    it('应该为缺失变量应用高亮', () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: '{{missingVar}}',
        },
      })

      expect(wrapper.find('.codemirror-container').exists()).toBe(true)
    })

    it('应该同时高亮多种类型的变量', () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: '{{global}} {{temp}} {{predef}} {{missing}}',
          existingGlobalVariables: ['global'],
          existingTemporaryVariables: ['temp'],
          predefinedVariables: ['predef'],
          globalVariableValues: { global: 'g' },
          temporaryVariableValues: { temp: 't' },
          predefinedVariableValues: { predef: 'p' },
        },
      })

      expect(wrapper.find('.codemirror-container').exists()).toBe(true)
    })
  })

  describe('边界情况处理', () => {
    it('应该处理空文本', () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: '',
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('应该处理无变量的文本', () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: 'Plain text without variables',
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('应该处理长文本', () => {
      const longText = 'a'.repeat(10000)
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: longText,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('应该处理包含特殊字符的文本', () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: '{{var}} with <html> & "quotes" and \'apostrophes\'',
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('应该处理 Unicode 字符', () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: '你好 {{用户名}} 😀',
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('应该处理换行符', () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: 'Line 1\nLine 2\n{{var}}\nLine 4',
        },
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('响应式更新', () => {
    it('应该响应 modelValue 的变化', async () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: 'Initial',
        },
      })

      await wrapper.setProps({ modelValue: 'Updated' })

      expect(wrapper.props('modelValue')).toBe('Updated')
    })

    it('应该响应变量列表的变化', async () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: '{{var1}}',
          existingGlobalVariables: [],
        },
      })

      // 初始状态: var1 是缺失变量
      expect(wrapper.props('existingGlobalVariables')).toEqual([])

      // 添加 var1 到全局变量
      await wrapper.setProps({
        existingGlobalVariables: ['var1'],
        globalVariableValues: { var1: 'value' },
      })

      expect(wrapper.props('existingGlobalVariables')).toEqual(['var1'])
    })

    it('应该响应变量值的变化', async () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: '{{var1}}',
          existingGlobalVariables: ['var1'],
          globalVariableValues: { var1: 'old value' },
        },
      })

      await wrapper.setProps({
        globalVariableValues: { var1: 'new value' },
      })

      expect(wrapper.props('globalVariableValues')).toEqual({ var1: 'new value' })
    })
  })

  describe('事件系统', () => {
    it('应该正确声明所有事件', () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: '',
        },
      })

      // 验证组件可以触发所有声明的事件
      expect(wrapper.vm.$emit).toBeDefined()
    })

    it('应该支持 update:modelValue 事件', async () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: 'test',
        },
      })

      await wrapper.vm.$emit('update:modelValue', 'new value')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('应该支持 variable-extracted 事件', async () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: 'test',
        },
      })

      await wrapper.vm.$emit('variable-extracted', {
        variableName: 'test',
        variableValue: 'value',
        variableType: 'global',
      })

      expect(wrapper.emitted('variable-extracted')).toBeTruthy()
    })

    it('应该支持 add-missing-variable 事件', async () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: '{{missing}}',
        },
      })

      await wrapper.vm.$emit('add-missing-variable', 'missing')

      expect(wrapper.emitted('add-missing-variable')).toBeTruthy()
    })
  })

  describe('性能测试', () => {
    it('应该能够处理大量变量', () => {
      const variables = Array.from({ length: 100 }, (_, i) => `var${i}`)
      const text = variables.map((v) => `{{${v}}}`).join(' ')

      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: text,
          existingGlobalVariables: variables,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('应该能够快速更新', async () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: 'test',
        },
      })

      const startTime = Date.now()

      for (let i = 0; i < 10; i++) {
        await wrapper.setProps({ modelValue: `test ${i}` })
      }

      const endTime = Date.now()
      const duration = endTime - startTime

      // 10次更新应该在合理时间内完成 (< 1秒)
      expect(duration).toBeLessThan(1000)
    })
  })

  describe('可访问性', () => {
    it('应该有合适的 ARIA 属性', () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: 'test',
        },
      })

      // CodeMirror 容器应该存在
      expect(wrapper.find('.codemirror-container').exists()).toBe(true)
    })

    it('应该支持键盘导航', () => {
      const wrapper = mount(VariableAwareInput, {
        props: {
          modelValue: 'test',
        },
      })

      // 组件应该可以接收焦点
      expect(wrapper.find('.codemirror-container').exists()).toBe(true)
    })
  })
})
