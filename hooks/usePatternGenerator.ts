'use client';

import { useState, useCallback, useRef } from 'react';
import type { PatternParams, PatternResult } from '@/generators/types';
import { DEFAULT_PARAMS } from '@/generators/types';
import { buildPrompt } from '@/lib/prompt-templates';

const POLL_INTERVAL = 2000;
const MAX_POLLS = 60;
const MAX_CONSECUTIVE_ERRORS = 3;

export function usePatternGenerator() {
  const [params, setParams] = useState<PatternParams>(DEFAULT_PARAMS);
  const [result, setResult] = useState<PatternResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const updateParams = useCallback((updates: Partial<PatternParams>) => {
    setParams((prev) => ({ ...prev, ...updates }));
  }, []);

  const generate = useCallback(async (token: string): Promise<PatternResult | null> => {
    // 取消之前的生成
    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;

    setIsGenerating(true);
    setError(null);

    try {
      const prompt = buildPrompt(params);

      // 1. 提交生成任务
      const submitRes = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt,
          provider: params.provider || 'openai',
          outputFormat: params.outputFormat,
        }),
        signal: abort.signal,
      });

      if (!submitRes.ok) {
        const data = await submitRes.json().catch(() => ({}));
        throw new Error(data.error || `请求失败 (${submitRes.status})`);
      }

      const { task } = await submitRes.json();
      const taskId = task.id;

      // 2. 轮询任务状态
      let polls = 0;
      let consecutiveErrors = 0;

      while (polls < MAX_POLLS) {
        if (abort.signal.aborted) return null;
        await new Promise((r) => setTimeout(r, POLL_INTERVAL));
        polls++;

        try {
          const pollRes = await fetch(`/api/ai/tasks/${taskId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
            signal: abort.signal,
          });

          if (!pollRes.ok) {
            consecutiveErrors++;
            if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
              throw new Error('网络连接异常，请检查网络后重试');
            }
            continue;
          }

          consecutiveErrors = 0;
          const { task: taskData } = await pollRes.json();

          if (taskData.status === 'completed' && taskData.result) {
            const patternResult: PatternResult = {
              resultType: params.outputFormat,
              result: taskData.result,
              params: { ...params },
              prompt,
              timestamp: Date.now(),
            };
            setResult(patternResult);
            return patternResult;
          }

          if (taskData.status === 'failed') {
            throw new Error(taskData.error || '生成失败，请重试');
          }
        } catch (err) {
          if (abort.signal.aborted) return null;
          if (err instanceof Error && err.message.includes('网络')) throw err;
          consecutiveErrors++;
          if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
            throw new Error('网络连接异常，请检查网络后重试');
          }
        }
      }

      throw new Error('生成超时，请重试');
    } catch (err) {
      if (abort.signal.aborted) return null;
      const message = err instanceof Error ? err.message : '生成失败';
      setError(message);
      return null;
    } finally {
      if (!abort.signal.aborted) {
        setIsGenerating(false);
      }
    }
  }, [params]);

  const restoreFromHistory = useCallback((historyItem: PatternResult) => {
    setParams(historyItem.params);
    setResult(historyItem);
    setError(null);
  }, []);

  return {
    params,
    result,
    isGenerating,
    error,
    updateParams,
    generate,
    restoreFromHistory,
  };
}
