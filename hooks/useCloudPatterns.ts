'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { patternsApi } from '@/lib/api-client';
import type { PatternListItem } from '@/lib/api-types';
import type { PatternResult } from '@/generators/types';

const PAGE_SIZE = 20;

export function useCloudPatterns() {
  const { user } = useAuth();
  const [patterns, setPatterns] = useState<PatternListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 获取列表
  const fetchPatterns = useCallback(async (pageNum: number, append = false) => {
    setLoading(true);
    try {
      const res = await patternsApi.list(pageNum, PAGE_SIZE);
      setPatterns((prev) => (append ? [...prev, ...res.data] : res.data));
      setTotal(res.total);
      setPage(pageNum);
    } catch {
      // 静默失败，保留已有数据
    } finally {
      setLoading(false);
    }
  }, []);

  // 登录后自动加载
  useEffect(() => {
    if (user) {
      fetchPatterns(1);
    } else {
      setPatterns([]);
      setTotal(0);
      setPage(1);
    }
  }, [user, fetchPatterns]);

  // 加载更多
  const loadMore = useCallback(() => {
    if (!loading && patterns.length < total) {
      fetchPatterns(page + 1, true);
    }
  }, [loading, patterns.length, total, page, fetchPatterns]);

  // 保存纹样到云端
  const savePattern = useCallback(async (result: PatternResult) => {
    setSaving(true);
    try {
      await patternsApi.create({
        type: result.params.type,
        params: JSON.stringify(result.params),
        svg: result.result,
        outputFormat: result.resultType,
      });
      // 刷新列表
      await fetchPatterns(1);
    } finally {
      setSaving(false);
    }
  }, [fetchPatterns]);

  // 删除云端纹样
  const deletePattern = useCallback(async (id: string) => {
    try {
      await patternsApi.delete(id);
      setPatterns((prev) => prev.filter((p) => p.id !== id));
      setTotal((prev) => prev - 1);
    } catch {
      // 静默
    }
  }, []);

  // 从云端恢复纹样到画布
  const restorePattern = useCallback(async (id: string): Promise<PatternResult | null> => {
    try {
      const res = await patternsApi.get(id);
      const p = res.pattern;
      const params = JSON.parse(p.params);
      return {
        resultType: (p.outputFormat || params.outputFormat || 'svg') as 'svg' | 'image',
        result: p.svg,
        params,
        prompt: '',
        timestamp: new Date(p.createdAt).getTime(),
      };
    } catch {
      return null;
    }
  }, []);

  return {
    patterns,
    total,
    loading,
    saving,
    loadMore,
    savePattern,
    deletePattern,
    restorePattern,
  };
}
