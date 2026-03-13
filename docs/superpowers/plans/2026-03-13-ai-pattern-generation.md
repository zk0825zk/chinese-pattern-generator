# AI 全量纹样生成 实施计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将中国纹样生成器从前端算法生成全面转向 AI 大模型生成，扩展纹样类型至 9 种，支持 SVG/位图双格式输出，支持用户自定义描述生成纹样。

**Architecture:** 前端构建提示词模板系统替代现有生成器算法，通过异步轮询调用后端 AI API 生成纹样。后端 AI 适配器扩展支持 SVG（文本大模型）和 Image（图像生成 API）双模式。数据库新增 outputFormat 字段。

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Prisma 6 (SQLite), Tailwind CSS 4, OpenAI API, Gemini API

**Spec:** `docs/superpowers/specs/2026-03-13-ai-pattern-generation-design.md`

---

## File Structure

### 新增文件

| 文件路径 | 职责 |
|---------|------|
| `lib/prompt-templates.ts` | 9 种纹样类型的提示词模板、参数映射函数、类型元数据（名称/描述/图标ID） |
| `lib/ai/svg-extractor.ts` | 从 AI 返回文本中提取和校验 SVG 代码 |

### 修改文件

| 文件路径 | 变更摘要 |
|---------|---------|
| `generators/types.ts` | PatternType 扩展为 9 种，PatternParams/PatternResult 新增字段 |
| `lib/ai/adapter.ts` | AiGenerateRequest 新增 outputFormat，AiGenerateResult 新增 svgCode |
| `lib/ai/providers/local.ts` | 返回 SVG/Image 存根数据替代抛出错误 |
| `lib/ai/providers/openai.ts` | SVG 模式调用 chat completions，Image 模式保持 DALL-E |
| `lib/ai/providers/gemini.ts` | SVG 模式调用 text generation，Image 模式保持现有 |
| `app/api/ai/generate/route.ts` | 接收 outputFormat 参数，存储时区分 svgCode/imageBase64 |
| `app/api/ai/tasks/[id]/route.ts` | 返回体新增 prompt 字段 |
| `lib/export.ts` | 新增 downloadBase64Image 函数 |
| `contexts/AuthContext.tsx` | 暴露 token 字段给消费方 |
| `hooks/useCloudPatterns.ts` | 适配新 PatternResult（result 替代 svg） |
| `hooks/useHistory.ts` | 添加旧数据格式兼容迁移 |
| `lib/api-types.ts` | CreatePatternRequest/PatternDetail 新增 outputFormat |
| `components/TypeSelector.tsx` | 3 列 9 项布局 + 自定义描述 textarea |
| `components/ControlPanel.tsx` | 新增生成格式和服务商选择器 |
| `components/PatternCanvas.tsx` | 支持位图渲染 + 加载/错误状态 |
| `components/DownloadButton.tsx` | 根据 resultType 切换导出方式 |
| `components/HistoryPanel.tsx` | 根据 resultType 区分缩略图渲染 |
| `hooks/usePatternGenerator.ts` | 重写为异步 AI 调用 + 轮询 |
| `app/page.tsx` | 适配异步生成 + 未登录提示 |
| `prisma/schema.prisma` | Pattern 表新增 outputFormat 字段 |

### 删除文件

| 文件路径 | 原因 |
|---------|------|
| `generators/cloud.ts` | 前端生成算法不再使用 |
| `generators/meander.ts` | 同上 |
| `generators/floral.ts` | 同上 |
| `generators/geometric.ts` | 同上 |
| `generators/dragon.ts` | 同上 |
| `generators/index.ts` | 被 lib/prompt-templates.ts 替代 |
| `lib/random.ts` | SeededRandom 不再需要 |
| `generators/__tests__/*` | 对应生成器的测试 |
| `lib/__tests__/svg-utils.test.ts` | svg-utils 大部分功能不再使用 |

---

## Chunk 1: 基础层（类型定义 + 提示词模板 + SVG 提取器）

### Task 1: 扩展类型定义

**Files:**
- Modify: `generators/types.ts`

- [ ] **Step 1: 更新 PatternType 和 PatternParams**

将 `generators/types.ts` 完整替换为：

```typescript
export const PATTERN_TYPES = [
  'cloud', 'meander', 'floral', 'geometric', 'dragon',
  'mythical_beast', 'auspicious', 'border', 'custom',
] as const;
export type PatternType = (typeof PATTERN_TYPES)[number];

export type SymmetryMode = 'none' | 'horizontal' | 'vertical' | 'radial' | 'full';

export type OutputMode = 'single' | 'seamless';

export type OutputFormat = 'svg' | 'image';

export interface PatternColor {
  primary: string;
  secondary: string;
  background: string;
}

export interface PatternParams {
  type: PatternType;
  color: PatternColor;
  complexity: number;
  density: number;
  symmetry: SymmetryMode;
  mode: OutputMode;
  outputFormat: OutputFormat;
  tileSize: number;
  width: number;
  height: number;
  customPrompt?: string;
  provider?: string;
  seed?: number; // 保留可选，向后兼容
}

export interface PatternResult {
  resultType: OutputFormat;
  result: string; // SVG 代码 或 base64/URL 图像
  params: PatternParams;
  prompt: string;
  timestamp: number;
}

export const DEFAULT_PARAMS: PatternParams = {
  type: 'cloud',
  color: {
    primary: '#e54d42',
    secondary: '#c5a572',
    background: '#f5f0e8',
  },
  complexity: 5,
  density: 5,
  symmetry: 'none',
  mode: 'single',
  outputFormat: 'svg',
  tileSize: 200,
  width: 800,
  height: 600,
};
```

- [ ] **Step 2: 验证 TypeScript 编译**

运行: `npx tsc --noEmit 2>&1 | head -30`
预期: 出现大量引用旧类型的编译错误（因为其他文件还未更新），这是预期行为。确认 `generators/types.ts` 本身没有语法错误即可。

- [ ] **Step 3: 提交**

```bash
git add generators/types.ts
git commit -m "refactor: 扩展 PatternType/PatternParams/PatternResult 类型定义"
```

---

### Task 2: 创建提示词模板系统

**Files:**
- Create: `lib/prompt-templates.ts`

- [ ] **Step 1: 创建提示词模板文件**

创建 `lib/prompt-templates.ts`：

