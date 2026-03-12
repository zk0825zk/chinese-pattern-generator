import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, signToken } from '@/lib/auth';
import { RateLimiter } from '@/lib/rate-limit';

const ipLimiter = new RateLimiter({ maxRequests: 10, windowMs: 60_000 });
const accountLimiter = new RateLimiter({ maxRequests: 5, windowMs: 900_000 });

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
    if (!ipLimiter.check(ip)) {
      return NextResponse.json({ error: '请求过于频繁，请稍后再试' }, { status: 429 });
    }

    let body: { username?: string; password?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: '请求体格式错误' }, { status: 400 });
    }

    const { username, password } = body;
    if (!username || !password) {
      return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 });
    }

    const normalizedUsername = username.toLowerCase();

    if (!accountLimiter.check(normalizedUsername)) {
      return NextResponse.json({ error: '登录失败次数过多，账户已锁定 15 分钟' }, { status: 429 });
    }

    const user = await prisma.user.findUnique({
      where: { username: normalizedUsername },
    });
    if (!user) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
    }

    const token = await signToken(user.id);
    return NextResponse.json({ token, user: { id: user.id, username: user.username } });
  } catch {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
