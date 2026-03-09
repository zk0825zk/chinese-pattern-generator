import type { PatternParams } from './types';
import { SeededRandom } from '@/lib/random';
import { createSvgRoot, createPath, createGroup, wrapInPattern, applySymmetry } from '@/lib/svg-utils';

function drawCloudHead(cx: number, cy: number, size: number, layers: number, color: string, flip: boolean): string {
  const paths: string[] = [];
  const dir = flip ? -1 : 1;

  for (let i = 0; i < layers; i++) {
    const r = size * (1 - i * 0.15);
    const startAngle = Math.PI * 0.8;
    const endAngle = Math.PI * 2.2;
    const steps = 8;

    let d = '';
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const angle = startAngle + (endAngle - startAngle) * t;
      const spiralR = r * (1 - t * 0.4);
      const x = cx + dir * Math.cos(angle) * spiralR;
      const y = cy - Math.sin(angle) * spiralR;
      d += s === 0 ? `M${x.toFixed(1)} ${y.toFixed(1)}` : ` Q${(cx + dir * Math.cos(angle - 0.2) * spiralR * 1.1).toFixed(1)} ${(cy - Math.sin(angle - 0.2) * spiralR * 1.1).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }

    paths.push(createPath(d, color, Math.max(1, 2 - i * 0.3)));
  }

  return paths.join('\n');
}

function drawCloudTail(x1: number, y1: number, x2: number, y2: number, color: string): string {
  const mx = (x1 + x2) / 2;
  const my = Math.min(y1, y2) - Math.abs(x2 - x1) * 0.15;
  const d = `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  return createPath(d, color, 1.5);
}

export function generateCloud(params: PatternParams): string {
  const { color, complexity, density, symmetry, mode, tileSize, width, height, seed } = params;
  const rng = new SeededRandom(seed);

  const layers = Math.max(2, Math.min(6, Math.round(complexity * 0.5 + 1)));
  const count = Math.max(2, Math.min(12, Math.round(density * 1.2)));

  const contentW = mode === 'seamless' ? tileSize : width;
  const contentH = mode === 'seamless' ? tileSize : height;

  const cloudSize = contentW / (count + 1) * 0.4;
  const elements: string[] = [];

  for (let i = 0; i < count; i++) {
    const cx = rng.range(cloudSize, contentW - cloudSize);
    const cy = rng.range(cloudSize, contentH - cloudSize);
    const flip = rng.next() > 0.5;
    const headSize = cloudSize * rng.range(0.7, 1.3);

    elements.push(drawCloudHead(cx, cy, headSize, layers, color.primary, flip));

    if (i > 0) {
      const prevCx = rng.range(cloudSize, contentW - cloudSize);
      const prevCy = rng.range(cloudSize, contentH - cloudSize);
      elements.push(drawCloudTail(prevCx, prevCy, cx, cy, color.secondary));
    }
  }

  let content = elements.join('\n');
  content = applySymmetry(content, symmetry, contentW, contentH);

  if (mode === 'seamless') {
    const patternContent = `<rect width="${contentW}" height="${contentH}" fill="${color.background}"/>\n${content}`;
    const tiled = wrapInPattern('cloud-pattern', contentW, contentH, patternContent, width, height);
    return createSvgRoot(width, height, color.background, tiled);
  }

  return createSvgRoot(width, height, color.background, content);
}
