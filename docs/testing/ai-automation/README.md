# AI自动化测试系统

## 🎯 目标

本测试系统专门设计用于AI通过MCP工具进行自动化测试，主要目标是：

- **发现Bug** - 通过边缘情况和异常场景发现潜在问题
- **回归测试** - 确保新功能不破坏现有功能
- **压力测试** - 验证系统在极限条件下的稳定性
- **用户体验验证** - 发现影响用户体验的问题

## 📁 目录结构

```
ai-automation/
├── README.md                       # 本文件
├── electron-mcp-guide.md          # Electron MCP自动化测试指南
├── test-scenarios/                 # 测试场景
│   ├── normal-flow/               # 正常流程测试
│   │   ├── 01-basic-setup.md
│   │   ├── 02-model-management.md
│   │   ├── 02b-model-add-and-test.md  # 模型添加和连接测试
│   │   ├── 03-template-management.md
│   │   ├── 04-prompt-optimization.md  # 已更新 - 包含结果展示功能测试
│   │   ├── 04b-user-prompt-optimization.md  # 已更新 - 包含结果展示功能测试
│   │   ├── 05-history-management.md
│   │   ├── 06-data-management.md
│   │   ├── 07-ui-interaction-features.md  # 新增 - UI交互功能测试
│   │   ├── 08-context-persistence.md      # 新增 - 上下文持久化
│   │   ├── 09-context-variables-and-preview.md  # 新增 - 上下文变量/预览
│   │   ├── 10-tools-management-and-advanced-context.md  # 新增 - 工具与高级上下文
│   │   ├── 11-context-import-export.md   # 新增 - 上下文导入导出
│   │   └── 12-advanced-context-optimization-and-testing.md  # 新增 - 高级优化与测试（变量/上下文/工具）
│   ├── edge-cases/                # 边缘情况测试
│   │   ├── input-validation.md
│   │   ├── performance-limits.md
│   │   ├── concurrent-operations.md
│   │   └── browser-compatibility.md
│   ├── error-handling/            # 错误处理测试
│   │   ├── network-failures.md
│   │   ├── invalid-inputs.md
│   │   ├── storage-failures.md
│   │   └── api-errors.md
│   └── stress-testing/            # 压力测试
│       ├── memory-stress.md
│       ├── rapid-operations.md
│       └── data-volume.md
├── bug-hunting/                   # 专门的bug发现测试
│   ├── ui-glitches.md
│   ├── data-corruption.md
│   ├── race-conditions.md
│   └── memory-leaks.md
├── regression/                    # 回归测试
│   ├── feature-regression.md
│   └── performance-regression.md
├── tools/                         # 测试工具和脚本
│   ├── mcp-helpers.md
│   └── test-data-generator.md
└── reports/                       # 测试报告
    ├── latest/
    └── history/
```

## 🤖 AI测试执行原则

### 1. Bug优先原则

- 重点关注可能出错的场景
- 测试边界条件和极限值
- 验证错误处理的完整性
- 发现用户体验问题

### 2. 真实场景模拟

- 模拟真实用户的使用模式
- 包含意外操作和错误操作
- 测试不同环境和条件
- 考虑并发和竞态情况

### 3. 系统性测试

- 覆盖所有主要功能路径
- 测试功能间的交互
- 验证数据一致性
- 检查性能和稳定性

## 🔍 测试分类说明

### Normal Flow（正常流程）

- 验证基本功能的正确性
- 确保主要用户路径可用
- 作为回归测试的基准
- 快速验证核心功能

### Edge Cases（边缘情况）

- 输入验证和边界测试
- 性能极限测试
- 并发操作测试
- 浏览器兼容性测试

### Error Handling（错误处理）

- 网络故障处理
- 无效输入处理
- 存储故障处理
- API错误处理

### Stress Testing（压力测试）

- 内存压力测试
- 快速操作测试
- 大数据量测试
- 长时间运行测试

### Bug Hunting（Bug发现）

- UI显示问题
- 数据损坏问题
- 竞态条件问题
- 内存泄漏问题

## 🛠️ MCP工具使用指南

### 基础工具