```typescript
import type { PatternType, PatternParams } from '@/generators/types';

export interface PatternTypeInfo {
  id: PatternType;
  name: string;
  description: string;
}

export const PATTERN_TYPE_LIST: PatternTypeInfo[] = [
  { id: 'cloud', name: '祥云纹', description: '卷曲云头纹样' },
  { id: 'meander', name: '回纹', description: '直角螺旋图案' },
  { id: 'floral', name: '花纹', description: '缠枝花卉纹样' },
  { id: 'geometric', name: '几何纹', description: '菱形万字六边形' },
  { id: 'dragon', name: '龙纹', description: '蜿蜒龙身纹样' },
  { id: 'mythical_beast', name: '瑞兽纹', description: '凤凰麒麟瑞禽' },
  { id: 'auspicious', name: '吉祥纹', description: '如意海水江崖' },
  { id: 'border', name: '古典边饰纹', description: '饕餮联珠方胜' },
  { id: 'custom', name: '自定义描述', description: '输入描述生成纹样' },
];

const BASE_TEMPLATES: Record<Exclude<PatternType, 'custom'>, string> = {
  cloud: '请生成一幅中国传统祥云纹样，云头呈卷曲螺旋状，以S形曲线相互连接，具有传统工艺美术的精致感。',
  meander: '请生成一幅中国传统回纹，由连续直角折线构成方形螺旋图案，线条规整有序，体现几何之美。',
  floral: '请生成一幅中国传统缠枝花卉纹样，花瓣层叠放射排列，枝蔓蜿蜒缠绕，富有生机与装饰美感。',
  geometric: '请生成一幅中国传统几何纹样，可包含菱形、万字纹、六边形等元素，线条精准对称，节奏感强。',
  dragon: '请生成一幅中国传统龙纹，龙身蜿蜒盘旋，鳞片细腻，龙爪刚劲有力，气势威严，具有皇家气韵。',
  mythical_beast: '请生成一幅中国传统瑞兽纹样，可以是凤凰、麒麟、仙鹤等神兽瑞禽，线条流畅，姿态生动，具有祥瑞寓意。',
  auspicious: '请生成一幅中国传统吉祥纹样，可包含如意纹、海水江崖纹、寿字纹等元素，寓意吉祥如意、福寿绵长。',
  border: '请生成一幅中国传统古典边饰纹样，可包含饕餮纹、联珠纹、方胜纹等元素，适合作为装饰边框使用，庄重典雅。',
};

function mapComplexity(complexity: number): string {
  if (complexity <= 3) return '简约风格，线条简洁';
  if (complexity <= 6) return '中等细节，适度装饰';
  return '精细繁复，细节丰富';
}

function mapDensity(density: number): string {
  if (density <= 3) return '元素稀疏，留白充裕';
  if (density <= 6) return '元素分布均匀';
  return '元素密集，铺满画面';
}

const SYMMETRY_LABELS: Record<string, string> = {
  none: '无对称',
  horizontal: '水平对称',
  vertical: '垂直对称',
  radial: '径向对称',
  full: '完全对称',
};

function mapOutputMode(mode: string): string {
  return mode === 'seamless' ? '可无缝平铺的连续纹样' : '单个独立纹样';
}

function colorToName(hex: string): string {
  const colors: Record<string, string> = {
    '#e54d42': '朱砂红', '#c5a572': '金色', '#f5f0e8': '宣纸白',
    '#2858a6': '青花蓝', '#6b9bd2': '浅蓝', '#f0f4f8': '月白',
    '#2c4a2c': '墨绿', '#5b8c5a': '竹青', '#f2f5f0': '浅碧',
    '#8b2500': '宫墙红', '#d4a54a': '琉璃金', '#faf3e8': '象牙白',
    '#c27c88': '桃粉', '#e8c4c8': '浅绯', '#fdf5f5': '粉白',
  };
  return colors[hex.toLowerCase()] || hex;
}

export function buildPrompt(params: PatternParams): string {
  // 基础模板
  let base: string;
  if (params.type === 'custom') {
    base = `请生成一幅中国传统纹样：${params.customPrompt || ''}`;
  } else {
    base = BASE_TEMPLATES[params.type];
  }

  // 参数描述
  const paramParts = [
    mapComplexity(params.complexity),
    mapDensity(params.density),
    `${SYMMETRY_LABELS[params.symmetry] || '无对称'}布局`,
    mapOutputMode(params.mode),
    `主色为${colorToName(params.color.primary)}，辅色为${colorToName(params.color.secondary)}，背景为${colorToName(params.color.background)}`,
  ];

  // 格式要求
  let formatReq = '';
  if (params.outputFormat === 'svg') {
    formatReq = `请输出完整的 SVG 代码，viewBox 为 0 0 ${params.width} ${params.height}，不要包含任何解释文字，只输出 SVG 代码。`;
  }

  return [base, paramParts.join('，') + '。', formatReq].filter(Boolean).join(' ');
}
```

- [ ] **Step 2: 提交**

```bash
git add lib/prompt-templates.ts
git commit -m "feat: 添加提示词模板系统和参数映射"
```

---

### Task 3: 创建 SVG 提取器

**Files:**
- Create: `lib/ai/svg-extractor.ts`

- [ ] **Step 1: 创建 SVG 提取工具**

创建 `lib/ai/svg-extractor.ts`：

```typescript
/**
 * 从 AI 大模型返回的文本中提取 SVG 代码
 */
export function extractSvg(text: string): { success: true; svg: string } | { success: false; error: string } {
  // 1. 尝试从 markdown 代码块中提取
  const codeBlockMatch = text.match(/```(?:svg|xml)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    const content = codeBlockMatch[1].trim();
    if (content.includes('<svg')) {
      return validateAndReturn(content);
    }
  }

  // 2. 尝试直接匹配 <svg>...</svg>
  const svgMatch = text.match(/<svg[\s\S]*?<\/svg>/i);
  if (svgMatch) {
    return validateAndReturn(svgMatch[0].trim());
  }

  return { success: false, error: 'AI 返回内容中未找到有效的 SVG 代码' };
}

