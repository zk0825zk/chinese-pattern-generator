'use client';

import { useState } from 'react';
import type { PatternResult } from '@/generators/types';
import type { PatternListItem } from '@/lib/api-types';
import { CloudPatternList } from '@/components/CloudPatternList';

type Tab = 'local' | 'cloud';

interface HistoryPanelProps {
  history: PatternResult[];
  onRestore: (item: PatternResult) => void;
  onClear: () => void;
  // 云端相关 props
  cloudPatterns?: PatternListItem[];
  cloudTotal?: number;
  cloudLoading?: boolean;
  onLoadMoreCloud?: () => void;
  onRestoreCloud?: (id: string) => Promise<PatternResult | null>;
  onDeleteCloud?: (id: string) => Promise<void>;
  isLoggedIn?: boolean;
}

export function HistoryPanel({
  history,
  onRestore,
  onClear,
  cloudPatterns = [],
  cloudTotal = 0,
  cloudLoading = false,
  onLoadMoreCloud,
  onRestoreCloud,
  onDeleteCloud,
  isLoggedIn = false,
}: HistoryPanelProps) {
  const [tab, setTab] = useState<Tab>('local');
  const showTabs = isLoggedIn;
  const hasContent = history.length > 0 || (isLoggedIn && cloudPatterns.length > 0);

  if (!hasContent && !isLoggedIn) return null;

  const handleRestoreCloud = async (id: string) => {
    if (!onRestoreCloud) return;
    const result = await onRestoreCloud(id);
    if (result) onRestore(result);
  };

  const handleDeleteCloud = async (id: string) => {
    if (!onDeleteCloud) return;
    await onDeleteCloud(id);
  };

  return (
    <div className="space-y-3">
      {/* 标题栏 + Tab */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-0.5 h-4 bg-[var(--color-gold)] rounded-full" />
            <h3 className="text-sm font-medium text-[var(--color-ink)]">
              {showTabs ? (tab === 'local' ? '本地历史' : '云端收藏') : '历史记录'}
            </h3>
            <span className="count-badge">
              {tab === 'local' ? history.length : cloudTotal}
            </span>
          </div>

          {/* Tab 切换 */}
          {showTabs && (
            <div className="flex bg-[var(--color-paper-dark)] rounded-lg p-0.5">
              <button
                onClick={() => setTab('local')}
                className={`px-3 py-1 text-[10px] font-medium rounded-md transition-all ${
                  tab === 'local'
                    ? 'bg-[var(--color-surface-elevated)] text-[var(--color-ink)] shadow-sm'
                    : 'text-[var(--color-ink-lighter)] hover:text-[var(--color-ink-light)]'
                }`}
              >
                本地
              </button>
              <button
                onClick={() => setTab('cloud')}
                className={`px-3 py-1 text-[10px] font-medium rounded-md transition-all ${
                  tab === 'cloud'
                    ? 'bg-[var(--color-surface-elevated)] text-[var(--color-ink)] shadow-sm'
                    : 'text-[var(--color-ink-lighter)] hover:text-[var(--color-ink-light)]'
                }`}
              >
                云端
              </button>
            </div>
          )}
        </div>

        {tab === 'local' && history.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-[var(--color-ink-lighter)] hover:text-white hover:bg-[var(--color-vermilion)] px-2 py-1 rounded-md transition-all"
          >
            清除全部
          </button>
        )}
      </div>

      {/* 内容区 */}
      {tab === 'local' ? (
        history.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {history.map((item) => (
              <button
                key={item.timestamp}
                onClick={() => onRestore(item)}
                className="flex-shrink-0 group flex flex-col items-center gap-1.5"
              >
                <div
                  className="w-28 h-28 rounded-lg border border-[var(--color-border-light)] overflow-hidden transition-all group-hover:border-[var(--color-gold)] group-hover:shadow-lg group-hover:scale-105"
                >
                  {'resultType' in item && item.resultType === 'image' ? (
                    <img
                      src={
                        (item.result || '').startsWith('data:') ? item.result
                        : (item.result || '').startsWith('PHN2Z') ? `data:image/svg+xml;base64,${item.result}`
                        : `data:image/png;base64,${item.result}`
                      }
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
                </div>
                <span className="text-[10px] text-[var(--color-ink-lighter)] group-hover:text-[var(--color-ink-light)] transition-colors">
                  {new Date(item.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </button>
            ))}
          </div>
        ) : (
          isLoggedIn && (
            <p className="text-xs text-[var(--color-ink-lighter)] py-4 text-center">
              暂无本地历史，点击「生成纹样」开始创作
            </p>
          )
        )
      ) : (
        <CloudPatternList
          patterns={cloudPatterns}
          total={cloudTotal}
          loading={cloudLoading}
          onRestore={handleRestoreCloud}
          onDelete={handleDeleteCloud}
          onLoadMore={onLoadMoreCloud ?? (() => {})}
        />
      )}
    </div>
  );
}
