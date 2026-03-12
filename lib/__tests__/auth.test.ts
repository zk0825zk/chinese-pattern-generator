// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import { hashPassword, verifyPassword, signToken, verifyToken } from '@/lib/auth';

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-for-vitest-at-least-32-chars!!';
});

describe('hashPassword / verifyPassword', () => {
  it('hashes and verifies a password', async () => {
    const hash = await hashPassword('testpass123');
    expect(hash).not.toBe('testpass123');
    expect(await verifyPassword('testpass123', hash)).toBe(true);
  });

  it('rejects wrong password', async () => {
    const hash = await hashPassword('testpass123');
    expect(await verifyPassword('wrongpass', hash)).toBe(false);
  });
});

describe('signToken / verifyToken', () => {
  it('signs and verifies a token', async () => {
    const token = await signToken('user-123');
    const payload = await verifyToken(token);
    expect(payload.sub).toBe('user-123');
  });

  it('rejects invalid token', async () => {
    await expect(verifyToken('invalid.token.here')).rejects.toThrow();
  });
});