function validateAndReturn(svg: string): { success: true; svg: string } | { success: false; error: string } {
  // 检查是否包含 <svg 根元素
  if (!/<svg\s/i.test(svg)) {
    return { success: false, error: 'SVG 代码缺少根元素' };
  }
  // 检查是否闭合
  if (!/<\/svg>/i.test(svg)) {
    return { success: false, error: 'SVG 代码未正确闭合' };
  }
  return { success: true, svg };
}
```

- [ ] **Step 2: 提交**

```bash
git add lib/ai/svg-extractor.ts
git commit -m "feat: 添加 SVG 代码提取和校验工具"
```

---

## Chunk 2: 后端 AI 适配层 + API + 数据库

### Task 4: 扩展 AI 适配器接口

**Files:**
- Modify: `lib/ai/adapter.ts`

- [ ] **Step 1: 更新 adapter.ts**

将 `lib/ai/adapter.ts` 完整替换为：

```typescript
export interface AiGenerateRequest {
  prompt: string;
  outputFormat: 'svg' | 'image';
  style?: string;
  width?: number;
  height?: number;
}

export interface AiGenerateResult {
  imageUrl?: string;
  imageBase64?: string;
  svgCode?: string;
  metadata?: Record<string, unknown>;
}

export interface AiAdapter {
  readonly provider: string;
  generate(request: AiGenerateRequest): Promise<AiGenerateResult>;
  checkStatus?(taskId: string): Promise<AiGenerateResult>;
}
```

- [ ] **Step 2: 提交**

```bash
git add lib/ai/adapter.ts
git commit -m "refactor: 扩展 AI 适配器接口支持 SVG/Image 双格式"
```

---

### Task 5: 更新 AI Provider 实现

**Files:**
- Modify: `lib/ai/providers/local.ts`
- Modify: `lib/ai/providers/openai.ts`
- Modify: `lib/ai/providers/gemini.ts`

- [ ] **Step 1: 更新 local.ts — 返回存根数据**

将 `lib/ai/providers/local.ts` 完整替换为：

```typescript
import type { AiAdapter, AiGenerateRequest, AiGenerateResult } from '../adapter';

const STUB_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#f5f0e8"/>
  <text x="400" y="300" text-anchor="middle" font-size="24" fill="#c5a572" font-family="serif">本地存根 — 纹样预览</text>
</svg>`;

export class LocalAdapter implements AiAdapter {
  readonly provider = 'local';

  async generate(request: AiGenerateRequest): Promise<AiGenerateResult> {
    // 模拟延迟
    await new Promise((r) => setTimeout(r, 1000));

    if (request.outputFormat === 'svg') {
      return { svgCode: STUB_SVG };
    }
    // image 模式：返回 1x1 透明 PNG 的 base64 作为占位
    return {
      imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    };
  }
}
```

- [ ] **Step 2: 更新 openai.ts — 支持 SVG/Image 双模式**

将 `lib/ai/providers/openai.ts` 完整替换为：

```typescript
import type { AiAdapter, AiGenerateRequest, AiGenerateResult } from '../adapter';
import { extractSvg } from '../svg-extractor';

export class OpenAiAdapter implements AiAdapter {
  readonly provider = 'openai';

  async generate(request: AiGenerateRequest): Promise<AiGenerateResult> {
    const apiKey = process.env.AI_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('AI_OPENAI_API_KEY is not configured');
    }

    if (request.outputFormat === 'svg') {
      return this.generateSvg(apiKey, request);
    }
    return this.generateImage(apiKey, request);
  }

  private async generateSvg(apiKey: string, request: AiGenerateRequest): Promise<AiGenerateResult> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: '你是一个专业的 SVG 矢量图形生成器。请只输出 SVG 代码，不要包含任何解释文字。' },
          { role: 'user', content: request.prompt },
        ],
        max_tokens: 16000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    const result = extractSvg(text);

    if (!result.success) {
      throw new Error(result.error);
    }

    return { svgCode: result.svg, metadata: { model: 'gpt-4o' } };
  }

  private async generateImage(apiKey: string, request: AiGenerateRequest): Promise<AiGenerateResult> {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: request.prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'b64_json',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    return {
      imageBase64: data.data?.[0]?.b64_json,
      metadata: { model: 'dall-e-3', revised_prompt: data.data?.[0]?.revised_prompt },
    };
  }
}
```

- [ ] **Step 3: 更新 gemini.ts — 支持 SVG/Image 双模式**

将 `lib/ai/providers/gemini.ts` 完整替换为：

```typescript
import type { AiAdapter, AiGenerateRequest, AiGenerateResult } from '../adapter';
import { extractSvg } from '../svg-extractor';

export class GeminiAdapter implements AiAdapter {
  readonly provider = 'gemini';

  async generate(request: AiGenerateRequest): Promise<AiGenerateResult> {
    const apiKey = process.env.AI_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('AI_GEMINI_API_KEY is not configured');
    }

    if (request.outputFormat === 'svg') {
      return this.generateSvg(apiKey, request);
    }
    return this.generateImage(apiKey, request);
  }

  private async generateSvg(apiKey: string, request: AiGenerateRequest): Promise<AiGenerateResult> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: request.prompt }] }],
          systemInstruction: { parts: [{ text: '你是一个专业的 SVG 矢量图形生成器。请只输出 SVG 代码，不要包含任何解释文字。' }] },
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const result = extractSvg(text);

    if (!result.success) {
      throw new Error(result.error);
    }

    return { svgCode: result.svg, metadata: { model: 'gemini-2.0-flash' } };
  }

  private async generateImage(apiKey: string, request: AiGenerateRequest): Promise<AiGenerateResult> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: request.prompt }] }],
          generationConfig: {
            responseModalities: ['image', 'text'],
            responseMimeType: 'image/png',
          },
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();
    const imagePart = data.candidates?.[0]?.content?.parts?.find(
      (p: { inlineData?: unknown }) => p.inlineData,
    );

    return {
      imageBase64: imagePart?.inlineData?.data,
      metadata: { model: 'gemini-2.0-flash-exp' },
    };
  }
}
```

- [ ] **Step 4: 提交**

```bash
git add lib/ai/providers/local.ts lib/ai/providers/openai.ts lib/ai/providers/gemini.ts
git commit -m "feat: 所有 AI provider 支持 SVG/Image 双模式生成"
```

---

### Task 6: 更新 API 路由

**Files:**
- Modify: `app/api/ai/generate/route.ts`
- Modify: `app/api/ai/tasks/[id]/route.ts`

- [ ] **Step 1: 更新 generate route.ts**

将 `app/api/ai/generate/route.ts` 完整替换为：

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import { createAiAdapter } from '@/lib/ai/factory';
import { RateLimiter } from '@/lib/rate-limit';

