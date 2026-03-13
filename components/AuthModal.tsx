'use client';

import { useState, useEffect } from 'react';
import { validateUsername, validatePassword } from '@/lib/validations';
import { ApiClientError } from '@/lib/api-client';

type AuthMode = 'login' | 'register';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: (username: string, password: string) => Promise<void>;
}

export function AuthModal({ open, onClose, onLogin, onRegister }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ESC 键关闭
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 前端校验
    const usernameErr = validateUsername(username);
    if (usernameErr) { setError(usernameErr); return; }
    const passwordErr = validatePassword(password);
    if (passwordErr) { setError(passwordErr); return; }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await onLogin(username, password);
      } else {
        await onRegister(username, password);
      }
      // 成功：重置并关闭
      setUsername('');
      setPassword('');
      onClose();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : '操作失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" onClick={onClose}>
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* 模态框 */}
      <div
        className="card-chinese chinese-corner relative w-full max-w-sm p-8 z-10"
        style={{ animation: 'fadeInUp 0.3s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="chinese-corner-inner" />

        {/* 标题 */}
        <div className="text-center mb-6">
          <div
            className="inline-block w-10 h-10 leading-10 text-white text-lg font-black rounded mb-3"
            style={{
              backgroundColor: 'var(--color-vermilion)',
              fontFamily: "'ZCOOL XiaoWei', serif",
            }}
          >
            {mode === 'login' ? '入' : '册'}
          </div>
          <h2
            className="text-xl font-bold text-[var(--color-ink)]"
            style={{ fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif" }}
          >
            {mode === 'login' ? '登录' : '注册'}
          </h2>
        </div>

        <div className="divider-gold mb-5" />

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-ink-light)] mb-1.5">
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="字母、数字、下划线"
              autoComplete="username"
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold-light)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-ink-light)] mb-1.5">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 8 个字符"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold-light)] transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-[var(--color-vermilion)] bg-[var(--color-vermilion)]/5 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-shimmer w-full py-3 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, var(--color-vermilion), var(--color-vermilion-dark))',
              boxShadow: '0 4px 14px rgba(229, 77, 66, 0.3)',
            }}
          >
            {submitting ? '处理中...' : mode === 'login' ? '登录' : '注册'}
          </button>
        </form>

        <div className="divider-gold mt-5 mb-4" />

        {/* 切换模式 */}
        <p className="text-center text-xs text-[var(--color-ink-lighter)]">
          {mode === 'login' ? '还没有账户？' : '已有账户？'}
          <button
            onClick={switchMode}
            className="ml-1 text-[var(--color-gold-dark)] hover:text-[var(--color-vermilion)] font-medium transition-colors"
          >
            {mode === 'login' ? '立即注册' : '去登录'}
          </button>
        </p>

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full text-[var(--color-ink-lighter)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-dark)] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 1l12 12M13 1L1 13" />
          </svg>
        </button>
      </div>
    </div>
  );
}
