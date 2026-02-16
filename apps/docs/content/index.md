---
title: MomoHub API 文档
description: MomoHub 平台 API 参考文档
---

欢迎使用 MomoHub API 文档。MomoHub 是一个 AI 角色平台，支持创建自定义 AI 角色、管理知识库和插件系统。

## 功能特性

- **AI 角色管理** — 创建和管理 AI 角色，设置人设提示词
- **知识库系统** — 上传文件构建知识库，支持语义搜索
- **插件系统** — 扩展 AI 角色的能力
- **多轮对话** — 与 AI 角色进行实时对话
- **多 LLM 支持** — 支持 OpenAI、Anthropic、DeepSeek 等模型

## 快速开始

所有 API 请求需要发送到以下 Base URL：

```
https://api.momohub.com/v1
```

API 使用 JSON 格式进行请求和响应，所有请求需要设置：

```
Content-Type: application/json
```

需要认证的接口需要在请求头中携带 Bearer Token：

```
Authorization: Bearer <access_token>
```

## 通用响应格式

所有 API 响应遵循统一格式：

```json
{
  "success": true,
  "code": null,
  "message": "OK",
  "data": { ... },
  "errors": null,
  "timestamp": "2025-01-15T08:30:00Z"
}
```

查看 [快速入门](/guide/getting-started) 了解更多细节。
