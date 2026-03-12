import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth';

// GET /api/patterns/:id
export const GET = withAuth(async (_req, { userId, params }) => {
  try {
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: '缺少纹样 ID' }, { status: 400 });
    }

    const pattern = await prisma.pattern.findFirst({
      where: { id, userId },
    });

    if (!pattern) {
      return NextResponse.json({ error: '纹样不存在' }, { status: 404 });
    }

    return NextResponse.json({ pattern });
  } catch {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
});

// PUT /api/patterns/:id — 当前仅支持更新名称
export const PUT = withAuth(async (req, { userId, params }) => {
  try {
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: '缺少纹样 ID' }, { status: 400 });
    }

    const existing = await prisma.pattern.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      return NextResponse.json({ error: '纹样不存在' }, { status: 404 });
    }

    let body: { name?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: '请求体格式错误' }, { status: 400 });
    }

    const pattern = await prisma.pattern.update({
      where: { id },
      data: { name: body.name },
    });

    return NextResponse.json({ pattern });
  } catch {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
});

// DELETE /api/patterns/:id
export const DELETE = withAuth(async (_req, { userId, params }) => {
  try {
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: '缺少纹样 ID' }, { status: 400 });
    }

    const existing = await prisma.pattern.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      return NextResponse.json({ error: '纹样不存在' }, { status: 404 });
    }

    await prisma.pattern.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
});
