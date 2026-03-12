import type { AiAdapter, AiGenerateRequest, AiGenerateResult } from '../adapter';

export class LocalAdapter implements AiAdapter {
  readonly provider = 'local';

  async generate(_request: AiGenerateRequest): Promise<AiGenerateResult> {
    throw new Error('本地模型适配器尚未实现，请配置其他 AI 服务商');
  }
}
