# AI 全量纹样生成设计

## 概述

将中国纹样生成器从前端算法生成全面转向 AI 大模型生成，扩展纹样类型至 9 种，并支持用户自定义描述输入生成纹样。

## 一、纹样类型体系

共 9 种纹样类型，全部通过 AI 生成：

| # | 名称 | ID | 提示词关键描述 |
|---|------|----|----------------|
| 1 | 祥云纹 | `cloud` | 传统祥云纹样，云头卷曲，S 形连接 |
| 2 | 回纹 | `meander` | 连续直角回纹，方形螺旋 |
| 3 | 花纹 | `floral` | 缠枝花卉纹样，花瓣放射排列 |
| 4 | 几何纹 | `geometric` | 几何连续纹样，菱形/万字/六边形 |
| 5 | 龙纹 | `dragon` | 传统龙纹，蜿蜒龙身，鳞片细节 |
| 6 | 瑞兽纹 | `mythical_beast` | 凤凰/麒麟/鹤等神兽瑞禽纹样 |
| 7 | 吉祥纹 | `auspicious` | 如意纹/海水江崖/寿字纹等吉祥图案 |
| 8 | 古典边饰纹 | `border` | 饕餮纹/联珠纹/方胜纹等古典边饰 |
| 9 | 自定义描述 | `custom` | 用户自由输入描述文本 |

- 选中"自定义描述"时，TypeSelector 下方显示 textarea 输入框
- 其他类型使用预定义的提示词模板

## 二、提示词模板与参数映射

### 提示词结构

每种纹样类型的提示词由三部分拼接：

```
[基础模板] + [参数描述] + [格式要求]
```

### 基础模板

每种纹样类型有一段预定义的中文描述，例如：

- **祥云纹**："请生成一幅中国传统祥云纹样，云头呈卷曲螺旋状，以S形曲线相互连接，具有传统工艺美术的精致感。"
- **瑞兽纹**："请生成一幅中国传统瑞兽纹样，可以是凤凰、麒麟、仙鹤等神兽瑞禽，线条流畅，姿态生动，具有祥瑞寓意。"
- **自定义描述**：用户输入的文本直接作为基础模板部分。

### 参数映射规则

| 参数 | 值域 | 映射方式 |
|------|------|----------|
| 复杂度 1-3 | 低 | "简约风格，线条简洁" |
| 复杂度 4-6 | 中 | "中等细节，适度装饰" |
| 复杂度 7-10 | 高 | "精细繁复，细节丰富" |
| 密度 1-3 | 低 | "元素稀疏，留白充裕" |
| 密度 4-6 | 中 | "元素分布均匀" |
| 密度 7-10 | 高 | "元素密集，铺满画面" |
| 对称方式 | none/horizontal/vertical/radial/full | 直接描述："无对称"/"水平对称"/"垂直对称"/"径向对称"/"完全对称" |
| 颜色 | 三色值 | "主色为{主色名}，辅色为{辅色名}，背景为{背景色名}" |
| 输出模式 | single/tile | "单个独立纹样" 或 "可无缝平铺的连续纹样" |

### 格式要求

- SVG 模式：追加"请输出完整的 SVG 代码，viewBox 为 0 0 {width} {height}"，尺寸取自 `PatternParams.width/height`
- 位图模式：不追加文本要求，直接调用图像生成 API

### 自定义描述校验

- 最大输入长度：500 个字符
- 不允许为空（前端 textarea 校验 + 后端校验）
- 输入内容自动前缀 "请生成一幅中国传统纹样：" 以确保上下文一致性

## 三、生成流程与 API 架构

### 前端生成流程

```
用户选择类型 + 调参数 + 选生成格式
        ↓
前端拼接提示词（模板 + 参数 + 格式要求）
        ↓
调用 POST /api/ai/generate（prompt, provider, outputFormat）
        ↓
后端返回 taskId，前端进入加载状态
        ↓
前端轮询 GET /api/ai/tasks/{id}
        ↓
任务完成 → 获取结果（SVG 代码 或 图片 base64/URL）
        ↓
PatternCanvas 渲染结果，添加到历史记录
```

### 前端轮询策略

- 轮询间隔：2 秒
- 最大轮询次数：60 次（即最长等待 2 分钟）
- 超时处理：显示"生成超时，请重试"错误提示
- 网络错误：连续 3 次失败后停止轮询，提示用户检查网络
- 加载状态 UI：居中旋转动画 + "纹样生成中..." 文字

### API 变更

