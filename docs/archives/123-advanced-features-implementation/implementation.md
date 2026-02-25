# 技术实现详解

## 🔧 架构设计

### 整体架构演进

```
原始架构                    扩展后架构
┌─────────────┐           ┌─────────────────────────────────┐
│ BasicTestPanel │    →     │ AdvancedTestPanel (主组件)      │
└─────────────┘           │ ├── BasicTestMode               │
                          │ ├── ConversationManager         │
                          │ ├── VariableManagerModal        │
                          │ └── ToolManager                 │
                          └─────────────────────────────────┘
```

### 核心设计原则

1. **最小侵入** - 基于现有架构进行最小化扩展
2. **向后兼容** - 所有新功能都是可选的
3. **职责分离** - UI层管理变量，Core层处理逻辑
4. **类型安全** - 完整的TypeScript类型支持

## 🧪 高级变量管理实现

### 1. VariableManager服务架构

```typescript
export class VariableManager implements IVariableManager {
  private customVariables: Record<string, string> = {}
  private readonly predefinedVariables = [
    'originalPrompt',
    'lastOptimizedPrompt',
    'iterateInput',
    'currentPrompt', // 新增：测试阶段使用
  ]

  // 变量CRUD操作
  setVariable(name: string, value: string): void {
    if (!this.validateVariableName(name)) {
      throw new Error(`Invalid variable name: ${name}`)
    }
    this.customVariables[name] = value
    this.saveCustomVariables()
  }

  // 解析所有变量（预定义 + 自定义）
  resolveAllVariables(context: TemplateContext): Record<string, string> {
    const predefinedVars = this.extractPredefinedVariables(context)
    return { ...predefinedVars, ...this.customVariables }
  }
}
```

### 2. ConversationManager实现

```typescript
export function useConversationManager() {
  const messages = ref<ConversationMessage[]>([])

  // 检测缺失变量
  const getMissingVariables = (content: string): string[] => {
    const referencedVars = variableManager.scanVariablesInContent(content)
    const availableVars = Object.keys(variableManager.listVariables())
    return referencedVars.filter((variable) => !availableVars.includes(variable))
  }

  // 预览消息（变量替换后）
  const previewMessages = (variables: Record<string, string>): ConversationMessage[] => {
    return messages.value.map((message) => ({
      ...message,
      content: replaceVariables(message.content, variables),
    }))
  }
}
```

### 3. 界面重新设计实现

```vue
<!-- MainLayout导航菜单集成 -->
<div class="navigation-actions">
  <!-- 高级模式导航按钮 -->
  <ActionButtonUI
    icon="🚀"
    :text="$t('nav.advancedMode')"
    @click="toggleAdvancedMode"
    :class="{ 'active-button': advancedModeEnabled }"
  />
  
  <!-- 变量管理按钮 - 仅在高级模式下显示 -->
  <ActionButtonUI
    v-if="advancedModeEnabled"
    icon="📊"
    :text="$t('nav.variableManager')"
    @click="showVariableManager = true"
  />
</div>
```

## 🛠️ 工具调用功能实现

### 1. 统一工具调用接口设计

```typescript
export interface ToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

export interface StreamHandlers {
  onToken: (token: string) => void
  onReasoningToken?: (token: string) => void
  onToolCall?: (toolCall: ToolCall) => void // 新增
  onComplete: (response?: LLMResponse) => void
  onError: (error: Error) => void
}
```

### 2. OpenAI工具调用实现

```typescript
async streamOpenAIMessageWithTools(
  messages: Message[],
  modelConfig: ModelConfig,
  tools: ToolDefinition[],
  callbacks: StreamHandlers
): Promise<void> {
  const completionConfig: any = {
    model: modelConfig.defaultModel,
    messages: formattedMessages,
    tools: tools,
    tool_choice: 'auto',
    stream: true,
    ...restLlmParams
  };

  // 处理工具调用delta
  const toolCallDeltas = chunk.choices[0]?.delta?.tool_calls;
  if (toolCallDeltas) {
    for (const toolCallDelta of toolCallDeltas) {
      // delta处理逻辑
      if (callbacks.onToolCall) {
        callbacks.onToolCall(currentToolCall);
      }
    }
  }
}
```

