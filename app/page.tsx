'use client';

import { useState } from 'react';
import { PatternCanvas } from '@/components/PatternCanvas';
import { ControlPanel } from '@/components/ControlPanel';
import { DownloadButton } from '@/components/DownloadButton';
import { HistoryPanel } from '@/components/HistoryPanel';
import { HeaderAuth } from '@/components/HeaderAuth';
import { AuthModal } from '@/components/AuthModal';
import { SaveToCloudButton } from '@/components/SaveToCloudButton';
import { usePatternGenerator } from '@/hooks/usePatternGenerator';
import { useHistory } from '@/hooks/useHistory';
import { useAuth } from '@/contexts/AuthContext';
import { useCloudPatterns } from '@/hooks/useCloudPatterns';

export default function Home() {
  const { params, result, isGenerating, error, updateParams, generate, restoreFromHistory } = usePatternGenerator();
  const { history, addToHistory, clearHistory } = useHistory();
  const { user, token, login, register } = useAuth();
  const cloud = useCloudPatterns();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleGenerate = async () => {
    if (!user || !token) {
      setAuthModalOpen(true);
      return;
    }
    const res = await generate(token);
    if (res) addToHistory(res);
  };

  const handleRestore = (item: typeof history[number]) => {
    restoreFromHistory(item);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="relative backdrop-blur-sm" style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
        <div className="h-1" style={{ background: 'linear-gradient(90deg, transparent, var(--color-gold-light), var(--color-gold), var(--color-gold-light), transparent)' }} />
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center gap-4">
          <div
            className="w-12 h-12 flex items-center justify-center text-white text-xl font-black flex-shrink-0"
            style={{
              backgroundColor: 'var(--color-vermilion)',
              transform: 'rotate(-2deg)',
              fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif",
              boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.3), 0 2px 8px rgba(229, 77, 66, 0.3)',
              borderRadius: '4px',
            }}
          >
            纹
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-[var(--color-ink)]" style={{ fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif" }}>
              中国纹样生成器
            </h1>
            <p className="text-xs text-[var(--color-ink-lighter)] mt-0.5" style={{ letterSpacing: '0.3em' }}>
              传承东方美学 · AI 生成无限纹样
            </p>
          </div>
          <HeaderAuth onLoginClick={() => setAuthModalOpen(true)} />
          <div className="hidden lg:block opacity-10 text-[var(--color-gold)] text-6xl font-light" style={{ fontFamily: "'ZCOOL XiaoWei', serif" }}>
            纹
          </div>
        </div>
        <div className="h-0.5" style={{ background: 'linear-gradient(90deg, transparent, var(--color-vermilion-light), var(--color-vermilion), var(--color-vermilion-light), transparent)' }} />
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left - Canvas Area */}
          <div className="lg:col-span-8 space-y-5">
            <PatternCanvas
              result={result?.result ?? null}
              resultType={result?.resultType ?? params.outputFormat}
              isLoading={isGenerating}
              error={error}
            />

            {/* Action Button */}
            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || (params.type === 'custom' && !params.customPrompt?.trim())}
                className="btn-shimmer flex-1 px-6 py-3.5 text-white rounded-xl font-bold text-base transition-all disabled:opacity-50 active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, var(--color-vermilion), var(--color-vermilion-dark))',
                  boxShadow: '0 4px 14px rgba(229, 77, 66, 0.3)',
                }}
              >
                {isGenerating ? '生成中...' : !user ? '登录后生成' : '生成纹样'}
              </button>
            </div>

            <div className="flex gap-3 items-start">
              <div className="flex-1">
                <DownloadButton
                  result={result?.result ?? null}
                  resultType={result?.resultType ?? 'svg'}
                  width={params.width}
                  height={params.height}
                />
              </div>
              {user && result && (
                <SaveToCloudButton
                  result={result}
                  saving={cloud.saving}
                  onSave={cloud.savePattern}
                />
              )}
            </div>

            {(history.length > 0 || (user && cloud.patterns.length > 0)) && <div className="divider-gold my-6" />}

            <HistoryPanel
              history={history}
              onRestore={handleRestore}
              onClear={clearHistory}
              cloudPatterns={user ? cloud.patterns : []}
              cloudTotal={cloud.total}
              cloudLoading={cloud.loading}
              onLoadMoreCloud={cloud.loadMore}
              onRestoreCloud={cloud.restorePattern}
              onDeleteCloud={cloud.deletePattern}
              isLoggedIn={!!user}
            />
          </div>

          {/* Right - Control Panel */}
          <div className="lg:col-span-4">
            <ControlPanel params={params} onUpdate={updateParams} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative mt-auto">
        <div className="divider-gold" />
        <div className="py-6 text-center">
          <div className="flex items-center justify-center gap-3 text-xs text-[var(--color-ink-lighter)]">
            <span>中国纹样生成器</span>
            <span className="text-[var(--color-gold)]">◇</span>
            <span>传承东方美学</span>
          </div>
          <p className="text-[10px] text-[var(--color-ink-lighter)] opacity-50 mt-1">
            探索传统纹饰 · 生成无限可能
          </p>
        </div>
      </footer>

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={login}
        onRegister={register}
      />
    </div>
  );
}
