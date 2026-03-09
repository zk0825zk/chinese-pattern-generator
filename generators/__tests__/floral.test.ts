import { describe, it, expect } from 'vitest';
import { generateFloral } from '../floral';
import { DEFAULT_PARAMS } from '../types';
import type { PatternParams } from '../types';

const floralParams: PatternParams = {
  ...DEFAULT_PARAMS,
  type: 'floral',
  seed: 42,
};

describe('generateFloral', () => {
  it('返回有效的 SVG 字符串', () => {
    const svg = generateFloral(floralParams);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('包含 path 元素（花瓣）', () => {
    const svg = generateFloral(floralParams);
    expect(svg).toContain('<path');
  });

  it('包含 circle 元素（花心）', () => {
    const svg = generateFloral(floralParams);
    expect(svg).toContain('<circle');
  });

  it('使用指定颜色', () => {
    const svg = generateFloral(floralParams);
    expect(svg).toContain(floralParams.color.primary);
  });

  it('seamless 模式包含 pattern 元素', () => {
    const svg = generateFloral({ ...floralParams, mode: 'seamless' });
    expect(svg).toContain('<pattern');
  });

  it('相同种子产生相同输出', () => {
    const svg1 = generateFloral(floralParams);
    const svg2 = generateFloral(floralParams);
    expect(svg1).toEqual(svg2);
  });
});
