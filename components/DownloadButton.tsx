'use client';

import { useState } from 'react';
import { downloadSvg, downloadPng, downloadBase64Image } from '@/lib/export';
import type { OutputFormat } from '@/generators/types';

interface DownloadButtonProps {
  result: string | null;
  resultType: OutputFormat;
  width: number;
  height: number;
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export function DownloadButton({ result, resultType, width, height }: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadSvg = () => {
    if (!result || resultType !== 'svg') return;
    downloadSvg(result, `pattern-${Date.now()}.svg`);
  };

  const handleDownloadPng = async () => {
    if (!result) return;
    setDownloading(true);
    try {
      if (resultType === 'image') {
        downloadBase64Image(result, `pattern-${Date.now()}.png`);
      } else {
        await downloadPng(result, width, height, `pattern-${Date.now()}.png`);
      }
    } catch (err) {
      console.error('PNG 导出失败:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex gap-2">
      {resultType === 'svg' && (
        <button
          onClick={handleDownloadSvg}
          disabled={!result}
          className="group flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-xl text-sm hover:border-[var(--color-gold)] hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <DownloadIcon className="transition-transform group-hover:scale-110" />
          <span>下载 SVG</span>
        </button>
      )}
      <button
        onClick={handleDownloadPng}
        disabled={!result || downloading}
        className="group flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-xl text-sm hover:border-[var(--color-gold)] hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <DownloadIcon className="transition-transform group-hover:scale-110" />
        <span>{downloading ? '导出中...' : '下载 PNG'}</span>
      </button>
    </div>
  );
}
