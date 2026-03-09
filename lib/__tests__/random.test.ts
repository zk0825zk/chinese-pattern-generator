import { describe, it, expect } from 'vitest';
import { SeededRandom } from '../random';

describe('SeededRandom', () => {
  it('相同种子产生相同序列', () => {
    const rng1 = new SeededRandom(42);
    const rng2 = new SeededRandom(42);
    const seq1 = Array.from({ length: 10 }, () => rng1.next());
    const seq2 = Array.from({ length: 10 }, () => rng2.next());
    expect(seq1).toEqual(seq2);
  });

  it('不同种子产生不同序列', () => {
    const rng1 = new SeededRandom(42);
    const rng2 = new SeededRandom(99);
    const val1 = rng1.next();
    const val2 = rng2.next();
    expect(val1).not.toEqual(val2);
  });

  it('range 返回指定范围内的值', () => {
    const rng = new SeededRandom(42);
    for (let i = 0; i < 100; i++) {
      const val = rng.range(5, 10);
      expect(val).toBeGreaterThanOrEqual(5);
      expect(val).toBeLessThan(10);
    }
  });

  it('next 返回 0-1 之间的值', () => {
    const rng = new SeededRandom(42);
    for (let i = 0; i < 100; i++) {
      const val = rng.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });
});
