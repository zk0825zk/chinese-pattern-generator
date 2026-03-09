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
