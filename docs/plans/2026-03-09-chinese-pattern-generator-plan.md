# 中国纹样生成器 - 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建一个基于 Next.js 的中国传统纹样生成器 Web 应用，支持算法生成 SVG 纹样、参数调控、无缝平铺、下载导出和历史记录。

**Architecture:** 模板化 SVG 生成器架构。每种纹样类型有独立生成器模块，接收统一参数接口输出 SVG。前端使用 Next.js App Router + TailwindCSS，状态通过 React Hooks 管理，历史记录存储在 localStorage。

**Tech Stack:** Next.js 15, TailwindCSS 4, TypeScript, Vitest, React Hooks

---

## Task 1: 项目脚手架搭建

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `vitest.config.ts`
- Create: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`

**Step 1: 使用 create-next-app 初始化项目**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src=no --import-alias="@/*" --use-npm
```

在项目根目录执行。选项说明：TypeScript、TailwindCSS、ESLint、App Router、不使用 src 目录、使用 `@/*` 作为导入别名、npm 包管理。

**Step 2: 安装测试依赖**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```

**Step 3: 配置 Vitest**

创建 `vitest.config.ts`：

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: [],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

**Step 4: 验证项目能正常启动**

```bash
npm run dev
```

访问 http://localhost:3000 确认能看到 Next.js 默认页面。停止 dev server。

**Step 5: 清理默认内容，设置基础布局**

`app/globals.css` - 只保留 Tailwind 指令，添加中式配色 CSS 变量：

```css
@import "tailwindcss";

:root {
  --color-vermilion: #e54d42;
  --color-gold: #c5a572;
  --color-ink: #2c2c2c;
  --color-paper: #f5f0e8;
  --color-jade: #5b8c5a;
}
```

`app/layout.tsx` - 基础根布局：

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '中国纹样生成器',
  description: '生成中国传统纹样 - 祥云纹、回纹、花纹、几何纹',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-[var(--color-paper)] text-[var(--color-ink)] min-h-screen">
        {children}
      </body>
    </html>
  );
}
```

`app/page.tsx` - 占位首页：

```tsx
export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen">
      <h1 className="text-3xl font-serif">中国纹样生成器</h1>
    </main>
  );
}
```

**Step 6: 运行确认一切正常**

```bash
npm run build
```

确认构建无报错。

**Step 7: 提交**

```bash
git init
git add .
git commit -m "feat: 初始化 Next.js 项目脚手架"
```

---

## Task 2: 核心类型定义与随机数工具

**Files:**
- Create: `generators/types.ts`
- Create: `lib/random.ts`
- Create: `lib/__tests__/random.test.ts`

**Step 1: 编写随机数生成器测试**

`lib/__tests__/random.test.ts`：

```typescript
import { describe, it, expect } from 'vitest';
import { SeededRandom } from '../random';

describe('SeededRandom', () => {
  it('相同种子产生相同序列', () => {
    const rng1 = new SeededRandom(42);
    const rng2 = new SeededRandom(42);
    const seq1 = Array.from({ length: 10 }, () => rng1.next());
    const seq2 = Array.from({ length: 10 }, () => rng2.next());
    expect(seq1).toEqual(seq2);
  });

  it('不同种子产生不同序列', () => {
    const rng1 = new SeededRandom(42);
    const rng2 = new SeededRandom(99);
    const val1 = rng1.next();
    const val2 = rng2.next();
    expect(val1).not.toEqual(val2);
  });

  it('range 返回指定范围内的值', () => {
    const rng = new SeededRandom(42);
    for (let i = 0; i < 100; i++) {
      const val = rng.range(5, 10);
      expect(val).toBeGreaterThanOrEqual(5);
      expect(val).toBeLessThan(10);
    }
  });

  it('next 返回 0-1 之间的值', () => {
    const rng = new SeededRandom(42);
    for (let i = 0; i < 100; i++) {
      const val = rng.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });
});
```

**Step 2: 运行测试确认失败**

```bash
npx vitest run lib/__tests__/random.test.ts
```

预期：FAIL - 找不到模块 `../random`

**Step 3: 实现 SeededRandom**

`lib/random.ts`：

```typescript
export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed;
  }

  next(): number {
    this.state = (this.state * 1664525 + 1013904223) & 0xffffffff;
    return (this.state >>> 0) / 0xffffffff;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  int(min: number, max: number): number {
    return Math.floor(this.range(min, max));
  }

  pick<T>(arr: T[]): T {
    return arr[this.int(0, arr.length)];
  }
}
```

**Step 4: 运行测试确认通过**

```bash
npx vitest run lib/__tests__/random.test.ts
```

预期：全部 PASS

**Step 5: 编写核心类型定义**

`generators/types.ts`：

```typescript
export type PatternType = 'cloud' | 'meander' | 'floral' | 'geometric' | 'dragon';

export type SymmetryMode = 'none' | 'horizontal' | 'vertical' | 'radial' | 'full';

export type OutputMode = 'single' | 'seamless';

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
  tileSize: number;
  width: number;
  height: number;
  seed: number;
}

export interface PatternResult {
  svg: string;
  params: PatternParams;
  timestamp: number;
}

export type PatternGenerator = (params: PatternParams) => string;

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
  tileSize: 200,
  width: 800,
  height: 600,
  seed: Date.now(),
};
```

**Step 6: 提交**

```bash
git add generators/types.ts lib/random.ts lib/__tests__/random.test.ts
git commit -m "feat: 添加核心类型定义和随机数生成器"
```

---

## Task 3: SVG 工具函数

**Files:**
- Create: `lib/svg-utils.ts`
- Create: `lib/__tests__/svg-utils.test.ts`

**Step 1: 编写 SVG 工具测试**

`lib/__tests__/svg-utils.test.ts`：

```typescript
import { describe, it, expect } from 'vitest';
import {
  createSvgRoot,
  createPath,
  createCircle,
  createGroup,
  wrapInPattern,
  applySymmetry,
} from '../svg-utils';

describe('SVG Utils', () => {
  describe('createSvgRoot', () => {
    it('生成有效的 SVG 根元素', () => {
      const svg = createSvgRoot(800, 600, '#ffffff', '<rect/>');
      expect(svg).toContain('<svg');
      expect(svg).toContain('width="800"');
      expect(svg).toContain('height="600"');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('<rect/>');
    });
  });

  describe('createPath', () => {
    it('生成 path 元素', () => {
      const path = createPath('M0 0 L10 10', '#ff0000', 2);
      expect(path).toContain('<path');
      expect(path).toContain('d="M0 0 L10 10"');
      expect(path).toContain('stroke="#ff0000"');
      expect(path).toContain('stroke-width="2"');
    });

    it('支持填充', () => {
      const path = createPath('M0 0 L10 10 Z', '#ff0000', 2, '#00ff00');
      expect(path).toContain('fill="#00ff00"');
    });
  });

  describe('createCircle', () => {
    it('生成 circle 元素', () => {
      const circle = createCircle(50, 50, 25, '#ff0000');
      expect(circle).toContain('<circle');
      expect(circle).toContain('cx="50"');
      expect(circle).toContain('r="25"');
    });
  });

  describe('createGroup', () => {
    it('生成带 transform 的 group', () => {
      const g = createGroup('<rect/>', 'translate(10, 20)');
      expect(g).toContain('<g');
      expect(g).toContain('transform="translate(10, 20)"');
      expect(g).toContain('<rect/>');
    });
  });

  describe('wrapInPattern', () => {
    it('生成 SVG pattern 元素 + 填充矩形', () => {
      const result = wrapInPattern('pattern-1', 100, 100, '<rect/>', 800, 600);
      expect(result).toContain('<pattern');
      expect(result).toContain('id="pattern-1"');
      expect(result).toContain('width="100"');
      expect(result).toContain('height="100"');
      expect(result).toContain('fill="url(#pattern-1)"');
    });
  });

  describe('applySymmetry', () => {
    it('horizontal 对称产生两组', () => {
      const result = applySymmetry('<path d="M0 0"/>', 'horizontal', 800, 600);
      expect(result).toContain('scale(-1, 1)');
    });

    it('none 返回原始内容', () => {
      const content = '<path d="M0 0"/>';
      const result = applySymmetry(content, 'none', 800, 600);
      expect(result).toBe(content);
    });
  });
});
```

