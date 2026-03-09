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
