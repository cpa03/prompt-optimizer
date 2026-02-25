# 114-桌面版文件存储实现

## 📋 概述

实现桌面版从内存存储到文件存储的完整切换，为桌面应用提供可靠的数据持久化解决方案。

## 🏗️ 核心成果

### FileStorageProvider 实现

- 完全兼容 `IStorageProvider` 接口，一行代码完成切换
- 延迟写入策略 (500ms) + 内存缓存，性能优异
- 原子写入操作，确保数据完整性
- 应用退出前自动保存数据

### 存储路径设计

根据用户偏好，采用可执行文件同级目录存储：

```typescript
// 路径设置逻辑
if (app.isPackaged) {
  // 生产环境：可执行文件目录/prompt-optimizer-data/
  const execDir = path.dirname(process.execPath)
  userDataPath = path.join(execDir, 'prompt-optimizer-data')
} else {
  // 开发环境：项目根目录/prompt-optimizer-data/
  userDataPath = path.join(__dirname, '..', '..', 'prompt-optimizer-data')
}
```

**优势**：

- ✅ 便于管理和查找数据文件
- ✅ 数据与应用在同一位置，便于备份迁移
- ✅ 目录名明确标识，避免与其他应用混淆

### 架构集成

```typescript
// 简单的一行切换
// const storage = StorageFactory.create('memory')  // 旧方式
const storage = new FileStorageProvider(userDataPath) // 新方式
```

## ✅ 验证结果

### 测试覆盖

- **单元测试**: 18/18 通过 (Mock文件系统)
- **集成测试**: 12/12 通过 (真实文件操作)
- **性能基准**: 写入4ms，读取0ms (内存缓存)

### 实际验证

- ✅ 桌面版本成功启动
- ✅ 自动创建 `prompt-optimizer-data/prompt-optimizer-data.json` 文件
- ✅ 数据持久化正常工作
- ✅ 应用重启后配置和历史记录保持

## 🔧 技术特性

- **延迟写入**: 正常操作延迟500ms，批量操作立即写入
- **原子操作**: 临时文件写入 → 验证 → 重命名替换
- **错误恢复**: 文件损坏时自动创建新存储
- **退出保护**: 应用退出前强制保存所有数据

## 📊 项目价值

### 用户价值

- **数据安全**: 用户数据得到可靠的持久化保护
- **使用体验**: 应用重启后数据保持，提升用户体验
- **功能完整**: 桌面版功能与Web版对等

### 技术价值

- **架构完善**: 为桌面应用提供了完整的存储解决方案
- **接口设计**: 良好的抽象层设计让存储切换变得简单
- **性能优化**: 实现了高性能的文件存储机制

---

## 附录：测试修复记录

在实现过程中顺便修复了16个测试失败问题：

- **架构问题**: Service层与UI层职责分离
- **异步调用**: TemplateLanguageService测试缺少await
- **集成测试**: 正确模拟UI层历史记录保存行为

修复后测试结果：291个测试通过，9个跳过 ✅

## 🔧 后续修复补充

### 应用退出无限循环问题修复

**问题发现**: 在使用FileStorageProvider后，发现应用退出时出现无限循环保存数据的问题。

**问题表现**:

```
[DESKTOP] Saving data before quit...
[DESKTOP] Data saved successfully
[DESKTOP] Saving data before quit...
[DESKTOP] Data saved successfully
```

**根本原因**:

1. 数据保存失败时`isDirty`标志未重置
2. 退出事件处理器形成循环：`window.close` → `before-quit` → `app.quit()` → `before-quit`

**解决方案**:

#### 1. FileStorageProvider防护机制

```javascript
async flush(): Promise<void> {
  // 检查重试次数限制
  if (this.flushAttempts >= this.MAX_FLUSH_ATTEMPTS) {
    console.error('Max flush attempts reached, forcing isDirty to false');
    this.isDirty = false;
    this.flushAttempts = 0;
    throw new Error('Max flush attempts exceeded');
  }

  try {
    await Promise.race([
      this.saveToFile(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Flush timeout')), this.MAX_FLUSH_TIME)
      )
    ]);
    this.isDirty = false;
    this.flushAttempts = 0;
  } catch (error) {
    // 强制重置状态避免无限重试
    if (this.flushAttempts >= this.MAX_FLUSH_ATTEMPTS) {
      this.isDirty = false;
      this.flushAttempts = 0;
    }
    throw error;
  }
}
```

#### 2. 多层应用退出保护机制

```javascript
let isQuitting = false
const MAX_SAVE_TIME = 5000

// 应急退出：10秒后强制终止
function setupEmergencyExit() {
  const emergencyExitTimer = setTimeout(() => {
    console.error('[DESKTOP] EMERGENCY EXIT: Force terminating process')
    process.exit(1)
  }, 10000)
  return emergencyExitTimer
}

app.on('before-quit', async (event) => {
  if (!isQuitting && storageProvider) {
    event.preventDefault()
    isQuitting = true

    const emergencyTimer = setupEmergencyExit()

    try {
      await Promise.race([
        storageProvider.flush(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Save timeout')), MAX_SAVE_TIME - 1000)
        ),
      ])
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      clearTimeout(emergencyTimer)
      setImmediate(() => {
        isQuitting = false
        app.quit()
      })
    }
  }
})
```

#### 3. 防护机制层级

- **逻辑保护**: `isQuitting`标志防止重复执行
- **超时保护**: 5秒强制关闭窗口/退出应用
- **应急保护**: 10秒强制终止进程
- **系统保护**: 响应SIGINT/SIGTERM信号

### 经验总结

#### 文件存储退出处理原则

