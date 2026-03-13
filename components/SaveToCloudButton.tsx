'use client';

import { useState } from 'react';
import type { PatternResult } from '@/generators/types';

interface SaveToCloudButtonProps {
  result: PatternResult;
  saving: boolean;
  onSave: (result: PatternResult) => Promise<void>;
}

export function SaveToCloudButton({ result, saving, onSave }: SaveToCloudButtonProps) {
  const [saved, setSaved] = useState(false);

  const handleClick = async () => {
    try {
      await onSave(result);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // 错误由上层处理
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={saving || saved}
      className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border border-[var(--color-gold)] text-[var(--color-gold-dark)] rounded-xl hover:bg-[var(--color-gold)] hover:text-white transition-all disabled:opacity-60 whitespace-nowrap"
    >
      {saving ? (
        <>
          <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
          保存中...
        </>
      ) : saved ? (
        <>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 7l3.5 3.5L12 3" />
          </svg>
          已保存
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 1v8M3.5 5.5L7 9l3.5-3.5" />
            <path d="M1.5 10v1.5a1 1 0 001 1h9a1 1 0 001-1V10" />
          </svg>
          保存到云端
        </>
      )}
    </button>
  );
}
