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
