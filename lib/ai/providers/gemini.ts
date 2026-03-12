import type { AiAdapter, AiGenerateRequest, AiGenerateResult } from '../adapter';

export class GeminiAdapter implements AiAdapter {
  readonly provider = 'gemini';

  async generate(request: AiGenerateRequest): Promise<AiGenerateResult> {
    const apiKey = process.env.AI_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('AI_GEMINI_API_KEY is not configured');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
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
