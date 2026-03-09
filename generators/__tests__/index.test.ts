import { describe, it, expect } from 'vitest';
import { getGenerator, PATTERN_TYPES } from '../index';
import { DEFAULT_PARAMS } from '../types';

describe('Generator Registry', () => {
  it('所有类型都有对应的生成器', () => {
    for (const type of PATTERN_TYPES) {
      const generator = getGenerator(type.id);
      expect(generator).toBeDefined();
    }
  });

  it('每个生成器都能产生有效 SVG', () => {
    for (const type of PATTERN_TYPES) {
      const generator = getGenerator(type.id);
      const svg = generator({ ...DEFAULT_PARAMS, type: type.id, seed: 42 });
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    }
  });

  it('PATTERN_TYPES 包含所有 5 种类型', () => {
    expect(PATTERN_TYPES).toHaveLength(5);
    const ids = PATTERN_TYPES.map(t => t.id);
    expect(ids).toContain('cloud');
    expect(ids).toContain('meander');
    expect(ids).toContain('floral');
    expect(ids).toContain('geometric');
    expect(ids).toContain('dragon');
  });
});
