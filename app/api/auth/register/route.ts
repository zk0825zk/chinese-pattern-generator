import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';
import { validateUsername, validatePassword } from '@/lib/validations';
import { RateLimiter } from '@/lib/rate-limit';

const limiter = new RateLimiter({ maxRequests: 10, windowMs: 3600_000 });

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
    if (!limiter.check(ip)) {
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

    const usernameError = validateUsername(username);
    if (usernameError) {
      return NextResponse.json({ error: usernameError }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const normalizedUsername = username.toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { username: normalizedUsername },
    });
    if (existing) {
      return NextResponse.json({ error: '用户名已存在' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { username: normalizedUsername, passwordHash },
    });

    const token = await signToken(user.id);
    return NextResponse.json(
      { token, user: { id: user.id, username: user.username } },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
