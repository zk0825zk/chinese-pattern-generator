import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
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
      <head>
        <link
          href="https://fonts.googleapis.cn/css2?family=Noto+Serif+SC:wght@300;400;700;900&family=ZCOOL+XiaoWei&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[var(--color-paper)] text-[var(--color-ink)] min-h-screen" style={{ fontFamily: "'Noto Serif SC', serif" }}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
