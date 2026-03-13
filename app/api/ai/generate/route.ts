import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import { createAiAdapter } from '@/lib/ai/factory';
import { RateLimiter } from '@/lib/rate-limit';

const limiter = new RateLimiter({ maxRequests: 5, windowMs: 60_000 });
const VALID_PROVIDERS = ['openai', 'gemini', 'local'];
const VALID_FORMATS = ['svg', 'image'];

export const POST = withAuth(async (req, { userId }) => {
  try {
    if (!limiter.check(userId)) {
      return NextResponse.json({ error: 'AI 生成请求过于频繁，请稍后再试' }, { status: 429 });
    }

    let body: { prompt?: string; provider?: string; outputFormat?: string; style?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: '请求体格式错误' }, { status: 400 });
    }

    const { prompt, provider = 'openai', outputFormat = 'svg', style } = body;
    if (!prompt) {
      return NextResponse.json({ error: 'prompt 为必填字段' }, { status: 400 });
    }

    if (!VALID_PROVIDERS.includes(provider)) {
      return NextResponse.json({ error: '无效的 AI 服务商' }, { status: 400 });
    }

    if (!VALID_FORMATS.includes(outputFormat)) {
      return NextResponse.json({ error: '无效的输出格式' }, { status: 400 });
    }

    const task = await prisma.aiTask.create({
      data: {
        userId,
        prompt,
        provider,
        status: 'pending',
      },
    });

    (async () => {
      try {
        await prisma.aiTask.update({
          where: { id: task.id },
          data: { status: 'processing' },
        });

        const adapter = createAiAdapter(provider);
        const result = await adapter.generate({
          prompt,
          outputFormat: outputFormat as 'svg' | 'image',
          style,
        });

        const resultData = outputFormat === 'svg'
          ? result.svgCode ?? null
          : result.imageBase64 ?? result.imageUrl ?? null;

        await prisma.aiTask.update({
          where: { id: task.id },
          data: {
            status: 'completed',
            result: resultData,
          },
        });
      } catch (err) {
        try {
          await prisma.aiTask.update({
            where: { id: task.id },
            data: {
              status: 'failed',
              error: err instanceof Error ? err.message : '未知错误',
            },
          });
        } catch (updateErr) {
          console.error('Failed to update AI task status:', updateErr);
        }
      }
    })();

    return NextResponse.json({
      task: { id: task.id, status: task.status, outputFormat },
    }, { status: 202 });
  } catch {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
});
