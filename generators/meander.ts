import type { PatternParams } from './types';
import { SeededRandom } from '@/lib/random';
import { createSvgRoot, createPath, wrapInPattern, applySymmetry } from '@/lib/svg-utils';

function drawMeanderUnit(x: number, y: number, size: number, depth: number, color: string, strokeWidth: number): string {
  const paths: string[] = [];
  let d = `M${x.toFixed(1)} ${y.toFixed(1)}`;

  let cx = x;
  let cy = y;
  const step = size / (depth * 2 + 1);

  for (let i = 0; i < depth; i++) {
    const len = size - i * step * 2;

    // 向下
    cy += len;
    d += ` L${cx.toFixed(1)} ${cy.toFixed(1)}`;
    // 向右
    cx += len;
    d += ` L${cx.toFixed(1)} ${cy.toFixed(1)}`;
    // 向上
    cy -= len - step;
    d += ` L${cx.toFixed(1)} ${cy.toFixed(1)}`;
    // 向左
    cx -= len - step;
    d += ` L${cx.toFixed(1)} ${cy.toFixed(1)}`;
  }

  paths.push(createPath(d, color, strokeWidth));
  return paths.join('\n');
}

export function generateMeander(params: PatternParams): string {
  const { color, complexity, density, symmetry, mode, tileSize, width, height, seed } = params;
  const rng = new SeededRandom(seed);

  const depth = Math.max(1, Math.min(5, Math.round(complexity * 0.4 + 1)));
  const unitSize = Math.max(30, Math.min(120, 200 / density));
  const strokeWidth = Math.max(1, 3 - density * 0.2);

  const contentW = mode === 'seamless' ? tileSize : width;
  const contentH = mode === 'seamless' ? tileSize : height;

  const cols = Math.ceil(contentW / unitSize);
  const rows = Math.ceil(contentH / unitSize);

  const elements: string[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * unitSize + unitSize * 0.1;
      const y = row * unitSize + unitSize * 0.1;
      const actualSize = unitSize * 0.8;
      elements.push(drawMeanderUnit(x, y, actualSize, depth, color.primary, strokeWidth));
    }
  }

  // 添加连接线（回纹带）
  for (let row = 0; row < rows; row++) {
    const y = row * unitSize + unitSize * 0.1;
    const d = `M0 ${y.toFixed(1)} L${contentW} ${y.toFixed(1)}`;
    elements.push(createPath(d, color.secondary, strokeWidth * 0.5));
  }

  let content = elements.join('\n');
  content = applySymmetry(content, symmetry, contentW, contentH);

  if (mode === 'seamless') {
    const patternContent = `<rect width="${contentW}" height="${contentH}" fill="${color.background}"/>\n${content}`;
    const tiled = wrapInPattern('meander-pattern', contentW, contentH, patternContent, width, height);
    return createSvgRoot(width, height, color.background, tiled);
  }

  return createSvgRoot(width, height, color.background, content);
}