const limiter = new RateLimiter({ maxRequests: 5, windowMs: 60_000 });
const VALID_PROVIDERS = ['openai', 'gemini', 'local'];
const VALID_FORMATS = ['svg', 'image'];

export const POST = withAuth(async (req, { userId }) => {
  try {
    if (!limiter.check(userId)) {
      return NextResponse.json({ error: 'AI 生成请求过于频繁，请稍后再试' }, { status: 429 });
    }

    let body: { prompt?: string; provider?: string; outputFormat?: string; style?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: '请求体格式错误' }, { status: 400 });
    }

    const { prompt, provider = 'openai', outputFormat = 'svg', style } = body;
    if (!prompt) {
      return NextResponse.json({ error: 'prompt 为必填字段' }, { status: 400 });
    }

    if (!VALID_PROVIDERS.includes(provider)) {
      return NextResponse.json({ error: '无效的 AI 服务商' }, { status: 400 });
    }

    if (!VALID_FORMATS.includes(outputFormat)) {
      return NextResponse.json({ error: '无效的输出格式' }, { status: 400 });
    }

    const task = await prisma.aiTask.create({
      data: {
        userId,
        prompt,
        provider,
        status: 'pending',
      },
    });

    // 异步执行生成，不阻塞响应
    (async () => {
      try {
        await prisma.aiTask.update({
          where: { id: task.id },
          data: { status: 'processing' },
        });

        const adapter = createAiAdapter(provider);
        const result = await adapter.generate({
          prompt,
          outputFormat: outputFormat as 'svg' | 'image',
          style,
        });

        // 根据 outputFormat 选择存储内容
        const resultData = outputFormat === 'svg'
          ? result.svgCode ?? null
          : result.imageBase64 ?? result.imageUrl ?? null;

        await prisma.aiTask.update({
          where: { id: task.id },
          data: {
            status: 'completed',
            result: resultData,
          },
        });
      } catch (err) {
        try {
          await prisma.aiTask.update({
            where: { id: task.id },
            data: {
              status: 'failed',
              error: err instanceof Error ? err.message : '未知错误',
            },
          });
        } catch (updateErr) {
          console.error('Failed to update AI task status:', updateErr);
        }
      }
    })();

    return NextResponse.json({
      task: { id: task.id, status: task.status, outputFormat },
    }, { status: 202 });
  } catch {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
});
```

- [ ] **Step 2: 更新 tasks/[id]/route.ts — 返回体新增 outputFormat**

找到 `app/api/ai/tasks/[id]/route.ts` 中两处返回 `task` 对象的地方，在返回字段中加入 `prompt`（用于前端判断 outputFormat）。

将 `return NextResponse.json({` 开始的两个返回块修改为包含 `prompt` 字段：

超时检查的返回：
```typescript
return NextResponse.json({
  task: {
    id: updated.id,
    status: updated.status,
    result: updated.result,
    error: updated.error,
    prompt: updated.prompt,
    createdAt: updated.createdAt,
  },
});
```

正常返回：
```typescript
return NextResponse.json({
  task: {
    id: task.id,
    status: task.status,
    result: task.result,
    error: task.error,
    prompt: task.prompt,
    createdAt: task.createdAt,
  },
});
```

- [ ] **Step 3: 提交**

```bash
git add app/api/ai/generate/route.ts app/api/ai/tasks/[id]/route.ts
git commit -m "feat: API 路由支持 outputFormat 参数和双格式结果存储"
```

---

### Task 7: 数据库迁移

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: 更新 schema**

在 `prisma/schema.prisma` 的 Pattern 模型中，在 `thumbnail` 字段之后添加：

```prisma
  outputFormat String  @default("svg") // svg | image
```

同时更新 `type` 字段的注释：

```prisma
  type       String    // cloud | meander | floral | geometric | dragon | mythical_beast | auspicious | border | custom
```

- [ ] **Step 2: 运行迁移**

运行: `npx prisma migrate dev --name add-output-format`
预期: 迁移成功创建

- [ ] **Step 3: 提交**

```bash
git add prisma/
git commit -m "feat: Pattern 表新增 outputFormat 字段"
```

---

## Chunk 3: 前端组件改造

### Task 8: 改造 TypeSelector 组件

**Files:**
- Modify: `components/TypeSelector.tsx`

- [ ] **Step 1: 重写 TypeSelector**

将 `components/TypeSelector.tsx` 完整替换为：

```typescript
'use client';

import { useState } from 'react';
import { PATTERN_TYPE_LIST } from '@/lib/prompt-templates';
import type { PatternType } from '@/generators/types';

interface TypeSelectorProps {
  selected: PatternType;
  onChange: (type: PatternType) => void;
  customPrompt?: string;
  onCustomPromptChange?: (prompt: string) => void;
}

export function TypeSelector({ selected, onChange, customPrompt = '', onCustomPromptChange }: TypeSelectorProps) {
  const [promptLength, setPromptLength] = useState(customPrompt.length);

  const handleCustomChange = (value: string) => {
    if (value.length > 500) return;
    setPromptLength(value.length);
    onCustomPromptChange?.(value);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {PATTERN_TYPE_LIST.map((type) => (
          <button
            key={type.id}
            onClick={() => onChange(type.id)}
            className={`flex flex-col items-start px-3 py-2.5 rounded-lg text-sm border transition-all ${
              selected === type.id
                ? 'text-white shadow-md'
                : 'border-[var(--color-border-light)] bg-[var(--color-surface)] hover:border-[var(--color-gold)] hover:shadow-sm'
            }`}
            style={
              selected === type.id
                ? { background: 'linear-gradient(135deg, var(--color-vermilion), var(--color-vermilion-dark))', borderColor: 'transparent' }
                : undefined
            }
          >
            <div className="font-medium leading-tight text-xs">{type.name}</div>
            <div className={`text-[10px] leading-tight mt-0.5 ${selected === type.id ? 'opacity-90' : 'opacity-60'}`}>
              {type.description}
            </div>
          </button>
        ))}
      </div>

      {/* 自定义描述输入框 */}
      {selected === 'custom' && (
        <div className="space-y-1">
          <textarea
            value={customPrompt}
            onChange={(e) => handleCustomChange(e.target.value)}
            placeholder="描述你想要的中国传统纹样，例如：一幅精美的敦煌飞天纹样，衣袂飘飘..."
            className="w-full h-24 px-3 py-2 text-sm border border-[var(--color-border-light)] rounded-lg bg-[var(--color-surface)] resize-none focus:outline-none focus:border-[var(--color-gold)] transition-colors"
            maxLength={500}
          />
          <div className="text-right text-[10px] text-[var(--color-ink-lighter)]">
            {promptLength}/500
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add components/TypeSelector.tsx
git commit -m "feat: TypeSelector 改为 3 列 9 项布局 + 自定义描述输入"
```

---

### Task 9: 改造 ControlPanel 组件

**Files:**
- Modify: `components/ControlPanel.tsx`

- [ ] **Step 1: 更新 ControlPanel**

对 `components/ControlPanel.tsx` 做以下修改：

a) 更新导入：
```typescript
import type { PatternParams, SymmetryMode, OutputMode, OutputFormat } from '@/generators/types';
```

b) 更新 TypeSelector 调用，传入 customPrompt 相关 props：
```typescript
<TypeSelector
  selected={params.type}
  onChange={(type) => onUpdate({ type })}
  customPrompt={params.customPrompt}
  onCustomPromptChange={(customPrompt) => onUpdate({ customPrompt })}
/>
```

c) 在「输出模式」卡片中，在模式按钮之后添加「生成格式」选择器：

```typescript
{/* 生成格式 */}
<div className="mt-4">
  <label className="text-xs text-[var(--color-ink-lighter)] mb-2 block">生成格式</label>
  <div className="flex gap-2">
    {(['svg', 'image'] as OutputFormat[]).map((fmt) => (
      <button
        key={fmt}
        onClick={() => onUpdate({ outputFormat: fmt })}
        className={`flex-1 px-3 py-2 rounded-lg text-sm border transition-all ${
          params.outputFormat === fmt
            ? 'text-white shadow-sm'
            : 'border-[var(--color-border-light)] bg-[var(--color-surface)] hover:border-[var(--color-gold)]'
        }`}
        style={
          params.outputFormat === fmt
            ? { background: 'linear-gradient(135deg, var(--color-vermilion), var(--color-vermilion-dark))', borderColor: 'transparent' }
            : undefined
        }
      >
        {fmt === 'svg' ? 'SVG 矢量图' : '位图图像'}
      </button>
    ))}
  </div>
</div>
```

d) 在「参数微调」卡片底部（对称方式之后）添加服务商选择器：

```typescript
{/* AI 服务商 */}
<div className="mt-4">
  <label className="text-sm text-[var(--color-ink-light)] mb-2 block">AI 服务商</label>
  <select
    value={params.provider || 'openai'}
    onChange={(e) => onUpdate({ provider: e.target.value })}
    className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--color-border-light)] bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
  >
    <option value="openai">OpenAI</option>
    <option value="gemini">Gemini</option>
    <option value="local">本地测试</option>
  </select>
</div>
```

- [ ] **Step 2: 提交**

```bash
git add components/ControlPanel.tsx
git commit -m "feat: ControlPanel 新增生成格式和服务商选择器"
```

---

### Task 10: 改造 PatternCanvas 组件

**Files:**
- Modify: `components/PatternCanvas.tsx`

- [ ] **Step 1: 重写 PatternCanvas**

将 `components/PatternCanvas.tsx` 完整替换为：

```typescript
'use client';

import type { OutputFormat } from '@/generators/types';

interface PatternCanvasProps {
  result: string | null;
  resultType: OutputFormat;
  isLoading: boolean;
  error: string | null;
}

export function PatternCanvas({ result, resultType, isLoading, error }: PatternCanvasProps) {
  return (
    <div className="chinese-corner card-chinese relative overflow-hidden" style={{ minHeight: '400px' }}>
      <div className="chinese-corner-inner w-full h-full">
        {/* 内层画框 */}
        <div className="absolute inset-3 border border-[var(--color-border-light)] rounded-lg pointer-events-none" />

        {isLoading ? (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center">
              <div
                className="w-16 h-16 mx-auto mb-4 border-4 border-[var(--color-gold)] border-t-transparent rounded-full"
                style={{ animation: 'spin 1s linear infinite' }}
              />
              <p className="text-sm text-[var(--color-ink-light)] font-medium">纹样生成中...</p>
              <p className="text-xs text-[var(--color-ink-lighter)] mt-1">AI 正在创作，请稍候</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center px-6">
              <div className="text-3xl mb-3">!</div>
              <p className="text-sm text-[var(--color-vermilion)] font-medium">{error}</p>
              <p className="text-xs text-[var(--color-ink-lighter)] mt-1">请调整参数后重试</p>
            </div>
          </div>
        ) : result ? (
          resultType === 'svg' ? (
            <div
              className="w-full h-full flex items-center justify-center p-4"
              style={{ animation: 'fadeInUp 0.5s ease-out' }}
              dangerouslySetInnerHTML={{ __html: result }}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center p-4"
              style={{ animation: 'fadeInUp 0.5s ease-out' }}
            >
              <img
                src={result.startsWith('data:') ? result : `data:image/png;base64,${result}`}
                alt="AI 生成的纹样"
                className="max-w-full max-h-full object-contain rounded"
              />
            </div>
          )
        ) : (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center">
              <div
                className="w-28 h-28 mx-auto mb-5 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, var(--color-paper-warm), var(--color-paper-dark))',
                  boxShadow: '0 8px 32px rgba(197, 165, 114, 0.15)',
                  animation: 'gentleFloat 4s ease-in-out infinite',
                }}
              >
                <span
                  className="text-5xl"
                  style={{ color: 'var(--color-gold)', fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif" }}
                >
                  云
                </span>
              </div>
              <p className="text-sm text-[var(--color-ink-light)] font-medium">选择纹样类型并点击生成</p>
              <p className="text-xs text-[var(--color-ink-lighter)] mt-1.5">探索中国传统纹饰之美</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add components/PatternCanvas.tsx
git commit -m "feat: PatternCanvas 支持位图渲染 + 加载/错误状态"
```

---

### Task 11: 改造导出功能

**Files:**
- Modify: `lib/export.ts`
- Modify: `components/DownloadButton.tsx`

- [ ] **Step 1: 在 lib/export.ts 末尾新增 base64 下载函数**

在现有代码末尾添加：

```typescript
export function downloadBase64Image(base64: string, filename: string = 'pattern.png'): void {
  const data = base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`;
  const a = document.createElement('a');
  a.href = data;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
```

- [ ] **Step 2: 重写 DownloadButton**

将 `components/DownloadButton.tsx` 完整替换为：

```typescript
'use client';

import { useState } from 'react';
import { downloadSvg, downloadPng, downloadBase64Image } from '@/lib/export';
import type { OutputFormat } from '@/generators/types';

interface DownloadButtonProps {
  result: string | null;
  resultType: OutputFormat;
  width: number;
  height: number;
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export function DownloadButton({ result, resultType, width, height }: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadSvg = () => {
    if (!result || resultType !== 'svg') return;
    downloadSvg(result, `pattern-${Date.now()}.svg`);
  };

  const handleDownloadPng = async () => {
    if (!result) return;
    setDownloading(true);
    try {
      if (resultType === 'image') {
        downloadBase64Image(result, `pattern-${Date.now()}.png`);
      } else {
        await downloadPng(result, width, height, `pattern-${Date.now()}.png`);
      }
    } catch (err) {
      console.error('PNG 导出失败:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex gap-2">
      {resultType === 'svg' && (
        <button
          onClick={handleDownloadSvg}
          disabled={!result}
          className="group flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-xl text-sm hover:border-[var(--color-gold)] hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <DownloadIcon className="transition-transform group-hover:scale-110" />
          <span>下载 SVG</span>
        </button>
      )}
      <button
        onClick={handleDownloadPng}
        disabled={!result || downloading}
        className="group flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-xl text-sm hover:border-[var(--color-gold)] hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <DownloadIcon className="transition-transform group-hover:scale-110" />
        <span>{downloading ? '导出中...' : '下载 PNG'}</span>
      </button>
    </div>
  );
}
```

- [ ] **Step 3: 提交**

```bash
git add lib/export.ts components/DownloadButton.tsx
git commit -m "feat: 导出功能支持位图直接下载"
```

---

### Task 12: 改造 HistoryPanel 组件

**Files:**
- Modify: `components/HistoryPanel.tsx`

- [ ] **Step 1: 更新缩略图渲染逻辑**

在 `components/HistoryPanel.tsx` 中，将历史项缩略图渲染部分（第 115-121 行）替换为根据 `resultType` 区分渲染：

找到：
```typescript
                <div
                  className="w-full h-full"
                  dangerouslySetInnerHTML={{ __html: item.svg.replace(/width="\d+"/, 'width="112"').replace(/height="\d+"/, 'height="112"') }}
                />
```

替换为：
```typescript
                {'resultType' in item && item.resultType === 'image' ? (
                  <img
                    src={(item.result || '').startsWith('data:') ? item.result : `data:image/png;base64,${item.result}`}
                    alt="纹样"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full"
                    dangerouslySetInnerHTML={{
                      __html: ('result' in item ? item.result : (item as { svg?: string }).svg || '')
                        .replace(/width="\d+"/, 'width="112"')
                        .replace(/height="\d+"/, 'height="112"'),
                    }}
                  />
                )}
```

这样写可以同时兼容新旧数据格式。

- [ ] **Step 2: 提交**

```bash
git add components/HistoryPanel.tsx
git commit -m "feat: HistoryPanel 根据 resultType 区分缩略图渲染"
```

---

## Chunk 4: 适配层修复（AuthContext + Cloud + API 类型 + 历史兼容）

### Task 13: AuthContext 暴露 token

**Files:**
- Modify: `contexts/AuthContext.tsx`

- [ ] **Step 1: 更新 AuthContextValue 接口和 Provider**

在 `contexts/AuthContext.tsx` 中：

a) 更新接口，新增 `token` 字段：

找到：
```typescript
interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}
```

替换为：
```typescript
interface AuthContextValue extends AuthState {
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}
```

b) 在 Provider 组件中，将 `getToken()` 的结果通过 context 传递。找到：

```typescript
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
```

替换为：

```typescript
    <AuthContext.Provider value={{ ...state, token: getToken(), login, register, logout }}>
```

- [ ] **Step 2: 提交**

```bash
git add contexts/AuthContext.tsx
git commit -m "feat: AuthContext 暴露 token 字段"
```

---

### Task 14: 更新 API 类型定义

**Files:**
- Modify: `lib/api-types.ts`

- [ ] **Step 1: 更新 PatternDetail 和 CreatePatternRequest**

在 `lib/api-types.ts` 中：

a) `PatternDetail` 接口新增 `outputFormat` 字段。找到：
```typescript
export interface PatternDetail extends PatternListItem {
  params: string;
  svg: string;
  userId: string;
}
```

替换为：
```typescript
export interface PatternDetail extends PatternListItem {
  params: string;
  svg: string;
  outputFormat: string;
  userId: string;
}
```

b) `CreatePatternRequest` 新增 `outputFormat` 字段。找到：
```typescript
export interface CreatePatternRequest {
  name?: string;
  type: string;
  params: string;
  svg: string;
  thumbnail?: string;
}
```

替换为：
```typescript
export interface CreatePatternRequest {
  name?: string;
  type: string;
  params: string;
  svg: string;
  outputFormat?: string;
  thumbnail?: string;
}
```

- [ ] **Step 2: 提交**

```bash
git add lib/api-types.ts
git commit -m "feat: API 类型定义新增 outputFormat 字段"
```

---

### Task 15: 更新 useCloudPatterns Hook

**Files:**
- Modify: `hooks/useCloudPatterns.ts`

- [ ] **Step 1: 适配 savePattern 使用新 PatternResult 字段**

在 `hooks/useCloudPatterns.ts` 中：

a) 找到 `savePattern` 中的 API 调用：
```typescript
      await patternsApi.create({
        type: result.params.type,
        params: JSON.stringify(result.params),
        svg: result.svg,
      });
```

替换为：
```typescript
      await patternsApi.create({
        type: result.params.type,
        params: JSON.stringify(result.params),
        svg: result.result,
        outputFormat: result.resultType,
      });
```

b) 找到 `restorePattern` 中的返回值构造：
```typescript
      return {
        svg: p.svg,
        params: JSON.parse(p.params),
        timestamp: new Date(p.createdAt).getTime(),
      };
```

替换为：
```typescript
      const params = JSON.parse(p.params);
      return {
        resultType: (p.outputFormat || params.outputFormat || 'svg') as 'svg' | 'image',
        result: p.svg,
        params,
        prompt: '',
        timestamp: new Date(p.createdAt).getTime(),
      };
```

- [ ] **Step 2: 提交**

```bash
git add hooks/useCloudPatterns.ts
git commit -m "feat: useCloudPatterns 适配新 PatternResult 字段结构"
```

---

### Task 16: 历史记录旧数据兼容

**Files:**
- Modify: `hooks/useHistory.ts`

- [ ] **Step 1: 添加旧数据格式迁移**

在 `hooks/useHistory.ts` 中，在 `useEffect` 读取 localStorage 后添加数据迁移逻辑。

找到：
```typescript
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      // localStorage 不可用或数据损坏
    }
  }, []);
```

替换为：
```typescript
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 迁移旧格式数据：svg -> result + resultType
        const migrated = parsed.map((item: Record<string, unknown>) => {
          if ('svg' in item && !('result' in item)) {
            return {
              resultType: 'svg' as const,
              result: item.svg as string,
              params: item.params,
              prompt: '',
              timestamp: item.timestamp,
            };
          }
          return item;
        });
        setHistory(migrated);
      }
    } catch {
      // localStorage 不可用或数据损坏
    }
  }, []);
```

- [ ] **Step 2: 提交**

```bash
git add hooks/useHistory.ts
git commit -m "feat: 历史记录添加旧数据格式兼容迁移"
```

---

## Chunk 5: Hook 重写 + 主页面集成 + 清理

### Task 17: 重写 usePatternGenerator Hook

**Files:**
- Modify: `hooks/usePatternGenerator.ts`

- [ ] **Step 1: 重写 hook**

将 `hooks/usePatternGenerator.ts` 完整替换为：

```typescript
'use client';

import { useState, useCallback, useRef } from 'react';
import type { PatternParams, PatternResult } from '@/generators/types';
import { DEFAULT_PARAMS } from '@/generators/types';
import { buildPrompt } from '@/lib/prompt-templates';

const POLL_INTERVAL = 2000;
const MAX_POLLS = 60;
const MAX_CONSECUTIVE_ERRORS = 3;

export function usePatternGenerator() {
  const [params, setParams] = useState<PatternParams>(DEFAULT_PARAMS);
  const [result, setResult] = useState<PatternResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const updateParams = useCallback((updates: Partial<PatternParams>) => {
    setParams((prev) => ({ ...prev, ...updates }));
  }, []);

  const generate = useCallback(async (token: string): Promise<PatternResult | null> => {
    // 取消之前的生成
    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;

    setIsGenerating(true);
    setError(null);

    try {
      const prompt = buildPrompt(params);

      // 1. 提交生成任务
      const submitRes = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt,
          provider: params.provider || 'openai',
          outputFormat: params.outputFormat,
        }),
        signal: abort.signal,
      });

      if (!submitRes.ok) {
        const data = await submitRes.json().catch(() => ({}));
        throw new Error(data.error || `请求失败 (${submitRes.status})`);
      }

      const { task } = await submitRes.json();
      const taskId = task.id;

      // 2. 轮询任务状态
      let polls = 0;
      let consecutiveErrors = 0;

      while (polls < MAX_POLLS) {
        if (abort.signal.aborted) return null;
        await new Promise((r) => setTimeout(r, POLL_INTERVAL));
        polls++;

        try {
          const pollRes = await fetch(`/api/ai/tasks/${taskId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
            signal: abort.signal,
          });

          if (!pollRes.ok) {
            consecutiveErrors++;
            if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
              throw new Error('网络连接异常，请检查网络后重试');
            }
            continue;
          }

          consecutiveErrors = 0;
          const { task: taskData } = await pollRes.json();

          if (taskData.status === 'completed' && taskData.result) {
            const patternResult: PatternResult = {
              resultType: params.outputFormat,
              result: taskData.result,
              params: { ...params },
              prompt,
              timestamp: Date.now(),
            };
            setResult(patternResult);
            return patternResult;
          }

          if (taskData.status === 'failed') {
            throw new Error(taskData.error || '生成失败，请重试');
          }
        } catch (err) {
          if (abort.signal.aborted) return null;
          if (err instanceof Error && err.message.includes('网络')) throw err;
          consecutiveErrors++;
          if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
            throw new Error('网络连接异常，请检查网络后重试');
          }
        }
      }

      throw new Error('生成超时，请重试');
    } catch (err) {
      if (abort.signal.aborted) return null;
      const message = err instanceof Error ? err.message : '生成失败';
      setError(message);
      return null;
    } finally {
      if (!abort.signal.aborted) {
        setIsGenerating(false);
      }
    }
  }, [params]);

  const restoreFromHistory = useCallback((historyItem: PatternResult) => {
    setParams(historyItem.params);
    setResult(historyItem);
    setError(null);
  }, []);

  return {
    params,
    result,
    isGenerating,
    error,
    updateParams,
    generate,
    restoreFromHistory,
  };
}
```

- [ ] **Step 2: 提交**

```bash
git add hooks/usePatternGenerator.ts
git commit -m "feat: 重写 usePatternGenerator 为异步 AI 生成 + 轮询"
```

---

### Task 18: 重写主页面

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: 完整替换 page.tsx**

将 `app/page.tsx` 完整替换为：

```typescript
'use client';

