# Changelog

## [Unreleased]

### 🔒 Security & Reliability

#### Secure ID Generation (#434)

- **crypto.randomUUID()**: Replaced Math.random() with crypto.randomUUID() for secure ID generation
- **Cloudflare Functions**: Applied to Cloudflare serverless functions for request IDs
- **Core Module**: Applied to core module for all ID generation

#### MCP Server Memory Leak Prevention (#386)

- **Stale Request Context Cleanup**: Added periodic cleanup for stale request contexts
- **Configurable Cleanup**: 5-minute max age and 1-minute cleanup interval
- **Graceful Shutdown**: Proper timer cleanup on server shutdown
- **Warning Logs**: Debug warnings when stale contexts are cleaned up

#### MCP Server Error Handling (#352)

- **AI Service Overload Handling**: Added graceful handling for AI service overload errors
- **Content Filter Error Handling**: Proper error messages for content filtering scenarios
- **Improved Error Messages**: Better error categorization and user-facing messages

#### MCP Template Validation

- **Template Length Constraint**: Added maxTemplateLength validation (100 chars) for MCP templates
- **Test Coverage**: Added test cases for template length validation

### ⚡ Performance

#### UI Performance Optimizations

- **Array Mutation Avoidance**: Fixed array mutation issues in Vue components
- **Computed Optimization**: Removed redundant computed wrappers
- **Tag Suggestions**: Optimized tag suggestions filtering performance

#### History Optimization (#369)

- **Single-Pass Grouping**: Optimized `getAllChains` with single-pass grouping algorithm

#### Storage Performance (#372)

- **Batch Read Operation**: Added `getItems` batch read operation for better performance

### 🏗️ Code Quality

#### Barrel Exports

- **Component Exports**: Added barrel exports for component directories for cleaner imports

#### Centralized Constants

- **Font Weights**: Centralized font weights and line heights in constants
- **HTTP Methods**: Replaced hardcoded HTTP methods with HTTP_METHODS constant

#### License Compliance (#373)

- **AGPL-3.0-only**: Added license field to packages missing license information

#### Type Safety (#370)

- **ESLint Improvements**: Removed redundant ESLint disable comments
- **Type Safety**: Improved TypeScript type safety

#### MCP Server Enhancement (#371)

- **Reset Method**: Added reset method to `CoreServicesManager` for better state management

#### Error Classification

- **Error Utilities**: Added error classification utilities for reliability engineering
- **Import/Export**: Added IImportExportable interface and ImportExportError

## [2.5.3] - 2026-02-10

### ✨ UI/UX Enhancements (Palette Micro-Interactions)

#### 🎨 TestResultSection Improvements (#111)

- **Card Hover Effects**: Added subtle lift (translateY -2px) and shadow transitions
- **Evaluation Button Animation**: Smooth fade and scale transitions
- **Header Text Feedback**: Color transition on header text hover
- **Accessibility**: Added focus-visible rings and reduced motion support
- **Dark Mode**: Proper hover shadow adjustments for dark theme

#### 🗂️ History Drawer Enhancements (#113)

- **Smooth Deletion Animation**: Added slide-out animation for deleted items
- **Staggered Transitions**: Items animate sequentially for better visual flow
- **Accessibility**: Respects `prefers-reduced-motion` media query

## [2.1.0] - 2025-01-19

### 🎉 Added - 收藏管理重构 (Favorite Management Refactor)

#### 🏗️ 核心架构改进

- **三层分类体系**:
  - `functionMode`: `basic | context | image` (必填)
  - `optimizationMode`: `system | user` (basic模式)
  - `imageSubMode`: `text2image | image2image` (image模式)
  - **Category**: 主题分类 (学习研究、日常助手等)
- **元数据重组**: `originalContent` 和 `sourceHistoryId` 移至 `metadata` 对象
- **TypeMapper 工具类**: 自动从历史记录类型推断功能模式

#### 🏷️ 独立标签库系统

- **标签全生命周期管理**: 重命名、合并、删除、统计
- **智能标签自动完成**: 基于使用频率的建议排序
- **独立标签存储**: 支持零使用次数的标签

#### 📁 分类管理增强

- **分类排序**: 支持上移/下移调整顺序
- **使用统计**: 计算每个分类的收藏数量
- **删除保护**: 有收藏的分类无法删除
- **颜色标识**: 支持自定义分类颜色

#### 🎨 UI 组件重构

- **SaveFavoriteDialog**: 统一的创建/编辑对话框，支持功能模式选择
- **TagManager**: 完整的标签管理界面
- **CategoryManager**: 分类管理界面，支持颜色选择和排序
- **标签自动完成**: `useTagSuggestions` + `NAutoComplete` 集成

#### 🔄 向后兼容性

- **数据迁移**: 自动检测和迁移旧数据
- **渐进式迁移**: 保留现有分类，不强制迁移

### 💔 Breaking Changes

- **移除 `isPublic` 字段**: 单机应用中无意义的公开字段
- **`FavoritePrompt` 接口变更**: `functionMode` 变为必填，`metadata` 结构重组

### 📝 Migration Guide

系统会自动检测旧数据并迁移，所有现有收藏保持不变，向后兼容。

### 🐛 Bug Fixes

- 修复导入导出数据完整性问题
- 修复标签计数不准确问题
- 修复E2E测试中遮罩层拦截点击问题

---

## [2.0.0] - 2025-09-07

### 🎉 Initial Release

- 基础收藏管理功能
- 优化历史集成
- 标签和分类基础支持
- 导入导出功能