- `POST /api/ai/generate`：扩展请求体，新增 `outputFormat` 字段（`"svg"` | `"image"`）
  - SVG 模式：调用文本大模型（如 OpenAI chat completions / Gemini text），提取返回中的 SVG 代码
  - Image 模式：调用图像生成 API（如 DALL-E / Gemini Image），返回 base64 或 URL
  - 现有 `provider` 字段保留，前端新增服务商选择控件

- `GET /api/ai/tasks/{id}` 返回体扩展，新增 `outputFormat` 字段，便于前端区分结果类型

### AI 适配器接口扩展

```typescript
interface AiGenerateRequest {
  prompt: string
  outputFormat: 'svg' | 'image'  // 新增
  // ...existing fields
}

interface AiGenerateResult {
  status: 'pending' | 'processing' | 'completed' | 'failed'
  imageUrl?: string
  imageBase64?: string
  svgCode?: string        // 新增：SVG 模式下存放提取的 SVG 代码
  error?: string
}
```

每个 provider 实现根据 `outputFormat` 决定调用文本 API 还是图像 API：
- **OpenAI**：SVG 模式调用 chat completions API，Image 模式调用 images API（DALL-E）
- **Gemini**：SVG 模式调用 text generation API，Image 模式调用 image generation API
- **Local**：两种模式均返回存根数据

### SVG 提取逻辑

新增工具函数 `lib/ai/svg-extractor.ts`：
- 从大模型返回文本中提取 `<svg>...</svg>` 代码块（正则匹配）
- 优先匹配 markdown 代码块中的 SVG，其次匹配裸 SVG 标签
- 校验提取的 SVG 是否包含合法的 `<svg>` 根元素
- 如果提取失败或 SVG 无效，返回错误状态

### AiTask 存储逻辑

- SVG 模式：`AiTask.result` 字段存储提取的 SVG 代码字符串
- Image 模式：`AiTask.result` 字段存储 base64 数据或图像 URL（与现有行为一致）

### 认证要求

保持现有设计，AI 生成需登录。

## 四、前端 UI 变更

### TypeSelector 组件改造

- 从 2 列 5 项 → 3 列 9 项网格布局
- 每个类型显示名称 + 简短描述（与现有风格一致）
- 选中"自定义描述"时，下方展开 textarea 输入框（最大 500 字符，带字数计数）
- 纹样类型元数据从 `lib/prompt-templates.ts` 导入（替代原有的 `generators/index.ts`）

### ControlPanel 新增控件

- **生成格式选择器**（标签：生成格式）：SVG / 位图，放在输出模式旁边
  - 注意：与"输出模式"（单个/平铺）是两个独立概念，命名和 UI 位置上做明确区分
- **AI 服务商选择器**：下拉选择 OpenAI / Gemini 等，放在控制面板底部

### PatternCanvas 改造

- 保留现有 SVG 渲染能力（`dangerouslySetInnerHTML`）
- 新增位图渲染支持：当 `resultType === 'image'` 时，使用 `<img src="data:image/png;base64,..." />` 渲染
- 新增加载中状态（居中旋转动画 + "纹样生成中..." 文字）
- 新增生成失败时的错误提示

### 生成按钮变更

- "生成纹样"按钮改为异步模式，点击后变为"生成中..."不可重复点击
- 移除"随机生成"按钮（AI 生成本身具有随机性）

### 未登录用户体验

- 未登录时，生成按钮显示为"登录后生成"，点击后弹出 AuthModal 登录/注册框
- 纹样类型选择和参数调节仍然可用（让用户先体验界面）
- 历史记录面板仅展示本地历史（不显示云端标签）

### 需要移除/弃用的文件

- `generators/cloud.ts`、`meander.ts`、`floral.ts`、`geometric.ts`、`dragon.ts` — 前端生成算法
- `generators/index.ts` — 生成器注册表（改为提示词模板注册表 `lib/prompt-templates.ts`）
- `lib/random.ts` — SeededRandom（不再需要）
- `generators/__tests__/` 下对应的测试文件
- `usePatternGenerator` hook 中的本地生成逻辑，改为调用 AI API

## 五、数据流与历史/导出

### 类型定义变更（generators/types.ts）

```typescript
type PatternType = 'cloud' | 'meander' | 'floral' | 'geometric' | 'dragon'
  | 'mythical_beast' | 'auspicious' | 'border' | 'custom'

interface PatternParams {
  type: PatternType
  complexity: number       // 1-10
  density: number          // 1-10
  symmetry: SymmetryType
  outputMode: OutputMode   // single | seamless
  outputFormat: 'svg' | 'image'  // 新增：生成格式
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  width: number
  height: number
  tileSize: number         // 仅 outputMode=seamless 时有效
  customPrompt?: string    // 新增：仅 type=custom 时使用
  provider?: string        // 新增：AI 服务商
  seed?: number            // 保留为可选，向后兼容旧数据
}

interface PatternResult {
  resultType: 'svg' | 'image'  // 新增：区分结果类型
  result: string               // SVG 代码字符串 或 base64/URL 图像数据
  params: PatternParams
  prompt: string               // 新增：记录使用的提示词
  timestamp: number
}
```

