// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimiter } from '@/lib/rate-limit';

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('allows requests within limit', () => {
    const limiter = new RateLimiter({ maxRequests: 3, windowMs: 60_000 });
    expect(limiter.check('key1')).toBe(true);
    expect(limiter.check('key1')).toBe(true);
    expect(limiter.check('key1')).toBe(true);
  });

  it('blocks requests exceeding limit', () => {
    const limiter = new RateLimiter({ maxRequests: 2, windowMs: 60_000 });
    expect(limiter.check('key1')).toBe(true);
    expect(limiter.check('key1')).toBe(true);
    expect(limiter.check('key1')).toBe(false);
  });

  it('resets after window expires', () => {
    const limiter = new RateLimiter({ maxRequests: 1, windowMs: 60_000 });
    expect(limiter.check('key1')).toBe(true);
    expect(limiter.check('key1')).toBe(false);

    vi.advanceTimersByTime(60_001);
    expect(limiter.check('key1')).toBe(true);
  });

  it('tracks different keys independently', () => {
    const limiter = new RateLimiter({ maxRequests: 1, windowMs: 60_000 });
    expect(limiter.check('key1')).toBe(true);
    expect(limiter.check('key2')).toBe(true);
    expect(limiter.check('key1')).toBe(false);
  });
});
