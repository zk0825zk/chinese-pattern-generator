import type { PatternParams } from './types';
import { SeededRandom } from '@/lib/random';
import { createSvgRoot, createPath, wrapInPattern, applySymmetry } from '@/lib/svg-utils';

function drawDiamond(cx: number, cy: number, size: number, color: string, strokeWidth: number): string {
  const d = `M${cx} ${(cy - size).toFixed(1)} L${(cx + size).toFixed(1)} ${cy} L${cx} ${(cy + size).toFixed(1)} L${(cx - size).toFixed(1)} ${cy} Z`;
  return createPath(d, color, strokeWidth);
}

function drawWanzi(x: number, y: number, size: number, color: string, strokeWidth: number): string {
  const paths: string[] = [];
  const cx = x + size / 2;
  const cy = y + size / 2;
  const arm = size * 0.35;
  const hook = size * 0.2;

  // Center cross
  paths.push(createPath(`M${cx - arm} ${cy} L${cx + arm} ${cy}`, color, strokeWidth));
  paths.push(createPath(`M${cx} ${cy - arm} L${cx} ${cy + arm}`, color, strokeWidth));

  // Four hooks
  paths.push(createPath(`M${cx + arm} ${cy} L${cx + arm} ${cy - hook}`, color, strokeWidth));
  paths.push(createPath(`M${cx - arm} ${cy} L${cx - arm} ${cy + hook}`, color, strokeWidth));
  paths.push(createPath(`M${cx} ${cy - arm} L${cx - hook} ${cy - arm}`, color, strokeWidth));
  paths.push(createPath(`M${cx} ${cy + arm} L${cx + hook} ${cy + arm}`, color, strokeWidth));

  return paths.join('\n');
}

function drawHexagon(cx: number, cy: number, radius: number, color: string, strokeWidth: number): string {
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    return `${(cx + Math.cos(angle) * radius).toFixed(1)} ${(cy + Math.sin(angle) * radius).toFixed(1)}`;
  });
  const d = `M${points[0]} ${points.slice(1).map(p => `L${p}`).join(' ')} Z`;
  return createPath(d, color, strokeWidth);
}

export function generateGeometric(params: PatternParams): string {
  const { color, complexity, density, symmetry, mode, tileSize, width, height, seed } = params;
  const rng = new SeededRandom(seed);

  const unitSize = Math.max(20, Math.min(80, 150 / density));
  const strokeWidth = Math.max(0.5, 2 - density * 0.15);

  const contentW = mode === 'seamless' ? tileSize : width;
  const contentH = mode === 'seamless' ? tileSize : height;

  const cols = Math.ceil(contentW / unitSize) + 1;
  const rows = Math.ceil(contentH / unitSize) + 1;

  const elements: string[] = [];
  const subType = complexity <= 3 ? 'diamond' : complexity <= 6 ? 'wanzi' : 'hexagon';

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * unitSize;
      const y = row * unitSize;

      switch (subType) {
        case 'diamond': {
          const offset = row % 2 === 0 ? 0 : unitSize / 2;
          elements.push(drawDiamond(x + offset + unitSize / 2, y + unitSize / 2, unitSize * 0.35, color.primary, strokeWidth));
          break;
        }
        case 'wanzi':
          elements.push(drawWanzi(x, y, unitSize, color.primary, strokeWidth));
          break;
        case 'hexagon': {
          const offset = row % 2 === 0 ? 0 : unitSize * 0.75;
          elements.push(drawHexagon(x + offset + unitSize / 2, y + unitSize / 2, unitSize * 0.4, color.primary, strokeWidth));
          break;
        }
      }
    }
  }

  let content = elements.join('\n');
  content = applySymmetry(content, symmetry, contentW, contentH);

  if (mode === 'seamless') {
    const patternContent = `<rect width="${contentW}" height="${contentH}" fill="${color.background}"/>\n${content}`;
    const tiled = wrapInPattern('geometric-pattern', contentW, contentH, patternContent, width, height);
    return createSvgRoot(width, height, color.background, tiled);
  }

  return createSvgRoot(width, height, color.background, content);
}
