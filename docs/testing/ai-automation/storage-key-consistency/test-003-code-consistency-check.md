# 测试003：代码存储键一致性检查

## 📋 测试信息

- **测试ID：** TEST-003
- **测试类型：** 代码审查测试
- **优先级：** 高
- **预计执行时间：** 10分钟

## 🎯 测试目标

通过代码检查验证所有存储操作都使用统一的常量定义，没有硬编码的魔法字符串。

## 📝 测试范围

1. UI组件中的存储键使用
2. 核心服务中的存储键使用
3. 测试文件中的存储键使用
4. 常量定义的一致性

## 🧪 检查清单

### UI组件存储键使用检查

#### ThemeToggleUI.vue

- [ ] **导入常量** - 正确导入 `UI_SETTINGS_KEYS`
- [ ] **使用常量** - 使用 `UI_SETTINGS_KEYS.THEME_ID` 而不是 `'theme-id'`
- [ ] **所有引用** - 所有getPreference和setPreference调用都使用常量

**检查代码位置：**

```typescript
// packages/ui/src/components/ThemeToggleUI.vue
import { UI_SETTINGS_KEYS } from '../constants/storage-keys'

// 应该使用：
await setPreference(UI_SETTINGS_KEYS.THEME_ID, theme.id)
const themeId = await getPreference(UI_SETTINGS_KEYS.THEME_ID, defaultTheme)

// 而不是：
await setPreference('theme-id', theme.id) // ❌
```

#### LanguageSwitch.vue

- [ ] **导入常量** - 正确导入 `UI_SETTINGS_KEYS`
- [ ] **使用常量** - 使用 `UI_SETTINGS_KEYS.PREFERRED_LANGUAGE`

#### BuiltinTemplateLanguageSwitch.vue

- [ ] **服务一致性** - TemplateLanguageService使用正确的完整键名

### 核心服务存储键使用检查

#### ModelManager

- [ ] **导入常量** - 正确导入 `CORE_SERVICE_KEYS`
- [ ] **使用常量** - 使用 `CORE_SERVICE_KEYS.MODELS` 而不是 `'models'`

**检查代码位置：**

```typescript
// packages/core/src/services/model/manager.ts
import { CORE_SERVICE_KEYS } from '../../constants/storage-keys'

export class ModelManager implements IModelManager {
  private readonly storageKey = CORE_SERVICE_KEYS.MODELS // ✅
  // 而不是：
  // private readonly storageKey = 'models'; // ❌
}
```

#### TemplateManager

- [ ] **导入常量** - 正确导入 `CORE_SERVICE_KEYS`
- [ ] **使用常量** - 使用 `CORE_SERVICE_KEYS.USER_TEMPLATES` 而不是 `'user-templates'`

**检查代码位置：**

```typescript
// packages/core/src/services/template/manager.ts
this.config = {
  storageKey: config?.storageKey || CORE_SERVICE_KEYS.USER_TEMPLATES, // ✅
  // 而不是：
  // storageKey: config?.storageKey || 'user-templates', // ❌
}
```

#### HistoryManager

- [ ] **导入常量** - 正确导入 `CORE_SERVICE_KEYS`
- [ ] **使用常量** - 使用 `CORE_SERVICE_KEYS.PROMPT_HISTORY` 而不是 `'prompt_history'`

#### TemplateLanguageService

- [ ] **使用完整键名** - 使用 `'app:settings:ui:builtin-template-language'` 而不是 `'builtin-template-language'`

**检查代码位置：**

```typescript
// packages/core/src/services/template/languageService.ts
export class TemplateLanguageService implements ITemplateLanguageService {
  private readonly STORAGE_KEY = 'app:settings:ui:builtin-template-language' // ✅
  // 而不是：
  // private readonly STORAGE_KEY = 'builtin-template-language'; // ❌
}
```

### 常量定义一致性检查

#### UI包常量定义