**Step 2: 运行测试确认失败**

```bash
npx vitest run lib/__tests__/svg-utils.test.ts
```

预期：FAIL

**Step 3: 实现 SVG 工具函数**

`lib/svg-utils.ts`：

```typescript
import type { SymmetryMode } from '@/generators/types';

export function createSvgRoot(
  width: number,
  height: number,
  background: string,
  content: string
): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${background}"/>
  ${content}
</svg>`;
}

export function createPath(
  d: string,
  stroke: string,
  strokeWidth: number,
  fill: string = 'none'
): string {
  return `<path d="${d}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

export function createCircle(
  cx: number,
  cy: number,
  r: number,
  fill: string,
  stroke: string = 'none',
  strokeWidth: number = 0
): string {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
}

export function createGroup(content: string, transform?: string): string {
  const attr = transform ? ` transform="${transform}"` : '';
  return `<g${attr}>${content}</g>`;
}

export function wrapInPattern(
  id: string,
  tileWidth: number,
  tileHeight: number,
  tileContent: string,
  canvasWidth: number,
  canvasHeight: number
): string {
  return `<defs>
    <pattern id="${id}" x="0" y="0" width="${tileWidth}" height="${tileHeight}" patternUnits="userSpaceOnUse">
      ${tileContent}
    </pattern>
  </defs>
  <rect width="${canvasWidth}" height="${canvasHeight}" fill="url(#${id})"/>`;
}

export function applySymmetry(
  content: string,
  symmetry: SymmetryMode,
  width: number,
  height: number
): string {
  if (symmetry === 'none') return content;

  const halfW = width / 2;
  const halfH = height / 2;

  switch (symmetry) {
    case 'horizontal':
      return `${content}
        <g transform="translate(${width}, 0) scale(-1, 1)">${content}</g>`;
    case 'vertical':
      return `${content}
        <g transform="translate(0, ${height}) scale(1, -1)">${content}</g>`;
    case 'radial':
      return Array.from({ length: 4 }, (_, i) =>
        `<g transform="rotate(${i * 90}, ${halfW}, ${halfH})">${content}</g>`
      ).join('\n');
    case 'full':
      return `${content}
        <g transform="translate(${width}, 0) scale(-1, 1)">${content}</g>
        <g transform="translate(0, ${height}) scale(1, -1)">${content}</g>
        <g transform="translate(${width}, ${height}) scale(-1, -1)">${content}</g>`;
    default:
      return content;
  }
}
```

**Step 4: 运行测试确认通过**

```bash
npx vitest run lib/__tests__/svg-utils.test.ts
```

预期：全部 PASS

**Step 5: 提交**

```bash
git add lib/svg-utils.ts lib/__tests__/svg-utils.test.ts
git commit -m "feat: 添加 SVG 工具函数"
```

---

## Task 4: 祥云纹生成器

**Files:**
- Create: `generators/cloud.ts`
- Create: `generators/__tests__/cloud.test.ts`

**Step 1: 编写祥云纹生成器测试**

`generators/__tests__/cloud.test.ts`：

```typescript
import { describe, it, expect } from 'vitest';
import { generateCloud } from '../cloud';
import { DEFAULT_PARAMS } from '../types';
import type { PatternParams } from '../types';

const cloudParams: PatternParams = {
  ...DEFAULT_PARAMS,
  type: 'cloud',
  seed: 42,
};

describe('generateCloud', () => {
  it('返回有效的 SVG 字符串', () => {
    const svg = generateCloud(cloudParams);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('包含 path 元素（云纹曲线）', () => {
    const svg = generateCloud(cloudParams);
    expect(svg).toContain('<path');
  });

  it('使用指定的主色调', () => {
    const svg = generateCloud(cloudParams);
    expect(svg).toContain(cloudParams.color.primary);
  });

  it('使用指定的背景色', () => {
    const svg = generateCloud(cloudParams);
    expect(svg).toContain(cloudParams.color.background);
  });

  it('相同种子产生相同输出', () => {
    const svg1 = generateCloud(cloudParams);
    const svg2 = generateCloud(cloudParams);
    expect(svg1).toEqual(svg2);
  });

  it('不同种子产生不同输出', () => {
    const svg1 = generateCloud({ ...cloudParams, seed: 42 });
    const svg2 = generateCloud({ ...cloudParams, seed: 99 });
    expect(svg1).not.toEqual(svg2);
  });

  it('seamless 模式包含 pattern 元素', () => {
    const svg = generateCloud({ ...cloudParams, mode: 'seamless' });
    expect(svg).toContain('<pattern');
  });

  it('改变 complexity 影响输出', () => {
    const svg1 = generateCloud({ ...cloudParams, complexity: 2 });
    const svg2 = generateCloud({ ...cloudParams, complexity: 8 });
    expect(svg1).not.toEqual(svg2);
  });
});
```

**Step 2: 运行测试确认失败**

```bash
npx vitest run generators/__tests__/cloud.test.ts
```

**Step 3: 实现祥云纹生成器**

`generators/cloud.ts`：

算法核心：
1. 使用贝塞尔曲线绘制螺旋云头（多层同心弧线收缩形成漩涡）
2. 云头之间用 S 曲线连接形成云尾
3. `complexity` 控制螺旋层数（2-6层）
4. `density` 控制云头数量
5. 对称处理通过 `applySymmetry` 实现
6. seamless 模式用 `wrapInPattern` 包裹瓦片

```typescript
import type { PatternParams } from './types';
import { SeededRandom } from '@/lib/random';
import { createSvgRoot, createPath, createGroup, wrapInPattern, applySymmetry } from '@/lib/svg-utils';

function drawCloudHead(cx: number, cy: number, size: number, layers: number, color: string, flip: boolean): string {
  const paths: string[] = [];
  const dir = flip ? -1 : 1;

  for (let i = 0; i < layers; i++) {
    const r = size * (1 - i * 0.15);
    const startAngle = Math.PI * 0.8;
    const endAngle = Math.PI * 2.2;
    const steps = 8;

    let d = '';
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const angle = startAngle + (endAngle - startAngle) * t;
      const spiralR = r * (1 - t * 0.4);
      const x = cx + dir * Math.cos(angle) * spiralR;
      const y = cy - Math.sin(angle) * spiralR;
      d += s === 0 ? `M${x.toFixed(1)} ${y.toFixed(1)}` : ` Q${(cx + dir * Math.cos(angle - 0.2) * spiralR * 1.1).toFixed(1)} ${(cy - Math.sin(angle - 0.2) * spiralR * 1.1).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }

    paths.push(createPath(d, color, Math.max(1, 2 - i * 0.3)));
  }

  return paths.join('\n');
}

