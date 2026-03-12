import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import { PATTERN_TYPES } from '@/generators/types';

// GET /api/patterns?page=1&limit=20
export const GET = withAuth(async (req, { userId }) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.pattern.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          type: true,
          thumbnail: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.pattern.count({ where: { userId } }),
    ]);

    return NextResponse.json({ data, total, page, limit });
  } catch {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
});

// POST /api/patterns
export const POST = withAuth(async (req, { userId }) => {
  try {
    let body: {
      name?: string;
      type?: string;
      params?: string;
      svg?: string;
      thumbnail?: string;
    };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: '请求体格式错误' }, { status: 400 });
    }

    const { type, params, svg } = body;
    if (!type || !params || !svg) {
      return NextResponse.json({ error: 'type, params, svg 为必填字段' }, { status: 400 });
    }

    if (!PATTERN_TYPES.includes(type as typeof PATTERN_TYPES[number])) {
      return NextResponse.json({ error: '无效的纹样类型' }, { status: 400 });
    }

    const pattern = await prisma.pattern.create({
      data: {
        userId,
        name: body.name ?? '未命名纹样',
        type,
        params,
        svg,
        thumbnail: body.thumbnail,
      },
    });

    return NextResponse.json({ pattern }, { status: 201 });
  } catch {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
});
