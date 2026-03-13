'use client';

import { useAuth } from '@/contexts/AuthContext';

interface HeaderAuthProps {
  onLoginClick: () => void;
}

export function HeaderAuth({ onLoginClick }: HeaderAuthProps) {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-[var(--color-ink-lighter)]">
        <div className="w-3 h-3 rounded-full border-2 border-[var(--color-gold)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={onLoginClick}
        className="px-4 py-1.5 text-xs font-medium border border-[var(--color-gold)] text-[var(--color-gold-dark)] rounded-lg hover:bg-[var(--color-gold)] hover:text-white transition-all"
      >
        登录
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        <div
          className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold"
          style={{ backgroundColor: 'var(--color-vermilion)' }}
        >
          {user.username[0].toUpperCase()}
        </div>
        <span className="text-xs font-medium text-[var(--color-ink-light)] max-w-[80px] truncate">
          {user.username}
        </span>
      </div>
      <button
        onClick={logout}
        className="text-[10px] text-[var(--color-ink-lighter)] hover:text-[var(--color-vermilion)] transition-colors"
      >
        退出
      </button>
    </div>
  );
}
