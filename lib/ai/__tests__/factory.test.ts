// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { createAiAdapter } from '@/lib/ai/factory';

describe('createAiAdapter', () => {
  it('creates openai adapter', () => {
    const adapter = createAiAdapter('openai');
    expect(adapter.provider).toBe('openai');
  });

  it('creates gemini adapter', () => {
    const adapter = createAiAdapter('gemini');
    expect(adapter.provider).toBe('gemini');
  });

  it('creates local adapter', () => {
    const adapter = createAiAdapter('local');
    expect(adapter.provider).toBe('local');
  });

  it('throws for unknown provider', () => {
    expect(() => createAiAdapter('unknown')).toThrow('Unknown AI provider: unknown');
  });
});
