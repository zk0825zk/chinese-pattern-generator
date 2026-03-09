import { describe, it, expect } from 'vitest';
import {
  createSvgRoot,
  createPath,
  createCircle,
  createGroup,
  wrapInPattern,
  applySymmetry,
} from '../svg-utils';

describe('SVG Utils', () => {
  describe('createSvgRoot', () => {
    it('生成有效的 SVG 根元素', () => {
      const svg = createSvgRoot(800, 600, '#ffffff', '<rect/>');
      expect(svg).toContain('<svg');
      expect(svg).toContain('width="800"');
      expect(svg).toContain('height="600"');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('<rect/>');
    });
  });

  describe('createPath', () => {
    it('生成 path 元素', () => {
      const path = createPath('M0 0 L10 10', '#ff0000', 2);
      expect(path).toContain('<path');
      expect(path).toContain('d="M0 0 L10 10"');
      expect(path).toContain('stroke="#ff0000"');
      expect(path).toContain('stroke-width="2"');
    });

    it('支持填充', () => {
      const path = createPath('M0 0 L10 10 Z', '#ff0000', 2, '#00ff00');
      expect(path).toContain('fill="#00ff00"');
    });
  });

  describe('createCircle', () => {
    it('生成 circle 元素', () => {
      const circle = createCircle(50, 50, 25, '#ff0000');
      expect(circle).toContain('<circle');
      expect(circle).toContain('cx="50"');
      expect(circle).toContain('r="25"');
    });
  });

  describe('createGroup', () => {
    it('生成带 transform 的 group', () => {
      const g = createGroup('<rect/>', 'translate(10, 20)');
      expect(g).toContain('<g');
      expect(g).toContain('transform="translate(10, 20)"');
      expect(g).toContain('<rect/>');
    });
  });

  describe('wrapInPattern', () => {
    it('生成 SVG pattern 元素 + 填充矩形', () => {
      const result = wrapInPattern('pattern-1', 100, 100, '<rect/>', 800, 600);
      expect(result).toContain('<pattern');
      expect(result).toContain('id="pattern-1"');
      expect(result).toContain('width="100"');
      expect(result).toContain('height="100"');
      expect(result).toContain('fill="url(#pattern-1)"');
    });
  });

  describe('applySymmetry', () => {
    it('horizontal 对称产生 scale(-1, 1)', () => {
      const result = applySymmetry('<path d="M0 0"/>', 'horizontal', 800, 600);
      expect(result).toContain('scale(-1, 1)');
    });

    it('none 返回原始内容', () => {
      const content = '<path d="M0 0"/>';
      const result = applySymmetry(content, 'none', 800, 600);
      expect(result).toBe(content);
    });
  });
});