- [ ] **文件存在** - `packages/ui/src/constants/storage-keys.ts` 存在
- [ ] **包含核心服务键** - 包含 `CORE_SERVICE_KEYS` 定义
- [ ] **类型定义完整** - 包含所有必要的类型定义

#### Core包常量定义

- [ ] **文件存在** - `packages/core/src/constants/storage-keys.ts` 存在
- [ ] **与UI包同步** - UI设置键与UI包保持一致
- [ ] **导出完整** - 导出所有必要的常量和类型

#### DataManager同步

- [ ] **使用统一常量** - DataManager的UI_SETTINGS_KEYS与常量文件一致
- [ ] **导入正确** - 从常量文件导入而不是重复定义

### 测试文件检查

#### 单元测试

- [ ] **ModelManager测试** - 使用正确的存储键常量
- [ ] **TemplateManager测试** - 使用正确的存储键常量
- [ ] **HistoryManager测试** - 使用正确的存储键常量
- [ ] **TemplateLanguageService测试** - 使用正确的完整键名

**检查代码位置：**

```typescript
// packages/core/tests/unit/template/languageService.test.ts
expect(mockStorage.getItem).toHaveBeenCalledWith('app:settings:ui:builtin-template-language') // ✅
// 而不是：
// expect(mockStorage.getItem).toHaveBeenCalledWith('builtin-template-language'); // ❌
```

## 🔍 自动化检查脚本

### 搜索魔法字符串

```bash
# 搜索可能的魔法字符串使用
grep -r "theme-id" packages/ --exclude-dir=node_modules
grep -r "preferred-language" packages/ --exclude-dir=node_modules
grep -r "builtin-template-language" packages/ --exclude-dir=node_modules
grep -r "'models'" packages/ --exclude-dir=node_modules
grep -r "'user-templates'" packages/ --exclude-dir=node_modules
grep -r "'prompt_history'" packages/ --exclude-dir=node_modules
```

### 验证常量使用

```bash
# 验证常量导入
grep -r "UI_SETTINGS_KEYS" packages/ui/src/
grep -r "CORE_SERVICE_KEYS" packages/core/src/
grep -r "TEMPLATE_SELECTION_KEYS" packages/ui/src/
```

## ✅ 验证标准

### 通过标准

- [ ] 所有UI组件都使用常量而不是魔法字符串
- [ ] 所有核心服务都使用常量而不是魔法字符串
- [ ] 常量定义在两个包中保持一致
- [ ] 测试文件使用正确的键名
- [ ] 没有发现硬编码的存储键字符串

### 失败标准

- 发现任何直接使用字符串字面量作为存储键的代码
- 常量定义不一致或缺失
- 测试文件使用错误的键名

## 📊 检查结果

### 执行信息

- **检查时间：** [待填写]
- **检查范围：** [文件数量]
- **检查工具：** [手动/脚本]

### 发现的问题

1. **文件：** [文件路径]
   **问题：** [问题描述]
   **建议：** [修复建议]

2. **文件：** [文件路径]
   **问题：** [问题描述]
   **建议：** [修复建议]

### 检查统计

- **检查的文件数量：** [数量]
- **发现的问题数量：** [数量]
- **需要修复的文件：** [数量]
- **符合标准的文件：** [数量]

## 🔄 后续行动

- [ ] 修复发现的所有问题
- [ ] 建立ESLint规则防止魔法字符串
- [ ] 更新开发文档和编码规范
- [ ] 设置CI检查确保代码质量

## 📝 改进建议

### 工具化建议

1. **ESLint规则** - 创建自定义规则检测存储键魔法字符串
2. **TypeScript严格模式** - 使用字面量类型限制存储键
3. **预提交钩子** - 在提交前自动检查代码一致性

### 文档建议

1. **编码规范** - 明确存储键使用规范
2. **开发指南** - 提供存储键使用最佳实践
3. **架构文档** - 说明存储键管理策略
