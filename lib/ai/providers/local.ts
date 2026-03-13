import type { AiAdapter, AiGenerateRequest, AiGenerateResult } from '../adapter';

const STUB_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#f5f0e8"/>
  <text x="400" y="300" text-anchor="middle" font-size="24" fill="#c5a572" font-family="serif">本地存根 — 纹样预览</text>
</svg>`;

export class LocalAdapter implements AiAdapter {
  readonly provider = 'local';

  async generate(request: AiGenerateRequest): Promise<AiGenerateResult> {
    await new Promise((r) => setTimeout(r, 1000));

    if (request.outputFormat === 'svg') {
      return { svgCode: STUB_SVG };
    }
    return {
      imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    };
  }
}
