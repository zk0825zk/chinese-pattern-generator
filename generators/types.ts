export const PATTERN_TYPES = [
  'cloud', 'meander', 'floral', 'geometric', 'dragon',
  'mythical_beast', 'auspicious', 'border', 'custom',
] as const;
export type PatternType = (typeof PATTERN_TYPES)[number];

export type SymmetryMode = 'none' | 'horizontal' | 'vertical' | 'radial' | 'full';

export type OutputMode = 'single' | 'seamless';

export type OutputFormat = 'svg' | 'image';

export interface PatternColor {
  primary: string;
  secondary: string;
  background: string;
}

export interface PatternParams {
  type: PatternType;
  color: PatternColor;
  complexity: number;
  density: number;
  symmetry: SymmetryMode;
  mode: OutputMode;
  outputFormat: OutputFormat;
  tileSize: number;
  width: number;
  height: number;
  customPrompt?: string;
  provider?: string;
  seed?: number;
}

export interface PatternResult {
  resultType: OutputFormat;
  result: string;
  params: PatternParams;
  prompt: string;
  timestamp: number;
}

export const DEFAULT_PARAMS: PatternParams = {
  type: 'cloud',
  color: {
    primary: '#e54d42',
    secondary: '#c5a572',
    background: '#f5f0e8',
  },
  complexity: 5,
  density: 5,
  symmetry: 'none',
  mode: 'single',
  outputFormat: 'svg',
  tileSize: 200,
  width: 800,
  height: 600,
};
