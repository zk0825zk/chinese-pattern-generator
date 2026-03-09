import type { PatternParams } from './types';
import { SeededRandom } from '@/lib/random';
import { createSvgRoot, createPath, createCircle, wrapInPattern, applySymmetry } from '@/lib/svg-utils';

function drawFlower(cx: number, cy: number, radius: number, petals: number, color: string, secondaryColor: string): string {
  const elements: string[] = [];

  // 花瓣
  for (let i = 0; i < petals; i++) {
    const angle = (Math.PI * 2 * i) / petals;

    const tipX = cx + Math.cos(angle) * radius;
    const tipY = cy + Math.sin(angle) * radius;

    const cp1X = cx + Math.cos(angle - 0.3) * radius * 0.6;
    const cp1Y = cy + Math.sin(angle - 0.3) * radius * 0.6;
    const cp2X = cx + Math.cos(angle + 0.3) * radius * 0.6;
    const cp2Y = cy + Math.sin(angle + 0.3) * radius * 0.6;

    const d = `M${cx.toFixed(1)} ${cy.toFixed(1)} C${cp1X.toFixed(1)} ${cp1Y.toFixed(1)} ${(tipX - Math.cos(angle + 0.2) * radius * 0.2).toFixed(1)} ${(tipY - Math.sin(angle + 0.2) * radius * 0.2).toFixed(1)} ${tipX.toFixed(1)} ${tipY.toFixed(1)} C${(tipX + Math.cos(angle - 0.2) * radius * 0.2).toFixed(1)} ${(tipY + Math.sin(angle - 0.2) * radius * 0.2).toFixed(1)} ${cp2X.toFixed(1)} ${cp2Y.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)} Z`;

    elements.push(createPath(d, secondaryColor, 1, color));
  }

  // 花心
  elements.push(createCircle(cx, cy, radius * 0.2, secondaryColor));
  elements.push(createCircle(cx, cy, radius * 0.1, color));

  return elements.join('\n');
}

export function generateFloral(params: PatternParams): string {
  const { color, complexity, density, symmetry, mode, tileSize, width, height, seed } = params;
  const rng = new SeededRandom(seed);

  const petals = Math.max(4, Math.min(12, Math.round(complexity * 0.8 + 3)));
  const count = Math.max(1, Math.min(8, Math.round(density * 0.8)));

  const contentW = mode === 'seamless' ? tileSize : width;
  const contentH = mode === 'seamless' ? tileSize : height;

  const flowerRadius = Math.min(contentW, contentH) / (count + 1) * 0.35;
  const elements: string[] = [];

  for (let i = 0; i < count; i++) {
    const cx = rng.range(flowerRadius, contentW - flowerRadius);
    const cy = rng.range(flowerRadius, contentH - flowerRadius);
    const r = flowerRadius * rng.range(0.6, 1.2);
    const p = petals + rng.int(-1, 2);

    elements.push(drawFlower(cx, cy, r, p, color.primary, color.secondary));
  }

  let content = elements.join('\n');
  content = applySymmetry(content, symmetry, contentW, contentH);

  if (mode === 'seamless') {
    const patternContent = `<rect width="${contentW}" height="${contentH}" fill="${color.background}"/>\n${content}`;
    const tiled = wrapInPattern('floral-pattern', contentW, contentH, patternContent, width, height);
    return createSvgRoot(width, height, color.background, tiled);
  }

  return createSvgRoot(width, height, color.background, content);
}