### 3. Gemini工具调用适配

```typescript
async streamGeminiMessageWithTools(
  messages: Message[],
  modelConfig: ModelConfig,
  tools: ToolDefinition[],
  callbacks: StreamHandlers
): Promise<void> {
  // 转换工具格式为Gemini标准
  const geminiTools = this.convertToGeminiTools(tools);

  // 处理Gemini工具调用
  const functionCalls = chunk.functionCalls();
  if (functionCalls && functionCalls.length > 0) {
    for (const functionCall of functionCalls) {
      const toolCall: ToolCall = {
        id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'function' as const,
        function: {
          name: functionCall.name,
          arguments: JSON.stringify(functionCall.args)
        }
      };

      if (callbacks.onToolCall) {
        callbacks.onToolCall(toolCall);
      }
    }
  }
}
```

## 📝 关键问题解决记录

### 问题1: 变量状态同步问题

**问题**: AdvancedTestPanel 创建独立的变量管理器实例，导致数据不同步
**解决方案**: 统一变量管理器实例

```typescript
const variableManager: Ref<VariableManagerHooks | null> = computed(() => {
  if (props.variableManager) {
    return props.variableManager // 使用App.vue传入的统一实例
  }
  return localVariableManager // 后备方案
})
```

### 问题2: TypeScript类型安全问题

**问题**: 工具调用类型'string'不能赋值给'"function"'
**解决方案**: 使用字面量类型断言

```typescript
const toolCall: ToolCall = {
  id: `call_${Date.now()}`,
  type: 'function' as const, // 添加 as const 断言
  function: {
    name: functionCall.name,
    arguments: JSON.stringify(functionCall.args),
  },
}
```

### 问题3: 主题CSS集成问题

**问题**: 新组件使用硬编码样式，与主题系统不一致
**解决方案**: 使用项目统一的主题CSS类

```vue
<div class="add-message-row theme-manager-card">
  <button class="add-message-btn theme-manager-button-secondary">
    添加消息
  </button>
</div>
```

## 🔄 Apply to Test功能创新实现

### 智能模板配置系统

从简单的高级模式启用转变为智能测试配置：

```typescript
const applyOptimizedPromptToTest = (optimizationData: {
  originalPrompt: string
  optimizedPrompt: string
  optimizationMode: string
}) => {
  if (optimizationData.optimizationMode === 'system') {
    // 系统提示词优化：系统消息 + 用户交互消息
    conversationMessages.value = [
      { role: 'system', content: '{{currentPrompt}}' },
      { role: 'user', content: '请按照你的角色设定，展示你的能力并与我互动。' },
    ]
  } else {
    // 用户提示词优化：仅用户消息
    conversationMessages.value = [{ role: 'user', content: '{{currentPrompt}}' }]
  }
}
```

## 🧪 测试验证

### MCP工具端到端测试

使用MCP Playwright工具完成完整workflow验证：

1. **工具创建** - 在ContextEditor中创建get_weather工具
2. **工具同步** - 从优化阶段同步到测试阶段
3. **提示词优化** - 优化天气助手系统提示词
4. **工具调用测试** - 执行Gemini工具调用测试
5. **结果验证** - 确认工具调用信息正确传递

### 测试结果

- ✅ 工具定义正确创建和保存
- ✅ UI显示"工具: 1"和"使用的工具: get_weather"
- ✅ Gemini API正确携带工具信息
- ✅ 工具调用流程完整执行
- ✅ 测试结果显示AI响应和工具意图

## 📊 架构优势

### 1. 多提供商兼容性

- **OpenAI** - 直接使用tool_calls delta处理
- **Gemini** - 转换functionCalls()到标准ToolCall格式
- **向后兼容** - 现有API无破坏性变更

### 2. 组件解耦设计

```
ContextEditor (工具创建和管理)
      ↓
ConversationManager (工具统计和同步)
      ↓
AdvancedTestPanel (工具调用测试)
```

### 3. 数据流管理

- **工具变量分离** - 工具定义不使用变量系统
- **统一消息结构** - ConversationMessage在优化和测试阶段复用
- **状态持久化** - 使用统一的preferenceService