import { useState } from 'react';
import { PatternCanvas } from '@/components/PatternCanvas';
import { ControlPanel } from '@/components/ControlPanel';
import { DownloadButton } from '@/components/DownloadButton';
import { HistoryPanel } from '@/components/HistoryPanel';
import { HeaderAuth } from '@/components/HeaderAuth';
import { AuthModal } from '@/components/AuthModal';
import { SaveToCloudButton } from '@/components/SaveToCloudButton';
import { usePatternGenerator } from '@/hooks/usePatternGenerator';
import { useHistory } from '@/hooks/useHistory';
import { useAuth } from '@/contexts/AuthContext';
import { useCloudPatterns } from '@/hooks/useCloudPatterns';

export default function Home() {
  const { params, result, isGenerating, error, updateParams, generate, restoreFromHistory } = usePatternGenerator();
  const { history, addToHistory, clearHistory } = useHistory();
  const { user, token, login, register } = useAuth();
  const cloud = useCloudPatterns();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleGenerate = async () => {
    if (!user || !token) {
      setAuthModalOpen(true);
      return;
    }
    const res = await generate(token);
    if (res) addToHistory(res);
  };

  const handleRestore = (item: typeof history[number]) => {
    restoreFromHistory(item);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="relative backdrop-blur-sm" style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
        <div className="h-1" style={{ background: 'linear-gradient(90deg, transparent, var(--color-gold-light), var(--color-gold), var(--color-gold-light), transparent)' }} />
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center gap-4">
          <div
            className="w-12 h-12 flex items-center justify-center text-white text-xl font-black flex-shrink-0"
            style={{
              backgroundColor: 'var(--color-vermilion)',
              transform: 'rotate(-2deg)',
              fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif",
              boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.3), 0 2px 8px rgba(229, 77, 66, 0.3)',
              borderRadius: '4px',
            }}
          >
            纹
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-[var(--color-ink)]" style={{ fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif" }}>
              中国纹样生成器
            </h1>
            <p className="text-xs text-[var(--color-ink-lighter)] mt-0.5" style={{ letterSpacing: '0.3em' }}>
              传承东方美学 · AI 生成无限纹样
            </p>
          </div>
          <HeaderAuth onLoginClick={() => setAuthModalOpen(true)} />
          <div className="hidden lg:block opacity-10 text-[var(--color-gold)] text-6xl font-light" style={{ fontFamily: "'ZCOOL XiaoWei', serif" }}>
            纹
          </div>
        </div>
        <div className="h-0.5" style={{ background: 'linear-gradient(90deg, transparent, var(--color-vermilion-light), var(--color-vermilion), var(--color-vermilion-light), transparent)' }} />
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left - Canvas Area */}
          <div className="lg:col-span-8 space-y-5">
            <PatternCanvas
              result={result?.result ?? null}
              resultType={result?.resultType ?? params.outputFormat}
              isLoading={isGenerating}
              error={error}
            />

            {/* Action Button */}
            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || (params.type === 'custom' && !params.customPrompt?.trim())}
                className="btn-shimmer flex-1 px-6 py-3.5 text-white rounded-xl font-bold text-base transition-all disabled:opacity-50 active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, var(--color-vermilion), var(--color-vermilion-dark))',
                  boxShadow: '0 4px 14px rgba(229, 77, 66, 0.3)',
                }}
              >
                {isGenerating ? '生成中...' : !user ? '登录后生成' : '生成纹样'}
              </button>
            </div>

            <div className="flex gap-3 items-start">
              <div className="flex-1">
                <DownloadButton
                  result={result?.result ?? null}
                  resultType={result?.resultType ?? 'svg'}
                  width={params.width}
                  height={params.height}
                />
              </div>
              {user && result && (
                <SaveToCloudButton
                  result={result}
                  saving={cloud.saving}
                  onSave={cloud.savePattern}
                />
              )}
            </div>

            {(history.length > 0 || (user && cloud.patterns.length > 0)) && <div className="divider-gold my-6" />}

            <HistoryPanel
              history={history}
              onRestore={handleRestore}
              onClear={clearHistory}
              cloudPatterns={user ? cloud.patterns : []}
              cloudTotal={cloud.total}
              cloudLoading={cloud.loading}
              onLoadMoreCloud={cloud.loadMore}
              onRestoreCloud={cloud.restorePattern}
              onDeleteCloud={cloud.deletePattern}
              isLoggedIn={!!user}
            />
          </div>

          {/* Right - Control Panel */}
          <div className="lg:col-span-4">
            <ControlPanel params={params} onUpdate={updateParams} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative mt-auto">
        <div className="divider-gold" />
        <div className="py-6 text-center">
          <div className="flex items-center justify-center gap-3 text-xs text-[var(--color-ink-lighter)]">
            <span>中国纹样生成器</span>
            <span className="text-[var(--color-gold)]">◇</span>
            <span>传承东方美学</span>
          </div>
          <p className="text-[10px] text-[var(--color-ink-lighter)] opacity-50 mt-1">
            探索传统纹饰 · 生成无限可能
          </p>
        </div>
      </footer>

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={login}
        onRegister={register}
      />
    </div>
  );
}
```

**注意：** 此步骤依赖 Task 13（AuthContext 暴露 token），确保该步骤已完成。

- [ ] **Step 2: 提交**

```bash
git add app/page.tsx
git commit -m "feat: 主页面集成异步 AI 生成 + 未登录引导"
```

---

### Task 19: 删除旧文件

**Files:**
- Delete: `generators/cloud.ts`, `generators/meander.ts`, `generators/floral.ts`, `generators/geometric.ts`, `generators/dragon.ts`, `generators/index.ts`, `lib/random.ts`
- Delete: `generators/__tests__/` 下所有文件
- Delete: `lib/__tests__/svg-utils.test.ts`

- [ ] **Step 1: 删除旧生成器文件和测试**

```bash
git rm generators/cloud.ts generators/meander.ts generators/floral.ts generators/geometric.ts generators/dragon.ts generators/index.ts
git rm lib/random.ts
git rm -r generators/__tests__/ 2>/dev/null || true
git rm lib/__tests__/svg-utils.test.ts 2>/dev/null || true
```

- [ ] **Step 2: 提交**

```bash
git commit -m "chore: 删除旧的前端生成器算法和相关测试"
```

---

### Task 20: 编译验证和修复

- [ ] **Step 1: 运行 TypeScript 编译检查**

运行: `npx tsc --noEmit`

检查是否有编译错误。常见需要修复的问题：
- `SaveToCloudButton` 的 `result` prop 类型不匹配（旧 PatternResult 有 `svg` 字段，新的改为 `result`）
- `useCloudPatterns` 中引用了旧的 `PatternResult.svg`
- `AuthContext` 未暴露 `token`

逐一修复所有编译错误。

- [ ] **Step 2: 运行项目验证**

运行: `npm run build`
预期: 构建成功

- [ ] **Step 3: 提交修复**

```bash
git add -A
git commit -m "fix: 修复类型变更导致的编译错误"
```

---

### Task 21: 在 globals.css 中添加 spin 动画

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: 检查是否已有 spin 动画定义**

运行: `grep -n 'spin' app/globals.css`

如果没有，在 globals.css 的 `@keyframes` 区域添加：

```css
@keyframes spin {
  to { transform: rotate(360deg); }
}
```

- [ ] **Step 2: 提交（如有变更）**

```bash
git add app/globals.css
git commit -m "style: 添加 spin 加载动画"
```
