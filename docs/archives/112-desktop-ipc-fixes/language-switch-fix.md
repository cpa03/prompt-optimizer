# 语言切换按钮修复

## 🎯 问题描述

### 核心问题

功能提示词管理的语言切换按钮显示"Object Promise"而不是正确的语言名称（如"中文"或"English"）。

### 问题表现

- UI组件中显示异常文本"Object Promise"
- 语言切换功能无法正常工作
- Web和Electron环境行为不一致

### 根本原因

- **异步接口不一致**: Electron环境的方法返回Promise，但被当作同步值使用
- **IPC调用处理错误**: 异步IPC调用的结果没有正确await
- **接口定义不匹配**: Web和Electron环境使用不同的方法签名

## 🔧 解决方案

### 1. 统一异步接口设计

创建`ITemplateLanguageService`接口，确保跨环境一致性：

```typescript
export interface ITemplateLanguageService {
  initialize(): Promise<void>
  getCurrentLanguage(): Promise<BuiltinTemplateLanguage>
  setLanguage(language: BuiltinTemplateLanguage): Promise<void>
  toggleLanguage(): Promise<BuiltinTemplateLanguage>
  isValidLanguage(language: string): Promise<boolean>
  getSupportedLanguages(): Promise<BuiltinTemplateLanguage[]>
}
```

### 2. 修复Vue组件异步调用

```vue
<!-- 修复前 -->
<span>{{ languageService.getCurrentLanguage() }}</span>

<!-- 修复后 -->
<span>{{ currentLanguage }}</span>

<script setup>
const currentLanguage = ref('')

onMounted(async () => {
  currentLanguage.value = await languageService.getCurrentLanguage()
})
</script>
```

### 3. 完善IPC调用链

```javascript
// preload.js
templateLanguage: {
  getCurrentLanguage: async () => {
    const result = await ipcRenderer.invoke('template-getCurrentBuiltinTemplateLanguage')
    if (!result.success) throw new Error(result.error)
    return result.data
  }
}

// main.js
ipcMain.handle('template-getCurrentBuiltinTemplateLanguage', async (event) => {
  try {
    const result = await templateManager.getCurrentBuiltinTemplateLanguage()
    return createSuccessResponse(result)
  } catch (error) {
    return createErrorResponse(error)
  }
})
```

## ✅ 修复验证

### 验证清单

- [x] 语言切换按钮正确显示"中文"或"English"
- [x] 完全解决了"Object Promise"显示问题
- [x] Web和Electron环境行为一致
- [x] 所有异步调用正确处理

## 💡 经验总结

### 核心原则

1. **接口一致性**: 跨环境的接口必须保持一致的异步性
2. **错误处理**: 让错误自然传播，便于问题定位
3. **类型安全**: 使用TypeScript确保接口实现的完整性
4. **事件传播**: 确保语言切换事件能传播到所有相关组件

### 最佳实践

1. **统一异步**: 所有跨环境接口都应该是异步的
2. **接口驱动**: 先定义接口，再实现具体类
3. **完整测试**: 在两种环境下都要验证功能
4. **事件链完整性**: 建立完整的事件传播机制，确保深层组件也能响应状态变化

### 相关问题

- **迭代页面模板选择不更新**: 语言切换后，由于组件层级差异和事件传播机制缺失，迭代页面的模板选择无法正确更新。解决方案是建立完整的事件传播链，确保所有TemplateSelect组件都能响应语言切换事件。详见 `106-template-management/troubleshooting.md` 第9节。

这个修复建立了完整的异步接口设计模式，为后续的IPC开发提供了标准。
