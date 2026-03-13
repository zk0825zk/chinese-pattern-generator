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

- SVG 模式：追加"请输出完整的 SVG 代码，viewBox 为 0 0 800 800"
- 位图模式：不追加文本要求，直接调用图像生成 API

## 三、生成流程与 API 架构

### 前端生成流程

```
用户选择类型 + 调参数 + 选输出格式
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

### API 变更

- `POST /api/ai/generate`：扩展请求体，新增 `outputFormat` 字段（`"svg"` | `"image"`）
  - SVG 模式：调用文本大模型，提取返回中的 SVG 代码
  - Image 模式：调用图像生成 API，返回 base64 或 URL
  - 现有 `provider` 字段保留，前端新增服务商选择控件

### AI 适配器接口扩展

```typescript
interface AiGenerateRequest {
  prompt: string
  outputFormat: 'svg' | 'image'  // 新增
  // ...existing fields
}
```

每个 provider 实现根据 `outputFormat` 决定调用文本 API 还是图像 API。

### 认证要求

保持现有设计，AI 生成需登录。

## 四、前端 UI 变更

### TypeSelector 组件改造

- 从 2 列 5 项 → 3 列 9 项网格布局
- 每个类型显示名称 + 简短描述（与现有风格一致）
- 选中"自定义描述"时，下方展开 textarea 输入框

### ControlPanel 新增控件

- **输出格式选择器**：SVG / 位图，放在输出模式旁边
- **AI 服务商选择器**：下拉选择 OpenAI / Gemini 等，放在控制面板底部

### PatternCanvas 改造

- 保留现有 SVG 渲染能力
- 新增位图渲染支持（`<img>` 标签展示 base64/URL）
- 新增加载中状态（生成中动画/进度提示）
- 新增生成失败时的错误提示

### 生成按钮变更

- "生成纹样"按钮改为异步模式，点击后变为"生成中..."不可重复点击
- 移除"随机生成"按钮（AI 生成本身具有随机性）

### 需要移除/弃用的文件

- `generators/cloud.ts`、`meander.ts`、`floral.ts`、`geometric.ts`、`dragon.ts` — 前端生成算法
- `generators/index.ts` — 生成器注册表（改为提示词模板注册表）
- `lib/random.ts` — SeededRandom（不再需要）
- `usePatternGenerator` hook 中的本地生成逻辑，改为调用 AI API

## 五、数据流与历史/导出

### 历史记录调整

- 现有格式：`{ type, params, svg }`
- 新格式：`{ type, params, prompt, outputFormat, result }`
  - `result` 可以是 SVG 字符串或图片 base64
  - 自定义描述类型额外保存 `customPrompt` 字段
- 点击历史项恢复参数和结果展示（不重新生成）

### 导出功能调整

- SVG 模式：与现有 SVG 导出逻辑一致
- 位图模式：PNG 导出直接使用生成的图像数据
- DownloadButton 根据当前结果类型自动切换导出方式

### 云端保存调整

- Pattern 表 `type` 字段值域扩展，包含 `mythical_beast`、`auspicious`、`border`、`custom`
- Pattern 表新增 `outputFormat` 字段记录生成格式
- Pattern 表 `params` JSON 中包含 `customPrompt` 字段（仅自定义类型）

### 类型定义变更（generators/types.ts）

- `PatternType` 联合类型扩展为 9 种
- `PatternParams` 新增 `outputFormat`、`customPrompt`、`provider` 字段
- 移除与前端生成算法绑定的字段（如 `seed`）

## 六、数据库迁移

需要新增 Prisma 迁移：

```prisma
model Pattern {
  // ...existing fields
  outputFormat String @default("svg")  // 新增：'svg' | 'image'
}
```

## 七、文件变更清单

### 新增文件

- `lib/prompt-templates.ts` — 9 种纹样类型的提示词模板和参数映射逻辑

### 修改文件

- `generators/types.ts` — 扩展 PatternType、PatternParams 类型定义
- `components/TypeSelector.tsx` — 9 项网格 + 自定义描述输入框
- `components/ControlPanel.tsx` — 新增输出格式选择器、服务商选择器
- `components/PatternCanvas.tsx` — 支持位图渲染、加载状态、错误提示
- `components/DownloadButton.tsx` — 适配位图导出
- `components/HistoryPanel.tsx` — 适配新的历史记录格式
- `hooks/usePatternGenerator.ts` — 改为异步 AI 调用流程
- `app/api/ai/generate/route.ts` — 支持 outputFormat 参数
- `lib/ai/adapter.ts` — 扩展 AiGenerateRequest 接口
- `lib/ai/providers/*.ts` — 各 provider 适配 SVG/Image 双模式
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
