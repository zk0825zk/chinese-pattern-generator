'use client';

import type { PatternParams, SymmetryMode, OutputMode, OutputFormat } from '@/generators/types';
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

const COLOR_PRESETS = [
  { name: '朱砂金', primary: '#e54d42', secondary: '#c5a572', background: '#f5f0e8' },
  { name: '青花瓷', primary: '#2858a6', secondary: '#6b9bd2', background: '#f0f4f8' },
  { name: '墨竹', primary: '#2c4a2c', secondary: '#5b8c5a', background: '#f2f5f0' },
  { name: '宫墙红', primary: '#8b2500', secondary: '#d4a54a', background: '#faf3e8' },
  { name: '粉黛', primary: '#c27c88', secondary: '#e8c4c8', background: '#fdf5f5' },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)]" />
      <h3 className="text-sm font-medium text-[var(--color-ink)]">{children}</h3>
      <div className="flex-1 h-px bg-[var(--color-border-light)]" />
    </div>
  );
}

export function ControlPanel({ params, onUpdate }: ControlPanelProps) {
  return (
    <div className="space-y-4">
      {/* 面板标题 */}
      <div className="flex items-center gap-2 px-1">
        <div className="w-0.5 h-5 bg-[var(--color-vermilion)] rounded-full" />
        <h2 className="text-base font-bold text-[var(--color-ink)]">参数调节</h2>
      </div>

      {/* 卡片1: 纹样类型 */}
      <div className="card-chinese chinese-corner p-4">
        <div className="chinese-corner-inner">
          <SectionTitle>纹样类型</SectionTitle>
          <TypeSelector
            selected={params.type}
            onChange={(type) => onUpdate({ type })}
            customPrompt={params.customPrompt}
            onCustomPromptChange={(customPrompt) => onUpdate({ customPrompt })}
          />
        </div>
      </div>

      {/* 卡片2: 输出模式 */}
      <div className="card-chinese p-4">
        <SectionTitle>输出模式</SectionTitle>
        <div className="flex gap-2">
          {(['single', 'seamless'] as OutputMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onUpdate({ mode })}
              className={`flex-1 px-3 py-2 rounded-lg text-sm border transition-all ${
                params.mode === mode
                  ? 'text-white shadow-sm'
                  : 'border-[var(--color-border-light)] bg-[var(--color-surface)] hover:border-[var(--color-gold)]'
              }`}
              style={
                params.mode === mode
                  ? { background: 'linear-gradient(135deg, var(--color-vermilion), var(--color-vermilion-dark))', borderColor: 'transparent' }
                  : undefined
              }
            >
              {mode === 'single' ? '单个纹样' : '无缝平铺'}
            </button>
          ))}
        </div>

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
      </div>

      {/* 卡片3: 色彩设定 */}
      <div className="card-chinese p-4">
        <SectionTitle>色彩设定</SectionTitle>

        {/* 预设色板 */}
        <div className="flex gap-2 mb-4">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => onUpdate({ color: { primary: preset.primary, secondary: preset.secondary, background: preset.background } })}
              className="group flex flex-col items-center gap-1 transition-transform hover:scale-105"
              title={preset.name}
            >
              <div className="flex w-8 h-8 rounded-full overflow-hidden border-2 border-[var(--color-border-light)] group-hover:border-[var(--color-gold)] transition-colors shadow-sm">
                <div className="w-1/2 h-full" style={{ backgroundColor: preset.primary }} />
                <div className="w-1/2 h-full" style={{ backgroundColor: preset.secondary }} />
              </div>
              <span className="text-[10px] text-[var(--color-ink-lighter)] group-hover:text-[var(--color-ink-light)]">{preset.name}</span>
            </button>
          ))}
        </div>

        {/* 颜色选择器 */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-[var(--color-ink-lighter)] mb-1 block">主色</label>
            <input
              type="color"
              value={params.color.primary}
              onChange={(e) => onUpdate({ color: { ...params.color, primary: e.target.value } })}
              className="w-full h-9 rounded-lg cursor-pointer border border-[var(--color-border-light)]"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--color-ink-lighter)] mb-1 block">辅色</label>
            <input
              type="color"
              value={params.color.secondary}
              onChange={(e) => onUpdate({ color: { ...params.color, secondary: e.target.value } })}
              className="w-full h-9 rounded-lg cursor-pointer border border-[var(--color-border-light)]"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--color-ink-lighter)] mb-1 block">背景色</label>
            <input
              type="color"
              value={params.color.background}
              onChange={(e) => onUpdate({ color: { ...params.color, background: e.target.value } })}
              className="w-full h-9 rounded-lg cursor-pointer border border-[var(--color-border-light)]"
            />
          </div>
        </div>
      </div>

      {/* 卡片4: 参数微调 */}
      <div className="card-chinese p-4">
        <SectionTitle>参数微调</SectionTitle>

        {/* 复杂度 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-[var(--color-ink-light)]">复杂度</label>
            <span className="value-badge">
              {params.complexity}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={params.complexity}
            onChange={(e) => onUpdate({ complexity: Number(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-[var(--color-ink-lighter)]">简约</span>
            <span className="text-[10px] text-[var(--color-ink-lighter)]">繁复</span>
          </div>
        </div>

        {/* 密度 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-[var(--color-ink-light)]">密度</label>
            <span className="value-badge">
              {params.density}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={params.density}
            onChange={(e) => onUpdate({ density: Number(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-[var(--color-ink-lighter)]">稀疏</span>
            <span className="text-[10px] text-[var(--color-ink-lighter)]">密集</span>
          </div>
        </div>

        {/* 对称方式 */}
        <div>
          <label className="text-sm text-[var(--color-ink-light)] mb-2 block">对称方式</label>
          <div className="flex flex-wrap gap-2">
            {SYMMETRY_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => onUpdate({ symmetry: value })}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                  params.symmetry === value
                    ? 'text-white shadow-sm'
                    : 'border-[var(--color-border-light)] bg-[var(--color-surface)] hover:border-[var(--color-gold)]'
                }`}
                style={
                  params.symmetry === value
                    ? { background: 'linear-gradient(135deg, var(--color-vermilion), var(--color-vermilion-dark))', borderColor: 'transparent' }
                    : undefined
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

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
      </div>
    </div>
  );
}
