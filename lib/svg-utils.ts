import type { SymmetryMode } from '@/generators/types';

export function createSvgRoot(
  width: number,
  height: number,
  background: string,
  content: string
): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
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

export function createGroup(content: string, transform?: string): string {
  const attr = transform ? ` transform="${transform}"` : '';
  return `<g${attr}>${content}</g>`;
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
