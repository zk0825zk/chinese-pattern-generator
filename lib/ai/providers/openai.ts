import type { AiAdapter, AiGenerateRequest, AiGenerateResult } from '../adapter';

export class OpenAiAdapter implements AiAdapter {
  readonly provider = 'openai';

  async generate(request: AiGenerateRequest): Promise<AiGenerateResult> {
    const apiKey = process.env.AI_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('AI_OPENAI_API_KEY is not configured');
    }

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
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
      metadata: { model: 'dall-e-3', revised_prompt: data.data?.[0]?.revised_prompt },
    };
  }
}
