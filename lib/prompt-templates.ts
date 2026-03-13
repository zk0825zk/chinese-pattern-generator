import type { PatternType, PatternParams } from '@/generators/types';

export interface PatternTypeInfo {
  id: PatternType;
  name: string;
  description: string;
}

export const PATTERN_TYPE_LIST: PatternTypeInfo[] = [
  { id: 'cloud', name: '祥云纹', description: '卷曲云头纹样' },
  { id: 'meander', name: '回纹', description: '直角螺旋图案' },
  { id: 'floral', name: '花纹', description: '缠枝花卉纹样' },
  { id: 'geometric', name: '几何纹', description: '菱形万字六边形' },
  { id: 'dragon', name: '龙纹', description: '蜿蜒龙身纹样' },
  { id: 'mythical_beast', name: '瑞兽纹', description: '凤凰麒麟瑞禽' },
  { id: 'auspicious', name: '吉祥纹', description: '如意海水江崖' },
  { id: 'border', name: '古典边饰纹', description: '饕餮联珠方胜' },
  { id: 'custom', name: '自定义描述', description: '输入描述生成纹样' },
];

const BASE_TEMPLATES: Record<Exclude<PatternType, 'custom'>, string> = {
  cloud: '请生成一幅中国传统祥云纹样，云头呈卷曲螺旋状，以S形曲线相互连接，具有传统工艺美术的精致感。',
  meander: '请生成一幅中国传统回纹，由连续直角折线构成方形螺旋图案，线条规整有序，体现几何之美。',
  floral: '请生成一幅中国传统缠枝花卉纹样，花瓣层叠放射排列，枝蔓蜿蜒缠绕，富有生机与装饰美感。',
  geometric: '请生成一幅中国传统几何纹样，可包含菱形、万字纹、六边形等元素，线条精准对称，节奏感强。',
  dragon: '请生成一幅中国传统龙纹，龙身蜿蜒盘旋，鳞片细腻，龙爪刚劲有力，气势威严，具有皇家气韵。',
  mythical_beast: '请生成一幅中国传统瑞兽纹样，可以是凤凰、麒麟、仙鹤等神兽瑞禽，线条流畅，姿态生动，具有祥瑞寓意。',
  auspicious: '请生成一幅中国传统吉祥纹样，可包含如意纹、海水江崖纹、寿字纹等元素，寓意吉祥如意、福寿绵长。',
  border: '请生成一幅中国传统古典边饰纹样，可包含饕餮纹、联珠纹、方胜纹等元素，适合作为装饰边框使用，庄重典雅。',
};

function mapComplexity(complexity: number): string {
  if (complexity <= 3) return '简约风格，线条简洁';
  if (complexity <= 6) return '中等细节，适度装饰';
  return '精细繁复，细节丰富';
}

function mapDensity(density: number): string {
  if (density <= 3) return '元素稀疏，留白充裕';
  if (density <= 6) return '元素分布均匀';
  return '元素密集，铺满画面';
}

const SYMMETRY_LABELS: Record<string, string> = {
  none: '无对称',
  horizontal: '水平对称',
  vertical: '垂直对称',
  radial: '径向对称',
  full: '完全对称',
};

function mapOutputMode(mode: string): string {
  return mode === 'seamless' ? '可无缝平铺的连续纹样' : '单个独立纹样';
}

function colorToName(hex: string): string {
  const colors: Record<string, string> = {
    '#e54d42': '朱砂红', '#c5a572': '金色', '#f5f0e8': '宣纸白',
    '#2858a6': '青花蓝', '#6b9bd2': '浅蓝', '#f0f4f8': '月白',
    '#2c4a2c': '墨绿', '#5b8c5a': '竹青', '#f2f5f0': '浅碧',
    '#8b2500': '宫墙红', '#d4a54a': '琉璃金', '#faf3e8': '象牙白',
    '#c27c88': '桃粉', '#e8c4c8': '浅绯', '#fdf5f5': '粉白',
  };
  return colors[hex.toLowerCase()] || hex;
}

export function buildPrompt(params: PatternParams): string {
  let base: string;
  if (params.type === 'custom') {
    base = `请生成一幅中国传统纹样：${params.customPrompt || ''}`;
  } else {
    base = BASE_TEMPLATES[params.type];
  }

  const paramParts = [
    mapComplexity(params.complexity),
    mapDensity(params.density),
    `${SYMMETRY_LABELS[params.symmetry] || '无对称'}布局`,
    mapOutputMode(params.mode),
    `主色为${colorToName(params.color.primary)}，辅色为${colorToName(params.color.secondary)}，背景为${colorToName(params.color.background)}`,
  ];

  let formatReq = '';
  if (params.outputFormat === 'svg') {
    formatReq = `请输出完整的 SVG 代码，viewBox 为 0 0 ${params.width} ${params.height}，不要包含任何解释文字，只输出 SVG 代码。`;
  }

  return [base, paramParts.join('，') + '。', formatReq].filter(Boolean).join(' ');
}
