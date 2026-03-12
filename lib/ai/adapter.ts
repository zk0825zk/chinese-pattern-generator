export interface AiGenerateRequest {
  prompt: string;
  style?: string;
  width?: number;
  height?: number;
}

export interface AiGenerateResult {
  imageUrl?: string;
  imageBase64?: string;
  metadata?: Record<string, unknown>;
}

export interface AiAdapter {
  readonly provider: string;
  generate(request: AiGenerateRequest): Promise<AiGenerateResult>;
  checkStatus?(taskId: string): Promise<AiGenerateResult>;
}
