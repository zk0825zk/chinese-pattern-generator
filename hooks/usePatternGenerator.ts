'use client';

import { useState, useCallback } from 'react';
import type { PatternParams, PatternResult } from '@/generators/types';
import { DEFAULT_PARAMS } from '@/generators/types';
import { generatePattern } from '@/generators';

export function usePatternGenerator() {
  const [params, setParams] = useState<PatternParams>(DEFAULT_PARAMS);
  const [result, setResult] = useState<PatternResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const updateParams = useCallback((updates: Partial<PatternParams>) => {
    setParams((prev) => ({ ...prev, ...updates }));
  }, []);

  const generate = useCallback(() => {
    setIsGenerating(true);
    try {
      const svg = generatePattern(params.type, params);
      const patternResult: PatternResult = {
        svg,
        params: { ...params },
        timestamp: Date.now(),
      };
      setResult(patternResult);
      return patternResult;
    } finally {
      setIsGenerating(false);
    }
  }, [params]);

  const randomGenerate = useCallback(() => {
    const randomParams = { ...params, seed: Math.floor(Math.random() * 1000000) };
    setParams(randomParams);
    setIsGenerating(true);
    try {
      const svg = generatePattern(randomParams.type, randomParams);
      const patternResult: PatternResult = {
        svg,
        params: randomParams,
        timestamp: Date.now(),
      };
      setResult(patternResult);
      return patternResult;
    } finally {
      setIsGenerating(false);
    }
  }, [params]);

  const restoreFromHistory = useCallback((historyItem: PatternResult) => {
    setParams(historyItem.params);
    setResult(historyItem);
  }, []);

  return {
    params,
    result,
    isGenerating,
    updateParams,
    generate,
    randomGenerate,
    restoreFromHistory,
  };
}
