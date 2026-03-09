import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHistory } from '../useHistory';
import type { PatternResult } from '@/generators/types';
import { DEFAULT_PARAMS } from '@/generators/types';

const mockResult: PatternResult = {
  svg: '<svg></svg>',
  params: { ...DEFAULT_PARAMS, seed: 42 },
  timestamp: Date.now(),
};

describe('useHistory', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('初始状态为空数组', () => {
    const { result } = renderHook(() => useHistory());
    expect(result.current.history).toEqual([]);
  });

  it('addToHistory 添加记录', () => {
    const { result } = renderHook(() => useHistory());
    act(() => {
      result.current.addToHistory(mockResult);
    });
    expect(result.current.history).toHaveLength(1);
  });

  it('最多保存 20 条记录', () => {
    const { result } = renderHook(() => useHistory());
    act(() => {
      for (let i = 0; i < 25; i++) {
        result.current.addToHistory({
          ...mockResult,
          timestamp: Date.now() + i,
        });
      }
    });
    expect(result.current.history).toHaveLength(20);
  });

  it('clearHistory 清除所有记录', () => {
    const { result } = renderHook(() => useHistory());
    act(() => {
      result.current.addToHistory(mockResult);
      result.current.clearHistory();
    });
    expect(result.current.history).toEqual([]);
  });
});
