import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth';

const TASK_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export const GET = withAuth(async (_req, { userId, params }) => {
  try {
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: '缺少任务 ID' }, { status: 400 });
    }

    const task = await prisma.aiTask.findFirst({
      where: { id, userId },
    });

    if (!task) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 });
    }

    // 懒超时检查
    if (
      task.status === 'processing' &&
      Date.now() - task.updatedAt.getTime() > TASK_TIMEOUT_MS
    ) {
      const updated = await prisma.aiTask.update({
        where: { id },
        data: { status: 'failed', error: '任务超时' },
      });
      return NextResponse.json({
        task: {
          id: updated.id,
          status: updated.status,
          result: updated.result,
          error: updated.error,
          prompt: updated.prompt,
          createdAt: updated.createdAt,
        },
      });
    }

    return NextResponse.json({
      task: {
        id: task.id,
        status: task.status,
        result: task.result,
        error: task.error,
        prompt: task.prompt,
        createdAt: task.createdAt,
      },
    });
  } catch {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
});
