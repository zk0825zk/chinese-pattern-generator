import type { AiAdapter } from './adapter';
import { OpenAiAdapter } from './providers/openai';
import { GeminiAdapter } from './providers/gemini';
import { LocalAdapter } from './providers/local';

export function createAiAdapter(provider: string): AiAdapter {
  switch (provider) {
    case 'openai':
      return new OpenAiAdapter();
    case 'gemini':
      return new GeminiAdapter();
    case 'local':
      return new LocalAdapter();
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}
