import { describe, it, expect } from 'vitest';
import { generateGeometric } from '../geometric';
import { DEFAULT_PARAMS } from '../types';
import type { PatternParams } from '../types';

const geoParams: PatternParams = {
  ...DEFAULT_PARAMS,
  type: 'geometric',
  seed: 42,
};

describe('generateGeometric', () => {
  it('返回有效的 SVG 字符串', () => {
    const svg = generateGeometric(geoParams);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('包含 path 或 rect 元素', () => {
    const svg = generateGeometric(geoParams);
    const hasPath = svg.includes('<path');
    const hasRect = svg.includes('<rect');
    expect(hasPath || hasRect).toBe(true);
  });

  it('使用指定颜色', () => {
    const svg = generateGeometric(geoParams);
    expect(svg).toContain(geoParams.color.primary);
  });

  it('seamless 模式包含 pattern 元素', () => {
    const svg = generateGeometric({ ...geoParams, mode: 'seamless' });
    expect(svg).toContain('<pattern');
  });

  it('相同种子产生相同输出', () => {
    const svg1 = generateGeometric(geoParams);
    const svg2 = generateGeometric(geoParams);
    expect(svg1).toEqual(svg2);
  });

  it('改变 complexity 影响输出', () => {
    const svg1 = generateGeometric({ ...geoParams, complexity: 2 });
    const svg2 = generateGeometric({ ...geoParams, complexity: 8 });
    expect(svg1).not.toEqual(svg2);
  });
});
