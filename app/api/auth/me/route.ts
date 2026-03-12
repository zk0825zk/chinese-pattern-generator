import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth';

export const GET = withAuth(async (_req, { userId }) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
});
