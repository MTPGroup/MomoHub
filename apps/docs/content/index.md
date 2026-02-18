---
seo:
  title: MomoHub API 文档
  description: MomoHub AI 角色平台 API 参考文档，支持角色管理、知识库、插件和多轮对话。
---

::u-page-hero{class="dark:bg-gradient-to-b from-neutral-900 to-neutral-950"}
---
orientation: horizontal
---
#top
:hero-background

#title
MomoHub [API 文档]{.text-primary}

#description
MomoHub 是一个 AI 角色平台，支持创建自定义 AI 角色、管理知识库和插件系统。通过 RESTful API 快速集成多轮对话、语义搜索等 AI 能力。

#links
  :::u-button
  ---
  to: /guide/getting-started
  size: xl
  trailing-icon: i-lucide-arrow-right
  ---
  快速开始
  :::

  :::u-button
  ---
  icon: i-lucide-book-open
  color: neutral
  variant: outline
  size: xl
  to: /api/auth
  ---
  API 参考
  :::

#default
  :::prose-pre
  ---
  code: |
    curl -X POST https://momohub-api.hanasaki.tech/v1/6b5f99ce-f3fe-4c43-9b2b-bad0a48e0861/messages \
      -H "Authorization: Bearer <token>" \
      -H accept: */* \
      -H "Content-Type: application/json" \
      -d '{
        "content": [
          {
            "type": "text",
            "content": "今天天气真不错啊"
          }
        ]
      }'
  filename: Terminal
  ---

  ```bash [Terminal]
  curl -X POST https://momohub-api.hanasaki.tech/v1/6b5f99ce-f3fe-4c43-9b2b-bad0a48e0861/messages \
    -H "Authorization: Bearer <token>" \
    -H accept: */* \
    -H "Content-Type: application/json" \
    -d '{
      "content": [
        {
          "type": "text",
          "content": "今天天气真不错啊"
        }
      ]
    }'
  ```
  :::
::

::u-page-section{class="dark:bg-neutral-950"}
#title
平台核心能力

#features
  :::u-page-feature
  ---
  icon: i-lucide-bot
  ---
  #title
  AI 角色管理

  #description
  创建和管理 AI 角色，自定义人设提示词，支持公开分享和私有角色。
  :::

  :::u-page-feature
  ---
  icon: i-lucide-book-open
  ---
  #title
  知识库系统

  #description
  上传文件构建知识库，支持语义搜索，让 AI 角色基于你的数据进行回答。
  :::

  :::u-page-feature
  ---
  icon: i-lucide-puzzle
  ---
  #title
  插件系统

  #description
  通过插件扩展 AI 角色能力，支持自定义 Function Call，如联网搜索等。
  :::

  :::u-page-feature
  ---
  icon: i-lucide-message-circle
  ---
  #title
  多轮对话

  #description
  与 AI 角色进行实时多轮对话，支持文本、图片、代码等多种消息类型。
  :::

  :::u-page-feature
  ---
  icon: i-lucide-cpu
  ---
  #title
  多 LLM 支持

  #description
  支持 OpenAI、Anthropic、DeepSeek 等主流大语言模型，灵活切换和配置。
  :::

  :::u-page-feature
  ---
  icon: i-lucide-lock
  ---
  #title
  JWT 认证

  #description
  基于 JWT Bearer Token 的安全认证体系，支持 Token 自动刷新机制。
  :::
::

::u-page-section{class="dark:bg-neutral-950"}
#title
统一的 API 设计

#features
  :::u-page-feature
  ---
  icon: i-lucide-braces
  ---
  #title
  JSON 请求与响应

  #description
  所有 API 使用 JSON 格式，统一的 `ApiResponse<T>` 响应结构，开发体验一致。
  :::

  :::u-page-feature
  ---
  icon: i-lucide-list
  ---
  #title
  分页查询

  #description
  列表接口支持分页、搜索，返回 `total`、`hasNext` 等元数据，轻松处理大数据集。
  :::

  :::u-page-feature
  ---
  icon: i-lucide-alert-triangle
  ---
  #title
  结构化错误

  #description
  统一的错误码和字段级验证错误，配合 TypeScript 辅助函数快速处理异常。
  :::

  :::u-page-feature
  ---
  icon: i-lucide-upload
  ---
  #title
  文件上传

  #description
  支持头像上传和知识库文件上传，使用 `multipart/form-data` 格式。
  :::

  :::u-page-feature
  ---
  icon: i-lucide-shield
  ---
  #title
  权限控制

  #description
  公开与私有资源分离，用户只能管理自己创建的角色、知识库等资源。
  :::

  :::u-page-feature
  ---
  icon: i-lucide-code
  ---
  #title
  TypeScript 支持

  #description
  `@momohub/types` 包提供完整类型定义和辅助函数，获得最佳开发体验。
  :::
::

::u-page-section{class="dark:bg-gradient-to-b from-neutral-950 to-neutral-900"}
  :::u-page-c-t-a
  ---
  links:
    - label: 快速开始
      to: '/guide/getting-started'
      trailingIcon: i-lucide-arrow-right
    - label: API 参考
      to: '/api/auth'
      variant: subtle
      icon: i-lucide-book-open
  title: 开始构建你的 AI 应用
  description: 通过 MomoHub API 快速集成 AI 角色对话、知识库和插件能力，打造专属 AI 体验。
  class: dark:bg-neutral-950
  ---

  :stars-bg
  :::
::