```javascript
// 页面操作
browser_navigate(url)
browser_snapshot()
browser_resize(width, height)

// 元素交互
browser_click(element, ref)
browser_type(element, ref, text)
browser_hover(element, ref)

// 等待和验证
browser_wait_for(text / textGone / time)
browser_take_screenshot(filename)
```

### 高级技巧

```javascript
// 快速连续操作（测试竞态条件）
for (let i = 0; i < 10; i++) {
  browser_click(element, ref)
}

// 大量数据输入（测试性能）
browser_type(element, ref, 'x'.repeat(10000))

// 窗口大小变化（测试响应式）
browser_resize(320, 568) // 手机尺寸
browser_resize(1920, 1080) // 桌面尺寸
```

## 📊 测试报告格式

### Bug报告模板

```markdown
# Bug报告 - [Bug标题]

## 基本信息

- **发现时间：** 2025-01-07 15:30:00
- **测试场景：** [具体测试场景]
- **严重程度：** 高/中/低
- **影响范围：** [影响的功能或用户]

## Bug描述

[详细描述发现的问题]

## 复现步骤

1. [具体步骤1]
2. [具体步骤2]
3. [具体步骤3]

## 预期行为

[应该发生什么]

## 实际行为

[实际发生了什么]

## 环境信息

- **浏览器：** Chrome 120.0
- **操作系统：** Windows 11
- **屏幕分辨率：** 1920x1080
- **网络状况：** 正常/慢速/离线

## 附件

- **截图：** bug_screenshot.png
- **控制台日志：** console_errors.txt
- **网络请求：** network_log.har

## 建议解决方案

[可能的解决方案或改进建议]
```

## 🚀 快速开始

### 1. 选择测试场景

```bash
# 正常流程验证
cd test-scenarios/normal-flow/

# 边缘情况测试
cd test-scenarios/edge-cases/

# Bug发现测试
cd bug-hunting/
```

### 2. 执行测试

```bash
# 读取测试文档
# 按照AI执行指导进行测试
# 记录发现的问题
# 生成测试报告
```

### 3. 报告问题

```bash
# 在reports/latest/目录下生成报告
# 包含详细的复现步骤和证据
# 提供改进建议
```

## 📈 测试指标

### 覆盖率指标

- **功能覆盖率** - 测试的功能占总功能的比例
- **场景覆盖率** - 测试的使用场景覆盖程度
- **边缘情况覆盖率** - 边缘情况的测试覆盖程度

### 质量指标

- **Bug发现率** - 每次测试发现的Bug数量
- **Bug严重程度分布** - 高/中/低严重程度Bug的分布
- **回归Bug率** - 修复后再次出现的Bug比例

### 效率指标

- **测试执行时间** - 完成一轮测试的时间
- **问题定位时间** - 从发现到定位问题的时间
- **自动化程度** - 自动化测试的比例

## 🖥️ Electron桌面应用测试

### 专门指南

详见 [`electron-mcp-guide.md`](./electron-mcp-guide.md) - Electron MCP自动化测试完整指南

### 关键差异

- **启动方式**: 使用 `app_launch_circuit-electron` 而非 `browser_navigate`
- **元素定位**: 优先使用 `click_by_text_circuit-electron`
- **问题处理**: 善用JavaScript执行绕过UI限制
- **状态判断**: 重视界面状态而非控制台信息

### 测试流程

1. **构建应用**: `pnpm clean && pnpm build`
2. **启动测试**: 使用packaged模式启动
3. **执行场景**: 按normal-flow顺序执行
4. **验证结果**: 关注功能按钮状态变化

### 成功案例

- **测试覆盖率**: 9/9 (100%)
- **通过率**: 100%
- **核心验证**: 端到端AI优化流程
- **技术积累**: 完整的Electron测试方法论

## 🔄 持续改进

### 测试优化

- 根据发现的问题调整测试重点
- 增加新的边缘情况测试
- 优化测试执行效率
- 提高Bug发现的准确性

### 工具改进

- 开发更好的测试辅助工具
- 优化MCP工具的使用方法
- 自动化测试报告生成
- 集成CI/CD流程

---

**注意：** 本测试系统专注于通过AI自动化发现问题，而不是简单的功能验证。每个测试场景都应该设计得能够发现潜在的Bug和用户体验问题。
