# 127 - 多轮对话模式（Pro-System / Conversation）优化设计

## 📋 功能概述

归档多轮对话模式（原“上下文-系统”）的优化交互与数据结构设计，核心目标是支持在会话中选择任意 `system/user` 消息进行优化，并以“消息 ID”为稳定锚点管理版本链路与自动应用。

## ⏱️ 时间线

- **开始时间**: 2025-01-04
- **最后更新**: 2025-01-05
- **状态**: ✅ 设计方案 + 实施记录（以 v3.1 为基线）

## 🎯 核心要点

- **稳定选择**：以 `ConversationMessage.id` 作为选择与映射的主键，避免按索引导致的插入/删除/排序问题。
- **工作链复用**：通过 `messageChainMap`（消息ID → chainId）实现“切换消息时自动加载既有链”的体验。
- **自动应用与自动保存**：优化结果自动应用到会话消息，工作链依赖历史记录系统自动保存（无需额外持久化索引）。

## 📁 文档清单

- [x] `design.md` - 设计方案与实施记录（最终版 v3.1）

## 🔗 相关实现参考（代码）

- `packages/core/src/services/prompt/types.ts`（`ConversationMessage.id` / `originalContent?`）
- `packages/ui/src/composables/prompt/useConversationOptimization.ts`（`selectedMessageId` / `messageChainMap` / 自动应用）
- `packages/ui/src/components/context-mode/ContextSystemWorkspace.vue`（多轮对话模式工作区）
- `packages/ui/src/components/context-mode/ConversationManager.vue`（会话输入与消息选择）
