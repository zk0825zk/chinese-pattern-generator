import type { AiAdapter, AiGenerateRequest, AiGenerateResult } from '../adapter';
import { extractSvg } from '../svg-extractor';

export class OpenAiAdapter implements AiAdapter {
  readonly provider = 'openai';

  async generate(request: AiGenerateRequest): Promise<AiGenerateResult> {
    const apiKey = process.env.AI_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('AI_OPENAI_API_KEY is not configured');
    }

    if (request.outputFormat === 'svg') {
      return this.generateSvg(apiKey, request);
    }
    return this.generateImage(apiKey, request);
  }

  private getBaseUrl(): string {
    return (process.env.AI_OPENAI_BASE_URL || 'https://api.openai.com').replace(/\/+$/, '');
  }

  private getChatModel(): string {
    return process.env.AI_OPENAI_CHAT_MODEL || 'gpt-4o';
  }

  private getImageModel(): string {
    return process.env.AI_OPENAI_IMAGE_MODEL || 'dall-e-3';
  }

  private async generateSvg(apiKey: string, request: AiGenerateRequest): Promise<AiGenerateResult> {
    const baseUrl = this.getBaseUrl();
    const model = this.getChatModel();
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: '你是一个专业的 SVG 矢量图形生成器。请只输出 SVG 代码，不要包含任何解释文字。' },
          { role: 'user', content: request.prompt },
        ],
        max_tokens: 16000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    const result = extractSvg(text);

    if (!result.success) {
      throw new Error(result.error);
    }

    return { svgCode: result.svg, metadata: { model } };
  }

  private async generateImage(apiKey: string, request: AiGenerateRequest): Promise<AiGenerateResult> {
    const baseUrl = this.getBaseUrl();
    const model = this.getImageModel();
    const response = await fetch(`${baseUrl}/v1/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt: request.prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'b64_json',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    return {
      imageBase64: data.data?.[0]?.b64_json,
      metadata: { model, revised_prompt: data.data?.[0]?.revised_prompt },
    };
  }
}
