'use client';

import { PatternCanvas } from '@/components/PatternCanvas';
import { ControlPanel } from '@/components/ControlPanel';
import { DownloadButton } from '@/components/DownloadButton';
import { HistoryPanel } from '@/components/HistoryPanel';
import { usePatternGenerator } from '@/hooks/usePatternGenerator';
import { useHistory } from '@/hooks/useHistory';

export default function Home() {
  const { params, result, isGenerating, updateParams, generate, randomGenerate, restoreFromHistory } = usePatternGenerator();
  const { history, addToHistory, clearHistory } = useHistory();

  const handleGenerate = () => {
    const res = generate();
    if (res) addToHistory(res);
  };

  const handleRandom = () => {
    const res = randomGenerate();
    if (res) addToHistory(res);
  };

  const handleRestore = (item: typeof history[number]) => {
    restoreFromHistory(item);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-[var(--color-vermilion)] rounded-lg flex items-center justify-center text-white font-serif text-lg">
            纹
          </div>
          <h1 className="text-xl font-serif font-bold text-[var(--color-ink)]">中国纹样生成器</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Canvas Area */}
          <div className="lg:col-span-2 space-y-4">
            <PatternCanvas svg={result?.svg ?? null} />

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-1 px-6 py-3 bg-[var(--color-vermilion)] text-white rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50"
              >
                {isGenerating ? '生成中...' : '生成纹样'}
              </button>
              <button
                onClick={handleRandom}
                disabled={isGenerating}
                className="px-6 py-3 border border-[var(--color-gold)] text-[var(--color-gold)] rounded-lg font-medium hover:bg-[var(--color-gold)] hover:text-white transition-all disabled:opacity-50"
              >
                随机生成
              </button>
            </div>

            <DownloadButton
              svg={result?.svg ?? null}
              width={params.width}
              height={params.height}
            />
          </div>

          {/* Right - Control Panel */}
          <div className="lg:col-span-1">
            <ControlPanel params={params} onUpdate={updateParams} />
          </div>
        </div>

        {/* History */}
        <div className="mt-8">
          <HistoryPanel
            history={history}
            onRestore={handleRestore}
            onClear={clearHistory}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        中国纹样生成器 - 传承东方美学
      </footer>
    </div>
  );
}