1. **多层保护**: 实现多个层级的保护机制
2. **超时控制**: 避免无限等待数据保存
3. **状态重置**: 异常情况下强制重置状态
4. **优雅降级**: 保存失败也要确保应用能退出

#### 最佳实践

- 在FileStorageProvider中实现重试限制和超时保护
- 在应用层实现多层退出保护机制
- 使用Promise.race实现超时控制
- 建立完整的异常处理和状态重置机制

这些补充修复确保了FileStorageProvider在各种异常情况下都能正常工作，并且应用能够可靠地退出。

## 🛡️ 数据安全性增强 (2025-07-06)

### 问题发现：备份恢复安全隐患

在审查恢复逻辑时发现了一个严重的数据安全问题：

**问题场景**：

- 主文件 `storage.json` 损坏
- 备份文件 `storage.json.backup` 完好
- 系统进入恢复流程

**危险流程**：

```
从备份恢复 → saveToFile() → createBackup() → 将损坏的主文件覆盖完好的备份！
```

如果后续的原子写入也失败，将导致数据永久丢失。

### 解决方案：智能恢复机制

#### 1. 新增安全保存方法

```typescript
/**
 * 专门用于恢复的保存方法，避免覆盖完好的备份
 */
private async saveToFileWithoutBackup(): Promise<void> {
  const data = Object.fromEntries(this.data);
  const jsonString = JSON.stringify(data, null, 2);

  // 验证数据完整性
  if (!this.validateJSON(jsonString)) {
    throw new StorageError('Generated JSON is invalid', 'write');
  }

  // 直接原子写入，不创建备份
  await this.atomicWrite(jsonString);
}
```

#### 2. 改进的恢复流程

```typescript
private async loadFromFileWithRecovery(): Promise<void> {
  // 1. 尝试从主文件加载
  const mainResult = await this.tryLoadFromFile(this.filePath, 'main');
  if (mainResult.success) {
    this.data = mainResult.data!;
    await this.createBackup();
    return;
  }

  // 2. 尝试从备份文件加载
  const backupResult = await this.tryLoadFromFile(this.backupPath, 'backup');
  if (backupResult.success) {
    this.data = backupResult.data!;

    // 关键：使用专门的方法避免覆盖备份
    await this.saveToFileWithoutBackup();

    // 主文件恢复成功后，重新创建备份
    await this.createBackup();
    return;
  }

  // 3. 区分首次运行和数据损坏
  if (!await this.fileExists(this.filePath) && !await this.fileExists(this.backupPath)) {
    // 首次运行
    this.data = new Map();
    await this.saveToFile();
  } else {
    // 严重错误：文件存在但都损坏
    throw new StorageError('Storage corruption detected', 'read');
  }
}
```

#### 3. 原子性updateData增强

为防止并发操作导致的数据不一致，增强了updateData的原子性：

```typescript
/**
 * 原子性数据更新 - 增强版
 */
async updateData<T>(key: string, modifier: (currentValue: T | null) => T): Promise<void> {
  await this.ensureInitialized();

  // 使用更新锁确保原子性
  const currentLock = this.updateLock;
  let resolveLock: () => void;

  this.updateLock = new Promise<void>((resolve) => {
    resolveLock = resolve;
  });

  try {
    await currentLock;
    await this.performAtomicUpdate(key, modifier);
  } finally {
    resolveLock!();
  }
}

/**
 * 执行原子更新操作
 */
private async performAtomicUpdate<T>(key: string, modifier: (currentValue: T | null) => T): Promise<void> {
  // 重新从存储读取最新数据，确保数据一致性
  const latestData = await this.getLatestData<T>(key);

  // 应用修改
  const newValue = modifier(latestData);

  // 验证新值
  this.validateValue(newValue);

  // 写入新值
  this.data.set(key, JSON.stringify(newValue));
  this.scheduleWrite();
}
```

### 安全保障机制

#### 1. 数据完整性保障

- **备份保护**：恢复时不会覆盖完好的备份文件
- **智能恢复**：区分首次运行和数据损坏情况
- **多层恢复**：主文件→备份文件→错误处理

#### 2. 原子性保障

- **更新锁机制**：防止并发操作导致的数据不一致
- **原子写入**：使用临时文件+重命名确保写入原子性
- **事务性操作**：读-修改-写操作的完整性

#### 3. 错误处理增强

- **错误分类**：区分不同类型的错误（首次运行、数据损坏、读写失败）
- **优雅降级**：各种异常情况下的合理处理
- **状态重置**：异常情况下的状态恢复机制

### 测试验证

#### 备份保护测试

```typescript
it('should not overwrite good backup during recovery', async () => {
  // 模拟损坏的主文件和完好的备份
  mockFs.readFile
    .mockResolvedValueOnce('{ invalid json') // 损坏的主文件
    .mockResolvedValueOnce(JSON.stringify(goodData)) // 完好的备份

  await provider.getItem('test')

  // 验证没有覆盖备份
  const dangerousCopyCall = mockFs.copyFile.mock.calls.find(
    (call) => call[0] === mainPath && call[1] === backupPath
  )
  expect(dangerousCopyCall).toBeUndefined()
})
```

#### 并发安全测试

```typescript
it('should handle concurrent updates safely', async () => {
  const promises = [
    provider.updateData('key1', () => 'value1'),
    provider.updateData('key2', () => 'value2'),
    provider.updateData('key3', () => 'value3'),
  ]

  await Promise.all(promises)

  // 验证所有更新都成功
  expect(await provider.getItem('key1')).toBe('value1')
  expect(await provider.getItem('key2')).toBe('value2')
  expect(await provider.getItem('key3')).toBe('value3')
})
```

这些增强确保了FileStorageProvider在各种复杂场景下的数据安全性和操作原子性。
