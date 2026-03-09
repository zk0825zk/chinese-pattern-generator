import type { PatternParams } from './types';
import { createSvgRoot, createPath, createCircle } from '@/lib/svg-utils';

export function generateDragon(params: PatternParams): string {
  const { color, width, height } = params;

  const cx = width / 2;
  const cy = height / 2;
  const size = Math.min(width, height) * 0.35;

  const elements: string[] = [];

  // S形龙身
  const bodyD = `M${cx - size} ${cy}
    C${cx - size * 0.5} ${cy - size * 0.8}
     ${cx + size * 0.5} ${cy + size * 0.8}
     ${cx + size} ${cy}`;
  elements.push(createPath(bodyD, color.primary, 3));

  // 龙头
  elements.push(createCircle(cx + size, cy, size * 0.15, color.primary, color.secondary, 2));

  // 提示文字
  elements.push(
    `<text x="${cx}" y="${height - 30}" text-anchor="middle" fill="${color.secondary}" font-size="14" font-family="serif">龙纹 - AI 生成接口预留</text>`
  );

  return createSvgRoot(width, height, color.background, elements.join('\n'));
}
