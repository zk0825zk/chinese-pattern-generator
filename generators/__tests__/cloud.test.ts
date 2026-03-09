import { describe, it, expect } from 'vitest';
import { generateCloud } from '../cloud';
import { DEFAULT_PARAMS } from '../types';
import type { PatternParams } from '../types';

const cloudParams: PatternParams = {
  ...DEFAULT_PARAMS,
  type: 'cloud',
  seed: 42,
};

describe('generateCloud', () => {
  it('返回有效的 SVG 字符串', () => {
    const svg = generateCloud(cloudParams);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('包含 path 元素（云纹曲线）', () => {
    const svg = generateCloud(cloudParams);
    expect(svg).toContain('<path');
  });

  it('使用指定的主色调', () => {
    const svg = generateCloud(cloudParams);
    expect(svg).toContain(cloudParams.color.primary);
  });

  it('使用指定的背景色', () => {
    const svg = generateCloud(cloudParams);
    expect(svg).toContain(cloudParams.color.background);
  });

  it('相同种子产生相同输出', () => {
    const svg1 = generateCloud(cloudParams);
    const svg2 = generateCloud(cloudParams);
    expect(svg1).toEqual(svg2);
  });

  it('不同种子产生不同输出', () => {
    const svg1 = generateCloud({ ...cloudParams, seed: 42 });
    const svg2 = generateCloud({ ...cloudParams, seed: 99 });
    expect(svg1).not.toEqual(svg2);
  });

  it('seamless 模式包含 pattern 元素', () => {
    const svg = generateCloud({ ...cloudParams, mode: 'seamless' });
    expect(svg).toContain('<pattern');
  });

  it('改变 complexity 影响输出', () => {
    const svg1 = generateCloud({ ...cloudParams, complexity: 2 });
    const svg2 = generateCloud({ ...cloudParams, complexity: 8 });
    expect(svg1).not.toEqual(svg2);
  });
});
