'use client';

import type { OutputFormat } from '@/generators/types';

interface PatternCanvasProps {
  result: string | null;
  resultType: OutputFormat;
  isLoading: boolean;
  error: string | null;
}

export function PatternCanvas({ result, resultType, isLoading, error }: PatternCanvasProps) {
  return (
    <div className="chinese-corner card-chinese relative overflow-hidden" style={{ minHeight: '400px' }}>
      <div className="chinese-corner-inner w-full h-full">
        <div className="absolute inset-3 border border-[var(--color-border-light)] rounded-lg pointer-events-none" />

        {isLoading ? (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center">
              <div
                className="w-16 h-16 mx-auto mb-4 border-4 border-[var(--color-gold)] border-t-transparent rounded-full"
                style={{ animation: 'spin 1s linear infinite' }}
              />
              <p className="text-sm text-[var(--color-ink-light)] font-medium">纹样生成中...</p>
              <p className="text-xs text-[var(--color-ink-lighter)] mt-1">AI 正在创作，请稍候</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center px-6">
              <div className="text-3xl mb-3">!</div>
              <p className="text-sm text-[var(--color-vermilion)] font-medium">{error}</p>
              <p className="text-xs text-[var(--color-ink-lighter)] mt-1">请调整参数后重试</p>
            </div>
          </div>
        ) : result ? (
          resultType === 'svg' ? (
            <div
              className="w-full h-full flex items-center justify-center p-4"
              style={{ animation: 'fadeInUp 0.5s ease-out' }}
              dangerouslySetInnerHTML={{ __html: result }}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center p-4"
              style={{ animation: 'fadeInUp 0.5s ease-out' }}
            >
              <img
                src={result.startsWith('data:') ? result : `data:image/png;base64,${result}`}
                alt="AI 生成的纹样"
                className="max-w-full max-h-full object-contain rounded"
              />
            </div>
          )
        ) : (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center">
              <div
                className="w-28 h-28 mx-auto mb-5 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, var(--color-paper-warm), var(--color-paper-dark))',
                  boxShadow: '0 8px 32px rgba(197, 165, 114, 0.15)',
                  animation: 'gentleFloat 4s ease-in-out infinite',
                }}
              >
                <span
                  className="text-5xl"
                  style={{ color: 'var(--color-gold)', fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif" }}
                >
                  云
                </span>
              </div>
              <p className="text-sm text-[var(--color-ink-light)] font-medium">选择纹样类型并点击生成</p>
              <p className="text-xs text-[var(--color-ink-lighter)] mt-1.5">探索中国传统纹饰之美</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
