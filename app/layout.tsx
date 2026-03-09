import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '中国纹样生成器',
  description: '生成中国传统纹样 - 祥云纹、回纹、花纹、几何纹',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-[var(--color-paper)] text-[var(--color-ink)] min-h-screen">
        {children}
      </body>
    </html>
  );
}
