# 技术实现详解

## 🔧 架构设计

### 核心设计理念

#### 从集中式到分布式

**原架构问题**:

- DataManager承担过多职责（协调 + 具体实现）
- 新增服务需要修改DataManager代码
- 违反单一职责原则和开闭原则

**新架构设计**:

```typescript
// 统一接口定义
export interface IImportExportable {
  exportData(): Promise<any>
  importData(data: any): Promise<void>
  getDataType(): Promise<string>
  validateData(data: any): Promise<boolean>
}

// DataManager只负责协调
class DataManager {
  async exportAllData(): Promise<string> {
    const services = [modelManager, templateManager, historyManager, preferenceService]
    const data = {}

    for (const service of services) {
      const dataType = await service.getDataType()
      data[dataType] = await service.exportData()
    }

    return JSON.stringify({ version: 1, exportTime: new Date().toISOString(), data })
  }
}
```

#### 存储键双重用途解决方案

**问题识别**:

- 物理存储键：实际存储操作使用的键名
- 逻辑JSON键：导入导出JSON中的键名
- PreferenceService添加'pref:'前缀导致查找失败

**解决方案**:

```typescript
// PreferenceService内部处理前缀转换
class PreferenceService {
  private readonly PREFIX = 'pref:'

  async exportData(): Promise<any> {
    const allData = await this.getAll()
    const exportData = {}

    // 移除前缀，使用逻辑键名导出
    for (const [key, value] of Object.entries(allData)) {
      const logicalKey = key.startsWith(this.PREFIX) ? key.slice(this.PREFIX.length) : key
      exportData[logicalKey] = value
    }

    return exportData
  }
}
```

### 接口设计原则

#### 异步优先

所有接口方法都设计为异步，支持：

- 网络请求（Electron IPC）
- 文件操作（FileStorageProvider）
- 数据验证（复杂验证逻辑）

#### 错误处理统一

```typescript
export class ImportExportError extends Error {
  constructor(
    message: string,
    public readonly dataType?: string,
    public readonly originalError?: Error
  ) {
    super(message)
    this.name = 'ImportExportError'
  }
}
```

## 🐛 问题诊断与解决

### 问题1: 数据导出不完整

**现象**: 用户导出JSON只有4个设置项，应该有8个

**诊断过程**:

1. 检查DataManager导出逻辑 → 发现调用PreferenceService.getAll()
2. 检查PreferenceService实现 → 发现添加了'pref:'前缀
3. 检查存储键定义 → 发现UI和Core包重复定义
4. 分析存储键用途 → 发现物理存储vs逻辑JSON的双重用途

**解决方案**:

- 在PreferenceService内部处理前缀转换
- 统一存储键定义到Core包
- 明确文档化存储键的双重用途

### 问题2: 循环依赖

**现象**: 编译错误，模块间循环引用

**解决方案**:

- 创建独立的interfaces/import-export.ts文件
- 将接口定义从具体实现中分离
- 使用依赖注入而非直接引用

### 问题3: Electron IPC序列化

**现象**: Vue reactive对象无法通过IPC传输

**解决方案**:

```typescript
// 在proxy类中进行序列化
async exportData(): Promise<any> {
  const result = await window.electronAPI.modelManager.exportData();
  return JSON.parse(JSON.stringify(result)); // 深度序列化
}
```

## 📝 实施步骤

### 第一阶段: 接口设计

1. 创建IImportExportable接口定义
2. 设计ImportExportError错误类
3. 定义统一的数据格式规范

### 第二阶段: 服务改造

1. **ModelManager**: 实现模型数据的导入导出
2. **TemplateManager**: 实现模板数据的导入导出
3. **HistoryManager**: 实现历史记录的导入导出
4. **PreferenceService**: 实现用户设置的导入导出

### 第三阶段: DataManager重构

1. 移除具体实现逻辑（-308行代码）
2. 改为协调者模式，调用各服务接口
3. 保持对外API接口不变

### 第四阶段: Electron更新

1. 更新main.js IPC处理逻辑
2. 更新preload.js API暴露
3. 更新所有service proxy类

### 第五阶段: 测试完善

1. 为每个服务创建import-export测试
2. 创建集成测试验证整体流程
3. 建立AI自动化测试框架

## 🔍 调试过程

### 存储键问题调试

```bash
# 1. 检查导出数据
console.log(await dataManager.exportAllData());

# 2. 检查PreferenceService数据
console.log(await preferenceService.getAll());

# 3. 检查存储层数据
console.log(await storageProvider.getAll());

# 4. 对比逻辑键名和物理键名
```

### 接口实现验证

```typescript
// 验证所有服务都实现了接口
const services = [modelManager, templateManager, historyManager, preferenceService]
for (const service of services) {
  console.assert(typeof service.exportData === 'function')
  console.assert(typeof service.importData === 'function')
  console.assert(typeof service.getDataType === 'function')
  console.assert(typeof service.validateData === 'function')
}
```

## 🧪 测试验证

### 单元测试

每个服务的import-export.test.ts文件包含：

- 导出功能测试
- 导入功能测试
- 数据验证测试
- 错误处理测试

### 集成测试

data/import-export-integration.test.ts验证：

- 完整导入导出流程
- 多服务协调工作
- 数据一致性检查

### MCP浏览器测试

使用Playwright自动化测试：

- 导出按钮功能
- 文件下载验证
- 导入文件上传
- 数据应用验证
- 用户界面交互

### AI自动化测试框架

创建storage-key-consistency测试套件：

- test-001: 数据导出完整性验证
- test-002: 旧版本数据导入兼容性
- test-003: 代码一致性检查

## 🔄 架构演进

### 重构前架构

```
DataManager (375行)
├── 协调各服务
├── 实现具体导入导出逻辑
├── 处理数据格式转换
└── 错误处理和验证
```

### 重构后架构

```
DataManager (67行) - 只负责协调
├── ModelManager.exportData()
├── TemplateManager.exportData()
├── HistoryManager.exportData()
└── PreferenceService.exportData()

IImportExportable接口
├── 统一的方法签名
├── 异步操作支持
└── 错误处理规范
```

### 关键改进点

1. **代码精简**: DataManager减少82%代码量
2. **职责分离**: 每个服务自管理导入导出
3. **扩展性**: 新增服务只需实现接口
4. **维护性**: 修改某个服务不影响其他服务
5. **测试性**: 每个服务可独立测试

## 📈 性能影响

### 正面影响

- **代码执行效率**: 减少不必要的中间层处理
- **内存使用**: 避免大量数据在DataManager中聚合
- **并发性**: 各服务可并行处理导入导出

### 注意事项

- **IPC调用**: Electron环境下增加了IPC调用次数
- **序列化开销**: 需要JSON序列化处理Vue reactive对象

## 🔮 未来扩展

### 新服务接入

只需实现IImportExportable接口：

```typescript
class NewService implements IImportExportable {
  async exportData(): Promise<any> {
    /* 实现 */
  }
  async importData(data: any): Promise<void> {
    /* 实现 */
  }
  async getDataType(): Promise<string> {
    return 'newServiceData'
  }
  async validateData(data: any): Promise<boolean> {
    /* 实现 */
  }
}
```

### 功能增强

- 增量导入导出
- 数据压缩
- 加密支持
- 版本迁移