function drawCloudTail(x1: number, y1: number, x2: number, y2: number, color: string): string {
  const mx = (x1 + x2) / 2;
  const my = Math.min(y1, y2) - Math.abs(x2 - x1) * 0.15;
  const d = `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  return createPath(d, color, 1.5);
}

export function generateCloud(params: PatternParams): string {
  const { color, complexity, density, symmetry, mode, tileSize, width, height, seed } = params;
  const rng = new SeededRandom(seed);

  const layers = Math.max(2, Math.min(6, Math.round(complexity * 0.5 + 1)));
  const count = Math.max(2, Math.min(12, Math.round(density * 1.2)));

  const contentW = mode === 'seamless' ? tileSize : width;
  const contentH = mode === 'seamless' ? tileSize : height;

  const cloudSize = contentW / (count + 1) * 0.4;
  const elements: string[] = [];

  for (let i = 0; i < count; i++) {
    const cx = rng.range(cloudSize, contentW - cloudSize);
    const cy = rng.range(cloudSize, contentH - cloudSize);
    const flip = rng.next() > 0.5;
    const headSize = cloudSize * rng.range(0.7, 1.3);

    elements.push(drawCloudHead(cx, cy, headSize, layers, color.primary, flip));

    if (i > 0) {
      const prevCx = rng.range(cloudSize, contentW - cloudSize);
      const prevCy = rng.range(cloudSize, contentH - cloudSize);
      elements.push(drawCloudTail(prevCx, prevCy, cx, cy, color.secondary));
    }
  }

  let content = elements.join('\n');
  content = applySymmetry(content, symmetry, contentW, contentH);

  if (mode === 'seamless') {
    const patternContent = `<rect width="${contentW}" height="${contentH}" fill="${color.background}"/>\n${content}`;
    const tiled = wrapInPattern('cloud-pattern', contentW, contentH, patternContent, width, height);
    return createSvgRoot(width, height, color.background, tiled);
  }

  return createSvgRoot(width, height, color.background, content);
}
```

**Step 4: 运行测试确认通过**

```bash
npx vitest run generators/__tests__/cloud.test.ts
```

**Step 5: 提交**

```bash
git add generators/cloud.ts generators/__tests__/cloud.test.ts
git commit -m "feat: 添加祥云纹生成器"
```

---

## Task 5: 回纹生成器

**Files:**
- Create: `generators/meander.ts`
- Create: `generators/__tests__/meander.test.ts`

**Step 1: 编写回纹生成器测试**

`generators/__tests__/meander.test.ts`：

```typescript
import { describe, it, expect } from 'vitest';
import { generateMeander } from '../meander';
import { DEFAULT_PARAMS } from '../types';
import type { PatternParams } from '../types';

const meanderParams: PatternParams = {
  ...DEFAULT_PARAMS,
  type: 'meander',
  seed: 42,
};

describe('generateMeander', () => {
  it('返回有效的 SVG 字符串', () => {
    const svg = generateMeander(meanderParams);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('包含 path 元素（回纹线条）', () => {
    const svg = generateMeander(meanderParams);
    expect(svg).toContain('<path');
  });

  it('使用指定颜色', () => {
    const svg = generateMeander(meanderParams);
    expect(svg).toContain(meanderParams.color.primary);
  });

  it('seamless 模式包含 pattern 元素', () => {
    const svg = generateMeander({ ...meanderParams, mode: 'seamless' });
    expect(svg).toContain('<pattern');
  });

  it('相同种子产生相同输出', () => {
    const svg1 = generateMeander(meanderParams);
    const svg2 = generateMeander(meanderParams);
    expect(svg1).toEqual(svg2);
  });

  it('改变 density 影响输出', () => {
    const svg1 = generateMeander({ ...meanderParams, density: 2 });
    const svg2 = generateMeander({ ...meanderParams, density: 8 });
    expect(svg1).not.toEqual(svg2);
  });
});
```

**Step 2: 运行测试确认失败**

```bash
npx vitest run generators/__tests__/meander.test.ts
```

**Step 3: 实现回纹生成器**

`generators/meander.ts`：

算法核心：
1. 回纹由直角螺旋组成，每个单元是一个方形内的螺旋路径
2. `complexity` 控制螺旋深度（回旋次数）
3. `density` 控制单元尺寸/间距
4. 多个单元沿网格排列形成连续回纹带

```typescript
import type { PatternParams } from './types';
import { SeededRandom } from '@/lib/random';
import { createSvgRoot, createPath, wrapInPattern, applySymmetry } from '@/lib/svg-utils';

function drawMeanderUnit(x: number, y: number, size: number, depth: number, color: string, strokeWidth: number): string {
  const paths: string[] = [];
  let d = `M${x} ${y}`;

  let cx = x;
  let cy = y;
  const step = size / (depth * 2 + 1);

  const directions = [
    [0, 1],   // 下
    [1, 0],   // 右
    [0, -1],  // 上
    [-1, 0],  // 左
  ];

  for (let i = 0; i < depth; i++) {
    const len = size - i * step * 2;

    // 向下
    cy += len;
    d += ` L${cx.toFixed(1)} ${cy.toFixed(1)}`;
    // 向右
    cx += len;
    d += ` L${cx.toFixed(1)} ${cy.toFixed(1)}`;
    // 向上
    cy -= len - step;
    d += ` L${cx.toFixed(1)} ${cy.toFixed(1)}`;
    // 向左
    cx -= len - step;
    d += ` L${cx.toFixed(1)} ${cy.toFixed(1)}`;
  }

  paths.push(createPath(d, color, strokeWidth));
  return paths.join('\n');
}

export function generateMeander(params: PatternParams): string {
  const { color, complexity, density, symmetry, mode, tileSize, width, height, seed } = params;
  const rng = new SeededRandom(seed);

  const depth = Math.max(1, Math.min(5, Math.round(complexity * 0.4 + 1)));
  const unitSize = Math.max(30, Math.min(120, 200 / density));
  const strokeWidth = Math.max(1, 3 - density * 0.2);

  const contentW = mode === 'seamless' ? tileSize : width;
  const contentH = mode === 'seamless' ? tileSize : height;

  const cols = Math.ceil(contentW / unitSize);
  const rows = Math.ceil(contentH / unitSize);

  const elements: string[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * unitSize + unitSize * 0.1;
      const y = row * unitSize + unitSize * 0.1;
      const actualSize = unitSize * 0.8;
      elements.push(drawMeanderUnit(x, y, actualSize, depth, color.primary, strokeWidth));
    }
  }

  // 添加连接线（回纹带）
  for (let row = 0; row < rows; row++) {
    const y = row * unitSize + unitSize * 0.1;
    const d = `M0 ${y.toFixed(1)} L${contentW} ${y.toFixed(1)}`;
    elements.push(createPath(d, color.secondary, strokeWidth * 0.5));
  }

  let content = elements.join('\n');
  content = applySymmetry(content, symmetry, contentW, contentH);

  if (mode === 'seamless') {
    const patternContent = `<rect width="${contentW}" height="${contentH}" fill="${color.background}"/>\n${content}`;
    const tiled = wrapInPattern('meander-pattern', contentW, contentH, patternContent, width, height);
    return createSvgRoot(width, height, color.background, tiled);
  }

  return createSvgRoot(width, height, color.background, content);
}
```

**Step 4: 运行测试确认通过**

```bash
npx vitest run generators/__tests__/meander.test.ts
```

**Step 5: 提交**

```bash
git add generators/meander.ts generators/__tests__/meander.test.ts
git commit -m "feat: 添加回纹生成器"
```

---

## Task 6: 花纹生成器

**Files:**
- Create: `generators/floral.ts`
- Create: `generators/__tests__/floral.test.ts`

**Step 1: 编写花纹生成器测试**

`generators/__tests__/floral.test.ts`：

```typescript
import { describe, it, expect } from 'vitest';
import { generateFloral } from '../floral';
import { DEFAULT_PARAMS } from '../types';
import type { PatternParams } from '../types';

const floralParams: PatternParams = {
  ...DEFAULT_PARAMS,
  type: 'floral',
  seed: 42,
};

describe('generateFloral', () => {
  it('返回有效的 SVG 字符串', () => {
    const svg = generateFloral(floralParams);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('包含 path 元素（花瓣）', () => {
    const svg = generateFloral(floralParams);
    expect(svg).toContain('<path');
  });

  it('包含 circle 元素（花心）', () => {
    const svg = generateFloral(floralParams);
    expect(svg).toContain('<circle');
  });

  it('使用指定颜色', () => {
    const svg = generateFloral(floralParams);
    expect(svg).toContain(floralParams.color.primary);
  });

  it('seamless 模式包含 pattern 元素', () => {
    const svg = generateFloral({ ...floralParams, mode: 'seamless' });
    expect(svg).toContain('<pattern');
  });

  it('相同种子产生相同输出', () => {
    const svg1 = generateFloral(floralParams);
    const svg2 = generateFloral(floralParams);
    expect(svg1).toEqual(svg2);
  });
});
```

**Step 2: 运行测试确认失败**

```bash
npx vitest run generators/__tests__/floral.test.ts
```

**Step 3: 实现花纹生成器**

`generators/floral.ts`：

算法核心：
1. 极坐标花瓣生成：以中心点为原点，用 sin/cos 生成花瓣轮廓
2. `complexity` 控制花瓣数（4-12 瓣）和细节层数
3. 花瓣使用三次贝塞尔曲线，外形饱满
4. 花心用圆形 + 放射线装饰

```typescript
import type { PatternParams } from './types';
import { SeededRandom } from '@/lib/random';
import { createSvgRoot, createPath, createCircle, createGroup, wrapInPattern, applySymmetry } from '@/lib/svg-utils';

function drawFlower(cx: number, cy: number, radius: number, petals: number, color: string, secondaryColor: string): string {
  const elements: string[] = [];

  // 花瓣
  for (let i = 0; i < petals; i++) {
    const angle = (Math.PI * 2 * i) / petals;
    const nextAngle = (Math.PI * 2 * (i + 0.5)) / petals;

    const tipX = cx + Math.cos(angle) * radius;
    const tipY = cy + Math.sin(angle) * radius;

    const cp1X = cx + Math.cos(angle - 0.3) * radius * 0.6;
    const cp1Y = cy + Math.sin(angle - 0.3) * radius * 0.6;
    const cp2X = cx + Math.cos(angle + 0.3) * radius * 0.6;
    const cp2Y = cy + Math.sin(angle + 0.3) * radius * 0.6;

    const d = `M${cx.toFixed(1)} ${cy.toFixed(1)} C${cp1X.toFixed(1)} ${cp1Y.toFixed(1)} ${(tipX - Math.cos(angle + 0.2) * radius * 0.2).toFixed(1)} ${(tipY - Math.sin(angle + 0.2) * radius * 0.2).toFixed(1)} ${tipX.toFixed(1)} ${tipY.toFixed(1)} C${(tipX + Math.cos(angle - 0.2) * radius * 0.2).toFixed(1)} ${(tipY + Math.sin(angle - 0.2) * radius * 0.2).toFixed(1)} ${cp2X.toFixed(1)} ${cp2Y.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)} Z`;

    elements.push(createPath(d, secondaryColor, 1, color));
  }

  // 花心
  elements.push(createCircle(cx, cy, radius * 0.2, secondaryColor));
  elements.push(createCircle(cx, cy, radius * 0.1, color));

  return elements.join('\n');
}

export function generateFloral(params: PatternParams): string {
  const { color, complexity, density, symmetry, mode, tileSize, width, height, seed } = params;
  const rng = new SeededRandom(seed);

  const petals = Math.max(4, Math.min(12, Math.round(complexity * 0.8 + 3)));
  const count = Math.max(1, Math.min(8, Math.round(density * 0.8)));

  const contentW = mode === 'seamless' ? tileSize : width;
  const contentH = mode === 'seamless' ? tileSize : height;

  const flowerRadius = Math.min(contentW, contentH) / (count + 1) * 0.35;
  const elements: string[] = [];

  for (let i = 0; i < count; i++) {
    const cx = rng.range(flowerRadius, contentW - flowerRadius);
    const cy = rng.range(flowerRadius, contentH - flowerRadius);
    const r = flowerRadius * rng.range(0.6, 1.2);
    const p = petals + rng.int(-1, 2);

    elements.push(drawFlower(cx, cy, r, p, color.primary, color.secondary));
  }

  let content = elements.join('\n');
  content = applySymmetry(content, symmetry, contentW, contentH);

  if (mode === 'seamless') {
    const patternContent = `<rect width="${contentW}" height="${contentH}" fill="${color.background}"/>\n${content}`;
    const tiled = wrapInPattern('floral-pattern', contentW, contentH, patternContent, width, height);
    return createSvgRoot(width, height, color.background, tiled);
  }

  return createSvgRoot(width, height, color.background, content);
}
```

