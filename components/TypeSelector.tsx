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
