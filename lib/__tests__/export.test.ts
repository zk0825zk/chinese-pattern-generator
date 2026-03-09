import { describe, it, expect } from 'vitest';
import { svgToDataUrl, svgToBlob } from '../export';

const testSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="red"/></svg>';

describe('Export Utils', () => {
  describe('svgToDataUrl', () => {
    it('返回 data URL 格式', () => {
      const url = svgToDataUrl(testSvg);
      expect(url).toMatch(/^data:image\/svg\+xml;charset=utf-8,/);
    });

    it('包含 SVG 内容', () => {
      const url = svgToDataUrl(testSvg);
      expect(url).toContain('svg');
    });
  });

  describe('svgToBlob', () => {
    it('返回 SVG Blob', () => {
      const blob = svgToBlob(testSvg);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/svg+xml');
    });
  });
});