**Step 4: 运行测试确认通过**

```bash
npx vitest run generators/__tests__/floral.test.ts
```

**Step 5: 提交**

```bash
git add generators/floral.ts generators/__tests__/floral.test.ts
git commit -m "feat: 添加花纹生成器"
```

---

## Task 7: 几何纹生成器

**Files:**
- Create: `generators/geometric.ts`
- Create: `generators/__tests__/geometric.test.ts`

**Step 1: 编写几何纹生成器测试**

`generators/__tests__/geometric.test.ts`：

```typescript
import { describe, it, expect } from 'vitest';
import { generateGeometric } from '../geometric';
import { DEFAULT_PARAMS } from '../types';
import type { PatternParams } from '../types';

const geoParams: PatternParams = {
  ...DEFAULT_PARAMS,
  type: 'geometric',
  seed: 42,
};

describe('generateGeometric', () => {
  it('返回有效的 SVG 字符串', () => {
    const svg = generateGeometric(geoParams);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('包含 path 或 rect 元素', () => {
    const svg = generateGeometric(geoParams);
    const hasPath = svg.includes('<path');
    const hasRect = svg.includes('<rect');
    expect(hasPath || hasRect).toBe(true);
  });

  it('使用指定颜色', () => {
    const svg = generateGeometric(geoParams);
    expect(svg).toContain(geoParams.color.primary);
  });

  it('seamless 模式包含 pattern 元素', () => {
    const svg = generateGeometric({ ...geoParams, mode: 'seamless' });
    expect(svg).toContain('<pattern');
  });

  it('相同种子产生相同输出', () => {
    const svg1 = generateGeometric(geoParams);
    const svg2 = generateGeometric(geoParams);
    expect(svg1).toEqual(svg2);
  });

  it('改变 complexity 影响输出', () => {
    const svg1 = generateGeometric({ ...geoParams, complexity: 2 });
    const svg2 = generateGeometric({ ...geoParams, complexity: 8 });
    expect(svg1).not.toEqual(svg2);
  });
});
```

