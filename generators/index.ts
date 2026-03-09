import type { PatternType, PatternGenerator, PatternParams } from './types';
import { generateCloud } from './cloud';
import { generateMeander } from './meander';
import { generateFloral } from './floral';
import { generateGeometric } from './geometric';
import { generateDragon } from './dragon';

export interface PatternTypeInfo {
  id: PatternType;
  name: string;
  description: string;
}

export const PATTERN_TYPES: PatternTypeInfo[] = [
  { id: 'cloud', name: '祥云纹', description: '贝塞尔曲线螺旋云头' },
  { id: 'meander', name: '回纹', description: '直角螺旋连续图案' },
  { id: 'floral', name: '花纹', description: '极坐标花瓣图案' },
  { id: 'geometric', name: '几何纹', description: '菱形/万字纹/六边形' },
  { id: 'dragon', name: '龙纹', description: 'AI 生成（开发中）' },
];

const generators: Record<PatternType, PatternGenerator> = {
  cloud: generateCloud,
  meander: generateMeander,
  floral: generateFloral,
  geometric: generateGeometric,
  dragon: generateDragon,
};

export function getGenerator(type: PatternType): PatternGenerator {
  return generators[type];
}

export function generatePattern(type: PatternType, params: PatternParams): string {
  return generators[type](params);
}
