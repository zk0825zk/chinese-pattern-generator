import type { SymmetryMode } from '@/generators/types';

export function createSvgRoot(
  width: number,
  height: number,
  background: string,
  content: string,
  defs?: string
): string {
  const defsBlock = defs ? `<defs>${defs}</defs>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${defsBlock}
  <rect width="${width}" height="${height}" fill="${background}"/>
  ${content}
</svg>`;
}

export function createPath(
  d: string,
  stroke: string,
  strokeWidth: number,
  fill: string = 'none'
): string {
  return `<path d="${d}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

export function createPathFilled(
  d: string,
  fill: string,
  stroke: string = 'none',
  strokeWidth: number = 0,
  opacity: number = 1
): string {
  const opacityAttr = opacity < 1 ? ` opacity="${opacity}"` : '';
  const strokeAttr = stroke !== 'none' ? ` stroke="${stroke}" stroke-width="${strokeWidth}"` : '';
  return `<path d="${d}" fill="${fill}"${strokeAttr}${opacityAttr}/>`;
}

export function createCircle(
  cx: number,
  cy: number,
  r: number,
  fill: string,
  stroke: string = 'none',
  strokeWidth: number = 0
): string {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
}

export function createRect(
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  stroke: string = 'none',
  strokeWidth: number = 0,
  rx: number = 0
): string {
  const rxAttr = rx > 0 ? ` rx="${rx}"` : '';
  const strokeAttr = stroke !== 'none' ? ` stroke="${stroke}" stroke-width="${strokeWidth}"` : '';
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${strokeAttr}${rxAttr}/>`;
}

export function createGroup(content: string, transform?: string): string {
  const attr = transform ? ` transform="${transform}"` : '';
  return `<g${attr}>${content}</g>`;
}

export function createLinearGradient(
  id: string,
  stops: Array<{ offset: string; color: string; opacity?: number }>,
  x1: string = '0%',
  y1: string = '0%',
  x2: string = '0%',
  y2: string = '100%'
): string {
  const stopsStr = stops
    .map(s => {
      const opacityAttr = s.opacity !== undefined ? ` stop-opacity="${s.opacity}"` : '';
      return `<stop offset="${s.offset}" stop-color="${s.color}"${opacityAttr}/>`;
    })
    .join('');
  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stopsStr}</linearGradient>`;
}

export function createRadialGradient(
  id: string,
  stops: Array<{ offset: string; color: string; opacity?: number }>,
  cx: string = '50%',
  cy: string = '50%',
  r: string = '50%'
): string {
  const stopsStr = stops
    .map(s => {
      const opacityAttr = s.opacity !== undefined ? ` stop-opacity="${s.opacity}"` : '';
      return `<stop offset="${s.offset}" stop-color="${s.color}"${opacityAttr}/>`;
    })
    .join('');
  return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stopsStr}</radialGradient>`;
}

export function createDefs(content: string): string {
  return `<defs>${content}</defs>`;
}

/** Lighten a hex color by a given amount (0-1) */
export function lightenColor(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const nr = Math.min(255, Math.round(r + (255 - r) * amount));
  const ng = Math.min(255, Math.round(g + (255 - g) * amount));
  const nb = Math.min(255, Math.round(b + (255 - b) * amount));

  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}

/** Darken a hex color by a given amount (0-1) */
export function darkenColor(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const nr = Math.max(0, Math.round(r * (1 - amount)));
  const ng = Math.max(0, Math.round(g * (1 - amount)));
  const nb = Math.max(0, Math.round(b * (1 - amount)));

  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}

export function wrapInPattern(
  id: string,
  tileWidth: number,
  tileHeight: number,
  tileContent: string,
  canvasWidth: number,
  canvasHeight: number
): string {
  return `<defs>
    <pattern id="${id}" x="0" y="0" width="${tileWidth}" height="${tileHeight}" patternUnits="userSpaceOnUse">
      ${tileContent}
    </pattern>
  </defs>
  <rect width="${canvasWidth}" height="${canvasHeight}" fill="url(#${id})"/>`;
}

export function applySymmetry(
  content: string,
  symmetry: SymmetryMode,
  width: number,
  height: number
): string {
  if (symmetry === 'none') return content;

  const halfW = width / 2;
  const halfH = height / 2;

  switch (symmetry) {
    case 'horizontal':
      return `${content}
        <g transform="translate(${width}, 0) scale(-1, 1)">${content}</g>`;
    case 'vertical':
      return `${content}
        <g transform="translate(0, ${height}) scale(1, -1)">${content}</g>`;
    case 'radial':
      return Array.from({ length: 4 }, (_, i) =>
        `<g transform="rotate(${i * 90}, ${halfW}, ${halfH})">${content}</g>`
      ).join('\n');
    case 'full':
      return `${content}
        <g transform="translate(${width}, 0) scale(-1, 1)">${content}</g>
        <g transform="translate(0, ${height}) scale(1, -1)">${content}</g>
        <g transform="translate(${width}, ${height}) scale(-1, -1)">${content}</g>`;
    default:
      return content;
  }
}