**Step 2: 运行测试确认失败**

```bash
npx vitest run generators/__tests__/geometric.test.ts
```

**Step 3: 实现几何纹生成器**

`generators/geometric.ts`：

算法核心：
1. 根据 complexity 选择子类型：低=菱形网格，中=万字纹，高=六边形+冰裂纹
2. 网格平铺算法，天然适合 seamless 模式
3. `density` 控制网格细度

```typescript
import type { PatternParams } from './types';
import { SeededRandom } from '@/lib/random';
import { createSvgRoot, createPath, wrapInPattern, applySymmetry } from '@/lib/svg-utils';

function drawDiamond(cx: number, cy: number, size: number, color: string, strokeWidth: number): string {
  const d = `M${cx} ${(cy - size).toFixed(1)} L${(cx + size).toFixed(1)} ${cy} L${cx} ${(cy + size).toFixed(1)} L${(cx - size).toFixed(1)} ${cy} Z`;
  return createPath(d, color, strokeWidth);
}

function drawWanzi(x: number, y: number, size: number, color: string, strokeWidth: number): string {
  const s = size;
  const paths: string[] = [];
  // 万字纹 - 中心十字 + 四个直角折
  const cx = x + s / 2;
  const cy = y + s / 2;
  const arm = s * 0.35;
  const hook = s * 0.2;

  // 十字
  paths.push(createPath(`M${cx - arm} ${cy} L${cx + arm} ${cy}`, color, strokeWidth));
  paths.push(createPath(`M${cx} ${cy - arm} L${cx} ${cy + arm}`, color, strokeWidth));

  // 四个钩
  paths.push(createPath(`M${cx + arm} ${cy} L${cx + arm} ${cy - hook}`, color, strokeWidth));
  paths.push(createPath(`M${cx - arm} ${cy} L${cx - arm} ${cy + hook}`, color, strokeWidth));
  paths.push(createPath(`M${cx} ${cy - arm} L${cx - hook} ${cy - arm}`, color, strokeWidth));
  paths.push(createPath(`M${cx} ${cy + arm} L${cx + hook} ${cy + arm}`, color, strokeWidth));

  return paths.join('\n');
}

function drawHexagon(cx: number, cy: number, radius: number, color: string, strokeWidth: number): string {
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    return `${(cx + Math.cos(angle) * radius).toFixed(1)} ${(cy + Math.sin(angle) * radius).toFixed(1)}`;
  });
  const d = `M${points[0]} ${points.slice(1).map(p => `L${p}`).join(' ')} Z`;
  return createPath(d, color, strokeWidth);
}

export function generateGeometric(params: PatternParams): string {
  const { color, complexity, density, symmetry, mode, tileSize, width, height, seed } = params;
  const rng = new SeededRandom(seed);

  const unitSize = Math.max(20, Math.min(80, 150 / density));
  const strokeWidth = Math.max(0.5, 2 - density * 0.15);

  const contentW = mode === 'seamless' ? tileSize : width;
  const contentH = mode === 'seamless' ? tileSize : height;

  const cols = Math.ceil(contentW / unitSize) + 1;
  const rows = Math.ceil(contentH / unitSize) + 1;

  const elements: string[] = [];

  // 根据 complexity 选择图案类型
  const subType = complexity <= 3 ? 'diamond' : complexity <= 6 ? 'wanzi' : 'hexagon';

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * unitSize;
      const y = row * unitSize;

      switch (subType) {
        case 'diamond': {
          const offset = row % 2 === 0 ? 0 : unitSize / 2;
          drawDiamond(x + offset + unitSize / 2, y + unitSize / 2, unitSize * 0.35, color.primary, strokeWidth);
          elements.push(drawDiamond(x + offset + unitSize / 2, y + unitSize / 2, unitSize * 0.35, color.primary, strokeWidth));
          break;
        }
        case 'wanzi':
          elements.push(drawWanzi(x, y, unitSize, color.primary, strokeWidth));
          break;
        case 'hexagon': {
          const offset = row % 2 === 0 ? 0 : unitSize * 0.75;
          elements.push(drawHexagon(x + offset + unitSize / 2, y + unitSize / 2, unitSize * 0.4, color.primary, strokeWidth));
          break;
        }
      }
    }
  }

  let content = elements.join('\n');
  content = applySymmetry(content, symmetry, contentW, contentH);

  if (mode === 'seamless') {
    const patternContent = `<rect width="${contentW}" height="${contentH}" fill="${color.background}"/>\n${content}`;
    const tiled = wrapInPattern('geometric-pattern', contentW, contentH, patternContent, width, height);
    return createSvgRoot(width, height, color.background, tiled);
  }

  return createSvgRoot(width, height, color.background, content);
}
```

**Step 4: 运行测试确认通过**

```bash
npx vitest run generators/__tests__/geometric.test.ts
```

**Step 5: 提交**

```bash
git add generators/geometric.ts generators/__tests__/geometric.test.ts
git commit -m "feat: 添加几何纹生成器"
```

---

## Task 8: 龙纹占位 + 生成器注册表

**Files:**
- Create: `generators/dragon.ts`
- Create: `generators/index.ts`
- Create: `generators/__tests__/index.test.ts`

**Step 1: 编写注册表测试**

`generators/__tests__/index.test.ts`：

```typescript
import { describe, it, expect } from 'vitest';
import { getGenerator, PATTERN_TYPES } from '../index';
import { DEFAULT_PARAMS } from '../types';

describe('Generator Registry', () => {
  it('所有类型都有对应的生成器', () => {
    for (const type of PATTERN_TYPES) {
      const generator = getGenerator(type.id);
      expect(generator).toBeDefined();
    }
  });

  it('每个生成器都能产生有效 SVG', () => {
    for (const type of PATTERN_TYPES) {
      const generator = getGenerator(type.id);
      const svg = generator({ ...DEFAULT_PARAMS, type: type.id, seed: 42 });
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    }
  });

  it('PATTERN_TYPES 包含所有 5 种类型', () => {
    expect(PATTERN_TYPES).toHaveLength(5);
    const ids = PATTERN_TYPES.map(t => t.id);
    expect(ids).toContain('cloud');
    expect(ids).toContain('meander');
    expect(ids).toContain('floral');
    expect(ids).toContain('geometric');
    expect(ids).toContain('dragon');
  });
});
```

**Step 2: 运行测试确认失败**

```bash
npx vitest run generators/__tests__/index.test.ts
```

**Step 3: 实现龙纹占位**

`generators/dragon.ts`：

