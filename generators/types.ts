export type PatternType = 'cloud' | 'meander' | 'floral' | 'geometric' | 'dragon';

export type SymmetryMode = 'none' | 'horizontal' | 'vertical' | 'radial' | 'full';

export type OutputMode = 'single' | 'seamless';

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
  tileSize: number;
  width: number;
  height: number;
  seed: number;
}

export interface PatternResult {
  svg: string;
  params: PatternParams;
  timestamp: number;
}

export type PatternGenerator = (params: PatternParams) => string;

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
  tileSize: 200,
  width: 800,
  height: 600,
  seed: Date.now(),
};
