'use client';

import { useState } from 'react';
import { downloadSvg, downloadPng } from '@/lib/export';

interface DownloadButtonProps {
  svg: string | null;
  width: number;
  height: number;
}

export function DownloadButton({ svg, width, height }: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadSvg = () => {
    if (!svg) return;
    downloadSvg(svg, `pattern-${Date.now()}.svg`);
  };

  const handleDownloadPng = async () => {
    if (!svg) return;
    setDownloading(true);
    try {
      await downloadPng(svg, width, height, `pattern-${Date.now()}.png`);
    } catch (err) {
      console.error('PNG 导出失败:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleDownloadSvg}
        disabled={!svg}
        className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:border-[var(--color-gold)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        下载 SVG
      </button>
      <button
        onClick={handleDownloadPng}
        disabled={!svg || downloading}
        className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:border-[var(--color-gold)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {downloading ? '导出中...' : '下载 PNG'}
      </button>
    </div>
  );
}
