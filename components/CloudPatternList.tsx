'use client';

import type { PatternListItem } from '@/lib/api-types';

interface CloudPatternListProps {
  patterns: PatternListItem[];
  total: number;
  loading: boolean;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onLoadMore: () => void;
}

export function CloudPatternList({
  patterns,
  total,
  loading,
  onRestore,
  onDelete,
  onLoadMore,
}: CloudPatternListProps) {
  if (patterns.length === 0 && !loading) {
    return (
      <p className="text-xs text-[var(--color-ink-lighter)] py-6 text-center">
        暂无云端纹样，生成后点击「保存到云端」收藏
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3 overflow-x-auto pb-2">
        {patterns.map((item) => (
          <div
            key={item.id}
            className="flex-shrink-0 group flex flex-col items-center gap-1.5 relative"
          >
            <button
              onClick={() => onRestore(item.id)}
              className="w-28 h-28 rounded-lg border border-[var(--color-border-light)] overflow-hidden transition-all group-hover:border-[var(--color-gold)] group-hover:shadow-lg group-hover:scale-105 bg-[var(--color-surface)] flex items-center justify-center"
            >
              {item.thumbnail ? (
                <div
                  className="w-full h-full"
                  dangerouslySetInnerHTML={{ __html: item.thumbnail }}
                />
              ) : (
                <div className="text-center">
                  <div
                    className="text-2xl text-[var(--color-gold)] opacity-40"
                    style={{ fontFamily: "'ZCOOL XiaoWei', serif" }}
                  >
                    纹
                  </div>
                  <div className="text-[9px] text-[var(--color-ink-lighter)] mt-0.5">
                    {item.name}
                  </div>
                </div>
              )}
            </button>

            {/* 删除按钮 */}
            <button
              onClick={() => onDelete(item.id)}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-light)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--color-vermilion)] hover:text-white hover:border-[var(--color-vermilion)]"
            >
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M1 1l6 6M7 1L1 7" />
              </svg>
            </button>

            <span className="text-[10px] text-[var(--color-ink-lighter)] group-hover:text-[var(--color-ink-light)] transition-colors">
              {new Date(item.createdAt).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
            </span>
          </div>
        ))}

        {/* 加载更多 */}
        {patterns.length < total && (
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="flex-shrink-0 w-28 h-28 rounded-lg border border-dashed border-[var(--color-border)] flex items-center justify-center text-xs text-[var(--color-ink-lighter)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold-dark)] transition-colors"
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-[var(--color-gold)] border-t-transparent animate-spin" />
            ) : (
              '加载更多'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
