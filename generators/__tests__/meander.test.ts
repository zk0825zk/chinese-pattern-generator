import { describe, it, expect } from 'vitest';
import { generateMeander } from '../meander';
import { DEFAULT_PARAMS } from '../types';
import type { PatternParams } from '../types';

const meanderParams: PatternParams = {
  ...DEFAULT_PARAMS,
  type: 'meander',
  seed: 42,
};

describe('generateMeander', () => {
  it('返回有效的 SVG 字符串', () => {
    const svg = generateMeander(meanderParams);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('包含 path 元素（回纹线条）', () => {
    const svg = generateMeander(meanderParams);
    expect(svg).toContain('<path');
  });

  it('使用指定颜色', () => {
    const svg = generateMeander(meanderParams);
    expect(svg).toContain(meanderParams.color.primary);
  });

  it('seamless 模式包含 pattern 元素', () => {
    const svg = generateMeander({ ...meanderParams, mode: 'seamless' });
    expect(svg).toContain('<pattern');
  });

  it('相同种子产生相同输出', () => {
    const svg1 = generateMeander(meanderParams);
    const svg2 = generateMeander(meanderParams);
    expect(svg1).toEqual(svg2);
  });

  it('改变 density 影响输出', () => {
    const svg1 = generateMeander({ ...meanderParams, density: 2 });
    const svg2 = generateMeander({ ...meanderParams, density: 8 });
    expect(svg1).not.toEqual(svg2);
  });
});