```typescript
import type { PatternParams } from './types';
import { createSvgRoot, createPath, createCircle } from '@/lib/svg-utils';

export function generateDragon(params: PatternParams): string {
  const { color, width, height } = params;

  // 占位：简化的龙形曲线
  const cx = width / 2;
  const cy = height / 2;
  const size = Math.min(width, height) * 0.35;

  const elements: string[] = [];

  // S形龙身
  const bodyD = `M${cx - size} ${cy}
    C${cx - size * 0.5} ${cy - size * 0.8}
     ${cx + size * 0.5} ${cy + size * 0.8}
     ${cx + size} ${cy}`;
  elements.push(createPath(bodyD, color.primary, 3));

  // 龙头
  elements.push(createCircle(cx + size, cy, size * 0.15, color.primary, color.secondary, 2));

  // 提示文字
  elements.push(
    `<text x="${cx}" y="${height - 30}" text-anchor="middle" fill="${color.secondary}" font-size="14" font-family="serif">龙纹 - AI 生成接口预留</text>`
  );

  return createSvgRoot(width, height, color.background, elements.join('\n'));
}
```

**Step 4: 实现生成器注册表**

`generators/index.ts`：

```typescript
import type { PatternType, PatternGenerator } from './types';
import { generateCloud } from './cloud';
import { generateMeander } from './meander';
import { generateFloral } from './floral';
import { generateGeometric } from './geometric';
import { generateDragon } from './dragon';

export interface PatternTypeInfo {
  id: PatternType;
  name: string;
  description: string;
}

export const PATTERN_TYPES: PatternTypeInfo[] = [
  { id: 'cloud', name: '祥云纹', description: '贝塞尔曲线螺旋云头' },
  { id: 'meander', name: '回纹', description: '直角螺旋连续图案' },
  { id: 'floral', name: '花纹', description: '极坐标花瓣图案' },
  { id: 'geometric', name: '几何纹', description: '菱形/万字纹/六边形' },
  { id: 'dragon', name: '龙纹', description: 'AI 生成（开发中）' },
];

const generators: Record<PatternType, PatternGenerator> = {
  cloud: generateCloud,
  meander: generateMeander,
  floral: generateFloral,
  geometric: generateGeometric,
  dragon: generateDragon,
};

export function getGenerator(type: PatternType): PatternGenerator {
  return generators[type];
}

export function generatePattern(type: PatternType, params: import('./types').PatternParams): string {
  return generators[type](params);
}
```

**Step 5: 运行测试确认通过**

```bash
npx vitest run generators/__tests__/index.test.ts
```

**Step 6: 运行所有测试确认无回归**

```bash
npx vitest run
```

**Step 7: 提交**

```bash
git add generators/dragon.ts generators/index.ts generators/__tests__/index.test.ts
git commit -m "feat: 添加龙纹占位和生成器注册表"
```

---

## Task 9: 导出工具（SVG/PNG 下载）

**Files:**
- Create: `lib/export.ts`
- Create: `lib/__tests__/export.test.ts`

**Step 1: 编写导出工具测试**

`lib/__tests__/export.test.ts`：

```typescript
import { describe, it, expect } from 'vitest';
import { svgToDataUrl, svgToBlob } from '../export';

const testSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="red"/></svg>';

describe('Export Utils', () => {
  describe('svgToDataUrl', () => {
    it('返回 data URL 格式', () => {
      const url = svgToDataUrl(testSvg);
      expect(url).toMatch(/^data:image\/svg\+xml;charset=utf-8,/);
    });

    it('包含 SVG 内容', () => {
      const url = svgToDataUrl(testSvg);
      expect(url).toContain('svg');
    });
  });

  describe('svgToBlob', () => {
    it('返回 SVG Blob', () => {
      const blob = svgToBlob(testSvg);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/svg+xml');
    });
  });
});
```

**Step 2: 运行测试确认失败**

```bash
npx vitest run lib/__tests__/export.test.ts
```

**Step 3: 实现导出工具**

`lib/export.ts`：

```typescript
export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function svgToBlob(svg: string): Blob {
  return new Blob([svg], { type: 'image/svg+xml' });
}

export function downloadSvg(svg: string, filename: string = 'pattern.svg'): void {
  const blob = svgToBlob(svg);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadPng(svg: string, width: number, height: number, filename: string = 'pattern.png'): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    canvas.width = width * 2; // 2x for retina
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob'));
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        resolve();
      }, 'image/png');
    };

    img.onerror = () => reject(new Error('Failed to load SVG image'));
    img.src = svgToDataUrl(svg);
  });
}
```

**Step 4: 运行测试确认通过**

```bash
npx vitest run lib/__tests__/export.test.ts
```

**Step 5: 提交**

```bash
git add lib/export.ts lib/__tests__/export.test.ts
git commit -m "feat: 添加 SVG/PNG 导出工具"
```

---

## Task 10: useHistory Hook

**Files:**
- Create: `hooks/useHistory.ts`
- Create: `hooks/__tests__/useHistory.test.ts`

**Step 1: 编写 useHistory 测试**

`hooks/__tests__/useHistory.test.ts`：

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHistory } from '../useHistory';
import type { PatternResult } from '@/generators/types';
import { DEFAULT_PARAMS } from '@/generators/types';

const mockResult: PatternResult = {
  svg: '<svg></svg>',
  params: { ...DEFAULT_PARAMS, seed: 42 },
  timestamp: Date.now(),
};

describe('useHistory', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('初始状态为空数组', () => {
    const { result } = renderHook(() => useHistory());
    expect(result.current.history).toEqual([]);
  });

  it('addToHistory 添加记录', () => {
    const { result } = renderHook(() => useHistory());
    act(() => {
      result.current.addToHistory(mockResult);
    });
    expect(result.current.history).toHaveLength(1);
  });

  it('最多保存 20 条记录', () => {
    const { result } = renderHook(() => useHistory());
    act(() => {
      for (let i = 0; i < 25; i++) {
        result.current.addToHistory({
          ...mockResult,
          timestamp: Date.now() + i,
        });
      }
    });
    expect(result.current.history).toHaveLength(20);
  });

  it('clearHistory 清除所有记录', () => {
    const { result } = renderHook(() => useHistory());
    act(() => {
      result.current.addToHistory(mockResult);
      result.current.clearHistory();
    });
    expect(result.current.history).toEqual([]);
  });
});
```

**Step 2: 运行测试确认失败**

```bash
npx vitest run hooks/__tests__/useHistory.test.ts
```

**Step 3: 实现 useHistory**

`hooks/useHistory.ts`：

```typescript
'use client';

import { useState, useCallback, useEffect } from 'react';
import type { PatternResult } from '@/generators/types';

const STORAGE_KEY = 'pattern-history';
const MAX_HISTORY = 20;

