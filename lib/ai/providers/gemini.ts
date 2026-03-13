import type { AiAdapter, AiGenerateRequest, AiGenerateResult } from '../adapter';
import { extractSvg } from '../svg-extractor';

export class GeminiAdapter implements AiAdapter {
  readonly provider = 'gemini';

  async generate(request: AiGenerateRequest): Promise<AiGenerateResult> {
    const apiKey = process.env.AI_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('AI_GEMINI_API_KEY is not configured');
    }

    if (request.outputFormat === 'svg') {
      return this.generateSvg(apiKey, request);
    }
    return this.generateImage(apiKey, request);
  }

  private getBaseUrl(): string {
    return (process.env.AI_GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com').replace(/\/+$/, '');
  }

  private async generateSvg(apiKey: string, request: AiGenerateRequest): Promise<AiGenerateResult> {
    const baseUrl = this.getBaseUrl();
    const response = await fetch(
      `${baseUrl}/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: request.prompt }] }],
          systemInstruction: { parts: [{ text: '你是一个专业的 SVG 矢量图形生成器。请只输出 SVG 代码，不要包含任何解释文字。' }] },
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const result = extractSvg(text);

    if (!result.success) {
      throw new Error(result.error);
    }

    return { svgCode: result.svg, metadata: { model: 'gemini-2.0-flash' } };
  }

  private async generateImage(apiKey: string, request: AiGenerateRequest): Promise<AiGenerateResult> {
    const baseUrl = this.getBaseUrl();
    const response = await fetch(
      `${baseUrl}/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: request.prompt }] }],
          generationConfig: {
            responseModalities: ['image', 'text'],
            responseMimeType: 'image/png',
          },
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();
    const imagePart = data.candidates?.[0]?.content?.parts?.find(
      (p: { inlineData?: unknown }) => p.inlineData,
    );

    return {
      imageBase64: imagePart?.inlineData?.data,
      metadata: { model: 'gemini-2.0-flash-exp' },
    };
  }
}
