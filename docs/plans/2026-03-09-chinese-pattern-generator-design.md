# 中国纹样生成器 - 设计文档

## 概述

一个基于 Web 的中国传统纹样生成器，用户可以选择纹样类型、调整参数，生成可下载的 SVG/PNG 纹样图案。支持单个纹样和无缝连续平铺纹样。

## 技术栈

- **框架**：Next.js 15 (App Router)
- **样式**：TailwindCSS 4
- **语言**：TypeScript
- **状态管理**：React Hooks
- **存储**：localStorage
- **包管理**：npm

## 架构方案：模板化 SVG 生成器

每种纹样类型有独立的 SVG 生成器函数，接收统一参数接口，输出 SVG 字符串。AI 生成（Stable Diffusion）预留接口，后续对接。

## 项目结构

```
chinese-pattern-generator/
├── app/
│   ├── layout.tsx            # 根布局
│   ├── page.tsx              # 首页（生成器主界面）
│   └── globals.css           # 全局样式
├── components/
│   ├── PatternCanvas.tsx     # 纹样展示区（SVG 渲染）
│   ├── ControlPanel.tsx      # 参数控制面板
│   ├── TypeSelector.tsx      # 纹样类型选择器
│   ├── DownloadButton.tsx    # 下载按钮（PNG/SVG）
│   └── HistoryPanel.tsx      # 历史记录面板
├── generators/
│   ├── types.ts              # 统一参数接口
│   ├── cloud.ts              # 祥云纹生成器
│   ├── meander.ts            # 回纹生成器
│   ├── floral.ts             # 花纹生成器
│   ├── geometric.ts          # 几何纹生成器
│   ├── dragon.ts             # 龙纹（预留 AI 接口）
│   └── index.ts              # 生成器注册表
├── hooks/
│   ├── usePatternGenerator.ts
│   └── useHistory.ts
├── lib/
│   ├── svg-utils.ts          # SVG 工具函数
│   └── export.ts             # 导出功能
└── public/
```

## 核心接口

```typescript
interface PatternParams {
  type: 'cloud' | 'meander' | 'floral' | 'geometric' | 'dragon';
  color: {
    primary: string;
    secondary: string;
    background: string;
  };
  complexity: number;   // 1-10
  density: number;      // 1-10
  symmetry: 'none' | 'horizontal' | 'vertical' | 'radial' | 'full';
  mode: 'single' | 'seamless';
  tileSize: number;
  width: number;
  height: number;
  seed?: number;
}

interface PatternResult {
  svg: string;
  params: PatternParams;
  timestamp: number;
}
```

## 纹样生成算法

| 纹样 | 算法核心 |
|------|---------|
| 祥云纹 | 贝塞尔曲线螺旋 + 重复排列 |
| 回纹 | 直角螺旋递归 + 连续回纹带 |
| 花纹 | 极坐标花瓣生成 + 叶片曲线 |
| 几何纹 | 网格平铺（万字纹/菱形/六边形） |
| 龙纹 | 预留 AI 接口 |

无缝平铺通过 SVG `<pattern>` 元素实现，生成器的 seamless 模式确保四边边缘连续。

## UI 布局

左右分栏布局：
- **左侧**：纹样展示区 + 描述输入框 + 生成/下载按钮
- **右侧**：控制面板（类型选择、颜色、复杂度/密度滑块、对称方式、输出模式）
- **底部**：历史记录（横向滚动缩略图）

展示区支持「单元视图」和「平铺预览」切换。

UI 风格：现代简约 + 中式点缀（衬线标题字体、回纹装饰线、传统红/金按钮配色）。响应式适配移动端。

## 数据流

```
用户操作 → PatternParams
  → usePatternGenerator → generators → PatternResult
    → PatternCanvas (渲染)
    → useHistory (localStorage 保存)
    → export (下载)
```

## 导出功能

- SVG：直接保存 SVG 字符串
- PNG：SVG → Canvas → toBlob()
- 无缝模式可选导出单个瓦片或平铺图案

## 历史记录

- localStorage 存储最近 20 条
- 每条：SVG 缩略图(base64) + 参数快照 + 时间戳
- 点击恢复参数并重新生成

## AI 接口预留

`generators/dragon.ts` 预留 Stable Diffusion API 调用接口，初期使用占位 SVG。后续对接时实现：
- API 调用层
- 加载状态
- 错误回退