export function useHistory() {
  const [history, setHistory] = useState<PatternResult[]>([]);

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

  const saveToStorage = useCallback((items: PatternResult[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // 存储失败（空间不足等）
    }
  }, []);

  const addToHistory = useCallback((result: PatternResult) => {
    setHistory((prev) => {
      const next = [result, ...prev].slice(0, MAX_HISTORY);
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { history, addToHistory, clearHistory };
}
```

**Step 4: 运行测试确认通过**

```bash
npx vitest run hooks/__tests__/useHistory.test.ts
```

**Step 5: 提交**

```bash
git add hooks/useHistory.ts hooks/__tests__/useHistory.test.ts
git commit -m "feat: 添加历史记录 Hook"
```

---

## Task 11: usePatternGenerator Hook

**Files:**
- Create: `hooks/usePatternGenerator.ts`

**Step 1: 实现 usePatternGenerator**

`hooks/usePatternGenerator.ts`：

```typescript
'use client';

import { useState, useCallback } from 'react';
import type { PatternParams, PatternResult } from '@/generators/types';
import { DEFAULT_PARAMS } from '@/generators/types';
import { generatePattern } from '@/generators';

export function usePatternGenerator() {
  const [params, setParams] = useState<PatternParams>(DEFAULT_PARAMS);
  const [result, setResult] = useState<PatternResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const updateParams = useCallback((updates: Partial<PatternParams>) => {
    setParams((prev) => ({ ...prev, ...updates }));
  }, []);

  const generate = useCallback(() => {
    setIsGenerating(true);
    try {
      const svg = generatePattern(params.type, params);
      const patternResult: PatternResult = {
        svg,
        params: { ...params },
        timestamp: Date.now(),
      };
      setResult(patternResult);
      return patternResult;
    } finally {
      setIsGenerating(false);
    }
  }, [params]);

  const randomGenerate = useCallback(() => {
    const randomParams = { ...params, seed: Math.floor(Math.random() * 1000000) };
    setParams(randomParams);
    setIsGenerating(true);
    try {
      const svg = generatePattern(randomParams.type, randomParams);
      const patternResult: PatternResult = {
        svg,
        params: randomParams,
        timestamp: Date.now(),
      };
      setResult(patternResult);
      return patternResult;
    } finally {
      setIsGenerating(false);
    }
  }, [params]);

  const restoreFromHistory = useCallback((historyItem: PatternResult) => {
    setParams(historyItem.params);
    setResult(historyItem);
  }, []);

  return {
    params,
    result,
    isGenerating,
    updateParams,
    generate,
    randomGenerate,
    restoreFromHistory,
  };
}
```

**Step 2: 提交**

```bash
git add hooks/usePatternGenerator.ts
git commit -m "feat: 添加纹样生成器 Hook"
```

---

## Task 12: UI 组件 - TypeSelector + ControlPanel

**Files:**
- Create: `components/TypeSelector.tsx`
- Create: `components/ControlPanel.tsx`

**Step 1: 实现 TypeSelector**

`components/TypeSelector.tsx`：

```tsx
'use client';

import { PATTERN_TYPES } from '@/generators';
import type { PatternType } from '@/generators/types';

interface TypeSelectorProps {
  selected: PatternType;
  onChange: (type: PatternType) => void;
}

export function TypeSelector({ selected, onChange }: TypeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[var(--color-ink)]">纹样类型</label>
      <div className="grid grid-cols-2 gap-2">
        {PATTERN_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => onChange(type.id)}
            className={`px-3 py-2 rounded-lg text-sm border transition-all ${
              selected === type.id
                ? 'border-[var(--color-vermilion)] bg-[var(--color-vermilion)] text-white'
                : 'border-gray-300 hover:border-[var(--color-gold)] bg-white'
            }`}
          >
            <div className="font-medium">{type.name}</div>
            <div className="text-xs opacity-70">{type.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: 实现 ControlPanel**

`components/ControlPanel.tsx`：

```tsx
'use client';

import type { PatternParams, SymmetryMode, OutputMode } from '@/generators/types';
import { TypeSelector } from './TypeSelector';

interface ControlPanelProps {
  params: PatternParams;
  onUpdate: (updates: Partial<PatternParams>) => void;
}

const SYMMETRY_OPTIONS: { value: SymmetryMode; label: string }[] = [
  { value: 'none', label: '无' },
  { value: 'horizontal', label: '水平' },
  { value: 'vertical', label: '垂直' },
  { value: 'radial', label: '径向' },
  { value: 'full', label: '完全' },
];

export function ControlPanel({ params, onUpdate }: ControlPanelProps) {
  return (
    <div className="space-y-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
      <TypeSelector
        selected={params.type}
        onChange={(type) => onUpdate({ type })}
      />

      {/* 输出模式 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">输出模式</label>
        <div className="flex gap-2">
          {(['single', 'seamless'] as OutputMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onUpdate({ mode })}
              className={`flex-1 px-3 py-2 rounded-lg text-sm border transition-all ${
                params.mode === mode
                  ? 'border-[var(--color-vermilion)] bg-[var(--color-vermilion)] text-white'
                  : 'border-gray-300 hover:border-[var(--color-gold)] bg-white'
              }`}
            >
              {mode === 'single' ? '单个纹样' : '无缝平铺'}
            </button>
          ))}
        </div>
      </div>

      {/* 颜色选择 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">颜色</label>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-500">主色</label>
            <input
              type="color"
              value={params.color.primary}
              onChange={(e) => onUpdate({ color: { ...params.color, primary: e.target.value } })}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">辅色</label>
            <input
              type="color"
              value={params.color.secondary}
              onChange={(e) => onUpdate({ color: { ...params.color, secondary: e.target.value } })}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">背景色</label>
            <input
              type="color"
              value={params.color.background}
              onChange={(e) => onUpdate({ color: { ...params.color, background: e.target.value } })}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 复杂度 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          复杂度 <span className="text-[var(--color-vermilion)]">{params.complexity}</span>
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={params.complexity}
          onChange={(e) => onUpdate({ complexity: Number(e.target.value) })}
          className="w-full accent-[var(--color-vermilion)]"
        />
      </div>

      {/* 密度 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          密度 <span className="text-[var(--color-vermilion)]">{params.density}</span>
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={params.density}
          onChange={(e) => onUpdate({ density: Number(e.target.value) })}
          className="w-full accent-[var(--color-vermilion)]"
        />
      </div>

      {/* 对称方式 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">对称方式</label>
        <div className="flex flex-wrap gap-2">
          {SYMMETRY_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onUpdate({ symmetry: value })}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                params.symmetry === value
                  ? 'border-[var(--color-vermilion)] bg-[var(--color-vermilion)] text-white'
                  : 'border-gray-300 hover:border-[var(--color-gold)] bg-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Step 3: 提交**

```bash
git add components/TypeSelector.tsx components/ControlPanel.tsx
git commit -m "feat: 添加类型选择器和控制面板组件"
```

---

## Task 13: UI 组件 - PatternCanvas + DownloadButton

**Files:**
- Create: `components/PatternCanvas.tsx`
- Create: `components/DownloadButton.tsx`

**Step 1: 实现 PatternCanvas**

`components/PatternCanvas.tsx`：

```tsx
'use client';

interface PatternCanvasProps {
  svg: string | null;
}

export function PatternCanvas({ svg }: PatternCanvasProps) {
  return (
    <div className="relative bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden" style={{ minHeight: '400px' }}>
      {svg ? (
        <div
          className="w-full h-full flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="flex items-center justify-center h-full min-h-[400px] text-gray-400">
          <div className="text-center">
            <div className="text-4xl mb-2">云</div>
            <p className="text-sm">选择纹样类型并点击生成</p>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 2: 实现 DownloadButton**

`components/DownloadButton.tsx`：

```tsx
'use client';

import { useState } from 'react';
import { downloadSvg, downloadPng } from '@/lib/export';

interface DownloadButtonProps {
  svg: string | null;
  width: number;
  height: number;
}

export function DownloadButton({ svg, width, height }: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadSvg = () => {
    if (!svg) return;
    downloadSvg(svg, `pattern-${Date.now()}.svg`);
  };

  const handleDownloadPng = async () => {
    if (!svg) return;
    setDownloading(true);
    try {
      await downloadPng(svg, width, height, `pattern-${Date.now()}.png`);
    } catch (err) {
      console.error('PNG 导出失败:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleDownloadSvg}
        disabled={!svg}
        className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:border-[var(--color-gold)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        下载 SVG
      </button>
      <button
        onClick={handleDownloadPng}
        disabled={!svg || downloading}
        className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:border-[var(--color-gold)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {downloading ? '导出中...' : '下载 PNG'}
      </button>
    </div>
  );
}
```

**Step 3: 提交**

```bash
git add components/PatternCanvas.tsx components/DownloadButton.tsx
git commit -m "feat: 添加纹样画布和下载按钮组件"
```

---

## Task 14: UI 组件 - HistoryPanel

**Files:**
- Create: `components/HistoryPanel.tsx`

**Step 1: 实现 HistoryPanel**

`components/HistoryPanel.tsx`：

```tsx
'use client';

import type { PatternResult } from '@/generators/types';

interface HistoryPanelProps {
  history: PatternResult[];
  onRestore: (item: PatternResult) => void;
  onClear: () => void;
}

export function HistoryPanel({ history, onRestore, onClear }: HistoryPanelProps) {
  if (history.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[var(--color-ink)]">历史记录</h3>
        <button
          onClick={onClear}
          className="text-xs text-gray-400 hover:text-[var(--color-vermilion)] transition-colors"
        >
          清除全部
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {history.map((item, index) => (
          <button
            key={item.timestamp}
            onClick={() => onRestore(item)}
            className="flex-shrink-0 w-20 h-20 rounded-lg border border-gray-200 overflow-hidden hover:border-[var(--color-gold)] transition-all hover:shadow-md"
            title={`${new Date(item.timestamp).toLocaleTimeString()} - ${item.params.type}`}
          >
            <div
              className="w-full h-full"
              dangerouslySetInnerHTML={{ __html: item.svg.replace(/width="\d+"/, 'width="80"').replace(/height="\d+"/, 'height="80"') }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: 提交**

```bash
git add components/HistoryPanel.tsx
git commit -m "feat: 添加历史记录面板组件"
```

---

## Task 15: 首页组装

**Files:**
- Modify: `app/page.tsx`

**Step 1: 组装首页**

`app/page.tsx` - 完整替换：

```tsx
'use client';

import { PatternCanvas } from '@/components/PatternCanvas';
import { ControlPanel } from '@/components/ControlPanel';
import { DownloadButton } from '@/components/DownloadButton';
import { HistoryPanel } from '@/components/HistoryPanel';
import { usePatternGenerator } from '@/hooks/usePatternGenerator';
import { useHistory } from '@/hooks/useHistory';

export default function Home() {
  const { params, result, isGenerating, updateParams, generate, randomGenerate, restoreFromHistory } = usePatternGenerator();
  const { history, addToHistory, clearHistory } = useHistory();

  const handleGenerate = () => {
    const res = generate();
    if (res) addToHistory(res);
  };

  const handleRandom = () => {
    const res = randomGenerate();
    if (res) addToHistory(res);
  };

  const handleRestore = (item: typeof history[number]) => {
    restoreFromHistory(item);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-[var(--color-vermilion)] rounded-lg flex items-center justify-center text-white font-serif text-lg">
            纹
          </div>
          <h1 className="text-xl font-serif font-bold text-[var(--color-ink)]">中国纹样生成器</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Canvas Area */}
          <div className="lg:col-span-2 space-y-4">
            <PatternCanvas svg={result?.svg ?? null} />

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-1 px-6 py-3 bg-[var(--color-vermilion)] text-white rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50"
              >
                {isGenerating ? '生成中...' : '生成纹样'}
              </button>
              <button
                onClick={handleRandom}
                disabled={isGenerating}
                className="px-6 py-3 border border-[var(--color-gold)] text-[var(--color-gold)] rounded-lg font-medium hover:bg-[var(--color-gold)] hover:text-white transition-all disabled:opacity-50"
              >
                随机生成
              </button>
            </div>

            <DownloadButton
              svg={result?.svg ?? null}
              width={params.width}
              height={params.height}
            />
          </div>

          {/* Right - Control Panel */}
          <div className="lg:col-span-1">
            <ControlPanel params={params} onUpdate={updateParams} />
          </div>
        </div>

        {/* History */}
        <div className="mt-8">
          <HistoryPanel
            history={history}
            onRestore={handleRestore}
            onClear={clearHistory}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        中国纹样生成器 - 传承东方美学
      </footer>
    </div>
  );
}
```

**Step 2: 运行构建确认无错误**

```bash
npm run build
```

**Step 3: 启动开发服务器，手动测试基础功能**

```bash
npm run dev
```

确认：
- 页面正常渲染
- 可以选择纹样类型
- 点击生成能产出 SVG
- 控制面板参数可调
- 下载按钮可用
- 历史记录显示

**Step 4: 提交**

```bash
git add app/page.tsx
git commit -m "feat: 组装首页，完成核心功能集成"
```

---

## Task 16: 全局样式与中式风格打磨

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

**Step 1: 完善全局样式**

在 `app/globals.css` 中添加中式风格装饰类：

```css
@import "tailwindcss";

:root {
  --color-vermilion: #e54d42;
  --color-gold: #c5a572;
  --color-ink: #2c2c2c;
  --color-paper: #f5f0e8;
  --color-jade: #5b8c5a;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--color-gold);
  border-radius: 3px;
}

/* Range slider 自定义 */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-vermilion);
  cursor: pointer;
}
```

**Step 2: 在 layout.tsx 中添加 Google Fonts 字体（可选衬线中文字体）**

在 `app/layout.tsx` 中导入 Noto Serif SC 字体：

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '中国纹样生成器',
  description: '生成中国传统纹样 - 祥云纹、回纹、花纹、几何纹',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[var(--color-paper)] text-[var(--color-ink)] min-h-screen" style={{ fontFamily: "'Noto Serif SC', serif" }}>
        {children}
      </body>
    </html>
  );
}
```

> 注意：Google Fonts 在中国大陆访问可能不稳定。如需要，可替换为本地字体或使用 `fonts.googleapis.cn` 镜像。

**Step 3: 运行全部测试确认无回归**

```bash
npx vitest run
```

**Step 4: 构建确认**

```bash
npm run build
```

**Step 5: 提交**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: 添加中式风格全局样式"
```

---

## 完成后检查清单

- [ ] 所有测试通过 (`npx vitest run`)
- [ ] 构建成功 (`npm run build`)
- [ ] 5 种纹样类型都能生成
- [ ] 参数控制（颜色/复杂度/密度/对称）生效
- [ ] 单个纹样和无缝平铺模式切换正常
- [ ] SVG 和 PNG 下载正常
- [ ] 历史记录保存和恢复正常
- [ ] 响应式布局在移动端正常