### 历史记录调整

- 存储格式改为 `PatternResult`，包含 `resultType` 鉴别字段
- 点击历史项恢复参数和结果展示（不重新生成）
- `HistoryPanel` 缩略图渲染根据 `resultType` 区分：
  - `'svg'`：使用 `dangerouslySetInnerHTML`（与现有逻辑一致）
  - `'image'`：使用 `<img src={result} />` 渲染

### 导出功能调整

- SVG 模式：与现有 SVG 导出逻辑一致
- 位图模式：PNG 导出直接使用 base64 数据转 Blob 下载，不走 SVG→PNG 转换
- DownloadButton 根据 `resultType` 自动切换导出方式

### 云端保存调整

- Pattern 表 `type` 字段值域扩展，包含 `mythical_beast`、`auspicious`、`border`、`custom`
- Pattern 表新增 `outputFormat` 字段记录生成格式
- Pattern 表 `svg` 字段语义放宽：SVG 模式存储 SVG 代码，Image 模式存储 base64 图像数据（字段名保持不变，避免破坏性迁移）
- Pattern 表 `params` JSON 中包含 `customPrompt` 字段（仅自定义类型）

## 六、数据库迁移

需要新增 Prisma 迁移：

```prisma
model Pattern {
  // ...existing fields
  outputFormat String @default("svg")  // 新增：'svg' | 'image'
}
```

### 向后兼容

- 现有 Pattern 数据的 `outputFormat` 默认为 `"svg"`（与现有行为一致）
- 旧数据中 `params` JSON 包含 `seed` 字段不会引起问题，类型定义中保留为 `seed?: number`
- `width`/`height` 字段在 AI 模式下用于 SVG 的 viewBox 尺寸，以及作为图像生成的参考尺寸
- `tileSize` 字段在 AI 模式下仅影响提示词（描述平铺单元大小），不影响实际生成尺寸

## 七、文件变更清单

### 新增文件

- `lib/prompt-templates.ts` — 9 种纹样类型的提示词模板、参数映射逻辑和类型元数据（名称、描述等，替代 `generators/index.ts` 中的 `PATTERN_TYPES`）
- `lib/ai/svg-extractor.ts` — SVG 代码提取和校验工具函数

### 修改文件

- `generators/types.ts` — 扩展 PatternType、PatternParams、PatternResult 类型定义
- `components/TypeSelector.tsx` — 9 项网格 + 自定义描述输入框，从 `lib/prompt-templates.ts` 导入类型元数据
- `components/ControlPanel.tsx` — 新增生成格式选择器、服务商选择器
- `components/PatternCanvas.tsx` — 支持位图渲染、加载状态、错误提示
- `components/DownloadButton.tsx` — 适配位图导出（base64 直接下载）
- `components/HistoryPanel.tsx` — 根据 resultType 区分 SVG/位图缩略图渲染
- `hooks/usePatternGenerator.ts` — 改为异步 AI 调用 + 轮询流程
- `app/page.tsx` — 适配异步生成流程，未登录提示
- `app/api/ai/generate/route.ts` — 支持 outputFormat 参数，SVG 模式调用文本 API
- `app/api/ai/tasks/[id]/route.ts` — 返回体新增 outputFormat 字段
- `lib/ai/adapter.ts` — 扩展 AiGenerateRequest、AiGenerateResult 接口
- `lib/ai/providers/openai.ts` — 适配 SVG/Image 双模式
- `lib/ai/providers/gemini.ts` — 适配 SVG/Image 双模式
- `lib/ai/providers/local.ts` — 适配 SVG/Image 双模式（存根数据）
- `lib/export.ts` — 位图模式下直接下载 base64，不走 SVG→PNG 转换
- `prisma/schema.prisma` — Pattern 表新增 outputFormat 字段

### 删除文件

- `generators/cloud.ts`
- `generators/meander.ts`
- `generators/floral.ts`
- `generators/geometric.ts`
- `generators/dragon.ts`
- `generators/index.ts`
- `lib/random.ts`
- `generators/__tests__/` 下对应的测试文件
- `lib/__tests__/svg-utils.test.ts`

### 保留但可能精简的文件

- `lib/svg-utils.ts` — 部分工具函数（如 `colorNameFromHex`）可能仍被提示词模板的颜色映射使用，按需保留
