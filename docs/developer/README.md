# 开发者文档

欢迎参与Prompt Optimizer的开发！这里包含了所有开发相关的技术文档。

## 🚀 快速开始

- [快速开始指南](../../dev.md) - 开发环境搭建和项目启动
- [技术开发指南](./technical-development-guide.md) - 完整的技术栈和开发规范
- [项目结构](./project-structure.md) - 项目文件和目录组织说明
- [通用开发经验](./general-experience.md) - 项目开发中的通用经验与最佳实践
- [LLM参数配置指南](./llm-params-guide.md) - 高级LLM参数配置详细说明

## 📱 平台开发指南

### 桌面端

- [桌面开发指南](./desktop-developer-guide.md) - Electron桌面应用开发

### Web端

- Web开发指南 - 参考 [dev.md](../../dev.md) 和 [技术开发指南](./technical-development-guide.md)

### 浏览器插件

- 插件开发指南 - 参考 [dev.md](../../dev.md) 中的 `pnpm dev:ext` 命令

## 📚 API文档

- 核心API文档 - 请参考 [项目结构](./project-structure.md) 了解各模块职责

## 🏗️ 架构文档

架构相关文档位于 [docs/architecture/](../architecture/) 目录：
- [Storage Key Architecture](../architecture/storage-key-architecture.md) - 存储系统设计
- [Image Model Management](../architecture/image-model-management-architecture.md) - 图像生成架构
- [Function Mode](../architecture/function-mode.md) - Function Calling实现
- [LLM Refactor](../architecture/llm-refactor.md) - LLM服务架构

## 🔧 故障排查

- [通用排查清单](./troubleshooting/general-checklist.md) - 常见问题的排查步骤
- [排查指南索引](./troubleshooting/README.md) - 所有排查文档的索引

## 🤝 贡献指南

- [贡献指南](../../CONTRIBUTING.md) - 如何参与项目开发
- 代码规范 - 参考 [技术开发指南](./technical-development-guide.md)
- 提交规范 - 参考 [CONTRIBUTING.md](../../CONTRIBUTING.md) 中的 Commit Message Format

## 📋 开发流程

- [开发任务清单](./todo.md) - 按功能模块和优先级组织的任务列表
- 开发流程 - 参考 [dev.md](../../dev.md) 中的开发工作流程
- 测试指南 - 参考 [CONTRIBUTING.md](../../CONTRIBUTING.md) 中的 Testing Guidelines
- 发布流程 - 参考 [dev.md](../../dev.md) 中的版本发布流程
