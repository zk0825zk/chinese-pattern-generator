'use client';

import { useState, useCallback, useEffect } from 'react';
import type { PatternResult } from '@/generators/types';

const STORAGE_KEY = 'pattern-history';
const MAX_HISTORY = 20;

export function useHistory() {
  const [history, setHistory] = useState<PatternResult[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 迁移旧格式数据：svg -> result + resultType
        const migrated = parsed.map((item: Record<string, unknown>) => {
          if ('svg' in item && !('result' in item)) {
            return {
              resultType: 'svg' as const,
              result: item.svg as string,
              params: item.params,
              prompt: '',
              timestamp: item.timestamp,
            };
          }
          return item;
        });
        setHistory(migrated);
      }
    } catch {
      // localStorage 不可用或数据损坏
    }
  }, []);

  const saveToStorage = useCallback((items: PatternResult[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // 存储失败（空间不足等）
    }
  }, []);

  const addToHistory = useCallback((result: PatternResult) => {
    setHistory((prev) => {
      const next = [result, ...prev].slice(0, MAX_HISTORY);
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { history, addToHistory, clearHistory };
}
